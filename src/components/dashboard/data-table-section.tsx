import { TransactionTable } from "@/components/transaction-table";
import transactionData from "@/app/dashboard/transactions-data.json";

export function TransactionManagementSection() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Recent Transactions</h3>
          <p className="text-sm text-muted-foreground">
            Manage and categorize your recent financial transactions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {
              transactionData.filter(
                (t) =>
                  t.status === "needs_review" ||
                  t.status === "needs_categorization" ||
                  t.status === "in_progress"
              ).length
            }{" "}
            pending
          </span>
        </div>
      </div>
      <TransactionTable data={transactionData} />
    </div>
  );
}
