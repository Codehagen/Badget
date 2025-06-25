"use client";

import { Button } from "@/components/ui/button";
import {
  IconSearch,
  IconFilter,
  IconRefresh,
  IconClockQuestion,
  IconCircleCheckFilled,
  IconDatabase,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";

interface TransactionEmptyStateProps {
  hasActiveFilters: boolean;
  filterType?: "uncategorized" | "search" | "status" | "general";
  searchQuery?: string;
}

export function TransactionEmptyState({
  hasActiveFilters,
  filterType = "general",
  searchQuery,
}: TransactionEmptyStateProps) {
  const router = useRouter();

  const handleClearFilters = () => {
    router.push("/dashboard/transactions");
  };
  const getEmptyStateContent = () => {
    if (!hasActiveFilters) {
      // No transactions at all
      return {
        icon: <IconDatabase className="h-12 w-12 text-muted-foreground" />,
        title: "No transactions yet",
        description: "You haven't added any transactions to your account yet.",
        action: null,
      };
    }

    // Has filters applied but no results
    switch (filterType) {
      case "uncategorized":
        return {
          icon: (
            <IconCircleCheckFilled className="h-12 w-12 text-emerald-500" />
          ),
          title: "All transactions categorized! 🎉",
          description:
            "Great job! All your transactions have been assigned to categories.",
          action: (
            <Button onClick={handleClearFilters} variant="outline">
              <IconFilter className="h-4 w-4 mr-2" />
              View all transactions
            </Button>
          ),
        };

      case "search":
        return {
          icon: <IconSearch className="h-12 w-12 text-muted-foreground" />,
          title: `No transactions found for "${searchQuery}"`,
          description:
            "Try adjusting your search terms or check your spelling.",
          action: (
            <Button onClick={handleClearFilters} variant="outline">
              <IconRefresh className="h-4 w-4 mr-2" />
              Clear search
            </Button>
          ),
        };

      case "status":
        return {
          icon: (
            <IconClockQuestion className="h-12 w-12 text-muted-foreground" />
          ),
          title: "No transactions match this status",
          description:
            "Try selecting a different status or clear the filter to see all transactions.",
          action: (
            <Button onClick={handleClearFilters} variant="outline">
              <IconFilter className="h-4 w-4 mr-2" />
              Clear filters
            </Button>
          ),
        };

      default:
        return {
          icon: <IconFilter className="h-12 w-12 text-muted-foreground" />,
          title: "No transactions match your filters",
          description: "Try adjusting your filters to see more results.",
          action: (
            <Button onClick={handleClearFilters} variant="outline">
              <IconRefresh className="h-4 w-4 mr-2" />
              Clear all filters
            </Button>
          ),
        };
    }
  };

  const { icon, title, description, action } = getEmptyStateContent();

  return (
    <div className="border rounded-lg">
      <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className="mb-4">{icon}</div>

        <h3 className="text-lg font-semibold mb-2">{title}</h3>

        <p className="text-sm text-muted-foreground mb-6 max-w-md">
          {description}
        </p>

        {action && <div className="mt-2">{action}</div>}
      </div>

      {/* Optional suggestions for no-filters empty state */}
      {!hasActiveFilters && (
        <div className="border-t px-6 py-4 bg-muted/20">
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <IconDatabase className="h-4 w-4" />
              <span>Import from your bank</span>
            </div>
            <div className="flex items-center gap-2">
              <IconRefresh className="h-4 w-4" />
              <span>Try sample data</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
