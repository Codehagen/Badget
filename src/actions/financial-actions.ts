import { PrismaClient } from "@/generated/prisma";
import { getCurrentAppUser } from "./user-actions";

// Prisma client instantiation per request (best practice)
function getPrismaClient() {
  return new PrismaClient();
}

async function getActiveFamilyId(): Promise<string | null> {
  const appUser = await getCurrentAppUser();
  return appUser?.familyMemberships[0]?.familyId || null;
}

export type FinancialOverview = {
  totalNetWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
  cashFlow: number;
  accountBreakdown: {
    checking: number;
    savings: number;
    creditCard: number;
    investment: number;
    other: number;
  };
  topCategories: {
    categoryId: string;
    categoryName: string;
    amount: number;
    percentage: number;
  }[];
  recentTrend: "up" | "down" | "stable";
  monthlyGoalProgress: number;
};

export type AccountTrend = {
  date: string;
  balance: number;
};

export type EnhancedAccount = {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  institution?: string | null;
  color?: string | null;
  trend: AccountTrend[];
  monthlyChange: number;
  monthlyChangePercentage: number;
  recentTransactionCount: number;
  status: "healthy" | "attention" | "inactive";
  isPlaidConnected: boolean;
};

/**
 * Get comprehensive financial overview metrics
 */
