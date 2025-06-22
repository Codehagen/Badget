"use server";

/**
 * AI BUDGET ACTIONS
 * ==================
 *
 * This file provides server actions for generating budget recommendations
 * using recent transaction history. It demonstrates how to combine
 * transactional data with the OpenAI API through the Vercel AI SDK.
 */

import { PrismaClient } from "@/generated/prisma";
import { getCurrentAppUser } from "./user-actions";
import type {
  TransactionStatus,
  TransactionType,
} from "@/generated/prisma";
import OpenAI from "openai";

// Instantiate Prisma per request
function getPrismaClient() {
  return new PrismaClient();
}

export type CategoryBudgetRecommendation = {
  categoryId: string;
  categoryName: string;
  averageMonthlySpend: number;
  recommendedBudget: number;
  explanation?: string;
};

export type BudgetRecommendationResult = {
  recommendations: CategoryBudgetRecommendation[];
  summary: string | null;
};

export type TransactionAnomaly = {
  transactionId: string;
  categoryName: string;
  amount: number;
  reason: string;
};

export type CategoryForecast = {
  categoryId: string;
  categoryName: string;
  projectedNextMonth: number;
};

/**
 * Generate budget recommendations based on past spending.
 *
 * @param months Number of months to average for spending history (default: 3)
 * @returns Recommended budget amounts and optional AI summary
 */
