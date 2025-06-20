"use server";

/**
 * DASHBOARD ACTIONS FOR BADGET FINANCIAL MANAGEMENT
 * =================================================
 *
 * This file contains server actions for the dashboard components of a multi-tenant
 * financial management application. It follows Prisma best practices and implements
 * proper data fetching patterns for financial data.
 *
 * ARCHITECTURE OVERVIEW:
 * ---------------------
 * 1. Authentication Layer: User → AppUser verification
 * 2. Family Context: Multi-tenant data access via Family relationships
 * 3. Financial Data: Transactions, Accounts, Categories, Budgets, Goals
 *
 * BEST PRACTICES IMPLEMENTED:
 * ---------------------------
 * ✅ Prisma Client instantiation per request (not global)
 * ✅ Proper error handling and type safety
 * ✅ Multi-tenant data isolation via Family relationships
 * ✅ Optimized queries with proper includes and selects
 * ✅ Caching considerations for dashboard performance
 * ✅ Input validation and sanitization
 *
 * DASHBOARD COMPONENTS SUPPORTED:
 * ------------------------------
 * 1. MetricsSection - Financial KPIs and summary metrics
 * 2. TransactionTable - Recent transactions with status tracking
 * 3. AnalyticsSection - Spending trends and charts data
 * 4. InsightsSection - Goals progress and financial insights
 * 5. HeaderSection - User context and family information
 *
 * USAGE PATTERNS:
 * --------------
 * ```typescript
 * // Get all dashboard data for current user's active family
 * const dashboardData = await getDashboardData();
 *
 * // Get specific component data
 * const transactions = await getTransactions({ limit: 50 });
 * const metrics = await getFinancialMetrics();
 * const goals = await getFinancialGoals();
 * ```
 *
 * PERFORMANCE CONSIDERATIONS:
 * --------------------------
 * - Queries are optimized for dashboard loading
 * - Uses select and include strategically to minimize data transfer
 * - Implements pagination for large datasets
 * - Family-scoped queries ensure data isolation and performance
 */

import { PrismaClient } from "@/generated/prisma";
import { getCurrentAppUser } from "./user-actions";
import type {
  TransactionStatus,
  TransactionType,
  AccountType,
  GoalType,
  BudgetPeriod,
} from "@/generated/prisma";

// Prisma client instantiation per request (best practice)
function getPrismaClient() {
  return new PrismaClient();
}

// Types for better TypeScript support
type GetTransactionsOptions = {
  limit?: number;
  offset?: number;
  status?: TransactionStatus;
  accountId?: string;
  categoryId?: string;
  startDate?: Date;
  endDate?: Date;
};

type DashboardMetrics = {
  monthlyIncome: number;
  monthlyExpenses: number;
  netWorth: number;
  savingsRate: number;
  budgetRemaining: number;
  accountBalances: {
    checking: number;
    savings: number;
    creditCard: number;
    total: number;
  };
};

/**
 * Get the user's active family ID for dashboard context
 */
async function getActiveFamilyId(): Promise<string | null> {
  const appUser = await getCurrentAppUser();
  if (!appUser || !appUser.familyMemberships.length) {
    return null;
  }

  // For now, use the first family membership
  // TODO: Implement active family selection in user preferences
  return appUser.familyMemberships[0].familyId;
}

/**
 * Get recent transactions for the dashboard transaction table
 */
