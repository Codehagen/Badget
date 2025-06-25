import { TransactionFilterWrapper } from "./transaction-filter-wrapper";
import { Account, Category, TransactionFilters } from "@/types/filters";

interface TransactionsFilterSectionProps {
  accounts: Account[];
  categories: Category[];
  totalCount: number;
  currentFilters: TransactionFilters;
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
