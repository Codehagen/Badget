"use server";

import { PrismaClient, AccountType, Prisma } from "@/generated/prisma";
import { getCurrentAppUser } from "./user-actions";
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

interface Institution {
  id: string;
  name: string;
  bic: string;
  transaction_total_days: string;
  countries: string[];
  logo: string;
  max_access_valid_for_days: string;
}

interface Agreement {
  id: string;
  created: string;
  max_historical_days: number;
  access_valid_for_days: number;
  access_scope: string[];
  accepted: string;
  institution_id: string;
}

interface Requisition {
  id: string;
  created: string;
  redirect: string;
  status: string;
  institution_id: string;
  agreement: string;
  reference: string;
  accounts: string[];
  user_language: string;
  link: string;
  ssn?: string;
  account_selection: boolean;
  redirect_immediate: boolean;
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

function getPrismaClient() {
  return new PrismaClient();
}

function getBaseUrl(): string {
  // For Vercel deployments
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // Custom app URL environment variable
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  // Fallback to localhost for development
  return "http://localhost:3000";
}

async function getActiveFamilyId(): Promise<string | null> {
  const appUser = await getCurrentAppUser();
  return appUser?.familyMemberships[0]?.familyId || null;
}

/**
 * Generate access token for GoCardless API (Step 1)
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
      throw new Error(
        `Token generation failed: ${response.status} ${errorText}`
      );
    }

    const tokenData: TokenResponse = await response.json();
    return tokenData.access;
  } catch (error) {
    console.error("Error generating GoCardless access token:", error);
    throw new Error(
      `Failed to generate access token: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Get institutions by country (Step 2)
 */
export async function getGoCardlessInstitutions(
  countryCode: string,
  accessToken?: string
): Promise<Institution[]> {
  try {
    const token = accessToken || (await generateAccessToken());

    const response = await fetch(
      `${GOCARDLESS_API_BASE}/institutions/?country=${countryCode}`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to fetch institutions: ${response.status} ${errorText}`
      );
    }

    const institutions: Institution[] = await response.json();
    return institutions;
  } catch (error) {
    console.error("Error fetching GoCardless institutions:", error);
    throw new Error(
      `Failed to fetch institutions: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Create end user agreement (Step 3)
 */
async function createEndUserAgreement(
  institutionId: string,
  accessToken: string
): Promise<Agreement> {
  try {
    const response = await fetch(`${GOCARDLESS_API_BASE}/agreements/enduser/`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        institution_id: institutionId,
        max_historical_days: 90, // 90 days of transaction history
        access_valid_for_days: 90, // 90 days of account access
        access_scope: ["balances", "details", "transactions"],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Agreement creation failed: ${response.status} ${errorText}`
      );
    }

    const agreement: Agreement = await response.json();
    return agreement;
  } catch (error) {
    console.error("Error creating end user agreement:", error);
    throw new Error(
      `Failed to create agreement: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Find GoCardless institution by bank name and country
 */
async function findGoCardlessInstitution(
  bank: BankInfo,
  accessToken: string
): Promise<string | null> {
  try {
    // Get institutions for the bank's country using the provided access token
    const institutions = await getGoCardlessInstitutions(
      bank.country,
      accessToken
    );

    // Try to find institution by exact name match first
    let institution = institutions.find(
      (inst) =>
        inst.name.toLowerCase() === bank.name.toLowerCase() ||
        inst.name.toLowerCase() === bank.displayName.toLowerCase()
    );

    // If not found, try partial matching
    if (!institution) {
      institution = institutions.find(
        (inst) =>
          inst.name.toLowerCase().includes(bank.name.toLowerCase()) ||
          bank.name.toLowerCase().includes(inst.name.toLowerCase())
      );
    }

    // For Norwegian banks, try specific mappings
    if (!institution && bank.country === "NO") {
      const norBankMappings: Record<string, string> = {
        dnb: "DNB",
        nordea: "Nordea",
        sparebank1: "SpareBank 1",
        handelsbanken: "Handelsbanken",
      };

      const searchTerm = norBankMappings[bank.id] || bank.name;
      institution = institutions.find((inst) =>
        inst.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return institution?.id || null;
  } catch (error) {
    console.error("Error finding GoCardless institution:", error);
    return null;
  }
}

/**
 * Create a requisition (Step 4) - equivalent to Plaid's link token
 */
export async function createGoCardlessRequisition(
  bank: BankInfo,
  redirectUrl?: string
) {
  const finalRedirectUrl =
    redirectUrl || `${getBaseUrl()}/dashboard/financial/callback`;
  try {
    const appUser = await getCurrentAppUser();
    if (!appUser) {
      throw new Error("User not authenticated");
    }

    const familyId = await getActiveFamilyId();
    if (!familyId) {
      throw new Error("No family found");
    }

    if (!bank.providers.includes("GOCARDLESS")) {
      throw new Error("Bank not supported by GoCardless");
    }

    // Step 1: Generate access token
    const accessToken = await generateAccessToken();

    // Step 2: Find the actual GoCardless institution ID
    const institutionId = await findGoCardlessInstitution(bank, accessToken);

    if (!institutionId) {
      // If we can't find the institution, list available ones for debugging
      const availableInstitutions = await getGoCardlessInstitutions(
        bank.country
      );
      console.log(
        `Available institutions for ${bank.country}:`,
        availableInstitutions.map((i) => ({ id: i.id, name: i.name }))
      );

      throw new Error(
        `Bank "${bank.displayName}" not found in GoCardless institutions for ${bank.country}. Please check available institutions.`
      );
    }

    // Step 3: Create end user agreement
    const agreement = await createEndUserAgreement(institutionId, accessToken);

    // Step 4: Create requisition
    const response = await fetch(`${GOCARDLESS_API_BASE}/requisitions/`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        redirect: finalRedirectUrl,
        institution_id: institutionId,
        agreement: agreement.id,
        reference: `family-${familyId}-${Date.now()}`,
        user_language: "EN",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Requisition creation failed: ${response.status} ${errorText}`
      );
    }

    const requisition: Requisition = await response.json();

    return {
      success: true,
      requisitionId: requisition.id,
      authUrl: requisition.link,
      institutionId: institutionId,
      agreementId: agreement.id,
    };
  } catch (error) {
    console.error("Error creating GoCardless requisition:", error);
    throw new Error(
      `Failed to create bank connection: ${error instanceof Error ? error.message : "Unknown error"}`
    );
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
    throw new Error(
      `Failed to fetch account details: ${response.status} ${errorText}`
    );
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
    throw new Error(
      `Failed to fetch account balances: ${response.status} ${errorText}`
    );
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
    throw new Error(
      `Failed to fetch account transactions: ${response.status} ${errorText}`
    );
  }

  return await response.json();
}

/**
 * Complete GoCardless connection after user authorization (Step 5 & 6)
 * Following the official GoCardless Bank Account Data API flow
 */
export async function completeGoCardlessConnection(
  requisitionId: string,
  bank: BankInfo
) {
  const familyId = await getActiveFamilyId();
  if (!familyId) {
    throw new Error("User not authenticated or no family found");
  }

  const prisma = getPrismaClient();

  try {
    // Step 1: Generate fresh access token
    const accessToken = await generateAccessToken();

    // Step 5: List accounts - Get requisition details to check status and get account IDs
    const requisitionResponse = await fetch(
      `${GOCARDLESS_API_BASE}/requisitions/${requisitionId}/`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!requisitionResponse.ok) {
      const errorText = await requisitionResponse.text();
      throw new Error(
        `Failed to fetch requisition: ${requisitionResponse.status} ${errorText}`
      );
    }

    const requisition: Requisition = await requisitionResponse.json();

    // Check if the requisition is linked (user completed authentication)
    if (requisition.status !== "LN") {
      // LN = Linked
      throw new Error(
        `Bank connection not completed. Status: ${requisition.status}. Please try the bank connection again.`
      );
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

    // Step 6: Access account details, balances and transactions for each account
    const createdAccounts = [];

    for (const accountId of requisition.accounts) {
      try {
        // Step 6a: Get account details
        const accountDetails = await getAccountDetails(accountId, accessToken);

        // Step 6b: Get account balances
        const accountBalances = await getAccountBalances(
          accountId,
          accessToken
        );

        // Map GoCardless account type to our AccountType enum
        const getAccountType = (details: AccountDetails): AccountType => {
          const usage = details.usage?.toLowerCase();
          const product = details.product?.toLowerCase();
          const cashAccountType = details.cashAccountType?.toLowerCase();

          if (usage === "priv" || cashAccountType === "cacc") {
            return AccountType.CHECKING;
          } else if (usage === "orga" || product?.includes("business")) {
            return AccountType.CHECKING; // Business checking
          } else if (
            product?.includes("savings") ||
            cashAccountType === "svgs"
          ) {
            return AccountType.SAVINGS;
          } else if (
            product?.includes("credit") ||
            cashAccountType === "card"
          ) {
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
        const availableBalance = balances.find(
          (b: Balance) => b.balanceType === "interimAvailable"
        );
        const currentBalance =
          availableBalance ||
          balances.find((b: Balance) => b.balanceType === "closingBooked") ||
          balances[0];

        const balance = currentBalance?.balanceAmount?.amount
          ? parseFloat(currentBalance.balanceAmount.amount)
          : 0;

        const currency =
          currentBalance?.balanceAmount?.currency ||
          accountDetails.currency ||
          "EUR";

        // Create financial account
        const financialAccount = await prisma.financialAccount.create({
          data: {
            name:
              accountDetails.displayName ||
              accountDetails.name ||
              (accountDetails.iban
                ? `${bank.displayName} ****${accountDetails.iban.slice(-4)}`
                : `${bank.displayName} Account`),
            type: accountType,
            balance,
            currency,
            institution: bank.displayName,
            accountNumber: accountDetails.iban
              ? `****${accountDetails.iban.slice(-4)}`
              : accountDetails.bban
                ? `****${accountDetails.bban.slice(-4)}`
                : null,
            familyId,
          },
        });

        // Create connected account mapping
        const connectedAccount = await prisma.connectedAccount.create({
          data: {
            providerAccountId: accountId,
            accountName:
              accountDetails.displayName ||
              accountDetails.name ||
              financialAccount.name,
            accountType:
              accountDetails.usage ||
              accountDetails.cashAccountType ||
              "current",
            accountSubtype: accountDetails.product || null,
            iban: accountDetails.iban || null,
            connectionId: bankConnection.id,
            financialAccountId: financialAccount.id,
          },
        });

        // Step 6c: Import initial transactions for this account
        try {
          const transactionData = await getAccountTransactions(
            accountId,
            accessToken
          );

          // Import booked transactions
          if (transactionData.transactions.booked) {
            for (const transaction of transactionData.transactions.booked) {
              await processGoCardlessTransaction(
                transaction,
                { ...connectedAccount, financialAccount },
                familyId,
                false, // not pending
                prisma
              );
            }
          }

          // Import pending transactions
          if (transactionData.transactions.pending) {
            for (const transaction of transactionData.transactions.pending) {
              await processGoCardlessTransaction(
                transaction,
                { ...connectedAccount, financialAccount },
                familyId,
                true, // pending
                prisma
              );
            }
          }
        } catch (transactionError) {
          console.warn(
            `Failed to import transactions for account ${accountId}:`,
            transactionError
          );
          // Continue with account creation even if transaction import fails
        }

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

    // Count total transactions imported
    const totalTransactions = await prisma.transaction.count({
      where: {
        accountId: {
          in: createdAccounts.map((acc) => acc.id),
        },
      },
    });

    return {
      success: true,
      accounts: createdAccounts,
      message: `Successfully connected ${createdAccounts.length} accounts and imported ${totalTransactions} transactions via GoCardless`,
    };
  } catch (error) {
    console.error("Error completing GoCardless connection:", error);
    throw new Error(
      `Failed to complete bank connection: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Import transactions from GoCardless accounts
 */
export async function importGoCardlessTransactions(
  startDate?: Date,
  endDate?: Date
) {
  const familyId = await getActiveFamilyId();
  if (!familyId) {
    throw new Error("User not authenticated or no family found");
  }

  const prisma = getPrismaClient();

  try {
    // Generate fresh access token
    const accessToken = await generateAccessToken();

    // Get all GoCardless connections for this family
    const connections = await prisma.bankConnection.findMany({
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

    if (connections.length === 0) {
      throw new Error("No GoCardless accounts connected");
    }

    let totalTransactions = 0;

    for (const connection of connections) {
      for (const connectedAccount of connection.connectedAccounts) {
        if (!connectedAccount.financialAccount) continue;

        try {
          // Get transactions from GoCardless API
          const dateFrom = startDate?.toISOString().split("T")[0];
          const dateTo = endDate?.toISOString().split("T")[0];

          const transactionData = await getAccountTransactions(
            connectedAccount.providerAccountId,
            accessToken,
            dateFrom,
            dateTo
          );

          // Process booked transactions
          const bookedTransactions = transactionData.transactions?.booked || [];
          const pendingTransactions =
            transactionData.transactions?.pending || [];

          // Process booked transactions
          for (const transaction of bookedTransactions) {
            await processGoCardlessTransaction(
              transaction,
              connectedAccount,
              familyId,
              false,
              prisma
            );
            totalTransactions++;
          }

          // Process pending transactions
          for (const transaction of pendingTransactions) {
            await processGoCardlessTransaction(
              transaction,
              connectedAccount,
              familyId,
              true,
              prisma
            );
            totalTransactions++;
          }
        } catch (accountError) {
          console.warn(
            `Failed to import transactions for account ${connectedAccount.providerAccountId}:`,
            accountError
          );
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
    throw new Error(
      `Failed to import transactions: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Process a single GoCardless transaction
 */
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

async function processGoCardlessTransaction(
  transaction: Transaction,
  connectedAccount: ConnectedAccountWithFinancialAccount,
  familyId: string,
  isPending: boolean,
  prisma: PrismaClient
) {
  if (
    !connectedAccount.financialAccount ||
    !connectedAccount.financialAccountId
  ) {
    throw new Error("Connected account missing financial account information");
  }
  // Create unique transaction ID for GoCardless
  // If no transactionId from GoCardless, create a deterministic fallback
  const transactionId =
    transaction.transactionId ||
    (() => {
      const baseData = [
        connectedAccount.providerAccountId,
        transaction.bookingDate || transaction.valueDate,
        transaction.transactionAmount?.amount,
        transaction.remittanceInformationUnstructured ||
          transaction.remittanceInformationStructured ||
          "",
        transaction.creditorName || transaction.debtorName || "",
        transaction.endToEndId || "",
      ]
        .filter(Boolean)
        .join("-");

      // Create a simple hash for shorter, more consistent IDs
      let hash = 0;
      for (let i = 0; i < baseData.length; i++) {
        const char = baseData.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32-bit integer
      }

      return `gocardless-${Math.abs(hash)}`;
    })();

  // Check if transaction already exists
  const existingTransaction = await prisma.transaction.findFirst({
    where: {
      plaidTransactionId: transactionId,
      accountId: connectedAccount.financialAccountId,
    },
  });

  if (existingTransaction) return;

  // Determine transaction type and amount
  const amount = parseFloat(transaction.transactionAmount?.amount || "0");
  const transactionType = amount < 0 ? "EXPENSE" : "INCOME";

  // Extract merchant/counterparty name
  const merchant =
    transaction.creditorName ||
    transaction.debtorName ||
    transaction.remittanceInformationUnstructured?.split(" ")[0] ||
    "Unknown";

  // Extract description
  const description =
    transaction.remittanceInformationUnstructured ||
    transaction.remittanceInformationStructured ||
    transaction.additionalInformation ||
    (transaction.creditorName
      ? `Payment to ${transaction.creditorName}`
      : transaction.debtorName
        ? `Payment from ${transaction.debtorName}`
        : "Transaction");

  // Create transaction
  await prisma.transaction.create({
    data: {
      date: new Date(
        transaction.bookingDate || transaction.valueDate || new Date()
      ),
      description: description.substring(0, 255), // Ensure it fits in DB
      merchant: merchant.substring(0, 100), // Ensure it fits in DB
      amount: Math.abs(amount),
      type: transactionType,
      status: "NEEDS_CATEGORIZATION",
      accountId: connectedAccount.financialAccountId,
      familyId,
      // GoCardless-specific fields stored in existing Plaid fields
      plaidTransactionId: transactionId,
      iso_currency_code: transaction.transactionAmount?.currency || "EUR",
      pending: isPending,
      // Store additional GoCardless data in tags
      tags: [
        `gocardless:${transactionId}`,
        ...(transaction.bankTransactionCode
          ? [`code:${transaction.bankTransactionCode}`]
          : []),
        ...(transaction.creditorAccount?.iban
          ? [`creditor:${transaction.creditorAccount.iban}`]
          : []),
        ...(transaction.debtorAccount?.iban
          ? [`debtor:${transaction.debtorAccount.iban}`]
          : []),
        ...(transaction.endToEndId ? [`e2e:${transaction.endToEndId}`] : []),
        ...(transaction.mandateId ? [`mandate:${transaction.mandateId}`] : []),
      ],
    },
  });
}

/**
 * Remove all GoCardless connections and accounts for testing
 */
export async function removeAllGoCardlessData() {
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
        provider: "GOCARDLESS",
      },
      include: {
        connectedAccounts: {
          include: {
            financialAccount: {
              include: {
                transactions: true,
              },
            },
          },
        },
      },
    });

    let deletedAccounts = 0;
    let deletedTransactions = 0;
    let deletedConnections = 0;

    for (const connection of connections) {
      for (const connectedAccount of connection.connectedAccounts) {
        if (connectedAccount.financialAccount) {
          // Delete all transactions for this account
          const transactionDeleteResult = await prisma.transaction.deleteMany({
            where: {
              accountId: connectedAccount.financialAccount.id,
            },
          });
          deletedTransactions += transactionDeleteResult.count;

          // Delete the financial account
          await prisma.financialAccount.delete({
            where: {
              id: connectedAccount.financialAccount.id,
            },
          });
          deletedAccounts++;
        }
      }

      // Delete connected accounts
      await prisma.connectedAccount.deleteMany({
        where: {
          connectionId: connection.id,
        },
      });

      // Delete the bank connection
      await prisma.bankConnection.delete({
        where: {
          id: connection.id,
        },
      });
      deletedConnections++;
    }

    return {
      success: true,
      message: `Successfully removed ${deletedConnections} GoCardless connections, ${deletedAccounts} accounts, and ${deletedTransactions} transactions`,
      deletedConnections,
      deletedAccounts,
      deletedTransactions,
    };
  } catch (error) {
    console.error("Error removing GoCardless data:", error);
    throw new Error(
      `Failed to remove GoCardless data: ${error instanceof Error ? error.message : "Unknown error"}`
    );
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
    // Generate fresh access token
    const accessToken = await generateAccessToken();

    // Get all GoCardless connections
    const connections = await prisma.bankConnection.findMany({
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

    let accountsUpdated = 0;

    for (const connection of connections) {
      for (const connectedAccount of connection.connectedAccounts) {
        if (!connectedAccount.financialAccount) continue;

        try {
          const balanceData = await getAccountBalances(
            connectedAccount.providerAccountId,
            accessToken
          );

          const balances = balanceData.balances || [];

          // Prefer interimAvailable balance, then closingBooked
          const availableBalance = balances.find(
            (b: Balance) => b.balanceType === "interimAvailable"
          );
          const currentBalance =
            availableBalance ||
            balances.find((b: Balance) => b.balanceType === "closingBooked") ||
            balances[0];

          if (currentBalance?.balanceAmount?.amount !== undefined) {
            const balance = parseFloat(currentBalance.balanceAmount.amount);

            await prisma.financialAccount.update({
              where: { id: connectedAccount.financialAccount.id },
              data: {
                balance,
                currency:
                  currentBalance.balanceAmount.currency ||
                  connectedAccount.financialAccount.currency,
              },
            });

            accountsUpdated++;
          }
        } catch (accountError) {
          console.warn(
            `Failed to sync balance for account ${connectedAccount.providerAccountId}:`,
            accountError
          );
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
    throw new Error(
      `Failed to sync account balances: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  } finally {
    await prisma.$disconnect();
  }
}
