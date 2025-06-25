"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar } from "@/components/ui/calendar";
import { Spinner } from "@/components/ui/spinner";
import {
  IconSearch,
  IconFilter,
  IconCalendar,
  IconRefresh,
  IconChevronDown,
} from "@tabler/icons-react";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { FilterChips, createFilterChips } from "../dashboard/filter-chips";
import { QuickFilters } from "../dashboard/quick-filters";
import {
  TransactionFilters,
  FilterValue,
  Account,
  Category,
} from "@/types/filters";

interface TransactionFilterBarProps {
  filters: TransactionFilters;
  accounts: Account[];
  categories: Category[];
  isLoading: boolean;
  totalCount: number;
  onUpdateFilter: (key: string, value: FilterValue) => void;
  onUpdateFilters: (updates: Partial<TransactionFilters>) => void;
  onClearFilters: () => void;
}

export function TransactionFilterBar({
  filters,
  accounts,
  categories,
  isLoading,
  totalCount,
  onUpdateFilter,
  onUpdateFilters,
  onClearFilters,
}: TransactionFilterBarProps) {
  const [isMoreFiltersOpen, setIsMoreFiltersOpen] = useState(false);

  // Handle search - pass directly to parent (debouncing handled in wrapper)
  const handleSearchChange = useCallback(
    (value: string) => {
      onUpdateFilter("search", value || undefined);
    },
    [onUpdateFilter]
  );

  // Handle date range selection
  const handleDateRangeChange = useCallback(
    (range: DateRange | undefined) => {
      onUpdateFilters({
        startDate: range?.from,
        endDate: range?.to,
      });
    },
    [onUpdateFilters]
  );

  // Create filter chips
  const filterChips = createFilterChips(
    filters,
    { accounts, categories },
    (key: string) => onUpdateFilter(key, undefined)
  );

  const dateRange: DateRange | undefined =
    filters.startDate && filters.endDate
      ? {
          from: new Date(filters.startDate),
          to: new Date(filters.endDate),
        }
      : undefined;

  const activeFiltersCount = filterChips.length;

  return (
    <div className="space-y-4 border rounded-lg p-4">
      {/* Main Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search - Primary */}
        <div className="flex-1 min-w-0">
          <div className="relative">
            <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              className="pl-10 bg-background"
              value={filters.search || ""}
              onChange={(e) => handleSearchChange(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Status Filter - Primary */}
        <div className="w-full sm:w-[140px]">
          <Select
            value={filters.status || "all"}
            onValueChange={(value) =>
              onUpdateFilter("status", value === "all" ? undefined : value)
            }
            disabled={isLoading}
          >
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="RECONCILED">Reconciled</SelectItem>
              <SelectItem value="NEEDS_CATEGORIZATION">
                Needs Categorization
              </SelectItem>
              <SelectItem value="NEEDS_REVIEW">Needs Review</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Account Filter - Primary */}
        <div className="w-full sm:w-[140px]">
          <Select
            value={filters.accountId || "all"}
            onValueChange={(value) =>
              onUpdateFilter("accountId", value === "all" ? undefined : value)
            }
            disabled={isLoading}
          >
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Account" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All accounts</SelectItem>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* More Filters Dropdown - Secondary */}
        <DropdownMenu
          open={isMoreFiltersOpen}
          onOpenChange={setIsMoreFiltersOpen}
        >
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2 bg-background">
              <IconFilter className="h-4 w-4" />
              More filters
              <IconChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-80 p-4" align="end">
            <DropdownMenuLabel>Additional Filters</DropdownMenuLabel>
            <DropdownMenuSeparator />

            <div className="space-y-4 mt-3">
              {/* Category Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select
                  value={filters.categoryId || "all"}
                  onValueChange={(value) =>
                    onUpdateFilter(
                      "categoryId",
                      value === "all" ? undefined : value
                    )
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Type Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select
                  value={filters.type || "all"}
                  onValueChange={(value) =>
                    onUpdateFilter("type", value === "all" ? undefined : value)
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="INCOME">Income</SelectItem>
                    <SelectItem value="EXPENSE">Expense</SelectItem>
                    <SelectItem value="TRANSFER">Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Date Range</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                      disabled={isLoading}
                    >
                      <IconCalendar className="mr-2 h-4 w-4" />
                      {dateRange?.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "LLL dd, y")} -{" "}
                            {format(dateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(dateRange.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick a date range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange?.from}
                      selected={dateRange}
                      onSelect={handleDateRangeChange}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Reset Button */}
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            disabled={isLoading}
            className="gap-2"
          >
            <IconRefresh className="h-4 w-4" />
            Reset
          </Button>
        )}
      </div>

      {/* Quick Filters */}
      <QuickFilters
        onApplyFilter={onUpdateFilters}
        activeFiltersCount={activeFiltersCount}
      />

      {/* Active Filter Chips */}
      <FilterChips chips={filterChips} onClearAll={onClearFilters} />

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-3">
        <span>
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Spinner size={16} />
              Filtering...
            </span>
          ) : (
            `${totalCount.toLocaleString()} transaction${totalCount !== 1 ? "s" : ""} found`
          )}
        </span>
        {activeFiltersCount > 0 && (
          <span className="text-xs">
            {activeFiltersCount} filter{activeFiltersCount !== 1 ? "s" : ""}{" "}
            active
          </span>
        )}
      </div>
    </div>
  );
}
