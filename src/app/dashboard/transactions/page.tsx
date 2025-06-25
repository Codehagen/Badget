import { Suspense } from "react";
import {
  getAllTransactions,
  getFinancialAccounts,
  getCategories,
} from "@/actions/dashboard-actions";
import { TransactionManagementSection } from "@/components/dashboard/data-table-section";
import { TransactionTableSkeleton } from "@/components/dashboard/skeletons";
import { TransactionsFilter } from "@/components/dashboard/transactions-filter";
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

async function AllTransactionsContent({ searchParams }: TransactionsPageProps) {
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
    startDate: params.startDate ? new Date(params.startDate) : undefined,
    endDate: params.endDate ? new Date(params.endDate) : undefined,
  };

  // Fetch data in parallel
  const [transactionData, accounts, categories] = await Promise.all([
    getAllTransactions({
      limit,
      offset,
      ...filters,
    }),
    getFinancialAccounts(),
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
    icon: category.icon,
    color: category.color,
  }));

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
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
                <span className="text-muted-foreground">transactions</span>
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
                Reconciled
              </p>
              <p className="text-2xl font-bold text-emerald-600">
                {
                  transformedTransactions.filter(
                    (t) => t.status === "RECONCILED"
                  ).length
                }
              </p>
              <div className="flex items-center gap-1 text-xs">
                <span className="text-muted-foreground">completed</span>
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
              <p className="text-sm font-medium text-muted-foreground">
                Pending
              </p>
              <p className="text-2xl font-bold text-orange-600">
                {
                  transformedTransactions.filter(
                    (t) => t.status !== "RECONCILED" || !t.category
                  ).length
                }
              </p>
              <div className="flex items-center gap-1 text-xs">
                <span className="text-muted-foreground">need attention</span>
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
                This Month
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {
                  transformedTransactions.filter((t) => {
                    const txDate = new Date(t.date);
                    const now = new Date();
                    return (
                      txDate.getMonth() === now.getMonth() &&
                      txDate.getFullYear() === now.getFullYear()
                    );
                  }).length
                }
              </p>
              <div className="flex items-center gap-1 text-xs">
                <span className="text-muted-foreground">current month</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <TransactionsFilter
        accounts={serializedAccounts}
        categories={serializedCategories}
        totalCount={transactionData.totalCount}
      />

      {/* Transactions Table */}
      <div className="border rounded-lg">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">All Transactions</h3>
              <p className="text-sm text-muted-foreground">
                Manage and categorize all your financial transactions
              </p>
            </div>
          </div>
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
    </div>
  );
}

export default function TransactionsPage({
  searchParams,
}: TransactionsPageProps) {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">All Transactions</h1>
        <p className="text-muted-foreground">
          View and manage all your financial transactions
        </p>
      </div>

      <Suspense fallback={<TransactionTableSkeleton />}>
        <AllTransactionsContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
