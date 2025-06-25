import { Suspense } from "react";
import {
  getAllTransactions,
  getFinancialAccounts,
  getCategories,
} from "@/actions/dashboard-actions";
import { TransactionsHeaderSection } from "./transactions-header-section";
import { TransactionsStatsSection } from "./transactions-stats-section";
import { TransactionsFilterSection } from "./transactions-filter-section";
import { TransactionsTableSection } from "./transactions-table-section";
import {
  HeaderSkeleton,
  MetricsSkeleton,
  TransactionTableSkeleton,
} from "../dashboard/skeletons";

interface FilterValues {
  search?: string;
  accountId?: string;
  categoryId?: string;
  status?:
    | "RECONCILED"
    | "NEEDS_CATEGORIZATION"
    | "NEEDS_REVIEW"
    | "IN_PROGRESS";
  type?: "INCOME" | "EXPENSE" | "TRANSFER";
  startDate?: Date;
  endDate?: Date;
  uncategorized?: boolean;
}

interface AsyncComponentProps {
  filters: FilterValues;
  page: number;
  limit: number;
}

// Async component wrappers that fetch data
async function AsyncTransactionsStatsSection({
  filters,
}: {
  filters: FilterValues;
}) {
  // Get total count for stats
  const transactionData = await getAllTransactions({
    limit: 1, // We only need the total count
    offset: 0,
    ...filters,
  });

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <TransactionsStatsSection
      totalCount={transactionData.totalCount}
      totalPages={transactionData.totalPages}
      pageSize={50}
      activeFiltersCount={activeFiltersCount}
    />
  );
}

async function AsyncTransactionsFilterSection({
  filters,
}: {
  filters: FilterValues;
}) {
  const [accounts, categories, transactionData] = await Promise.all([
    getFinancialAccounts(),
    getCategories(),
    getAllTransactions({
      limit: 1, // We only need the total count
      offset: 0,
      ...filters,
    }),
  ]);

  // Serialize accounts
  const serializedAccounts = accounts.map((account) => ({
    id: account.id,
    name: account.name,
    type: account.type,
  }));

  // Serialize categories
  const serializedCategories = categories.map((category) => ({
    id: category.id,
    name: category.name,
    icon: category.icon || undefined,
    color: category.color || undefined,
  }));

  return (
    <TransactionsFilterSection
      accounts={serializedAccounts}
      categories={serializedCategories}
      totalCount={transactionData.totalCount}
      currentFilters={filters}
    />
  );
}

async function AsyncTransactionsTableSection({
  filters,
  page,
  limit,
}: AsyncComponentProps) {
  const offset = (page - 1) * limit;

  const [transactionData, categories] = await Promise.all([
    getAllTransactions({
      limit,
      offset,
      ...filters,
    }),
    getCategories(),
  ]);

  // Transform transactions and serialize Decimal objects for client components
  const transformedTransactions = transactionData.transactions.map((tx) => ({
    id: tx.id,
    amount: Number(tx.amount),
    description: tx.description,
    merchant: tx.merchant || tx.account.name,
    date: tx.date,
    type: tx.type,
    status: tx.status,
    account: {
      name: tx.account.name,
      type: tx.account.type,
    },
    category: tx.category
      ? {
          id: tx.category.id,
          name: tx.category.name,
          icon: tx.category.icon,
          color: tx.category.color,
        }
      : null,
  }));

  // Serialize categories for client component
  const serializedCategories = categories.map((category) => ({
    id: category.id,
    name: category.name,
    icon: category.icon || undefined,
    color: category.color || undefined,
  }));

  // Determine if there are active filters
  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== undefined && value !== null && value !== false
  );

  // Determine filter type for appropriate empty state messaging
  // Priority: uncategorized > search > status > general
  let filterType: "uncategorized" | "search" | "status" | "general" = "general";
  if (filters.uncategorized) {
    filterType = "uncategorized";
  } else if (filters.search) {
    filterType = "search";
  } else if (filters.status) {
    filterType = "status";
  }

  return (
    <TransactionsTableSection
      transactions={transformedTransactions}
      categories={serializedCategories}
      currentPage={page}
      totalPages={transactionData.totalPages}
      totalCount={transactionData.totalCount}
      pageSize={limit}
      hasActiveFilters={hasActiveFilters}
      filterType={filterType}
      searchQuery={filters.search}
    />
  );
}

async function AsyncTransactionsHeaderSection() {
  return <TransactionsHeaderSection />;
}

// Exported components with Suspense boundaries
export function SuspendedTransactionsHeaderSection() {
  return (
    <Suspense fallback={<HeaderSkeleton />}>
      <AsyncTransactionsHeaderSection />
    </Suspense>
  );
}

export function SuspendedTransactionsStatsSection({
  filters,
}: {
  filters: FilterValues;
}) {
  return (
    <Suspense fallback={<MetricsSkeleton />}>
      <AsyncTransactionsStatsSection filters={filters} />
    </Suspense>
  );
}

export function SuspendedTransactionsFilterSection({
  filters,
}: {
  filters: FilterValues;
}) {
  return (
    <Suspense
      fallback={<div className="h-16 animate-pulse bg-muted rounded-lg" />}
    >
      <AsyncTransactionsFilterSection filters={filters} />
    </Suspense>
  );
}

export function SuspendedTransactionsTableSection({
  filters,
  page,
  limit,
}: AsyncComponentProps) {
  return (
    <Suspense fallback={<TransactionTableSkeleton />}>
      <AsyncTransactionsTableSection
        filters={filters}
        page={page}
        limit={limit}
      />
    </Suspense>
  );
}
