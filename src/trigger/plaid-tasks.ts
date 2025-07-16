import { logger, task, schedules } from "@trigger.dev/sdk/v3";
import { PrismaClient, AccountType } from "@/generated/prisma";
import {
  Configuration,
  PlaidApi,
  PlaidEnvironments,
  ItemPublicTokenExchangeRequest,
  AccountsGetRequest,
  TransactionsGetRequest,
  Account,
} from "plaid";

// Initialize Plaid client
const configuration = new Configuration({
  basePath: PlaidEnvironments.sandbox,
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

// Map Plaid account type to our AccountType enum
const getAccountType = (plaidType: string, plaidSubtype: string): AccountType => {
  switch (plaidType) {
    case "depository":
      return plaidSubtype === "savings" ? AccountType.SAVINGS : AccountType.CHECKING;
    case "credit":
      return AccountType.CREDIT_CARD;
    case "investment":
      return AccountType.INVESTMENT;
    case "loan":
      return plaidSubtype === "mortgage" ? AccountType.MORTGAGE : AccountType.LOAN;
    default:
      return AccountType.OTHER;
  }
};

/**
 * Exchange Plaid public token for access token and create accounts
 */
export const exchangePlaidPublicToken = task({
  id: "exchange-plaid-public-token",
  maxDuration: 300, // 5 minutes
  run: async (payload: { publicToken: string; familyId: string }) => {
    const { publicToken, familyId } = payload;
    const prisma = getPrismaClient();

    logger.log("Starting Plaid public token exchange", { familyId });

    try {
      // Exchange public token for access token
      const exchangeRequest: ItemPublicTokenExchangeRequest = {
        public_token: publicToken,
      };

      const exchangeResponse = await plaidClient.itemPublicTokenExchange(exchangeRequest);
      const accessToken = exchangeResponse.data.access_token;
      const itemId = exchangeResponse.data.item_id;

      logger.log("Successfully exchanged public token", { itemId });

      // Get accounts information
      const accountsRequest: AccountsGetRequest = {
        access_token: accessToken,
      };

      const accountsResponse = await plaidClient.accountsGet(accountsRequest);
      const accounts = accountsResponse.data.accounts;

      logger.log("Retrieved accounts from Plaid", { accountCount: accounts.length });

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

      logger.log("Successfully created accounts", { 
        accountCount: createdAccounts.length,
        accountIds: createdAccounts.map(a => a.id)
      });

      return {
        success: true,
        accounts: createdAccounts,
        message: `Successfully connected ${accounts.length} accounts`,
      };
    } catch (error) {
      logger.error("Error exchanging Plaid public token", { error, familyId });
      throw new Error(`Failed to connect accounts: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      await prisma.$disconnect();
    }
  },
});

/**
 * Import transactions from all connected Plaid accounts
 */
export const importPlaidTransactions = task({
  id: "import-plaid-transactions",
  maxDuration: 600, // 10 minutes for large transaction imports
  run: async (payload: { 
    familyId: string; 
    startDate?: string; 
    endDate?: string;
  }) => {
    const { familyId, startDate, endDate } = payload;
    const prisma = getPrismaClient();

    logger.log("Starting Plaid transaction import", { familyId, startDate, endDate });

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

      logger.log("Found Plaid items", { itemCount: plaidItems.length });

      let totalTransactions = 0;

      for (const item of plaidItems) {
        logger.log("Processing Plaid item", { itemId: item.itemId });

        // Get accounts for this item
        const accountsRequest: AccountsGetRequest = {
          access_token: item.accessToken,
        };

        const accountsResponse = await plaidClient.accountsGet(accountsRequest);
        const accounts = accountsResponse.data.accounts;

        // Set date range (default to last 30 days)
        const end = endDate ? new Date(endDate) : new Date();
        const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        // Get transactions
        const transactionsRequest: TransactionsGetRequest = {
          access_token: item.accessToken,
          start_date: start.toISOString().split("T")[0],
          end_date: end.toISOString().split("T")[0],
        };

        const transactionsResponse = await plaidClient.transactionsGet(transactionsRequest);
        const transactions = transactionsResponse.data.transactions;

        logger.log("Retrieved transactions from Plaid", { 
          itemId: item.itemId, 
          transactionCount: transactions.length 
        });

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
            logger.warn("No financial account found for Plaid account", { 
              plaidAccountId: transaction.account_id 
            });
            continue;
          }

          const financialAccount = plaidAccountRecord.financialAccount;

          // Check if transaction already exists
          const existingTransaction = await prisma.transaction.findFirst({
            where: {
              plaidTransactionId: transaction.transaction_id,
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
              tags: [transaction.transaction_id],
            },
          });

          totalTransactions++;
        }
      }

      logger.log("Completed Plaid transaction import", { 
        familyId, 
        totalTransactions 
      });

      return {
        success: true,
        transactionsImported: totalTransactions,
        message: `Successfully imported ${totalTransactions} transactions`,
      };
    } catch (error) {
      logger.error("Error importing Plaid transactions", { error, familyId });
      throw new Error(`Failed to import transactions: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      await prisma.$disconnect();
    }
  },
});

/**
 * Sync account balances from Plaid
 */
export const syncPlaidBalances = task({
  id: "sync-plaid-balances",
  maxDuration: 300, // 5 minutes
  run: async (payload: { familyId: string }) => {
    const { familyId } = payload;
    const prisma = getPrismaClient();

    logger.log("Starting Plaid balance sync", { familyId });

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

      logger.log("Found Plaid items for balance sync", { itemCount: plaidItems.length });

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

      logger.log("Completed Plaid balance sync", { 
        familyId, 
        accountsUpdated 
      });

      return {
        success: true,
        accountsUpdated,
        message: `Successfully updated ${accountsUpdated} account balances`,
      };
    } catch (error) {
      logger.error("Error syncing Plaid balances", { error, familyId });
      throw new Error(`Failed to sync account balances: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      await prisma.$disconnect();
    }
  },
});

/**
 * Scheduled task to automatically sync Plaid balances daily
 */
export const scheduledPlaidBalanceSync = schedules.task({
  id: "scheduled-plaid-balance-sync",
  cron: "0 6 * * *", // Run daily at 6 AM
  run: async (payload) => {
    const prisma = getPrismaClient();
    
    logger.log("Starting scheduled Plaid balance sync for all families");

    try {
      // Get all families with Plaid connections
      const familiesWithPlaid = await prisma.family.findMany({
        where: {
          plaidItems: {
            some: {},
          },
        },
        select: {
          id: true,
          name: true,
        },
      });

      logger.log("Found families with Plaid connections", { 
        familyCount: familiesWithPlaid.length 
      });

      // Trigger balance sync for each family
      for (const family of familiesWithPlaid) {
        await syncPlaidBalances.trigger({
          familyId: family.id,
        });
      }

      return {
        success: true,
        familiesProcessed: familiesWithPlaid.length,
        message: `Triggered balance sync for ${familiesWithPlaid.length} families`,
      };
    } catch (error) {
      logger.error("Error in scheduled Plaid balance sync", { error });
      throw error;
    } finally {
      await prisma.$disconnect();
    }
  },
});

/**
 * Scheduled task to automatically import new transactions daily
 */
export const scheduledPlaidTransactionImport = schedules.task({
  id: "scheduled-plaid-transaction-import",
  cron: "0 7 * * *", // Run daily at 7 AM
  run: async (payload) => {
    const prisma = getPrismaClient();
    
    logger.log("Starting scheduled Plaid transaction import for all families");

    try {
      // Get all families with Plaid connections
      const familiesWithPlaid = await prisma.family.findMany({
        where: {
          plaidItems: {
            some: {},
          },
        },
        select: {
          id: true,
          name: true,
        },
      });

      logger.log("Found families with Plaid connections", { 
        familyCount: familiesWithPlaid.length 
      });

      // Trigger transaction import for each family (last 7 days)
      const endDate = new Date();
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      for (const family of familiesWithPlaid) {
        await importPlaidTransactions.trigger({
          familyId: family.id,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        });
      }

      return {
        success: true,
        familiesProcessed: familiesWithPlaid.length,
        message: `Triggered transaction import for ${familiesWithPlaid.length} families`,
      };
    } catch (error) {
      logger.error("Error in scheduled Plaid transaction import", { error });
      throw error;
    } finally {
      await prisma.$disconnect();
    }
  },
});