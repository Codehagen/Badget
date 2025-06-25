export type TransactionStatus =
  | "RECONCILED"
  | "NEEDS_CATEGORIZATION"
  | "NEEDS_REVIEW"
  | "IN_PROGRESS";

export type TransactionType = "INCOME" | "EXPENSE" | "TRANSFER";

export interface DateRange {
  from?: Date;
  to?: Date;
}

export interface TransactionFilters {
  search?: string;
  accountId?: string;
  categoryId?: string;
  status?: TransactionStatus;
  type?: TransactionType;
  startDate?: Date;
  endDate?: Date;
  dateRange?: DateRange;
  uncategorized?: boolean;
}

export interface SerializedFilters {
  search?: string;
  account?: string;
  category?: string;
  status?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
  uncategorized?: string;
}

export interface FilterOption {
  id: string;
  name: string;
  icon?: string;
  color?: string;
}

export interface Account extends FilterOption {
  type: string;
}

export interface Category extends FilterOption {
  icon?: string;
  color?: string;
}

export interface QuickFilter {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  filters: Partial<TransactionFilters>;
  description?: string;
}

export interface FilterState {
  filters: TransactionFilters;
  isLoading: boolean;
  activeFiltersCount: number;
  serializedFilters: SerializedFilters;
}

export type FilterValue =
  | string
  | Date
  | TransactionStatus
  | TransactionType
  | undefined;

export interface UseTransactionFiltersReturn {
  // State
  filters: TransactionFilters;
  isLoading: boolean;
  activeFiltersCount: number;

  // Actions
  updateFilter: (key: keyof TransactionFilters, value: FilterValue) => void;
  updateFilters: (updates: Partial<TransactionFilters>) => void;
  clearFilters: () => void;
  applyQuickFilter: (quickFilter: QuickFilter) => void;

  // Utilities
  getFilterValue: (key: keyof TransactionFilters) => FilterValue;
  isFilterActive: (key: keyof TransactionFilters) => boolean;
  serializeFilters: () => SerializedFilters;
}
