"use server";

import {
  Configuration,
  PlaidApi,
  PlaidEnvironments,
  LinkTokenCreateRequest,
  ItemPublicTokenExchangeRequest,
  AccountsGetRequest,
  TransactionsGetRequest,
  CountryCode,
  Products,
} from "plaid";
import { PrismaClient, AccountType } from "@/generated/prisma";
import { getCurrentAppUser } from "./user-actions";

// Initialize Plaid client
const configuration = new Configuration({
  basePath: PlaidEnvironments.sandbox, // Use sandbox for development
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID!,
      "PLAID-SECRET": process.env.PLAID_SECRET!,
      "Plaid-Version": "2020-09-14",
    },
  },
});

const plaidClient = new PlaidApi(configuration);

function getPrismaClient() {
  return new PrismaClient();
}

async function getActiveFamilyId(): Promise<string | null> {
  const appUser = await getCurrentAppUser();
  return appUser?.familyMemberships[0]?.familyId || null;
}

/**
 * Create a link token for Plaid Link initialization
 */
export async function createLinkToken() {
  try {
    const appUser = await getCurrentAppUser();
    if (!appUser) {
      throw new Error("User not authenticated");
    }

    const request: LinkTokenCreateRequest = {
      products: [Products.Transactions],
      client_name: "Badget",
      country_codes: [CountryCode.Us],
      language: "en",
      user: {
        client_user_id: appUser.id,
      },
    };

    const response = await plaidClient.linkTokenCreate(request);
    return { link_token: response.data.link_token };
  } catch (error) {
    console.error("Error creating link token:", error);
    throw new Error("Failed to create link token");
  }
}

/**
 * Exchange public token for access token and store account information
 */
