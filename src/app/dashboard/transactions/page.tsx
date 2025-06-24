import { Suspense } from "react";
import { getTransactions } from "@/actions/dashboard-actions";
import { TransactionManagementSection } from "@/components/dashboard/data-table-section";
import { TransactionTableSkeleton } from "@/components/dashboard/skeletons";
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
  const limit = parseInt(searchParams.limit || "100");
  const transactions = await getTransactions({ limit });

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
              <p className="text-2xl font-bold">{transactions.length}</p>
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
                {transactions.filter((t) => t.status === "RECONCILED").length}
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
                  transactions.filter(
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
                  transactions.filter((t) => {
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

      {/* Transactions Table */}
      <TransactionManagementSection transactions={transactions} />
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
