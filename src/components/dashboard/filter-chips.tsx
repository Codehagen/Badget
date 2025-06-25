"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconX } from "@tabler/icons-react";
import { format } from "date-fns";

interface FilterChip {
  key: string;
  label: string;
  value: string;
  onRemove: () => void;
}

interface FilterChipsProps {
  chips: FilterChip[];
  onClearAll: () => void;
}

export function FilterChips({ chips, onClearAll }: FilterChipsProps) {
  if (chips.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap py-2">
      <span className="text-sm font-medium text-muted-foreground">
        Active filters:
      </span>

      {chips.map((chip) => (
        <Badge
          key={chip.key}
          variant="secondary"
          className="gap-1 pr-1 hover:bg-destructive/10 transition-colors"
        >
          <span className="text-xs">
            {chip.label}: {chip.value}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-0.5 hover:bg-destructive hover:text-destructive-foreground"
            onClick={chip.onRemove}
          >
            <IconX className="h-3 w-3" />
          </Button>
        </Badge>
      ))}

      {chips.length > 1 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Clear all
        </Button>
      )}
    </div>
  );
}

export function createFilterChips(
  filters: Record<string, any>,
  displayOptions: {
    accounts?: Array<{ id: string; name: string }>;
    categories?: Array<{ id: string; name: string }>;
  },
  onRemoveFilter: (key: string) => void
): FilterChip[] {
  const chips: FilterChip[] = [];

  // Search filter
  if (filters.search) {
    chips.push({
      key: "search",
      label: "Search",
      value: filters.search,
      onRemove: () => onRemoveFilter("search"),
    });
  }

  // Account filter
  if (filters.accountId) {
    const account = displayOptions.accounts?.find(
      (a) => a.id === filters.accountId
    );
    chips.push({
      key: "account",
      label: "Account",
      value: account?.name || filters.accountId,
      onRemove: () => onRemoveFilter("accountId"),
    });
  }

  // Category filter
  if (filters.categoryId) {
    const category = displayOptions.categories?.find(
      (c) => c.id === filters.categoryId
    );
    chips.push({
      key: "category",
      label: "Category",
      value: category?.name || filters.categoryId,
      onRemove: () => onRemoveFilter("categoryId"),
    });
  }

  // Status filter
  if (filters.status) {
    chips.push({
      key: "status",
      label: "Status",
      value: filters.status.replace("_", " ").toLowerCase(),
      onRemove: () => onRemoveFilter("status"),
    });
  }

  // Type filter
  if (filters.type) {
    chips.push({
      key: "type",
      label: "Type",
      value: filters.type.toLowerCase(),
      onRemove: () => onRemoveFilter("type"),
    });
  }

  // Uncategorized filter
  if (filters.uncategorized) {
    chips.push({
      key: "uncategorized",
      label: "Filter",
      value: "Uncategorized",
      onRemove: () => onRemoveFilter("uncategorized"),
    });
  }

  // Date range filter
  if (filters.startDate && filters.endDate) {
    const startDate = new Date(filters.startDate);
    const endDate = new Date(filters.endDate);
    chips.push({
      key: "dateRange",
      label: "Date Range",
      value: `${format(startDate, "MMM dd")} - ${format(endDate, "MMM dd")}`,
      onRemove: () => {
        onRemoveFilter("startDate");
        onRemoveFilter("endDate");
      },
    });
  } else if (filters.startDate) {
    chips.push({
      key: "startDate",
      label: "From",
      value: format(new Date(filters.startDate), "MMM dd, yyyy"),
      onRemove: () => onRemoveFilter("startDate"),
    });
  } else if (filters.endDate) {
    chips.push({
      key: "endDate",
      label: "Until",
      value: format(new Date(filters.endDate), "MMM dd, yyyy"),
      onRemove: () => onRemoveFilter("endDate"),
    });
  }

  return chips;
}