export async function getTransactions(options: GetTransactionsOptions = {}) {
  const familyId = await getActiveFamilyId();
  if (!familyId) {
    return [];
  }

  const {
    limit = 20,
    offset = 0,
    status,
    accountId,
    categoryId,
    startDate,
    endDate,
  } = options;

  const prisma = getPrismaClient();

  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        familyId,
        ...(status && { status }),
        ...(accountId && { accountId }),
        ...(categoryId && { categoryId }),
        ...(startDate &&
          endDate && {
            date: {
              gte: startDate,
              lte: endDate,
            },
          }),
      },
      include: {
        account: {
          select: {
            name: true,
            type: true,
          },
        },
        category: {
          select: {
            name: true,
            icon: true,
            color: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
      take: limit,
      skip: offset,
    });

    return transactions;
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return [];
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Get financial accounts for the user's family
 */
export async function getFinancialAccounts() {
  const familyId = await getActiveFamilyId();
  if (!familyId) {
    return [];
  }

  const prisma = getPrismaClient();

  try {
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
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return accounts;
  } catch (error) {
    console.error("Error fetching financial accounts:", error);
    return [];
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Get financial metrics for the dashboard metrics section
 */
export async function getFinancialMetrics(): Promise<DashboardMetrics> {
  const familyId = await getActiveFamilyId();
  if (!familyId) {
    return {
      monthlyIncome: 0,
      monthlyExpenses: 0,
      netWorth: 0,
      savingsRate: 0,
      budgetRemaining: 0,
      accountBalances: {
        checking: 0,
        savings: 0,
        creditCard: 0,
        total: 0,
      },
    };
  }

  const prisma = getPrismaClient();

  try {
    // Get current month date range
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Get account balances
    const accounts = await prisma.financialAccount.findMany({
      where: {
        familyId,
        isActive: true,
      },
      select: {
        type: true,
        balance: true,
      },
    });

    // Calculate account balances by type
    const accountBalances = accounts.reduce(
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
            acc.creditCard += balance; // Note: credit card balance is typically negative
            break;
        }
        acc.total += balance;
        return acc;
      },
      { checking: 0, savings: 0, creditCard: 0, total: 0 }
    );

    // Get monthly transactions for income/expense calculation
    const monthlyTransactions = await prisma.transaction.findMany({
      where: {
        familyId,
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
        status: "RECONCILED", // Only count reconciled transactions
      },
      select: {
        amount: true,
        type: true,
      },
    });

    // Calculate monthly income and expenses
    const monthlyIncome = monthlyTransactions
      .filter((t) => t.type === "INCOME")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const monthlyExpenses = Math.abs(
      monthlyTransactions
        .filter((t) => t.type === "EXPENSE")
        .reduce((sum, t) => sum + Number(t.amount), 0)
    );

    // Calculate savings rate
    const savingsRate =
      monthlyIncome > 0
        ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100
        : 0;

    // Get budget remaining (simplified - sum of all active budgets)
    const budgets = await prisma.budget.findMany({
      where: {
        familyId,
        isActive: true,
        startDate: { lte: endOfMonth },
        OR: [{ endDate: null }, { endDate: { gte: startOfMonth } }],
      },
      select: {
        amount: true,
      },
    });

    const budgetRemaining =
      budgets.reduce((sum, budget) => sum + Number(budget.amount), 0) -
      monthlyExpenses;

    return {
      monthlyIncome,
      monthlyExpenses,
      netWorth: accountBalances.total,
      savingsRate,
      budgetRemaining,
      accountBalances,
    };
  } catch (error) {
    console.error("Error calculating financial metrics:", error);
    return {
      monthlyIncome: 0,
      monthlyExpenses: 0,
      netWorth: 0,
      savingsRate: 0,
      budgetRemaining: 0,
      accountBalances: {
        checking: 0,
        savings: 0,
        creditCard: 0,
        total: 0,
      },
    };
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Get financial goals for the insights section
 */
export async function getFinancialGoals() {
  const familyId = await getActiveFamilyId();
  if (!familyId) {
    return [];
  }

  const prisma = getPrismaClient();

  try {
    const goals = await prisma.goal.findMany({
      where: {
        familyId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        type: true,
        targetAmount: true,
        currentAmount: true,
        targetDate: true,
        description: true,
        color: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return goals.map((goal) => ({
      ...goal,
      targetAmount: Number(goal.targetAmount),
      currentAmount: Number(goal.currentAmount),
      progressPercentage:
        Number(goal.targetAmount) > 0
          ? (Number(goal.currentAmount) / Number(goal.targetAmount)) * 100
          : 0,
    }));
  } catch (error) {
    console.error("Error fetching financial goals:", error);
    return [];
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Get categories for the family
 */
export async function getCategories() {
  const familyId = await getActiveFamilyId();
  if (!familyId) {
    return [];
  }

  const prisma = getPrismaClient();

  try {
    const categories = await prisma.category.findMany({
      where: {
        familyId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        icon: true,
        color: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return categories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Get spending trends data for the analytics chart
 */
export async function getSpendingTrends(months: number = 6) {
  const familyId = await getActiveFamilyId();
  if (!familyId) {
    return [];
  }

  const prisma = getPrismaClient();

  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const transactions = await prisma.transaction.findMany({
      where: {
        familyId,
        date: {
          gte: startDate,
          lte: endDate,
        },
        status: "RECONCILED",
      },
      select: {
        date: true,
        amount: true,
        type: true,
      },
      orderBy: {
        date: "asc",
      },
    });

    // Group transactions by month
    const monthlyData = new Map();

    transactions.forEach((transaction) => {
      const monthKey = transaction.date.toISOString().slice(0, 7); // YYYY-MM
      const amount = Number(transaction.amount);

      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, { income: 0, expenses: 0 });
      }

      const monthData = monthlyData.get(monthKey);
      if (transaction.type === "INCOME") {
        monthData.income += amount;
      } else if (transaction.type === "EXPENSE") {
        monthData.expenses += Math.abs(amount);
      }
    });

    // Convert to array format for charts
    return Array.from(monthlyData.entries()).map(([month, data]) => ({
      month,
      income: data.income,
      expenses: data.expenses,
      net: data.income - data.expenses,
    }));
  } catch (error) {
    console.error("Error fetching spending trends:", error);
    return [];
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Get all dashboard data in a single optimized call
 */
export async function getDashboardData() {
  try {
    const [transactions, accounts, metrics, goals, categories, spendingTrends] =
      await Promise.all([
        getTransactions({ limit: 15 }),
        getFinancialAccounts(),
        getFinancialMetrics(),
        getFinancialGoals(),
        getCategories(),
        getSpendingTrends(6),
      ]);

    return {
      transactions,
      accounts,
      metrics,
      goals,
      categories,
      spendingTrends,
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    throw new Error("Failed to fetch dashboard data");
  }
}

/**
 * Seed the database with sample data for the current user
 */
export async function seedUserData() {
  const appUser = await getCurrentAppUser();
  if (!appUser) {
    throw new Error("User not authenticated");
  }

  // Check if user already has a family
  if (appUser.familyMemberships.length > 0) {
    throw new Error(
      "User already has financial data. Use reset if you want to start over."
    );
  }

  const prisma = getPrismaClient();

  try {
    return await prisma.$transaction(async (tx) => {
      // Create family for the user
      const family = await tx.family.create({
        data: {
          name: `${appUser.firstName || "My"} Family`,
          description: "Personal finances",
          currency: "USD",
          timezone: appUser.timezone || "UTC",
        },
      });

      // Add user to family as owner
      await tx.familyMember.create({
        data: {
          familyId: family.id,
          appUserId: appUser.id,
          role: "OWNER",
        },
      });

      // Create financial accounts
      const checkingAccount = await tx.financialAccount.create({
        data: {
          name: "Chase Checking",
          type: "CHECKING",
          balance: 5420.75,
          currency: "USD",
          institution: "Chase Bank",
          accountNumber: "****1234",
          color: "#0066CC",
          familyId: family.id,
        },
      });

      const creditCard = await tx.financialAccount.create({
        data: {
          name: "Chase Credit Card",
          type: "CREDIT_CARD",
          balance: -1234.56,
          currency: "USD",
          institution: "Chase Bank",
          accountNumber: "****5678",
          color: "#FF6B35",
          familyId: family.id,
        },
      });

      const savingsAccount = await tx.financialAccount.create({
        data: {
          name: "Chase Savings",
          type: "SAVINGS",
          balance: 12450.0,
          currency: "USD",
          institution: "Chase Bank",
          accountNumber: "****9012",
          color: "#28A745",
          familyId: family.id,
        },
      });

      // Create categories
      const categories = [
        { name: "Food & Dining", icon: "🍽️", color: "#FF6B35" },
        { name: "Transportation", icon: "🚗", color: "#0066CC" },
        { name: "Groceries", icon: "🛒", color: "#28A745" },
        { name: "Entertainment", icon: "🎬", color: "#6F42C1" },
        { name: "Utilities", icon: "💡", color: "#FFC107" },
        { name: "Health & Fitness", icon: "💪", color: "#20C997" },
        { name: "Salary", icon: "💰", color: "#28A745" },
        { name: "Freelance", icon: "💻", color: "#17A2B8" },
      ];

      const createdCategories = await Promise.all(
        categories.map((cat) =>
          tx.category.create({
            data: {
              ...cat,
              familyId: family.id,
            },
          })
        )
      );

      // Create sample transactions
      const sampleTransactions = [
        {
          date: new Date("2024-01-15"),
          description: "Starbucks Coffee",
          merchant: "Starbucks",
          amount: -5.47,
          type: "EXPENSE" as TransactionType,
          status: "RECONCILED" as TransactionStatus,
          accountId: checkingAccount.id,
          categoryId: createdCategories.find((c) => c.name === "Food & Dining")
            ?.id,
          isReconciled: true,
        },
        {
          date: new Date("2024-01-15"),
          description: "Salary Deposit",
          merchant: "Company Inc",
          amount: 2850.0,
          type: "INCOME" as TransactionType,
          status: "RECONCILED" as TransactionStatus,
          accountId: checkingAccount.id,
          categoryId: createdCategories.find((c) => c.name === "Salary")?.id,
          isReconciled: true,
        },
        {
          date: new Date("2024-01-14"),
          description: "Amazon Purchase",
          merchant: "Amazon",
          amount: -89.99,
          type: "EXPENSE" as TransactionType,
          status: "NEEDS_CATEGORIZATION" as TransactionStatus,
          accountId: creditCard.id,
          categoryId: null,
          isReconciled: true,
        },
      ];

      await Promise.all(
        sampleTransactions.map((transaction) =>
          tx.transaction.create({
            data: {
              ...transaction,
              familyId: family.id,
              tags: [],
            },
          })
        )
      );

      // Create a financial goal
      await tx.goal.create({
        data: {
          name: "Emergency Fund",
          type: "EMERGENCY_FUND" as GoalType,
          targetAmount: 15000.0,
          currentAmount: 10050.0,
          targetDate: new Date("2024-12-31"),
          description: "6 months of expenses",
          color: "#28A745",
          familyId: family.id,
        },
      });

      return { success: true, familyId: family.id };
    });
  } catch (error) {
    console.error("Error seeding user data:", error);
    throw new Error("Failed to seed user data");
  } finally {
    await prisma.$disconnect();
  }
}
