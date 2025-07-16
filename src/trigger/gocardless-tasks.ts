import { logger, task, schedules } from "@trigger.dev/sdk/v3";
import { PrismaClient, AccountType, Prisma } from "@/generated/prisma";
import type { BankInfo } from "@/data/banks";

// GoCardless Bank Account Data API base URL
const GOCARDLESS_API_BASE = "https://bankaccountdata.gocardless.com/api/v2";

// Types for GoCardless API responses
interface TokenResponse {
  access: string;
  access_expires: number;
  refresh: string;
  refresh_expires: number;
}

interface AccountDetails {
  resourceId: string;
  iban?: string;
  bban?: string;
  msisdn?: string;
  currency: string;
  name?: string;
  displayName?: string;
  product?: string;
  cashAccountType?: string;
  status?: string;
  bic?: string;
  linkedAccounts?: string;
  usage?: string;
  details?: string;
  ownerName?: string;
  ownerAddressStructured?: Record<string, unknown>;
  ownerAddressUnstructured?: string;
}

interface Balance {
  balanceAmount: {
    amount: string;
    currency: string;
  };
  balanceType: string;
  referenceDate?: string;
  lastChangeDateTime?: string;
}

interface Transaction {
  transactionId: string;
  debtorName?: string;
  debtorAccount?: {
    iban?: string;
    bban?: string;
  };
  creditorName?: string;
  creditorAccount?: {
    iban?: string;
    bban?: string;
  };
  transactionAmount: {
    amount: string;
    currency: string;
  };
  bookingDate?: string;
  valueDate?: string;
  remittanceInformationUnstructured?: string;
  remittanceInformationStructured?: string;
  additionalInformation?: string;
  bankTransactionCode?: string;
  proprietaryBankTransactionCode?: string;
  endToEndId?: string;
  mandateId?: string;
  checkId?: string;
  creditorId?: string;
  ultimateCreditor?: string;
  ultimateDebtor?: string;
  purposeCode?: string;
  exchangeRate?: Record<string, unknown>[];
  currencyExchange?: Record<string, unknown>[];
}

interface ConnectedAccountWithFinancialAccount {
  id: string;
  providerAccountId: string;
  accountName: string;
  accountType: string;
  accountSubtype: string | null;
  iban: string | null;
  connectionId: string;
  financialAccountId: string | null;
  financialAccount: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    familyId: string;
    description: string | null;
    currency: string;
    type: AccountType;
    balance: Prisma.Decimal;
    isActive: boolean;
    institution: string | null;
    accountNumber: string | null;
    color: string | null;
  } | null;
}

function getPrismaClient() {
  return new PrismaClient();
}

/**
 * Generate access token for GoCardless API
 */
