"use server";

const NordigenClient = require("nordigen-node");
import { PrismaClient, AccountType } from "@/generated/prisma";
import { getCurrentAppUser } from "./user-actions";
import type { BankInfo } from "@/data/banks";

// Initialize GoCardless client
const nordigenClient = new NordigenClient({
  secretId: process.env.GOCARDLESS_SECRET_ID!,
  secretKey: process.env.GOCARDLESS_SECRET_KEY!,
});

function getPrismaClient() {
  return new PrismaClient();
}

async function getActiveFamilyId(): Promise<string | null> {
  const appUser = await getCurrentAppUser();
  return appUser?.familyMemberships[0]?.familyId || null;
}

/**
 * Create a requisition (equivalent to Plaid's link token) for GoCardless
 */
export async function createGoCardlessRequisition(bank: BankInfo, redirectUrl: string = "http://localhost:3000/dashboard/financial") {
  try {
    const appUser = await getCurrentAppUser();
    if (!appUser) {
      throw new Error("User not authenticated");
    }

    const familyId = await getActiveFamilyId();
    if (!familyId) {
      throw new Error("No family found");
    }

    if (!bank.institutionId?.gocardless) {
      throw new Error("Bank not supported by GoCardless");
    }

    // Generate access token
    const tokenData = await nordigenClient.generateToken();
    
    // Create requisition
    const requisition = await nordigenClient.initSession({
      redirectUrl,
      institutionId: bank.institutionId.gocardless,
      reference: `${familyId}-${Date.now()}`, // Unique reference
      userLanguage: "en",
    });

    return {
      success: true,
      requisitionId: requisition.id,
      authUrl: requisition.link,
      institutionId: bank.institutionId.gocardless,
    };
  } catch (error) {
    console.error("Error creating GoCardless requisition:", error);
    throw new Error("Failed to create bank connection");
  }
}

/**
 * Complete GoCardless connection after user authorization
 */
