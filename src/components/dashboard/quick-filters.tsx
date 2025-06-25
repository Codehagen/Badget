"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  IconAlertTriangle,
  IconCalendarMonth,
  IconClockQuestion,
  IconCircleCheckFilled,
} from "@tabler/icons-react";

interface QuickFilter {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  filters: Record<string, any>;
  variant?: "default" | "secondary" | "outline";
}

interface QuickFiltersProps {
  onApplyFilter: (filters: Record<string, any>) => void;
  activeFiltersCount: number;
}

export function QuickFilters({
  onApplyFilter,
  activeFiltersCount,
}: QuickFiltersProps) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const quickFilters: QuickFilter[] = [
    {
      id: "needs-review",
      label: "Needs Review",
      description: "Unreconciled transactions",
      icon: IconAlertTriangle,
      filters: {
        status: "NEEDS_REVIEW",
      },
      variant: "outline",
    },
    {
      id: "this-month",
      label: "This Month",
      description: "Current month transactions",
      icon: IconCalendarMonth,
      filters: {
        startDate: startOfMonth.toISOString(),
        endDate: endOfMonth.toISOString(),
      },
      variant: "outline",
    },
    {
      id: "uncategorized",
      label: "Uncategorized",
      description: "Missing categories",
      icon: IconClockQuestion,
      filters: {
        uncategorized: true,
      },
      variant: "outline",
    },
    {
      id: "reconciled",
      label: "Reconciled",
      description: "Completed transactions",
      icon: IconCircleCheckFilled,
      filters: {
        status: "RECONCILED",
      },
      variant: "outline",
    },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">
          Quick filters:
        </span>
        {activeFiltersCount > 0 && (
          <Badge variant="secondary" className="text-xs">
            {activeFiltersCount} active
          </Badge>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {quickFilters.map((filter) => {
          const Icon = filter.icon;
          return (
            <Button
              key={filter.id}
              variant={filter.variant as "default" | "secondary" | "outline"}
              size="sm"
              onClick={() => onApplyFilter(filter.filters)}
              className="gap-2 text-xs"
            >
              <Icon className="h-3 w-3" />
              {filter.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
