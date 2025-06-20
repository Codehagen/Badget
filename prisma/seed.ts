import { PrismaClient } from "@/generated/prisma";
import {
  AccountType,
  TransactionType,
  TransactionStatus,
  GoalType,
  BudgetPeriod,
  FamilyRole,
  AppUserStatus,
} from "@/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Create test user
  const user = await prisma.user.upsert({
    where: { email: "john.doe@example.com" },
    update: {},
    create: {
      email: "john.doe@example.com",
      name: "John Doe",
      emailVerified: true,
      image: null,
    },
  });

  console.log("✅ Created user:", user.email);

  // Create AppUser
  const appUser = await prisma.appUser.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      firstName: "John",
      lastName: "Doe",
      timezone: "America/New_York",
      locale: "en-US",
      status: AppUserStatus.ACTIVE,
      preferences: {},
    },
  });

  console.log("✅ Created app user:", appUser.firstName);

  // Create Family
  const family = await prisma.family.upsert({
    where: { id: "family-1" },
    update: {},
    create: {
      id: "family-1",
      name: "The Doe Family",
      description: "Personal finances for John Doe",
      currency: "USD",
      timezone: "America/New_York",
      preferences: {},
    },
  });

  console.log("✅ Created family:", family.name);

  // Create FamilyMember
  await prisma.familyMember.upsert({
    where: {
      familyId_appUserId: {
        familyId: family.id,
        appUserId: appUser.id,
      },
    },
    update: {},
    create: {
      familyId: family.id,
      appUserId: appUser.id,
      role: FamilyRole.OWNER,
      preferences: {},
    },
  });

  console.log("✅ Created family membership");

  // Create Financial Accounts
  const checkingAccount = await prisma.financialAccount.upsert({
    where: { id: "account-checking" },
    update: {},
    create: {
      id: "account-checking",
      name: "Chase Checking",
      type: AccountType.CHECKING,
      balance: 5420.75,
      currency: "USD",
      institution: "Chase Bank",
      accountNumber: "****1234",
      color: "#0066CC",
      familyId: family.id,
    },
  });

  const creditCard = await prisma.financialAccount.upsert({
    where: { id: "account-credit" },
    update: {},
    create: {
      id: "account-credit",
      name: "Chase Credit Card",
      type: AccountType.CREDIT_CARD,
      balance: -1234.56,
      currency: "USD",
      institution: "Chase Bank",
      accountNumber: "****5678",
      color: "#FF6B35",
      familyId: family.id,
    },
  });

  const savingsAccount = await prisma.financialAccount.upsert({
    where: { id: "account-savings" },
    update: {},
    create: {
      id: "account-savings",
      name: "Chase Savings",
      type: AccountType.SAVINGS,
      balance: 12450.0,
      currency: "USD",
      institution: "Chase Bank",
      accountNumber: "****9012",
      color: "#28A745",
      familyId: family.id,
    },
  });

  console.log("✅ Created financial accounts");

  // Create Categories
  const categories = [
    { id: "cat-food", name: "Food & Dining", icon: "🍽️", color: "#FF6B35" },
    {
      id: "cat-transport",
      name: "Transportation",
      icon: "🚗",
      color: "#0066CC",
    },
    { id: "cat-groceries", name: "Groceries", icon: "🛒", color: "#28A745" },
    {
      id: "cat-entertainment",
      name: "Entertainment",
      icon: "🎬",
      color: "#6F42C1",
    },
    { id: "cat-utilities", name: "Utilities", icon: "💡", color: "#FFC107" },
    {
      id: "cat-health",
      name: "Health & Fitness",
      icon: "💪",
      color: "#20C997",
    },
    { id: "cat-salary", name: "Salary", icon: "💰", color: "#28A745" },
    { id: "cat-freelance", name: "Freelance", icon: "💻", color: "#17A2B8" },
    { id: "cat-cash", name: "Cash", icon: "💵", color: "#6C757D" },
    { id: "cat-savings", name: "Savings", icon: "🏦", color: "#28A745" },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: {
        familyId_name: {
          familyId: family.id,
          name: category.name,
        },
      },
      update: {},
      create: {
        id: category.id,
        name: category.name,
        icon: category.icon,
        color: category.color,
        familyId: family.id,
      },
    });
  }

  console.log("✅ Created categories");

  // Create Transactions (matching our sample data)
  const transactions = [
    {
      date: new Date("2024-01-15"),
      description: "Starbucks Coffee",
      merchant: "Starbucks",
      amount: -5.47,
      type: TransactionType.EXPENSE,
      status: TransactionStatus.RECONCILED,
      accountId: checkingAccount.id,
      categoryId: "cat-food",
      isReconciled: true,
    },
    {
      date: new Date("2024-01-15"),
      description: "Salary Deposit",
      merchant: "Acme Corp",
      amount: 2850.0,
      type: TransactionType.INCOME,
      status: TransactionStatus.RECONCILED,
      accountId: checkingAccount.id,
      categoryId: "cat-salary",
      isReconciled: true,
    },
    {
      date: new Date("2024-01-14"),
      description: "Amazon Purchase",
      merchant: "Amazon",
      amount: -89.99,
      type: TransactionType.EXPENSE,
      status: TransactionStatus.NEEDS_CATEGORIZATION,
      accountId: creditCard.id,
      categoryId: null,
      isReconciled: true,
    },
    {
      date: new Date("2024-01-14"),
      description: "Gas Station",
      merchant: "Shell",
      amount: -45.3,
      type: TransactionType.EXPENSE,
      status: TransactionStatus.RECONCILED,
      accountId: checkingAccount.id,
      categoryId: "cat-transport",
      isReconciled: true,
    },
    {
      date: new Date("2024-01-13"),
      description: "ATM Withdrawal",
      merchant: "Chase ATM",
      amount: -100.0,
      type: TransactionType.TRANSFER,
      status: TransactionStatus.RECONCILED,
      accountId: checkingAccount.id,
      categoryId: "cat-cash",
      isReconciled: true,
    },
    {
      date: new Date("2024-01-13"),
      description: "Grocery Store",
      merchant: "Whole Foods",
      amount: -67.85,
      type: TransactionType.EXPENSE,
      status: TransactionStatus.RECONCILED,
      accountId: checkingAccount.id,
      categoryId: "cat-groceries",
      isReconciled: true,
    },
    {
      date: new Date("2024-01-12"),
      description: "Netflix Subscription",
      merchant: "Netflix",
      amount: -15.99,
      type: TransactionType.EXPENSE,
      status: TransactionStatus.RECONCILED,
      accountId: creditCard.id,
      categoryId: "cat-entertainment",
      isReconciled: true,
    },
    {
      date: new Date("2024-01-12"),
      description: "Electric Bill",
      merchant: "PG&E",
      amount: -125.5,
      type: TransactionType.EXPENSE,
      status: TransactionStatus.RECONCILED,
      accountId: checkingAccount.id,
      categoryId: "cat-utilities",
      isReconciled: true,
    },
    {
      date: new Date("2024-01-11"),
      description: "Restaurant Payment",
      merchant: "The Italian Place",
      amount: -78.5,
      type: TransactionType.EXPENSE,
      status: TransactionStatus.NEEDS_CATEGORIZATION,
      accountId: creditCard.id,
      categoryId: null,
      isReconciled: true,
    },
    {
      date: new Date("2024-01-11"),
      description: "Bank Transfer",
      merchant: "Chase Bank",
      amount: -500.0,
      type: TransactionType.TRANSFER,
      status: TransactionStatus.RECONCILED,
      accountId: checkingAccount.id,
      categoryId: "cat-savings",
      transferToAccountId: savingsAccount.id,
      isReconciled: true,
    },
    {
      date: new Date("2024-01-10"),
      description: "Unknown Transaction",
      merchant: "UNKNOWN MERCHANT",
      amount: -25.0,
      type: TransactionType.EXPENSE,
      status: TransactionStatus.NEEDS_REVIEW,
      accountId: checkingAccount.id,
      categoryId: null,
      isReconciled: false,
    },
    {
      date: new Date("2024-01-10"),
      description: "Freelance Payment",
      merchant: "Client ABC",
      amount: 750.0,
      type: TransactionType.INCOME,
      status: TransactionStatus.RECONCILED,
      accountId: checkingAccount.id,
      categoryId: "cat-freelance",
      isReconciled: true,
    },
    {
      date: new Date("2024-01-09"),
      description: "Coffee Shop",
      merchant: "Local Cafe",
      amount: -8.25,
      type: TransactionType.EXPENSE,
      status: TransactionStatus.RECONCILED,
      accountId: checkingAccount.id,
      categoryId: "cat-food",
      isReconciled: true,
    },
    {
      date: new Date("2024-01-09"),
      description: "Online Purchase",
      merchant: "Best Buy",
      amount: -299.99,
      type: TransactionType.EXPENSE,
      status: TransactionStatus.IN_PROGRESS,
      accountId: creditCard.id,
      categoryId: null,
      isReconciled: false,
    },
    {
      date: new Date("2024-01-08"),
      description: "Gym Membership",
      merchant: "Fitness Plus",
      amount: -49.99,
      type: TransactionType.EXPENSE,
      status: TransactionStatus.RECONCILED,
      accountId: checkingAccount.id,
      categoryId: "cat-health",
      isReconciled: true,
    },
  ];

  for (const transaction of transactions) {
    await prisma.transaction.create({
      data: {
        ...transaction,
        familyId: family.id,
        tags: [],
      },
    });
  }

  console.log("✅ Created transactions");

  // Create Budgets
  const budgets = [
    {
      name: "Monthly Food Budget",
      amount: 800.0,
      period: BudgetPeriod.MONTHLY,
      startDate: new Date("2024-01-01"),
      endDate: new Date("2024-01-31"),
      categoryId: "cat-food",
      alertThreshold: 0.85,
      familyId: family.id,
    },
    {
      name: "Transportation Budget",
      amount: 400.0,
      period: BudgetPeriod.MONTHLY,
      startDate: new Date("2024-01-01"),
      endDate: new Date("2024-01-31"),
      categoryId: "cat-transport",
      alertThreshold: 0.9,
      familyId: family.id,
    },
    {
      name: "Entertainment Budget",
      amount: 200.0,
      period: BudgetPeriod.MONTHLY,
      startDate: new Date("2024-01-01"),
      endDate: new Date("2024-01-31"),
      categoryId: "cat-entertainment",
      alertThreshold: 0.8,
      familyId: family.id,
    },
  ];

  for (const budget of budgets) {
    await prisma.budget.create({
      data: budget,
    });
  }

  console.log("✅ Created budgets");

  // Create Goals
  const goals = [
    {
      name: "Emergency Fund",
      type: GoalType.EMERGENCY_FUND,
      targetAmount: 15000.0,
      currentAmount: 10050.0,
      targetDate: new Date("2024-12-31"),
      description: "6 months of expenses",
      color: "#28A745",
      familyId: family.id,
    },
    {
      name: "Vacation Fund",
      type: GoalType.SAVINGS,
      targetAmount: 5000.0,
      currentAmount: 1200.0,
      targetDate: new Date("2024-06-30"),
      description: "Summer vacation to Europe",
      color: "#17A2B8",
      familyId: family.id,
    },
    {
      name: "New Car Down Payment",
      type: GoalType.SAVINGS,
      targetAmount: 8000.0,
      currentAmount: 2500.0,
      targetDate: new Date("2024-09-30"),
      description: "Down payment for new car",
      color: "#6F42C1",
      familyId: family.id,
    },
  ];

  for (const goal of goals) {
    await prisma.goal.create({
      data: goal,
    });
  }

  console.log("✅ Created goals");

  // Create some additional sample data for the past month
  const additionalTransactions = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);

    return {
      date,
      description: `Sample Transaction ${i + 1}`,
      merchant: `Merchant ${i + 1}`,
      amount: Math.random() * 200 - 100, // Random amount between -100 and 100
      type:
        Math.random() > 0.7 ? TransactionType.INCOME : TransactionType.EXPENSE,
      status:
        Math.random() > 0.1
          ? TransactionStatus.RECONCILED
          : TransactionStatus.NEEDS_CATEGORIZATION,
      accountId: Math.random() > 0.5 ? checkingAccount.id : creditCard.id,
      categoryId:
        Math.random() > 0.2
          ? categories[Math.floor(Math.random() * categories.length)].id
          : null,
      isReconciled: Math.random() > 0.1,
      familyId: family.id,
      tags: [],
    };
  });

  for (const transaction of additionalTransactions) {
    await prisma.transaction.create({
      data: transaction,
    });
  }

  console.log("✅ Created additional sample transactions");

  console.log("🎉 Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
