import { TransactionManagementSection } from "./data-table-section";
import { TransactionsPagination } from "./transactions-pagination";

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

interface TransactionsTableSectionProps {
  transactions: Transaction[];
  categories: Category[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
}

export function TransactionsTableSection({
  transactions,
  categories,
  currentPage,
  totalPages,
  totalCount,
  pageSize,
}: TransactionsTableSectionProps) {
  return (
    <div className="border rounded-lg">
      <div className="p-6">
        <TransactionManagementSection
          transactions={transactions}
          categories={categories}
        />
      </div>

      {/* Pagination */}
      <div className="border-t p-4">
        <TransactionsPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={totalCount}
          pageSize={pageSize}
        />
      </div>
    </div>
  );
}
