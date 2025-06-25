import { TransactionFilterWrapper } from "./transaction-filter-wrapper";

interface Account {
  id: string;
  name: string;
  type: string;
}

interface Category {
  id: string;
  name: string;
  icon?: string;
  color?: string;
}

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
}

interface TransactionsFilterSectionProps {
  accounts: Account[];
  categories: Category[];
  totalCount: number;
  currentFilters: FilterValues;
}

export function TransactionsFilterSection({
  accounts,
  categories,
  totalCount,
  currentFilters,
}: TransactionsFilterSectionProps) {
  return (
    <TransactionFilterWrapper
      accounts={accounts}
      categories={categories}
      totalCount={totalCount}
      currentFilters={currentFilters}
    />
  );
}
