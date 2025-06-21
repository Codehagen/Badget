import { TransactionTable } from "@/components/transaction-table";

// Define the transaction type that matches the dashboard actions return type
type Transaction = {
  id: string;
  amount: number;
  description: string;
  date: Date;
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  status: "PENDING" | "PROCESSED" | "RECONCILED" | "FAILED";
  account: {
    name: string;
    type: string;
  };
  category: {
    name: string;
    icon?: string | null;
    color?: string | null;
  } | null;
};

interface TransactionManagementSectionProps {
  transactions: Transaction[];
}

export function TransactionManagementSection({
  transactions,
}: TransactionManagementSectionProps) {
  // Transform the transaction data to match the TransactionTable expected format
  const transformedTransactions = transactions.map((tx, index) => ({
    id: index + 1, // TransactionTable expects numeric id
    date: tx.date.toISOString(),
    description: tx.description,
    merchant: tx.account.name, // Using account name as merchant for now
    amount: tx.amount, // Keep the amount as is since expenses are already negative in DB
    type: tx.type.toLowerCase() as "income" | "expense" | "transfer",
    category: tx.category?.name || "",
    account: tx.account.name,
    status: tx.status.toLowerCase().replace("_", " ") as
      | "reconciled"
      | "needs_categorization"
      | "needs_review"
      | "in_progress",
    reconciled: tx.status === "RECONCILED",
    categorized: tx.category !== null,
  }));

  const pendingCount = transactions.filter(
    (tx) => tx.status === "PENDING" || !tx.category
  ).length;

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
            {pendingCount} pending
          </span>
        </div>
      </div>
      <TransactionTable data={transformedTransactions} />
    </div>
  );
}
