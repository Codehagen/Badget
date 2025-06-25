/**
 * TRANSACTIONS PAGE FOR BADGET FINANCIAL MANAGEMENT
 * =================================================
 *
 * This is the main transactions page that displays all financial transactions
 * with comprehensive filtering, pagination, and management capabilities.
 * Built using a modular, suspended component architecture for optimal performance.
 *
 * ARCHITECTURE OVERVIEW:
 * ---------------------
 * 1. Modular Components: Each section is a separate suspended component
 * 2. Smart Re-rendering: Only the table re-renders when filters change
 * 3. Server-Side Filtering: All filtering happens on the server for performance
 * 4. Pagination Support: Large datasets are handled with efficient pagination
 *
 * COMPONENT STRUCTURE:
 * -------------------
 * ┌─ SuspendedTransactionsHeaderSection (Static)
 * ├─ SuspendedTransactionsStatsSection (Updates with filters)
 * ├─ SuspendedTransactionsFilterSection (Static UI, dynamic data)
 * └─ SuspendedTransactionsTableSection (Re-renders on filter changes)
 *
 * FILTERING SYSTEM:
 * ----------------
 * The page supports comprehensive filtering through URL search parameters:
 *
 * • search: Text search in description/merchant (case-insensitive)
 * • account: Filter by specific financial account ID
 * • category: Filter by transaction category ID
 * • status: Filter by transaction status
 *   - RECONCILED: Fully processed and categorized
 *   - NEEDS_CATEGORIZATION: Requires category assignment
 *   - NEEDS_REVIEW: Requires manual review
 *   - IN_PROGRESS: Currently being processed
 * • type: Filter by transaction type
 *   - INCOME: Money coming in
 *   - EXPENSE: Money going out
 *   - TRANSFER: Movement between accounts
 * • startDate/endDate: Date range filtering (ISO date strings)
 * • page: Current page number for pagination
 * • limit: Number of transactions per page (default: 50)
 *
 * PERFORMANCE OPTIMIZATIONS:
 * --------------------------
 * ✅ Smart Re-rendering: Only table updates when filters change
 * ✅ Server-Side Filtering: Reduces data transfer and client processing
 * ✅ Pagination: Handles large datasets efficiently
 * ✅ Suspended Loading: Each section loads independently
 * ✅ Optimized Queries: Database queries are optimized for dashboard performance
 * ✅ Component Caching: Static sections don't re-render unnecessarily
 *
 * USAGE EXAMPLES:
 * --------------
 * ```
 * // View all transactions
 * /dashboard/transactions
 *
 * // Filter by status
 * /dashboard/transactions?status=NEEDS_CATEGORIZATION
 *
 * // Search and filter
 * /dashboard/transactions?search=grocery&category=abc123&page=2
 *
 * // Date range filtering
 * /dashboard/transactions?startDate=2024-01-01&endDate=2024-01-31
 * ```
 *
 * FILTER INTERACTIONS:
 * -------------------
 * • Quick Status Filters: Click metric cards to filter by status
 * • Advanced Filters: Use the filter bar for complex queries
 * • URL Persistence: All filters are preserved in the URL
 * • Bookmark Support: Filtered views can be bookmarked and shared
 * • Real-time Updates: Filters apply immediately via URL navigation
 *
 * ACCESSIBILITY & UX:
 * ------------------
 * • Loading States: Proper skeleton screens for each section
 * • Error Handling: Graceful fallbacks for failed data loads
 * • Mobile Responsive: Optimized for all screen sizes
 * • Keyboard Navigation: Full keyboard accessibility support
 * • Screen Reader Support: Proper ARIA labels and semantic markup
 */

import {
  SuspendedTransactionsHeaderSection,
  SuspendedTransactionsStatsSection,
  SuspendedTransactionsFilterSection,
  SuspendedTransactionsTableSection,
} from "@/components/transactions/transactions-async-components";

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
    uncategorized?: string;
  };
}

export default async function TransactionsPage({
  searchParams,
}: TransactionsPageProps) {
  const params = await searchParams;

  const page = parseInt(params.page || "1");
  const limit = parseInt(params.limit || "50");

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
    type: params.type as "INCOME" | "EXPENSE" | "TRANSFER" | undefined,
    startDate: params.startDate ? new Date(params.startDate) : undefined,
    endDate: params.endDate ? new Date(params.endDate) : undefined,
    uncategorized: params.uncategorized === "true",
  };

  // Create a key that changes when search params change to trigger re-renders
  const searchKey = JSON.stringify(params);

  return (
    <div className="flex flex-col gap-6 p-6">
      <SuspendedTransactionsHeaderSection />
      {/* <SuspendedTransactionsStatsSection filters={filters} /> */}
      <SuspendedTransactionsFilterSection filters={filters} />
      <SuspendedTransactionsTableSection
        key={`table-${searchKey}`}
        filters={filters}
        page={page}
        limit={limit}
      />
    </div>
  );
}
