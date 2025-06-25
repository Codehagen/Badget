import { Suspense } from "react";
import {
  getAllTransactions,
  getFinancialAccounts,
  getCategories,
} from "@/actions/dashboard-actions";
import { TransactionManagementSection } from "@/components/dashboard/data-table-section";
import { TransactionsOnlySkeleton } from "@/components/dashboard/skeletons";
import { TransactionFilterWrapper } from "@/components/dashboard/transaction-filter-wrapper";
import { TransactionsPagination } from "@/components/dashboard/transactions-pagination";
import {
  IconCircleCheckFilled,
  IconAlertTriangle,
  IconCurrencyDollar,
  IconCalendarMonth,
} from "@tabler/icons-react";

interface TransactionsPageProps {
  searchParams: {
    page?: string;
    limit?: string;
    search?: string;
    account?: string;
    category?: string;
    status?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
  };
}

// Separate component for just the transactions table that can re-render independently
async function TransactionsTableContent({
  searchParams,
}: TransactionsPageProps) {
  const params = await searchParams;

  const page = parseInt(params.page || "1");
  const limit = parseInt(params.limit || "50");
  const offset = (page - 1) * limit;

  // Parse filter parameters
  const filters = {
    search: params.search,
    accountId: params.account,
    categoryId: params.category,
    status: params.status as
      | "RECONCILED"
      | "NEEDS_CATEGORIZATION"
      | "NEEDS_REVIEW"
      | "IN_PROGRESS"
      | undefined,
    type: params.type as "INCOME" | "EXPENSE" | "TRANSFER" | undefined,
    startDate: params.startDate ? new Date(params.startDate) : undefined,
    endDate: params.endDate ? new Date(params.endDate) : undefined,
  };

  // Fetch only transaction data for this component
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
    account: tx.account,
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

  return (
    <div className="border rounded-lg">
      <div className="p-6">
        <TransactionManagementSection
          transactions={transformedTransactions}
          categories={serializedCategories}
        />
      </div>

      {/* Pagination */}
      <div className="border-t p-4">
        <TransactionsPagination
          currentPage={page}
          totalPages={transactionData.totalPages}
          totalCount={transactionData.totalCount}
          pageSize={limit}
        />
      </div>
    </div>
  );
}

// Component for static content that doesn't need to re-render
async function StaticPageContent({ searchParams }: TransactionsPageProps) {
  const params = await searchParams;

  // Parse filter parameters for the filter bar
  const filters = {
    search: params.search,
    accountId: params.account,
    categoryId: params.category,
    status: params.status as
      | "RECONCILED"
      | "NEEDS_CATEGORIZATION"
      | "NEEDS_REVIEW"
      | "IN_PROGRESS"
      | undefined,
    type: params.type as "INCOME" | "EXPENSE" | "TRANSFER" | undefined,
    startDate: params.startDate ? new Date(params.startDate) : undefined,
    endDate: params.endDate ? new Date(params.endDate) : undefined,
  };

  // Fetch static data (accounts, categories) and get total count for stats
  const [accounts, categories, transactionData] = await Promise.all([
    getFinancialAccounts(),
    getCategories(),
    getAllTransactions({
      limit: 1, // We only need the total count, not the actual transactions
      offset: 0,
      ...filters,
    }),
  ]);

  // Serialize accounts (convert Decimal balance to number)
  const serializedAccounts = accounts.map((account) => ({
    id: account.id,
    name: account.name,
    type: account.type,
  }));

  // Serialize categories for client component
  const serializedCategories = categories.map((category) => ({
    id: category.id,
    name: category.name,
    icon: category.icon || undefined,
    color: category.color || undefined,
  }));

  return (
    <div className="space-y-6">
      {/* Stats Cards - These will be simplified since they don't need live filtering */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <IconCurrencyDollar className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{transactionData.totalCount}</p>
              <div className="flex items-center gap-1 text-xs">
                <span className="text-muted-foreground">
                  found with current filters
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <IconCircleCheckFilled className="h-4 w-4 text-emerald-600" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                Showing
              </p>
              <p className="text-2xl font-bold text-emerald-600">
                {Math.min(transactionData.totalCount, 50)}
              </p>
              <div className="flex items-center gap-1 text-xs">
                <span className="text-muted-foreground">per page</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <IconAlertTriangle className="h-4 w-4 text-orange-600" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">Pages</p>
              <p className="text-2xl font-bold text-orange-600">
                {transactionData.totalPages}
              </p>
              <div className="flex items-center gap-1 text-xs">
                <span className="text-muted-foreground">available</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <IconCalendarMonth className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                Filters
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {Object.values(filters).filter(Boolean).length}
              </p>
              <div className="flex items-center gap-1 text-xs">
                <span className="text-muted-foreground">active</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Linear-inspired Filter Bar */}
      <TransactionFilterWrapper
        accounts={serializedAccounts}
        categories={serializedCategories}
        totalCount={transactionData.totalCount}
        currentFilters={filters}
      />
    </div>
  );
}

export default async function TransactionsPage({
  searchParams,
}: TransactionsPageProps) {
  // Await searchParams to avoid Next.js warning
  const params = await searchParams;
  const searchKey = JSON.stringify(params);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">All Transactions</h1>
        <p className="text-muted-foreground">
          View and manage all your financial transactions
        </p>
      </div>

      {/* Static content that doesn't re-render */}
      <StaticPageContent searchParams={searchParams} />

      {/* Only the transactions table re-renders with skeleton */}
      <Suspense key={searchKey} fallback={<TransactionsOnlySkeleton />}>
        <TransactionsTableContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
