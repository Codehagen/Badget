import { Suspense } from "react";
import { getFinancialAccounts } from "@/actions/dashboard-actions";
import { AccountsHeaderSection } from "./accounts-header-section";
import { AccountsFilterSection } from "./accounts-filter-section";
import { AccountsGrid } from "./accounts-grid";
import {
  TransactionTableSkeleton,
  HeaderSkeleton,
} from "../dashboard/skeletons";

interface FilterValues {
  search?: string;
  type?: string;
  institution?: string;
}

type Account = Awaited<ReturnType<typeof getFinancialAccounts>>[number] & {
  balance: number;
};

function normalizeAccounts(accounts: Awaited<ReturnType<typeof getFinancialAccounts>>): Account[] {
  return accounts.map((account) => ({
    ...account,
    balance: Number(account.balance),
  }));
}

function filterAccounts(accounts: Account[], filters: FilterValues) {
  return accounts.filter((account) => {
    const matchesSearch = filters.search
      ? account.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        (account.institution ?? "").toLowerCase().includes(filters.search.toLowerCase())
      : true;
    const matchesType = filters.type ? account.type === filters.type : true;
    const matchesInst = filters.institution ? account.institution === filters.institution : true;
    return matchesSearch && matchesType && matchesInst;
  });
}

async function AsyncAccountsHeaderSection() {
  return <AccountsHeaderSection />;
}

async function AsyncAccountsFilterSection({ filters }: { filters: FilterValues }) {
  const rawAccounts = await getFinancialAccounts();
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

async function AsyncAccountsGridSection({ filters }: { filters: FilterValues }) {
  const rawAccounts = await getFinancialAccounts();
  const accounts = normalizeAccounts(rawAccounts);
  const filtered = filterAccounts(accounts, filters);
  return <AccountsGrid accounts={filtered} />;
}

export function SuspendedAccountsHeaderSection() {
  return (
    <Suspense fallback={<HeaderSkeleton />}>
      <AsyncAccountsHeaderSection />
    </Suspense>
  );
}

export function SuspendedAccountsFilterSection({ filters }: { filters: FilterValues }) {
  return (
    <Suspense fallback={<div className="h-16 animate-pulse bg-muted rounded-lg" />}>
      <AsyncAccountsFilterSection filters={filters} />
    </Suspense>
  );
}

export function SuspendedAccountsGridSection({ filters }: { filters: FilterValues }) {
  return (
    <Suspense fallback={<TransactionTableSkeleton />}>
      <AsyncAccountsGridSection filters={filters} />
    </Suspense>
  );
}