export async function generateBudgetRecommendations(
  months: number = 3,
): Promise<BudgetRecommendationResult> {
  const appUser = await getCurrentAppUser();
  if (!appUser) throw new Error("User not authenticated");

  const familyId = appUser.familyMemberships[0]?.familyId;
  if (!familyId) throw new Error("No family found for user");

  const prisma = getPrismaClient();

  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(endDate.getMonth() - months);

    // Sum expenses by category for the selected period
    const spendByCategory = await prisma.transaction.groupBy({
      by: ["categoryId"],
      where: {
        familyId,
        type: "EXPENSE" as TransactionType,
        status: "RECONCILED" as TransactionStatus,
        date: { gte: startDate, lte: endDate },
        categoryId: { not: null },
      },
      _sum: { amount: true },
    });

    // Fetch category names
    const categoryIds = spendByCategory.map((s) => s.categoryId!);
    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true },
    });

    const recommendations: CategoryBudgetRecommendation[] = spendByCategory.map(
      (entry) => {
        const category = categories.find((c) => c.id === entry.categoryId);
        const avgMonthly = Number(entry._sum.amount || 0) / months;
        return {
          categoryId: entry.categoryId!,
          categoryName: category?.name || "Uncategorized",
          averageMonthlySpend: Number(avgMonthly.toFixed(2)),
          recommendedBudget: Number((avgMonthly * 1.05).toFixed(2)), // add 5% buffer
        };
      },
    );

    // Adjust budgets for active savings goals
    const goals = await prisma.goal.findMany({
      where: {
        familyId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        targetAmount: true,
        currentAmount: true,
        targetDate: true,
      },
    });

    if (goals.length > 0) {
      const now = new Date();
      const totalGoalAllocation = goals.reduce((sum, goal) => {
        if (!goal.targetDate) return sum;
        const monthsLeft =
          (goal.targetDate.getFullYear() - now.getFullYear()) * 12 +
          (goal.targetDate.getMonth() - now.getMonth());
        if (monthsLeft <= 0) return sum;
        const remaining = Number(goal.targetAmount) - Number(goal.currentAmount);
        return sum + Math.max(0, remaining / monthsLeft);
      }, 0);

      const perCategoryAdjustment = totalGoalAllocation / recommendations.length;
      recommendations.forEach((rec) => {
        rec.recommendedBudget = Number(
          (rec.recommendedBudget - perCategoryAdjustment).toFixed(2),
        );
        if (rec.recommendedBudget < 0) rec.recommendedBudget = 0;
      });
    }

    // Generate a summary and explanations with OpenAI (optional)
    let summary: string | null = null;
    try {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
      const prompt = `Provide a short budgeting summary and a one-sentence explanation for each category's recommended budget.\n${recommendations
        .map((r) => `${r.categoryName}: $${r.recommendedBudget}`)
        .join("\n")}`;

      const chat = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are a helpful budgeting assistant." },
          { role: "user", content: prompt },
        ],
      });

      summary = chat.choices[0]?.message?.content?.trim() || null;

      // Parse explanations from the response if provided in lines
      const lines = summary?.split("\n") || [];
      lines.forEach((line) => {
        const [name, ...rest] = line.split(":");
        const explanation = rest.join(":").trim();
        const rec = recommendations.find(
          (r) => r.categoryName.toLowerCase() === name.toLowerCase(),
        );
        if (rec && explanation) {
          rec.explanation = explanation;
        }
      });
    } catch (aiError) {
      console.error("AI summary failed:", aiError);
    }

    return { recommendations, summary };
  } catch (error) {
    console.error("Error generating budget recommendations:", error);
    throw new Error("Failed to generate budget recommendations");
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Detect potential anomalous transactions by comparing each expense
 * against the historical average for its category.
 */
export async function detectTransactionAnomalies(
  months: number = 3,
): Promise<TransactionAnomaly[]> {
  const appUser = await getCurrentAppUser();
  if (!appUser) throw new Error("User not authenticated");

  const familyId = appUser.familyMemberships[0]?.familyId;
  if (!familyId) throw new Error("No family found for user");

  const prisma = getPrismaClient();

  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(endDate.getMonth() - months);

    // Fetch historical expenses grouped by category
    const spendByCategory = await prisma.transaction.groupBy({
      by: ["categoryId"],
      where: {
        familyId,
        type: "EXPENSE" as TransactionType,
        status: "RECONCILED" as TransactionStatus,
        date: { gte: startDate, lte: endDate },
        categoryId: { not: null },
      },
      _avg: { amount: true },
      _stddev: { amount: true },
    });

    const categoryStats = new Map(
      spendByCategory.map((entry) => [
        entry.categoryId!,
        {
          avg: Number(entry._avg.amount || 0),
          std: Number(entry._stddev.amount || 0),
        },
      ]),
    );

    const recentTransactions = await prisma.transaction.findMany({
      where: {
        familyId,
        type: "EXPENSE",
        status: "RECONCILED",
        date: { gte: startDate, lte: endDate },
        categoryId: { not: null },
      },
      select: {
        id: true,
        amount: true,
        categoryId: true,
        category: {
          select: { name: true },
        },
      },
    });

    const anomalies: TransactionAnomaly[] = [];
    for (const tx of recentTransactions) {
      const stats = categoryStats.get(tx.categoryId!);
      if (!stats) continue;
      const amount = Math.abs(Number(tx.amount));
      if (amount > stats.avg + stats.std * 2) {
        anomalies.push({
          transactionId: tx.id,
          categoryName: tx.category?.name || "Uncategorized",
          amount,
          reason: `Above expected range for ${tx.category?.name}`,
        });
      }
    }

    return anomalies;
  } catch (error) {
    console.error("Error detecting anomalies:", error);
    return [];
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Forecast next month's spending per category using a simple linear trend.
 */
export async function forecastCategorySpending(
  months: number = 6,
): Promise<CategoryForecast[]> {
  const appUser = await getCurrentAppUser();
  if (!appUser) throw new Error("User not authenticated");

  const familyId = appUser.familyMemberships[0]?.familyId;
  if (!familyId) throw new Error("No family found for user");

  const prisma = getPrismaClient();

  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(endDate.getMonth() - months);

    const transactions = await prisma.transaction.findMany({
      where: {
        familyId,
        type: "EXPENSE",
        status: "RECONCILED",
        date: { gte: startDate, lte: endDate },
        categoryId: { not: null },
      },
      select: {
        amount: true,
        date: true,
        categoryId: true,
        category: { select: { name: true } },
      },
      orderBy: { date: "asc" },
    });

    const monthly = new Map<string, Map<string, number>>();
    transactions.forEach((tx) => {
      const monthKey = tx.date.toISOString().slice(0, 7); // YYYY-MM
      if (!monthly.has(monthKey)) monthly.set(monthKey, new Map());
      const catMap = monthly.get(monthKey)!;
      const current = catMap.get(tx.categoryId!) || 0;
      catMap.set(tx.categoryId!, current + Math.abs(Number(tx.amount)));
    });

    const categories = new Map<string, string>();
    transactions.forEach((tx) => {
      categories.set(tx.categoryId!, tx.category?.name || "Uncategorized");
    });

    const results: CategoryForecast[] = [];
    categories.forEach((name, id) => {
      const series: [number, number][] = [];
      Array.from(monthly.entries()).forEach(([, catMap], idx) => {
        const val = catMap.get(id) || 0;
        series.push([idx + 1, val]);
      });
      if (series.length === 0) return;
      const n = series.length;
      const avgX = series.reduce((s, [x]) => s + x, 0) / n;
      const avgY = series.reduce((s, [, y]) => s + y, 0) / n;
      let num = 0;
      let den = 0;
      series.forEach(([x, y]) => {
        num += (x - avgX) * (y - avgY);
        den += (x - avgX) ** 2;
      });
      const slope = den === 0 ? 0 : num / den;
      const intercept = avgY - slope * avgX;
      const forecast = intercept + slope * (n + 1);
      results.push({
        categoryId: id,
        categoryName: name,
        projectedNextMonth: Number(Math.max(0, forecast).toFixed(2)),
      });
    });

    return results;
  } catch (error) {
    console.error("Error forecasting spending:", error);
    return [];
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Answer a free-form financial question using OpenAI and recent data.
 */
export async function answerFinanceQuestion(question: string) {
  const appUser = await getCurrentAppUser();
  if (!appUser) throw new Error("User not authenticated");

  const familyId = appUser.familyMemberships[0]?.familyId;
  if (!familyId) throw new Error("No family found for user");

  const prisma = getPrismaClient();

  try {
    const recentTransactions = await prisma.transaction.findMany({
      where: {
        familyId,
        date: {
          gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90),
        },
        status: "RECONCILED",
      },
      select: {
        date: true,
        amount: true,
        category: { select: { name: true } },
      },
      orderBy: { date: "asc" },
    });

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
    const context = recentTransactions
      .map(
        (tx) =>
          `${tx.date.toISOString().slice(0, 10)} - ${tx.category?.name}: $${Math.abs(
            Number(tx.amount),
          )}`,
      )
      .slice(-100)
      .join("\n");

    const chat = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are a financial assistant that answers questions using the provided transaction history.",
        },
        { role: "system", content: context },
        { role: "user", content: question },
      ],
    });

    return chat.choices[0]?.message?.content?.trim() || "";
  } catch (error) {
    console.error("Error answering question:", error);
    return "";
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Generate short personalized budgeting tips.
 */
export async function generateBudgetTips(months: number = 3) {
  const recommendations = await generateBudgetRecommendations(months);
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
    const prompt = `Based on the following category budgets, give three short tips to help save money.\n${recommendations.recommendations
      .map((r) => `${r.categoryName}: $${r.recommendedBudget}`)
      .join("\n")}`;

    const chat = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a helpful budgeting assistant." },
        { role: "user", content: prompt },
      ],
    });

    return chat.choices[0]?.message?.content?.trim() || "";
  } catch (error) {
    console.error("Error generating tips:", error);
    return "";
  }
}

/**
 * Run an ad-hoc AI prompt and return the response.
 *
 * This replaces the previous API route example with a server action so
 * clients can invoke OpenAI directly without an HTTP endpoint.
 */
export async function runAiPrompt(prompt: string) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
  const chat = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
  });
  return chat.choices[0]?.message?.content?.trim() || "";
}