async function generateAccessToken(): Promise<string> {
  try {
    const response = await fetch(`${GOCARDLESS_API_BASE}/token/new/`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        secret_id: process.env.GOCARDLESS_SECRET_ID!,
        secret_key: process.env.GOCARDLESS_SECRET_KEY!,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Token generation failed: ${response.status} ${errorText}`);
    }

    const tokenData: TokenResponse = await response.json();
    return tokenData.access;
  } catch (error) {
    logger.error("Error generating GoCardless access token", { error });
    throw new Error(`Failed to generate access token: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Get account details from GoCardless API
 */
async function getAccountDetails(
  accountId: string,
  accessToken: string
): Promise<AccountDetails> {
  const response = await fetch(
    `${GOCARDLESS_API_BASE}/accounts/${accountId}/details/`,
    {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch account details: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return data.account || data;
}

/**
 * Get account balances from GoCardless API
 */
async function getAccountBalances(
  accountId: string,
  accessToken: string
): Promise<{ balances: Balance[] }> {
  const response = await fetch(
    `${GOCARDLESS_API_BASE}/accounts/${accountId}/balances/`,
    {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch account balances: ${response.status} ${errorText}`);
  }

  return await response.json();
}

/**
 * Get account transactions from GoCardless API
 */
async function getAccountTransactions(
  accountId: string,
  accessToken: string,
  dateFrom?: string,
  dateTo?: string
): Promise<{
  transactions: { booked: Transaction[]; pending: Transaction[] };
}> {
  let url = `${GOCARDLESS_API_BASE}/accounts/${accountId}/transactions/`;
  const params = new URLSearchParams();

  if (dateFrom) params.append("date_from", dateFrom);
  if (dateTo) params.append("date_to", dateTo);

  if (params.toString()) {
    url += `?${params.toString()}`;
  }

  const response = await fetch(url, {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch account transactions: ${response.status} ${errorText}`);
  }

  return await response.json();
}

// Map GoCardless account type to our AccountType enum
const getAccountType = (details: AccountDetails): AccountType => {
  if (details.cashAccountType) {
    switch (details.cashAccountType.toLowerCase()) {
      case "cacc": // Current account
      case "tran": // Transactional account
        return AccountType.CHECKING;
      case "sava": // Savings account
        return AccountType.SAVINGS;
      case "loan": // Loan account
        return AccountType.LOAN;
      case "card": // Card account
        return AccountType.CREDIT_CARD;
      default:
        return AccountType.OTHER;
    }
  }
  
  // Fallback based on account type or name
  if (details.product?.toLowerCase().includes("savings")) {
    return AccountType.SAVINGS;
  }
  if (details.product?.toLowerCase().includes("credit")) {
    return AccountType.CREDIT_CARD;
  }
  if (details.product?.toLowerCase().includes("loan")) {
    return AccountType.LOAN;
  }
  
  return AccountType.CHECKING; // Default to checking
};

/**
 * Complete GoCardless connection after user authorization
 */
export const completeGoCardlessConnection = task({
  id: "complete-gocardless-connection",
  maxDuration: 300, // 5 minutes
  run: async (payload: { 
    requisitionId: string; 
    bank: BankInfo; 
    familyId: string 
  }) => {
    const { requisitionId, bank, familyId } = payload;
    const prisma = getPrismaClient();

    logger.log("Starting GoCardless connection completion", { 
      requisitionId, 
      bankId: bank.id, 
      familyId 
    });

    try {
      // Generate access token
      const accessToken = await generateAccessToken();

      // Get requisition details to fetch account IDs
      const response = await fetch(
        `${GOCARDLESS_API_BASE}/requisitions/${requisitionId}/`,
        {
          method: "GET",
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch requisition: ${response.status} ${errorText}`);
      }

      const requisition = await response.json();
      const accountIds: string[] = requisition.accounts;

      if (!accountIds.length) {
        throw new Error("No accounts found in requisition");
      }

      logger.log("Found accounts in requisition", { 
        accountCount: accountIds.length,
        accountIds 
      });

      // Create bank connection record
      const bankConnection = await prisma.bankConnection.create({
        data: {
          provider: "GOCARDLESS",
          accessToken: requisitionId, // For GoCardless, we use requisition ID as access token
          itemId: requisitionId,
          familyId,
          institutionId: bank.institutionId?.gocardless || null,
          institutionName: bank.displayName,
          institutionCountry: bank.country,
        },
      });

      const createdAccounts = [];
      let totalTransactions = 0;

      // Process each account
      for (const accountId of accountIds) {
        logger.log("Processing GoCardless account", { accountId });

        // Get account details
        const details = await getAccountDetails(accountId, accessToken);
        
        // Get account balances
        const balanceData = await getAccountBalances(accountId, accessToken);
        const currentBalance = balanceData.balances.find(b => 
          b.balanceType === "closingBooked" || b.balanceType === "expected"
        );

        // Create financial account
        const financialAccount = await prisma.financialAccount.create({
          data: {
            name: details.name || details.displayName || `Account ${details.resourceId}`,
            type: getAccountType(details),
            balance: currentBalance ? parseFloat(currentBalance.balanceAmount.amount) : 0,
            currency: details.currency || "EUR",
            institution: bank.displayName,
            accountNumber: details.iban || details.bban || `****${details.resourceId.slice(-4)}`,
            familyId,
          },
        });

        // Create connected account mapping
        const connectedAccountRecord = await prisma.connectedAccount.create({
          data: {
            providerAccountId: accountId,
            accountName: details.name || details.displayName || `Account ${details.resourceId}`,
            accountType: details.cashAccountType || "unknown",
            accountSubtype: details.product || null,
            iban: details.iban || null,
            connectionId: bankConnection.id,
            financialAccountId: financialAccount.id,
          },
        });

        createdAccounts.push({
          ...financialAccount,
          gocardlessAccountId: accountId,
        });

        // Import transactions for this account (last 90 days)
        const endDate = new Date();
        const startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

        try {
          const transactionData = await getAccountTransactions(
            accountId,
            accessToken,
            startDate.toISOString().split("T")[0],
            endDate.toISOString().split("T")[0]
          );

          const allTransactions = [
            ...transactionData.transactions.booked,
            ...transactionData.transactions.pending.map(t => ({ ...t, pending: true }))
          ];

          logger.log("Retrieved transactions from GoCardless", { 
            accountId, 
            transactionCount: allTransactions.length 
          });

          // Process transactions
          for (const transaction of allTransactions) {
            await processGoCardlessTransaction(
              transaction,
              { ...connectedAccountRecord, financialAccount } as ConnectedAccountWithFinancialAccount,
              familyId,
              !!(transaction as any).pending,
              prisma
            );
            totalTransactions++;
          }
        } catch (transactionError) {
          logger.warn("Failed to import transactions for account", { 
            accountId, 
            error: transactionError 
          });
          // Continue with other accounts even if transaction import fails
        }
      }

      logger.log("Completed GoCardless connection", { 
        familyId,
        accountCount: createdAccounts.length,
        totalTransactions
      });

      return {
        success: true,
        accounts: createdAccounts,
        transactionsImported: totalTransactions,
        message: `Successfully connected ${createdAccounts.length} accounts and imported ${totalTransactions} transactions via GoCardless`,
      };
    } catch (error) {
      logger.error("Error completing GoCardless connection", { 
        error, 
        requisitionId, 
        familyId 
      });
      throw new Error(`Failed to complete GoCardless connection: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      await prisma.$disconnect();
    }
  },
});

/**
 * Import transactions from GoCardless accounts
 */
export const importGoCardlessTransactions = task({
  id: "import-gocardless-transactions",
  maxDuration: 600, // 10 minutes for large transaction imports
  run: async (payload: { 
    familyId: string; 
    startDate?: string; 
    endDate?: string;
  }) => {
    const { familyId, startDate, endDate } = payload;
    const prisma = getPrismaClient();

    logger.log("Starting GoCardless transaction import", { familyId, startDate, endDate });

    try {
      // Get all GoCardless connections for this family
      const bankConnections = await prisma.bankConnection.findMany({
        where: {
          familyId,
          provider: "GOCARDLESS",
        },
        include: {
          connectedAccounts: {
            include: {
              financialAccount: true,
            },
          },
        },
      });

      // Flatten to get all connected accounts
      const connections = bankConnections.flatMap((bc: any) => bc.connectedAccounts);

      if (connections.length === 0) {
        throw new Error("No GoCardless accounts connected");
      }

      logger.log("Found GoCardless connections", { connectionCount: connections.length });

      // Generate access token
      const accessToken = await generateAccessToken();

      let totalTransactions = 0;

      // Set date range (default to last 7 days)
      const end = endDate ? new Date(endDate) : new Date();
      const start = startDate ? new Date(startDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      for (const connection of connections) {
        if (!connection.financialAccount) continue;

        logger.log("Processing GoCardless connection", { 
          connectionId: connection.id,
          accountId: connection.providerAccountId 
        });

        try {
          // Get transactions from GoCardless API
          const transactionData = await getAccountTransactions(
            connection.providerAccountId,
            accessToken,
            start.toISOString().split("T")[0],
            end.toISOString().split("T")[0]
          );

          const allTransactions = [
            ...transactionData.transactions.booked,
            ...transactionData.transactions.pending.map((t: any) => ({ ...t, pending: true }))
          ];

          logger.log("Retrieved transactions from GoCardless", { 
            accountId: connection.providerAccountId, 
            transactionCount: allTransactions.length 
          });

          // Process transactions
          for (const transaction of allTransactions) {
            await processGoCardlessTransaction(
              transaction,
              connection as ConnectedAccountWithFinancialAccount,
              familyId,
              !!(transaction as any).pending,
              prisma
            );
            totalTransactions++;
          }
        } catch (accountError) {
          logger.warn("Failed to import transactions for account", { 
            accountId: connection.providerAccountId, 
            error: accountError 
          });
          // Continue with other accounts
        }
      }

      logger.log("Completed GoCardless transaction import", { 
        familyId, 
        totalTransactions 
      });

      return {
        success: true,
        transactionsImported: totalTransactions,
        message: `Successfully imported ${totalTransactions} transactions from GoCardless`,
      };
    } catch (error) {
      logger.error("Error importing GoCardless transactions", { error, familyId });
      throw new Error(`Failed to import GoCardless transactions: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      await prisma.$disconnect();
    }
  },
});

/**
 * Sync GoCardless account balances
 */
export const syncGoCardlessBalances = task({
  id: "sync-gocardless-balances",
  maxDuration: 300, // 5 minutes
  run: async (payload: { familyId: string }) => {
    const { familyId } = payload;
    const prisma = getPrismaClient();

    logger.log("Starting GoCardless balance sync", { familyId });

    try {
      // Get all GoCardless connections for this family
      const bankConnections = await prisma.bankConnection.findMany({
        where: {
          familyId,
          provider: "GOCARDLESS",
        },
        include: {
          connectedAccounts: {
            include: {
              financialAccount: true,
            },
          },
        },
      });

      // Flatten to get all connected accounts
      const connections = bankConnections.flatMap((bc: any) => bc.connectedAccounts);

      logger.log("Found GoCardless connections for balance sync", { 
        connectionCount: connections.length 
      });

      // Generate access token
      const accessToken = await generateAccessToken();

      let accountsUpdated = 0;

      for (const connection of connections) {
        if (!connection.financialAccount) continue;

        try {
          // Get account balances
          const balanceData = await getAccountBalances(
            connection.providerAccountId, 
            accessToken
          );
          
          const currentBalance = balanceData.balances.find(b => 
            b.balanceType === "closingBooked" || b.balanceType === "expected"
          );

          if (currentBalance) {
            await prisma.financialAccount.update({
              where: { id: connection.financialAccount.id },
              data: {
                balance: parseFloat(currentBalance.balanceAmount.amount),
              },
            });
            accountsUpdated++;
          }
        } catch (accountError) {
          logger.warn("Failed to sync balance for account", { 
            accountId: connection.providerAccountId, 
            error: accountError 
          });
          // Continue with other accounts
        }
      }

      logger.log("Completed GoCardless balance sync", { 
        familyId, 
        accountsUpdated 
      });

      return {
        success: true,
        accountsUpdated,
        message: `Successfully updated ${accountsUpdated} account balances`,
      };
    } catch (error) {
      logger.error("Error syncing GoCardless balances", { error, familyId });
      throw new Error(`Failed to sync GoCardless balances: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      await prisma.$disconnect();
    }
  },
});

/**
 * Process a single GoCardless transaction
 */
async function processGoCardlessTransaction(
  transaction: Transaction,
  connectedAccount: ConnectedAccountWithFinancialAccount,
  familyId: string,
  isPending: boolean,
  prisma: PrismaClient
) {
  if (!connectedAccount.financialAccount) return;

  // Create unique transaction ID for GoCardless
  const transactionId = transaction.transactionId || 
    createDeterministicId(transaction, connectedAccount.providerAccountId);

  // Check if transaction already exists
  const existingTransaction = await prisma.transaction.findFirst({
    where: {
      OR: [
        { plaidTransactionId: transactionId },
        {
          AND: [
            { accountId: connectedAccount.financialAccount.id },
            { date: new Date(transaction.bookingDate || transaction.valueDate || new Date()) },
            { amount: Math.abs(parseFloat(transaction.transactionAmount.amount)) },
            { description: transaction.remittanceInformationUnstructured || "GoCardless Transaction" },
          ],
        },
      ],
    },
  });

  if (existingTransaction) return;

  // Determine transaction type based on amount
  const amount = parseFloat(transaction.transactionAmount.amount);
  const transactionType = amount < 0 ? "EXPENSE" : "INCOME";

  // Create transaction
  await prisma.transaction.create({
    data: {
      date: new Date(transaction.bookingDate || transaction.valueDate || new Date()),
      description: transaction.remittanceInformationUnstructured || 
                   transaction.remittanceInformationStructured || 
                   "GoCardless Transaction",
      merchant: transaction.creditorName || transaction.debtorName || null,
      amount: Math.abs(amount),
      type: transactionType,
      status: "NEEDS_CATEGORIZATION",
      accountId: connectedAccount.financialAccount.id,
      familyId,
      // GoCardless-specific fields stored in existing Plaid fields
      plaidTransactionId: transactionId,
      plaidCategory: transaction.bankTransactionCode ? [transaction.bankTransactionCode] : [],
      plaidSubcategory: transaction.proprietaryBankTransactionCode || null,
      pending: isPending,
      iso_currency_code: transaction.transactionAmount.currency,
      tags: [transactionId],
    },
  });
}

/**
 * Create a deterministic ID for GoCardless transactions
 */
function createDeterministicId(transaction: Transaction, accountId: string): string {
  const baseString = `${accountId}-${transaction.transactionAmount.amount}-${transaction.bookingDate || transaction.valueDate}-${transaction.remittanceInformationUnstructured || ""}`;
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < baseString.length; i++) {
    const char = baseString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return `gocardless-${Math.abs(hash)}`;
}

/**
 * Scheduled task to automatically sync GoCardless balances daily
 */
export const scheduledGoCardlessBalanceSync = schedules.task({
  id: "scheduled-gocardless-balance-sync",
  cron: "0 6 * * *", // Run daily at 6 AM
  run: async () => {
    const prisma = getPrismaClient();
    
    logger.log("Starting scheduled GoCardless balance sync for all families");

    try {
      // Get all families with GoCardless connections
      const familiesWithGoCardless = await prisma.family.findMany({
        where: {
          BankConnection: {
            some: {
              provider: "GOCARDLESS",
            },
          },
        },
        select: {
          id: true,
          name: true,
        },
      });

      logger.log("Found families with GoCardless connections", { 
        familyCount: familiesWithGoCardless.length 
      });

      // Trigger balance sync for each family
      for (const family of familiesWithGoCardless) {
        await syncGoCardlessBalances.trigger({
          familyId: family.id,
        });
      }

      return {
        success: true,
        familiesProcessed: familiesWithGoCardless.length,
        message: `Triggered balance sync for ${familiesWithGoCardless.length} families`,
      };
    } catch (error) {
      logger.error("Error in scheduled GoCardless balance sync", { error });
      throw error;
    } finally {
      await prisma.$disconnect();
    }
  },
});

/**
 * Scheduled task to automatically import new GoCardless transactions daily
 */
export const scheduledGoCardlessTransactionImport = schedules.task({
  id: "scheduled-gocardless-transaction-import",
  cron: "0 7 * * *", // Run daily at 7 AM
  run: async () => {
    const prisma = getPrismaClient();
    
    logger.log("Starting scheduled GoCardless transaction import for all families");

    try {
      // Get all families with GoCardless connections
      const familiesWithGoCardless = await prisma.family.findMany({
        where: {
          BankConnection: {
            some: {
              provider: "GOCARDLESS",
            },
          },
        },
        select: {
          id: true,
          name: true,
        },
      });

      logger.log("Found families with GoCardless connections", { 
        familyCount: familiesWithGoCardless.length 
      });

      // Trigger transaction import for each family (last 7 days)
      const endDate = new Date();
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      for (const family of familiesWithGoCardless) {
        await importGoCardlessTransactions.trigger({
          familyId: family.id,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        });
      }

      return {
        success: true,
        familiesProcessed: familiesWithGoCardless.length,
        message: `Triggered transaction import for ${familiesWithGoCardless.length} families`,
      };
    } catch (error) {
      logger.error("Error in scheduled GoCardless transaction import", { error });
      throw error;
    } finally {
      await prisma.$disconnect();
    }
  },
});