export async function getFinancialOverview(): Promise<FinancialOverview> {
  const familyId = await getActiveFamilyId();
  if (!familyId) {
    throw new Error("User not authenticated or no family found");
  }

  const prisma = getPrismaClient();

  try {
    // Get current month date range
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Get all accounts with balances
    const accounts = await prisma.financialAccount.findMany({
      where: {
        familyId,
        isActive: true,
      },
      select: {
        id: true,
        type: true,
        balance: true,
      },
    });

    // Calculate account breakdown
    const accountBreakdown = accounts.reduce(
      (acc, account) => {
        const balance = Number(account.balance);
        switch (account.type) {
          case "CHECKING":
            acc.checking += balance;
            break;
          case "SAVINGS":
            acc.savings += balance;
            break;
          case "CREDIT_CARD":
            acc.creditCard += Math.abs(balance); // Show absolute value for liabilities
            break;
          case "INVESTMENT":
            acc.investment += balance;
            break;
          default:
            acc.other += balance;
            break;
        }
        return acc;
      },
      { checking: 0, savings: 0, creditCard: 0, investment: 0, other: 0 }
    );

    // Calculate totals
    const totalAssets =
      accountBreakdown.checking +
      accountBreakdown.savings +
      accountBreakdown.investment +
      accountBreakdown.other;
    const totalLiabilities = accountBreakdown.creditCard;
    const totalNetWorth = totalAssets - totalLiabilities;

    // Get monthly transactions for income/expense calculation
    const currentMonthTransactions = await prisma.transaction.findMany({
      where: {
        familyId,
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
        status: "RECONCILED",
      },
      select: {
        amount: true,
        type: true,
        categoryId: true,
        category: {
          select: {
            name: true,
          },
        },
      },
    });

    // Calculate monthly income and expenses
    const monthlyIncome = currentMonthTransactions
      .filter((t) => t.type === "INCOME")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const monthlyExpenses = Math.abs(
      currentMonthTransactions
        .filter((t) => t.type === "EXPENSE")
        .reduce((sum, t) => sum + Number(t.amount), 0)
    );

    // Calculate savings rate and cash flow
    const savingsRate =
      monthlyIncome > 0
        ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100
        : 0;
    const cashFlow = monthlyIncome - monthlyExpenses;

    // Get top spending categories
    const categorySpending = currentMonthTransactions
      .filter((t) => t.type === "EXPENSE" && t.categoryId)
      .reduce(
        (acc, t) => {
          const categoryId = t.categoryId!;
          const categoryName = t.category?.name || "Uncategorized";
          const amount = Math.abs(Number(t.amount));

          if (!acc[categoryId]) {
            acc[categoryId] = { categoryId, categoryName, amount: 0 };
          }
          acc[categoryId].amount += amount;
          return acc;
        },
        {} as Record<
          string,
          { categoryId: string; categoryName: string; amount: number }
        >
      );

    const topCategories = Object.values(categorySpending)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)
      .map((cat) => ({
        ...cat,
        percentage:
          monthlyExpenses > 0 ? (cat.amount / monthlyExpenses) * 100 : 0,
      }));

    // Calculate trend (compare to last month)
    const lastMonthTransactions = await prisma.transaction.findMany({
      where: {
        familyId,
        date: {
          gte: lastMonth,
          lte: endOfLastMonth,
        },
        status: "RECONCILED",
        type: "EXPENSE",
      },
      select: {
        amount: true,
      },
    });

    const lastMonthExpenses = Math.abs(
      lastMonthTransactions.reduce((sum, t) => sum + Number(t.amount), 0)
    );

    let recentTrend: "up" | "down" | "stable" = "stable";
    if (monthlyExpenses > lastMonthExpenses * 1.05) {
      recentTrend = "up";
    } else if (monthlyExpenses < lastMonthExpenses * 0.95) {
      recentTrend = "down";
    }

    // Get goal progress
    const goals = await prisma.goal.findMany({
      where: {
        familyId,
        isActive: true,
      },
      select: {
        targetAmount: true,
        currentAmount: true,
      },
    });

    const monthlyGoalProgress =
      goals.length > 0
        ? goals.reduce((avg, goal) => {
            const progress =
              Number(goal.targetAmount) > 0
                ? (Number(goal.currentAmount) / Number(goal.targetAmount)) * 100
                : 0;
            return avg + progress;
          }, 0) / goals.length
        : 0;

    return {
      totalNetWorth,
      totalAssets,
      totalLiabilities,
      monthlyIncome,
      monthlyExpenses,
      savingsRate,
      cashFlow,
      accountBreakdown,
      topCategories,
      recentTrend,
      monthlyGoalProgress,
    };
  } catch (error) {
    console.error("Error fetching financial overview:", error);
    throw new Error("Failed to fetch financial overview");
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Get enhanced account data with trends and mini-chart data
 */
export async function getEnhancedAccounts(): Promise<EnhancedAccount[]> {
  const familyId = await getActiveFamilyId();
  if (!familyId) {
    return [];
  }

  const prisma = getPrismaClient();

  try {
    // Get all accounts with Plaid connection info
    const accounts = await prisma.financialAccount.findMany({
      where: {
        familyId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        type: true,
        balance: true,
        currency: true,
        institution: true,
        color: true,
        createdAt: true,
        plaidAccounts: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Get last 6 months of data for trends (simplified - using creation date as proxy)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const enhancedAccounts: EnhancedAccount[] = await Promise.all(
      accounts.map(async (account) => {
        // Get recent transactions for this account
        const recentTransactions = await prisma.transaction.findMany({
          where: {
            accountId: account.id,
            date: {
              gte: sixMonthsAgo,
            },
          },
          select: {
            date: true,
            amount: true,
          },
          orderBy: {
            date: "asc",
          },
        });

        // Generate trend data (simplified - using monthly aggregation)
        const trend: AccountTrend[] = [];
        const now = new Date();
        const currentBalance = Number(account.balance);

        // Generate 6 months of trend data (simplified calculation)
        for (let i = 5; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthTransactions = recentTransactions.filter((t) => {
            const transactionDate = new Date(t.date);
            return (
              transactionDate.getMonth() === date.getMonth() &&
              transactionDate.getFullYear() === date.getFullYear()
            );
          });

          const monthlyChange = monthTransactions.reduce(
            (sum, t) => sum + Number(t.amount),
            0
          );
          const estimatedBalance =
            i === 0
              ? currentBalance
              : currentBalance - monthlyChange * (i + 1) * 0.1; // Simplified estimation

          trend.push({
            date: date.toISOString().split("T")[0],
            balance: Math.max(0, estimatedBalance),
          });
        }

        // Calculate monthly change
        const lastMonthBalance =
          trend[trend.length - 2]?.balance || currentBalance;
        const monthlyChange = currentBalance - lastMonthBalance;
        const monthlyChangePercentage =
          lastMonthBalance > 0 ? (monthlyChange / lastMonthBalance) * 100 : 0;

        // Determine account status
        let status: "healthy" | "attention" | "inactive" = "healthy";
        if (recentTransactions.length === 0) {
          status = "inactive";
        } else if (account.type === "CREDIT_CARD" && currentBalance < -1000) {
          status = "attention";
        } else if (account.type === "CHECKING" && currentBalance < 100) {
          status = "attention";
        }

        return {
          id: account.id,
          name: account.name,
          type: account.type,
          balance: currentBalance,
          currency: account.currency,
          institution: account.institution,
          color: account.color,
          trend,
          monthlyChange,
          monthlyChangePercentage,
          recentTransactionCount: recentTransactions.length,
          status,
          isPlaidConnected: account.plaidAccounts.length > 0,
        };
      })
    );

    return enhancedAccounts;
  } catch (error) {
    console.error("Error fetching enhanced accounts:", error);
    return [];
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Get a single financial account by ID
 */
export async function getFinancialAccountById(accountId: string) {
  const familyId = await getActiveFamilyId();
  if (!familyId) {
    return null;
  }

  const prisma = getPrismaClient();

  try {
    const account = await prisma.financialAccount.findFirst({
      where: {
        id: accountId,
        familyId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        type: true,
        balance: true,
        currency: true,
        institution: true,
        color: true,
        description: true,
        accountNumber: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!account) {
      return null;
    }

    return {
      ...account,
      balance: Number(account.balance),
    };
  } catch (error) {
    console.error("Error fetching account by ID:", error);
    return null;
  } finally {
    await prisma.$disconnect();
  }
}
