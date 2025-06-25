import {
  IconCircleCheckFilled,
  IconAlertTriangle,
  IconCurrencyDollar,
  IconCalendarMonth,
} from "@tabler/icons-react";

interface TransactionsStatsProps {
  totalCount: number;
  totalPages: number;
  pageSize: number;
  activeFiltersCount: number;
}

export function TransactionsStatsSection({
  totalCount,
  totalPages,
  pageSize,
  activeFiltersCount,
}: TransactionsStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="border rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <IconCurrencyDollar className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Total</p>
            <p className="text-2xl font-bold">{totalCount}</p>
            <div className="flex items-center gap-1 text-xs">
              <span className="text-muted-foreground">
                found with current filters
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="border rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <IconCircleCheckFilled className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Showing</p>
            <p className="text-2xl font-bold text-emerald-600">
              {Math.min(totalCount, pageSize)}
            </p>
            <div className="flex items-center gap-1 text-xs">
              <span className="text-muted-foreground">per page</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <IconAlertTriangle className="h-4 w-4 text-orange-600" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Pages</p>
            <p className="text-2xl font-bold text-orange-600">{totalPages}</p>
            <div className="flex items-center gap-1 text-xs">
              <span className="text-muted-foreground">available</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <IconCalendarMonth className="h-4 w-4 text-blue-600" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Filters</p>
            <p className="text-2xl font-bold text-blue-600">
              {activeFiltersCount}
            </p>
            <div className="flex items-center gap-1 text-xs">
              <span className="text-muted-foreground">active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
