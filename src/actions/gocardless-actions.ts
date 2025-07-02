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
 * Generate access token for GoCardless API
 */
async function generateAccessToken() {
  try {
    const tokenData = await nordigenClient.generateToken();
    return tokenData.access;
  } catch (error) {
    console.error("Error generating GoCardless access token:", error);
    throw new Error("Failed to generate access token");
  }
}

/**
 * Create a requisition (equivalent to Plaid's link token) for GoCardless
 * Following the official API documentation pattern
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

    // Generate access token first (Step 1 from API docs)
    await generateAccessToken();
    
    // Create end user agreement (Step 3 from API docs) - optional but recommended
    const agreement = await nordigenClient.agreement.createEuaAgreement({
      institutionId: bank.institutionId.gocardless,
      maxHistoricalDays: 90, // 90 days of transaction history
      accessValidForDays: 90, // 90 days of account access
      accessScope: ["balances", "details", "transactions"]
    });

    // Create requisition (Step 4 from API docs)
    const requisition = await nordigenClient.initSession({
      redirectUrl,
      institutionId: bank.institutionId.gocardless,
      agreement: agreement.id,
      reference: `family-${familyId}-${Date.now()}`, // Unique reference for tracking
      userLanguage: "EN",
    });

    return {
      success: true,
      requisitionId: requisition.id,
      authUrl: requisition.link,
      institutionId: bank.institutionId.gocardless,
      agreementId: agreement.id,
    };
  } catch (error) {
    console.error("Error creating GoCardless requisition:", error);
    throw new Error(`Failed to create bank connection: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Complete GoCardless connection after user authorization
 * Following Step 5 and 6 from the API documentation
 */
