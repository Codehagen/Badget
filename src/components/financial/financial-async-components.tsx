import { Suspense } from "react";
import {
  getFinancialOverview,
  getEnhancedAccounts,
} from "@/actions/financial-actions";
import { FinancialOverviewSection } from "./financial-overview-section";
import { EnhancedAccountsGrid } from "./enhanced-accounts-grid";
import { AccountsHeaderSection } from "../accounts/accounts-header-section";
import { AccountsFilterSection } from "../accounts/accounts-filter-section";
import {
  TransactionTableSkeleton,
  HeaderSkeleton,
  MetricsSkeleton,
} from "../dashboard/skeletons";

interface FilterValues {
  search?: string;
  type?: string;
  institution?: string;
}

function normalizeAccounts(
  accounts: Awaited<ReturnType<typeof getEnhancedAccounts>>
) {
  return accounts.map((account) => ({
    ...account,
    balance: Number(account.balance),
  }));
}

function filterAccounts(
  accounts: ReturnType<typeof normalizeAccounts>,
  filters: FilterValues
) {
  return accounts.filter((account) => {
    const matchesSearch = filters.search
      ? account.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        (account.institution ?? "")
          .toLowerCase()
          .includes(filters.search.toLowerCase())
      : true;
    const matchesType = filters.type ? account.type === filters.type : true;
    const matchesInst = filters.institution
      ? account.institution === filters.institution
      : true;
    return matchesSearch && matchesType && matchesInst;
  });
}

async function AsyncFinancialOverviewSection() {
  const overview = await getFinancialOverview();
  return <FinancialOverviewSection overview={overview} />;
}

async function AsyncAccountsHeaderSection() {
  return <AccountsHeaderSection />;
}

async function AsyncAccountsFilterSection({
  filters,
}: {
  filters: FilterValues;
}) {
  const rawAccounts = await getEnhancedAccounts();
  const accounts = normalizeAccounts(rawAccounts);
  const filtered = filterAccounts(accounts, filters);
  const types = Array.from(new Set(accounts.map((a) => a.type)));
  const institutions = Array.from(
    new Set(accounts.map((a) => a.institution).filter(Boolean))
  ) as string[];

  return (
    <AccountsFilterSection
      types={types}
      institutions={institutions}
      currentFilters={filters}
      totalCount={filtered.length}
    />
  );
}

async function AsyncEnhancedAccountsGridSection({
  filters,
}: {
  filters: FilterValues;
}) {
  const rawAccounts = await getEnhancedAccounts();
  const accounts = normalizeAccounts(rawAccounts);
  const filtered = filterAccounts(accounts, filters);
  return <EnhancedAccountsGrid accounts={filtered} />;
}

// Exported components with Suspense boundaries
export function SuspendedFinancialOverviewSection() {
  return (
    <Suspense fallback={<MetricsSkeleton />}>
      <AsyncFinancialOverviewSection />
    </Suspense>
  );
}

export function SuspendedAccountsHeaderSection() {
  return (
    <Suspense fallback={<HeaderSkeleton />}>
      <AsyncAccountsHeaderSection />
    </Suspense>
  );
}

export function SuspendedAccountsFilterSection({
  filters,
}: {
  filters: FilterValues;
}) {
  return (
    <Suspense
      fallback={<div className="h-16 animate-pulse bg-muted rounded-lg" />}
    >
      <AsyncAccountsFilterSection filters={filters} />
    </Suspense>
  );
}

export function SuspendedEnhancedAccountsGridSection({
  filters,
}: {
  filters: FilterValues;
}) {
  return (
    <Suspense fallback={<TransactionTableSkeleton />}>
      <AsyncEnhancedAccountsGridSection filters={filters} />
    </Suspense>
  );
}