export async function completeGoCardlessConnection(requisitionId: string, bank: BankInfo) {
  const familyId = await getActiveFamilyId();
  if (!familyId) {
    throw new Error("User not authenticated or no family found");
  }

  const prisma = getPrismaClient();

  try {
    // Get requisition details
    const requisition = await nordigenClient.requisition.getRequisitionById(requisitionId);
    
    if (requisition.status !== "LN") { // LN = Linked
      throw new Error("Bank connection not completed");
    }

    // Create bank connection record
    const bankConnection = await prisma.bankConnection.create({
      data: {
        provider: "GOCARDLESS",
        accessToken: requisitionId, // For GoCardless, we use requisition ID as access token
        itemId: requisitionId,
        institutionId: bank.institutionId?.gocardless || null,
        institutionName: bank.displayName,
        institutionLogo: bank.logo || null,
        institutionCountry: bank.country,
        familyId,
      },
    });

    // Get accounts for this requisition
    const accountIds = requisition.accounts;
    const createdAccounts = [];

    for (const accountId of accountIds) {
      const accountDetails = await nordigenClient.account(accountId).getDetails();
      const accountBalances = await nordigenClient.account(accountId).getBalances();

      // Map GoCardless account type to our AccountType enum
      const getAccountType = (gcType: string): AccountType => {
        switch (gcType?.toLowerCase()) {
          case "current":
          case "checking":
            return AccountType.CHECKING;
          case "savings":
            return AccountType.SAVINGS;
          case "credit":
          case "credit_card":
            return AccountType.CREDIT_CARD;
          case "investment":
            return AccountType.INVESTMENT;
          case "loan":
            return AccountType.LOAN;
          default:
            return AccountType.OTHER;
        }
      };

      const accountType = getAccountType(accountDetails.usage || accountDetails.product || "");
      const currentBalance = accountBalances.balances?.[0]?.balanceAmount?.amount || 0;

      // Create financial account
      const financialAccount = await prisma.financialAccount.create({
        data: {
          name: accountDetails.name || `${bank.displayName} Account`,
          type: accountType,
          balance: parseFloat(currentBalance.toString()),
          currency: accountBalances.balances?.[0]?.balanceAmount?.currency || "EUR",
          institution: bank.displayName,
          accountNumber: accountDetails.iban ? `****${accountDetails.iban.slice(-4)}` : null,
          familyId,
        },
      });

      // Create connected account mapping
      await prisma.connectedAccount.create({
        data: {
          providerAccountId: accountId,
          accountName: accountDetails.name || `${bank.displayName} Account`,
          accountType: accountDetails.usage || "current",
          accountSubtype: accountDetails.product || null,
          iban: accountDetails.iban || null,
          connectionId: bankConnection.id,
          financialAccountId: financialAccount.id,
        },
      });

      createdAccounts.push({
        ...financialAccount,
        providerAccountId: accountId,
      });
    }

    return {
      success: true,
      accounts: createdAccounts,
      message: `Successfully connected ${createdAccounts.length} accounts via GoCardless`,
    };
  } catch (error) {
    console.error("Error completing GoCardless connection:", error);
    throw new Error("Failed to complete bank connection");
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Import transactions from GoCardless accounts
 */
export async function importGoCardlessTransactions(startDate?: Date, endDate?: Date) {
  const familyId = await getActiveFamilyId();
  if (!familyId) {
    throw new Error("User not authenticated or no family found");
  }

  const prisma = getPrismaClient();

  try {
    // Get all GoCardless connections for this family
    const connections = await prisma.bankConnection.findMany({
      where: { 
        familyId,
        provider: "GOCARDLESS"
      },
      include: {
        connectedAccounts: {
          include: {
            financialAccount: true,
          },
        },
      },
    });

    if (connections.length === 0) {
      throw new Error("No GoCardless accounts connected");
    }

    let totalTransactions = 0;

    for (const connection of connections) {
      for (const connectedAccount of connection.connectedAccounts) {
        if (!connectedAccount.financialAccount) continue;

        try {
          // Get transactions from GoCardless
          const transactions = await nordigenClient
            .account(connectedAccount.providerAccountId)
            .getTransactions({
              dateFrom: startDate?.toISOString().split('T')[0],
              dateTo: endDate?.toISOString().split('T')[0],
            });

          for (const transaction of transactions.transactions.booked || []) {
            // Check if transaction already exists
            const existingTransaction = await prisma.transaction.findFirst({
              where: {
                plaidTransactionId: transaction.transactionId,
                accountId: connectedAccount.financialAccount.id,
              },
            });

            if (existingTransaction) continue;

            // Determine transaction type
            const amount = parseFloat(transaction.transactionAmount.amount);
            const transactionType = amount < 0 ? "EXPENSE" : "INCOME";

            // Create transaction
            await prisma.transaction.create({
              data: {
                date: new Date(transaction.bookingDate || transaction.valueDate),
                description: transaction.remittanceInformationUnstructured || 
                           transaction.creditorName || 
                           transaction.debtorName || 
                           "Transaction",
                merchant: transaction.creditorName || transaction.debtorName || "Unknown",
                amount: Math.abs(amount),
                type: transactionType,
                status: "NEEDS_CATEGORIZATION",
                accountId: connectedAccount.financialAccount.id,
                familyId,
                // GoCardless-specific fields
                plaidTransactionId: transaction.transactionId, // Reusing field for GoCardless ID
                iso_currency_code: transaction.transactionAmount.currency,
                pending: false, // GoCardless only returns booked transactions
                tags: [`gocardless:${transaction.transactionId}`],
              },
            });

            totalTransactions++;
          }
        } catch (accountError) {
          console.warn(`Failed to import transactions for account ${connectedAccount.providerAccountId}:`, accountError);
          // Continue with other accounts
        }
      }
    }

    return {
      success: true,
      transactionsImported: totalTransactions,
      message: `Successfully imported ${totalTransactions} transactions from GoCardless`,
    };
  } catch (error) {
    console.error("Error importing GoCardless transactions:", error);
    throw new Error("Failed to import transactions");
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Sync account balances from GoCardless
 */
export async function syncGoCardlessBalances() {
  const familyId = await getActiveFamilyId();
  if (!familyId) {
    throw new Error("User not authenticated or no family found");
  }

  const prisma = getPrismaClient();

  try {
    // Get all GoCardless connections
    const connections = await prisma.bankConnection.findMany({
      where: { 
        familyId,
        provider: "GOCARDLESS"
      },
      include: {
        connectedAccounts: {
          include: {
            financialAccount: true,
          },
        },
      },
    });

    let accountsUpdated = 0;

    for (const connection of connections) {
      for (const connectedAccount of connection.connectedAccounts) {
        if (!connectedAccount.financialAccount) continue;

        try {
          const balances = await nordigenClient
            .account(connectedAccount.providerAccountId)
            .getBalances();

          const currentBalance = balances.balances?.[0]?.balanceAmount?.amount || 0;

          await prisma.financialAccount.update({
            where: { id: connectedAccount.financialAccount.id },
            data: {
              balance: parseFloat(currentBalance.toString()),
            },
          });

          accountsUpdated++;
        } catch (accountError) {
          console.warn(`Failed to sync balance for account ${connectedAccount.providerAccountId}:`, accountError);
        }
      }
    }

    return {
      success: true,
      accountsUpdated,
      message: `Successfully updated ${accountsUpdated} account balances`,
    };
  } catch (error) {
    console.error("Error syncing GoCardless balances:", error);
    throw new Error("Failed to sync account balances");
  } finally {
    await prisma.$disconnect();
  }
}