export async function completeGoCardlessConnection(requisitionId: string, bank: BankInfo) {
  const familyId = await getActiveFamilyId();
  if (!familyId) {
    throw new Error("User not authenticated or no family found");
  }

  const prisma = getPrismaClient();

  try {
    // Generate fresh access token
    await generateAccessToken();

    // Step 5: Get requisition details to check status and get account IDs
    const requisition = await nordigenClient.requisition.getRequisitionById(requisitionId);
    
    if (requisition.status !== "LN") { // LN = Linked
      throw new Error(`Bank connection not completed. Status: ${requisition.status}`);
    }

    if (!requisition.accounts || requisition.accounts.length === 0) {
      throw new Error("No accounts found for this connection");
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

    // Step 6: Access account details, balances for each account
    const createdAccounts = [];

    for (const accountId of requisition.accounts) {
      try {
        // Get account details
        const accountDetails = await nordigenClient.account(accountId).getDetails();
        
        // Get account balances
        const accountBalances = await nordigenClient.account(accountId).getBalances();

        // Map GoCardless account type to our AccountType enum
        const getAccountType = (details: any): AccountType => {
          const usage = details.usage?.toLowerCase();
          const product = details.product?.toLowerCase();
          const cashAccountType = details.cashAccountType?.toLowerCase();
          
          if (usage === "priv" || cashAccountType === "cacc") {
            return AccountType.CHECKING;
          } else if (usage === "orga" || product?.includes("business")) {
            return AccountType.CHECKING; // Business checking
          } else if (product?.includes("savings") || cashAccountType === "svgs") {
            return AccountType.SAVINGS;
          } else if (product?.includes("credit") || cashAccountType === "card") {
            return AccountType.CREDIT_CARD;
          } else if (product?.includes("loan")) {
            return AccountType.LOAN;
          } else if (product?.includes("investment")) {
            return AccountType.INVESTMENT;
          }
          return AccountType.OTHER;
        };

        const accountType = getAccountType(accountDetails);
        
                 // Get current balance (prefer interimAvailable, then closingBooked)
         const balances = accountBalances.balances || [];
         const availableBalance = balances.find((b: any) => b.balanceType === "interimAvailable");
         const currentBalance = availableBalance || balances.find((b: any) => b.balanceType === "closingBooked") || balances[0];
        
        const balance = currentBalance?.balanceAmount?.amount ? 
          parseFloat(currentBalance.balanceAmount.amount) : 0;
        
        const currency = currentBalance?.balanceAmount?.currency || "EUR";

        // Create financial account
        const financialAccount = await prisma.financialAccount.create({
          data: {
            name: accountDetails.name || 
                  (accountDetails.iban ? `${bank.displayName} ****${accountDetails.iban.slice(-4)}` : `${bank.displayName} Account`),
            type: accountType,
            balance,
            currency,
            institution: bank.displayName,
            accountNumber: accountDetails.iban ? `****${accountDetails.iban.slice(-4)}` : 
                          accountDetails.bban ? `****${accountDetails.bban.slice(-4)}` : null,
            familyId,
          },
        });

        // Create connected account mapping
        await prisma.connectedAccount.create({
          data: {
            providerAccountId: accountId,
            accountName: accountDetails.name || financialAccount.name,
            accountType: accountDetails.usage || accountDetails.cashAccountType || "current",
            accountSubtype: accountDetails.product || null,
            iban: accountDetails.iban || null,
            connectionId: bankConnection.id,
            financialAccountId: financialAccount.id,
          },
        });

        createdAccounts.push({
          ...financialAccount,
          providerAccountId: accountId,
          iban: accountDetails.iban,
        });
      } catch (accountError) {
        console.warn(`Failed to process account ${accountId}:`, accountError);
        // Continue with other accounts
      }
    }

    if (createdAccounts.length === 0) {
      throw new Error("No accounts could be processed successfully");
    }

    return {
      success: true,
      accounts: createdAccounts,
      message: `Successfully connected ${createdAccounts.length} accounts via GoCardless`,
    };
  } catch (error) {
    console.error("Error completing GoCardless connection:", error);
    throw new Error(`Failed to complete bank connection: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Import transactions from GoCardless accounts
 * Following Step 6 from the API documentation
 */
export async function importGoCardlessTransactions(startDate?: Date, endDate?: Date) {
  const familyId = await getActiveFamilyId();
  if (!familyId) {
    throw new Error("User not authenticated or no family found");
  }

  const prisma = getPrismaClient();

  try {
    // Generate fresh access token
    await generateAccessToken();

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
          // Get transactions from GoCardless API
          const transactionParams: any = {};
          if (startDate) {
            transactionParams.dateFrom = startDate.toISOString().split('T')[0];
          }
          if (endDate) {
            transactionParams.dateTo = endDate.toISOString().split('T')[0];
          }

          const transactionData = await nordigenClient
            .account(connectedAccount.providerAccountId)
            .getTransactions(transactionParams);

          // Process booked transactions
          const bookedTransactions = transactionData.transactions?.booked || [];
          const pendingTransactions = transactionData.transactions?.pending || [];

          // Process booked transactions
          for (const transaction of bookedTransactions) {
            await processGoCardlessTransaction(transaction, connectedAccount, familyId, false, prisma);
            totalTransactions++;
          }

          // Process pending transactions
          for (const transaction of pendingTransactions) {
            await processGoCardlessTransaction(transaction, connectedAccount, familyId, true, prisma);
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
    throw new Error(`Failed to import transactions: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Process a single GoCardless transaction
 */
async function processGoCardlessTransaction(
  transaction: any, 
  connectedAccount: any, 
  familyId: string, 
  isPending: boolean,
  prisma: PrismaClient
) {
  // Create unique transaction ID for GoCardless
  const transactionId = transaction.transactionId || 
    `${connectedAccount.providerAccountId}-${transaction.bookingDate || transaction.valueDate}-${transaction.transactionAmount?.amount}-${Math.random()}`;

  // Check if transaction already exists
  const existingTransaction = await prisma.transaction.findFirst({
    where: {
      plaidTransactionId: transactionId,
      accountId: connectedAccount.financialAccount.id,
    },
  });

  if (existingTransaction) return;

  // Determine transaction type and amount
  const amount = parseFloat(transaction.transactionAmount?.amount || "0");
  const transactionType = amount < 0 ? "EXPENSE" : "INCOME";

  // Extract merchant/counterparty name
  const merchant = transaction.creditorName || 
                  transaction.debtorName || 
                  transaction.remittanceInformationUnstructured?.split(' ')[0] ||
                  "Unknown";

  // Extract description
  const description = transaction.remittanceInformationUnstructured || 
                     transaction.additionalInformation ||
                     (transaction.creditorName ? `Payment to ${transaction.creditorName}` : 
                      transaction.debtorName ? `Payment from ${transaction.debtorName}` : 
                      "Transaction");

  // Create transaction
  await prisma.transaction.create({
    data: {
      date: new Date(transaction.bookingDate || transaction.valueDate || new Date()),
      description: description.substring(0, 255), // Ensure it fits in DB
      merchant: merchant.substring(0, 100), // Ensure it fits in DB
      amount: Math.abs(amount),
      type: transactionType,
      status: "NEEDS_CATEGORIZATION",
      accountId: connectedAccount.financialAccount.id,
      familyId,
      // GoCardless-specific fields stored in existing Plaid fields
      plaidTransactionId: transactionId,
      iso_currency_code: transaction.transactionAmount?.currency || "EUR",
      pending: isPending,
      // Store additional GoCardless data in tags
      tags: [
        `gocardless:${transactionId}`,
        ...(transaction.bankTransactionCode ? [`code:${transaction.bankTransactionCode}`] : []),
        ...(transaction.creditorAccount?.iban ? [`creditor:${transaction.creditorAccount.iban}`] : []),
        ...(transaction.debtorAccount?.iban ? [`debtor:${transaction.debtorAccount.iban}`] : []),
      ],
    },
  });
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
    // Generate fresh access token
    await generateAccessToken();

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
          const balanceData = await nordigenClient
            .account(connectedAccount.providerAccountId)
            .getBalances();

                     const balances = balanceData.balances || [];
           
           // Prefer interimAvailable balance, then closingBooked
           const availableBalance = balances.find((b: any) => b.balanceType === "interimAvailable");
           const currentBalance = availableBalance || balances.find((b: any) => b.balanceType === "closingBooked") || balances[0];

          if (currentBalance?.balanceAmount?.amount !== undefined) {
            const balance = parseFloat(currentBalance.balanceAmount.amount);
            
            await prisma.financialAccount.update({
              where: { id: connectedAccount.financialAccount.id },
              data: {
                balance,
                currency: currentBalance.balanceAmount.currency || connectedAccount.financialAccount.currency,
              },
            });

            accountsUpdated++;
          }
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
    throw new Error(`Failed to sync account balances: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    await prisma.$disconnect();
  }
}