import { EnhancedTransactionTable } from "./enhanced-transaction-table";

// Define the transaction type that matches the dashboard actions return type
type Transaction = {
  id: string;
  amount: number;
  description: string;
  merchant: string;
  date: Date;
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  status:
    | "RECONCILED"
    | "NEEDS_CATEGORIZATION"
    | "NEEDS_REVIEW"
    | "IN_PROGRESS";
  account: {
    name: string;
    type: string;
  };
  category: {
    id: string;
    name: string;
    icon?: string | null;
    color?: string | null;
  } | null;
};

interface Category {
  id: string;
  name: string;
  icon?: string | null;
  color?: string | null;
}

interface TransactionManagementSectionProps {
  transactions: Transaction[];
  categories: Category[];
}

export function TransactionManagementSection({
  transactions,
  categories,
}: TransactionManagementSectionProps) {
  const pendingCount = transactions.filter(
    (tx) => tx.status !== "RECONCILED" || !tx.category
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
      <EnhancedTransactionTable
        transactions={transactions}
        categories={categories}
      />
    </div>
  );
}