export async function exchangePublicToken(publicToken: string) {
  const familyId = await getActiveFamilyId();
  if (!familyId) {
    throw new Error("User not authenticated or no family found");
  }

  const prisma = getPrismaClient();

  try {
    // Exchange public token for access token
    const exchangeRequest: ItemPublicTokenExchangeRequest = {
      public_token: publicToken,
    };

    const exchangeResponse =
      await plaidClient.itemPublicTokenExchange(exchangeRequest);
    const accessToken = exchangeResponse.data.access_token;
    const itemId = exchangeResponse.data.item_id;

    // Get accounts information
    const accountsRequest: AccountsGetRequest = {
      access_token: accessToken,
    };

    const accountsResponse = await plaidClient.accountsGet(accountsRequest);
    const accounts = accountsResponse.data.accounts;

    // Create Plaid item record
    const plaidItem = await prisma.plaidItem.create({
      data: {
        accessToken,
        itemId,
        institutionId: accountsResponse.data.item.institution_id || null,
        familyId,
      },
    });

    // Store accounts in database
    const createdAccounts = await Promise.all(
      accounts.map(async (account) => {
        // Map Plaid account type to our AccountType enum
        const getAccountType = (
          plaidType: string,
          plaidSubtype: string
        ): AccountType => {
          switch (plaidType) {
            case "depository":
              return plaidSubtype === "savings"
                ? AccountType.SAVINGS
                : AccountType.CHECKING;
            case "credit":
              return AccountType.CREDIT_CARD;
            case "investment":
              return AccountType.INVESTMENT;
            case "loan":
              return account.subtype === "mortgage"
                ? AccountType.MORTGAGE
                : AccountType.LOAN;
            default:
              return AccountType.OTHER;
          }
        };

        const accountType = getAccountType(account.type, account.subtype || "");

        // Create financial account in our database
        const financialAccount = await prisma.financialAccount.create({
          data: {
            name: account.name,
            type: accountType,
            balance: account.balances.current || 0,
            currency: account.balances.iso_currency_code || "USD",
            institution: accountsResponse.data.item.institution_id || null,
            accountNumber: account.mask ? `****${account.mask}` : null,
            familyId,
          },
        });

        // Create Plaid account mapping
        await prisma.plaidAccount.create({
          data: {
            plaidAccountId: account.account_id,
            accountName: account.name,
            accountType: account.type,
            accountSubtype: account.subtype || null,
            mask: account.mask || null,
            plaidItemId: plaidItem.id,
            financialAccountId: financialAccount.id,
          },
        });

        return {
          ...financialAccount,
          plaidAccountId: account.account_id,
        };
      })
    );

    return {
      success: true,
      accounts: createdAccounts,
      message: `Successfully connected ${accounts.length} accounts`,
    };
  } catch (error) {
    console.error("Error exchanging public token:", error);
    throw new Error("Failed to connect accounts");
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Import transactions for all connected Plaid accounts
 */
export async function importTransactions(startDate?: Date, endDate?: Date) {
  const familyId = await getActiveFamilyId();
  if (!familyId) {
    throw new Error("User not authenticated or no family found");
  }

  const prisma = getPrismaClient();

  try {
    // Get all Plaid access tokens for this family
    const plaidItems = await prisma.plaidItem.findMany({
      where: { familyId },
      select: {
        accessToken: true,
        itemId: true,
        id: true,
      },
    });

    if (plaidItems.length === 0) {
      throw new Error("No Plaid accounts connected");
    }

    let totalTransactions = 0;

    for (const item of plaidItems) {
      // Get accounts for this item
      const accountsRequest: AccountsGetRequest = {
        access_token: item.accessToken,
      };

      const accountsResponse = await plaidClient.accountsGet(accountsRequest);
      const accounts = accountsResponse.data.accounts;

      // Set date range (default to last 30 days)
      const end = endDate || new Date();
      const start =
        startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      // Get transactions
      const transactionsRequest: TransactionsGetRequest = {
        access_token: item.accessToken,
        start_date: start.toISOString().split("T")[0],
        end_date: end.toISOString().split("T")[0],
      };

      const transactionsResponse =
        await plaidClient.transactionsGet(transactionsRequest);
      const transactions = transactionsResponse.data.transactions;

      // Import transactions
      for (const transaction of transactions) {
        // Find corresponding financial account using Plaid account mapping
        const plaidAccountRecord = await prisma.plaidAccount.findFirst({
          where: {
            plaidAccountId: transaction.account_id,
            plaidItem: {
              familyId,
            },
          },
          include: {
            financialAccount: true,
          },
        });

        if (!plaidAccountRecord?.financialAccount) {
          console.warn(`No financial account found for Plaid account ${transaction.account_id}`);
          continue;
        }

        const financialAccount = plaidAccountRecord.financialAccount;

        // Check if transaction already exists
        const existingTransaction = await prisma.transaction.findFirst({
          where: {
            accountId: financialAccount.id,
            date: new Date(transaction.date),
            amount: Math.abs(transaction.amount),
            description: transaction.name,
          },
        });

        if (existingTransaction) continue;

        // Determine transaction type
        const transactionType = transaction.amount < 0 ? "EXPENSE" : "INCOME";

        // Create transaction with enhanced Plaid data
        await prisma.transaction.create({
          data: {
            date: new Date(transaction.date),
            description: transaction.name,
            merchant: transaction.merchant_name || transaction.name,
            amount: Math.abs(transaction.amount),
            type: transactionType,
            status: "NEEDS_CATEGORIZATION",
            accountId: financialAccount.id,
            familyId,
            // Enhanced Plaid-specific fields
            plaidTransactionId: transaction.transaction_id,
            plaidCategory: transaction.category || [],
            plaidSubcategory: transaction.category?.[0] || null,
            merchantLogo: transaction.logo_url || null,
            location: transaction.location ? {
              address: transaction.location.address,
              city: transaction.location.city,
              region: transaction.location.region,
              postal_code: transaction.location.postal_code,
              country: transaction.location.country,
              lat: transaction.location.lat,
              lon: transaction.location.lon,
            } : null,
            pending: transaction.pending,
            authorizedDate: transaction.authorized_date ? new Date(transaction.authorized_date) : null,
            iso_currency_code: transaction.iso_currency_code,
            // Store original transaction ID in tags for backward compatibility
            tags: [transaction.transaction_id],
          },
        });

        totalTransactions++;
      }
    }

    return {
      success: true,
      transactionsImported: totalTransactions,
      message: `Successfully imported ${totalTransactions} transactions`,
    };
  } catch (error) {
    console.error("Error importing transactions:", error);
    throw new Error("Failed to import transactions");
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Sync account balances from Plaid
 */
export async function syncAccountBalances() {
  const familyId = await getActiveFamilyId();
  if (!familyId) {
    throw new Error("User not authenticated or no family found");
  }

  const prisma = getPrismaClient();

  try {
    // Get all Plaid access tokens for this family
    const plaidItems = await prisma.plaidItem.findMany({
      where: { familyId },
      select: {
        accessToken: true,
        itemId: true,
        id: true,
      },
    });

    let accountsUpdated = 0;

    for (const item of plaidItems) {
      const accountsRequest: AccountsGetRequest = {
        access_token: item.accessToken,
      };

      const accountsResponse = await plaidClient.accountsGet(accountsRequest);
      const accounts = accountsResponse.data.accounts;

      for (const account of accounts) {
        // Find corresponding financial account using Plaid account mapping
        const plaidAccountRecord = await prisma.plaidAccount.findFirst({
          where: {
            plaidAccountId: account.account_id,
            plaidItem: {
              familyId,
            },
          },
          include: {
            financialAccount: true,
          },
        });

        if (plaidAccountRecord?.financialAccount) {
          await prisma.financialAccount.update({
            where: { id: plaidAccountRecord.financialAccount.id },
            data: {
              balance: account.balances.current || 0,
            },
          });
          accountsUpdated++;
        }
      }
    }

    return {
      success: true,
      accountsUpdated,
      message: `Successfully updated ${accountsUpdated} account balances`,
    };
  } catch (error) {
    console.error("Error syncing account balances:", error);
    throw new Error("Failed to sync account balances");
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Remove all Plaid connections and data for testing purposes
 */
export async function removeAllPlaidData() {
  const familyId = await getActiveFamilyId();
  if (!familyId) {
    throw new Error("User not authenticated or no family found");
  }

  const prisma = getPrismaClient();

  try {
    // Get all Plaid items for this family
    const plaidItems = await prisma.plaidItem.findMany({
      where: { familyId },
      include: {
        financialAccounts: {
          include: {
            financialAccount: true,
          },
        },
      },
    });

    let deletedAccounts = 0;
    let deletedTransactions = 0;

    // Delete financial accounts and their transactions
    for (const plaidItem of plaidItems) {
      for (const plaidAccount of plaidItem.financialAccounts) {
        if (plaidAccount.financialAccount) {
          // Delete transactions for this account
          const transactionDeleteResult = await prisma.transaction.deleteMany({
            where: {
              accountId: plaidAccount.financialAccount.id,
              familyId,
            },
          });
          deletedTransactions += transactionDeleteResult.count;

          // Delete the financial account
          await prisma.financialAccount.delete({
            where: { id: plaidAccount.financialAccount.id },
          });
          deletedAccounts++;
        }
      }
    }

    // Delete Plaid account mappings
    await prisma.plaidAccount.deleteMany({
      where: {
        plaidItem: {
          familyId,
        },
      },
    });

    // Delete Plaid items
    await prisma.plaidItem.deleteMany({
      where: { familyId },
    });

    return {
      success: true,
      deletedAccounts,
      deletedTransactions,
      message: `Removed ${deletedAccounts} accounts and ${deletedTransactions} transactions`,
    };
  } catch (error) {
    console.error("Error removing Plaid data:", error);
    throw new Error("Failed to remove Plaid data");
  } finally {
    await prisma.$disconnect();
  }
}
