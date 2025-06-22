import { Suspense } from "react";
import { HeaderSection } from "./header-section";
import { MetricsSection } from "./metrics-section";
import { AnalyticsSection } from "./analytics-section";
import { InsightsSection } from "./insights-section";
import { TransactionManagementSection } from "./data-table-section";
import {
  getFinancialMetrics,
  getSpendingTrends,
  getFinancialGoals,
  getTransactions,
} from "@/actions/dashboard-actions";
import { getNewsForUserAssets } from "@/actions/asset-actions";
import {
  HeaderSkeleton,
  MetricsSkeleton,
  AnalyticsSkeleton,
  InsightsSkeleton,
  TransactionTableSkeleton,
} from "./skeletons";

// Async component wrappers that fetch data
async function AsyncMetricsSection() {
  const metrics = await getFinancialMetrics();
  return <MetricsSection data={metrics} />;
}

async function AsyncAnalyticsSection() {
  const spendingTrends = await getSpendingTrends(6);
  return <AnalyticsSection data={spendingTrends} />;
}

async function AsyncInsightsSection() {
  const [goals, assetNews] = await Promise.all([
    getFinancialGoals(),
    getNewsForUserAssets(),
  ]);
  return <InsightsSection goals={goals} assetNews={assetNews} />;
}

async function AsyncTransactionSection() {
  const transactions = await getTransactions({ limit: 20 });
  return <TransactionManagementSection transactions={transactions} />;
}

async function AsyncHeaderSection() {
  return <HeaderSection />;
}

// Exported components with Suspense boundaries
export function SuspendedHeaderSection() {
  return (
    <Suspense fallback={<HeaderSkeleton />}>
      <AsyncHeaderSection />
    </Suspense>
  );
}

export function SuspendedMetricsSection() {
  return (
    <Suspense fallback={<MetricsSkeleton />}>
      <AsyncMetricsSection />
    </Suspense>
  );
}

export function SuspendedAnalyticsSection() {
  return (
    <Suspense fallback={<AnalyticsSkeleton />}>
      <AsyncAnalyticsSection />
    </Suspense>
  );
}

export function SuspendedInsightsSection() {
  return (
    <Suspense fallback={<InsightsSkeleton />}>
      <AsyncInsightsSection />
    </Suspense>
  );
}

export function SuspendedTransactionSection() {
  return (
    <Suspense fallback={<TransactionTableSkeleton />}>
      <AsyncTransactionSection />
    </Suspense>
  );
}
