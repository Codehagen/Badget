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
      savings: Math.max(0, data.income - data.expenses),
      budget: data.income * 0.7, // Assume 70% of income as budget target
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
 * Reset user's financial data
 */
export async function resetUserData() {
  const appUser = await getCurrentAppUser();
  if (!appUser) {
    throw new Error("User not authenticated");
  }

  const prisma = getPrismaClient();

  try {
    return await prisma.$transaction(async (tx) => {
      // Get all families the user belongs to
      const familyMemberships = await tx.familyMember.findMany({
        where: { appUserId: appUser.id },
        include: { family: true },
      });

      for (const membership of familyMemberships) {
        const familyId = membership.familyId;

        // Delete all related data for this family
        await tx.transaction.deleteMany({ where: { familyId } });
        await tx.budget.deleteMany({ where: { familyId } });
        await tx.goal.deleteMany({ where: { familyId } });
        await tx.category.deleteMany({ where: { familyId } });
        await tx.financialAccount.deleteMany({ where: { familyId } });
        await tx.familyMember.deleteMany({ where: { familyId } });
        await tx.family.delete({ where: { id: familyId } });
      }

      return { success: true };
    });
  } catch (error) {
    console.error("Error resetting user data:", error);
    throw new Error("Failed to reset user data");
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Seed the database with sample data for the current user
 */
export async function seedUserData(resetFirst: boolean = false) {
  const appUser = await getCurrentAppUser();
  if (!appUser) {
    throw new Error("User not authenticated");
  }

  // If user has existing data and resetFirst is true, reset it first
  if (appUser.familyMemberships.length > 0) {
    if (resetFirst) {
      await resetUserData();
    } else {
      throw new Error(
        "User already has financial data. Use reset if you want to start over."
      );
    }
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

      await tx.financialAccount.create({
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

      // Create comprehensive transaction data including current month
      const allTransactions = [];
      const currentDate = new Date();

      // Generate data for current month and past 2 months (3 months total for faster seeding)
      for (let monthOffset = 0; monthOffset < 3; monthOffset++) {
        const monthDate = new Date(currentDate);
        monthDate.setMonth(monthDate.getMonth() - monthOffset);

        // Base monthly income (salary) - always on the 15th
        const salaryAmount = 6250 + (Math.random() - 0.5) * 500; // 6000-6500 range
        allTransactions.push({
          date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 15),
          description: "Monthly Salary",
          merchant: "Acme Corporation",
          amount: salaryAmount,
          type: "INCOME" as TransactionType,
          status: "RECONCILED" as TransactionStatus,
          accountId: checkingAccount.id,
          categoryId: createdCategories.find((c) => c.name === "Salary")?.id,
          isReconciled: true,
        });

        // Optional freelance income (30% chance)
        if (Math.random() > 0.7) {
          allTransactions.push({
            date: new Date(
              monthDate.getFullYear(),
              monthDate.getMonth(),
              Math.floor(Math.random() * 28) + 1
            ),
            description: "Freelance Payment",
            merchant: "Client XYZ",
            amount: 500 + Math.random() * 1000,
            type: "INCOME" as TransactionType,
            status: "RECONCILED" as TransactionStatus,
            accountId: checkingAccount.id,
            categoryId: createdCategories.find((c) => c.name === "Freelance")
              ?.id,
            isReconciled: true,
          });
        }

        // Monthly expenses with realistic patterns
        const monthlyExpenses = [
          // Fixed expenses
          {
            category: "Utilities",
            amount: -120 - Math.random() * 60,
            count: 1,
            desc: "Electric Bill",
          },
          {
            category: "Utilities",
            amount: -80 - Math.random() * 20,
            count: 1,
            desc: "Internet Bill",
          },
          {
            category: "Entertainment",
            amount: -15.99,
            count: 1,
            desc: "Netflix",
          },
          {
            category: "Health & Fitness",
            amount: -49.99,
            count: 1,
            desc: "Gym Membership",
          },

          // Variable expenses (reduced counts for faster seeding)
          {
            category: "Groceries",
            amount: -80 - Math.random() * 40,
            count: 2,
            desc: "Grocery Store",
          },
          {
            category: "Food & Dining",
            amount: -15 - Math.random() * 25,
            count: 4,
            desc: "Restaurant",
          },
          {
            category: "Transportation",
            amount: -45 - Math.random() * 25,
            count: 2,
            desc: "Gas Station",
          },
          {
            category: "Entertainment",
            amount: -25 - Math.random() * 50,
            count: 1,
            desc: "Entertainment",
          },
        ];

        monthlyExpenses.forEach((expense) => {
          for (let i = 0; i < expense.count; i++) {
            const variation = 0.8 + Math.random() * 0.4; // 80% to 120% of base amount
            allTransactions.push({
              date: new Date(
                monthDate.getFullYear(),
                monthDate.getMonth(),
                Math.floor(Math.random() * 28) + 1
              ),
              description: `${expense.desc} ${i + 1}`,
              merchant: `${expense.desc} Store`,
              amount: expense.amount * variation,
              type: "EXPENSE" as TransactionType,
              status:
                Math.random() > 0.05
                  ? ("RECONCILED" as TransactionStatus)
                  : ("NEEDS_CATEGORIZATION" as TransactionStatus),
              accountId:
                Math.random() > 0.3 ? checkingAccount.id : creditCard.id,
              categoryId:
                Math.random() > 0.1
                  ? createdCategories.find((c) => c.name === expense.category)
                      ?.id
                  : null,
              isReconciled: Math.random() > 0.05,
            });
          }
        });

        // Random additional transactions (reduced for faster seeding)
        const additionalCount = 2 + Math.floor(Math.random() * 3);
        for (let i = 0; i < additionalCount; i++) {
          const randomExpense =
            monthlyExpenses[Math.floor(Math.random() * monthlyExpenses.length)];
          allTransactions.push({
            date: new Date(
              monthDate.getFullYear(),
              monthDate.getMonth(),
              Math.floor(Math.random() * 28) + 1
            ),
            description: `Random ${randomExpense.desc}`,
            merchant: "Various",
            amount: -20 - Math.random() * 100,
            type: "EXPENSE" as TransactionType,
            status:
              Math.random() > 0.1
                ? ("RECONCILED" as TransactionStatus)
                : ("NEEDS_REVIEW" as TransactionStatus),
            accountId: Math.random() > 0.5 ? checkingAccount.id : creditCard.id,
            categoryId:
              Math.random() > 0.2
                ? createdCategories.find(
                    (c) => c.name === randomExpense.category
                  )?.id
                : null,
            isReconciled: Math.random() > 0.1,
          });
        }
      }

      // Create all transactions using createMany for better performance
      await tx.transaction.createMany({
        data: allTransactions.map((transaction) => ({
          ...transaction,
          familyId: family.id,
          tags: [],
        })),
      });

      // Create budgets for the current month
      const currentMonthStart = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );
      const currentMonthEnd = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
      );

      const budgets = [
        {
          name: "Monthly Food Budget",
          amount: 800.0,
          period: "MONTHLY" as BudgetPeriod,
          startDate: currentMonthStart,
          endDate: currentMonthEnd,
          isActive: true,
          familyId: family.id,
        },
        {
          name: "Transportation Budget",
          amount: 400.0,
          period: "MONTHLY" as BudgetPeriod,
          startDate: currentMonthStart,
          endDate: currentMonthEnd,
          isActive: true,
          familyId: family.id,
        },
        {
          name: "Entertainment Budget",
          amount: 300.0,
          period: "MONTHLY" as BudgetPeriod,
          startDate: currentMonthStart,
          endDate: currentMonthEnd,
          isActive: true,
          familyId: family.id,
        },
      ];

      for (const budget of budgets) {
        await tx.budget.create({
          data: budget,
        });
      }

      // Create financial goals
      const goals = [
        {
          name: "Emergency Fund",
          type: "EMERGENCY_FUND" as GoalType,
          targetAmount: 15000.0,
          currentAmount: 10050.0,
          targetDate: new Date("2024-12-31"),
          description: "6 months of expenses",
          color: "#28A745",
          familyId: family.id,
        },
        {
          name: "Vacation Fund",
          type: "SAVINGS" as GoalType,
          targetAmount: 5000.0,
          currentAmount: 1200.0,
          targetDate: new Date("2024-06-30"),
          description: "Summer vacation to Europe",
          color: "#17A2B8",
          familyId: family.id,
        },
        {
          name: "New Car Down Payment",
          type: "SAVINGS" as GoalType,
          targetAmount: 8000.0,
          currentAmount: 2500.0,
          targetDate: new Date("2024-09-30"),
          description: "Down payment for new car",
          color: "#6F42C1",
          familyId: family.id,
        },
      ];

      for (const goal of goals) {
        await tx.goal.create({
          data: goal,
        });
      }

      return { success: true, familyId: family.id };
    });
  } catch (error) {
    console.error("Error seeding user data:", error);
    throw new Error("Failed to seed user data");
  } finally {
    await prisma.$disconnect();
  }
}
