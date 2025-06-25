import {
  TransactionFilters,
  SerializedFilters,
  TransactionStatus,
  TransactionType,
  Account,
  Category,
} from "@/types/filters";

export function serializeFilters(
  filters: TransactionFilters
): SerializedFilters {
  return {
    search: filters.search || undefined,
    account: filters.accountId || undefined,
    category: filters.categoryId || undefined,
    status: filters.status || undefined,
    type: filters.type || undefined,
    startDate: filters.startDate?.toISOString() || undefined,
    endDate: filters.endDate?.toISOString() || undefined,
  };
}

export function deserializeFilters(
  searchParams: URLSearchParams
): TransactionFilters {
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  return {
    search: searchParams.get("search") || undefined,
    accountId: searchParams.get("account") || undefined,
    categoryId: searchParams.get("category") || undefined,
    status: (searchParams.get("status") as TransactionStatus) || undefined,
    type: (searchParams.get("type") as TransactionType) || undefined,
    startDate: startDate ? new Date(startDate) : undefined,
    endDate: endDate ? new Date(endDate) : undefined,
  };
}

export function buildUrlParams(
  filters: TransactionFilters,
  currentParams?: URLSearchParams
): URLSearchParams {
  const params = new URLSearchParams(currentParams);

  // Clear existing filter params
  const filterKeys = [
    "search",
    "account",
    "category",
    "status",
    "type",
    "startDate",
    "endDate",
  ];
  filterKeys.forEach((key) => params.delete(key));

  // Add new filter params
  const serialized = serializeFilters(filters);
  Object.entries(serialized).forEach(([key, value]) => {
    if (value && value.trim() !== "" && value !== "all") {
      params.set(key, value);
    }
  });

  // Reset to page 1 when filters change
  params.delete("page");

  return params;
}

export function validateFilterValue(
  key: keyof TransactionFilters,
  value: unknown
): boolean {
  switch (key) {
    case "status":
      return [
        "RECONCILED",
        "NEEDS_CATEGORIZATION",
        "NEEDS_REVIEW",
        "IN_PROGRESS",
      ].includes(value);
    case "type":
      return ["INCOME", "EXPENSE", "TRANSFER"].includes(value);
    case "startDate":
    case "endDate":
      return value instanceof Date && !isNaN(value.getTime());
    case "search":
    case "accountId":
    case "categoryId":
      return typeof value === "string";
    default:
      return true;
  }
}

export function countActiveFilters(filters: TransactionFilters): number {
  return Object.values(filters).filter((value) => {
    if (value === undefined || value === null) return false;
    if (typeof value === "string" && value.trim() === "") return false;
    return true;
  }).length;
}

export function isFilterEmpty(filters: TransactionFilters): boolean {
  return countActiveFilters(filters) === 0;
}

export function getFilterDisplayValue(
  key: keyof TransactionFilters,
  value: unknown,
  options?: { accounts?: Account[]; categories?: Category[] }
): string {
  switch (key) {
    case "status":
      return value?.replace("_", " ").toLowerCase() || "";
    case "type":
      return value?.toLowerCase() || "";
    case "accountId":
      return (
        options?.accounts?.find((a) => a.id === value)?.name || value || ""
      );
    case "categoryId":
      return (
        options?.categories?.find((c) => c.id === value)?.name || value || ""
      );
    case "startDate":
    case "endDate":
      return value instanceof Date ? value.toLocaleDateString() : "";
    case "search":
      return value || "";
    default:
      return String(value || "");
  }
}
