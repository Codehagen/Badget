"use client";

import { useCallback, useMemo, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  TransactionFilters,
  UseTransactionFiltersReturn,
  QuickFilter,
  FilterValue,
} from "@/types/filters";
import {
  deserializeFilters,
  buildUrlParams,
  countActiveFilters,
  validateFilterValue,
} from "@/lib/filter-utils";
import { useDebounce } from "@/hooks/useDebounce";

export function useTransactionFilters(): UseTransactionFiltersReturn {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Parse current filters from URL
  const filters = useMemo(
    () => deserializeFilters(searchParams),
    [searchParams]
  );

  // Debounce search to prevent excessive API calls
  const debouncedSearch = useDebounce(filters.search, 300);

  // Create debounced filters for API calls
  const debouncedFilters = useMemo(
    () => ({
      ...filters,
      search: debouncedSearch,
    }),
    [filters, debouncedSearch]
  );

  const activeFiltersCount = useMemo(
    () => countActiveFilters(debouncedFilters),
    [debouncedFilters]
  );

  const updateUrlWithFilters = useCallback(
    (newFilters: TransactionFilters) => {
      const params = buildUrlParams(newFilters, searchParams);

      startTransition(() => {
        router.push(`?${params.toString()}`);
      });
    },
    [router, searchParams, startTransition]
  );

  const updateFilter = useCallback(
    (key: keyof TransactionFilters, value: FilterValue) => {
      // Validate the filter value
      if (
        value !== undefined &&
        value !== null &&
        !validateFilterValue(key, value)
      ) {
        console.warn(`Invalid filter value for ${key}:`, value);
        return;
      }

      const newFilters = {
        ...filters,
        [key]: value || undefined,
      };

      updateUrlWithFilters(newFilters);
    },
    [filters, updateUrlWithFilters]
  );

  const updateFilters = useCallback(
    (updates: Partial<TransactionFilters>) => {
      // Validate all updates
      const validUpdates = Object.entries(updates).reduce(
        (acc, [key, value]) => {
          if (
            value === undefined ||
            value === null ||
            validateFilterValue(key as keyof TransactionFilters, value)
          ) {
            acc[key as keyof TransactionFilters] = value;
          } else {
            console.warn(`Invalid filter value for ${key}:`, value);
          }
          return acc;
        },
        {} as Partial<TransactionFilters>
      );

      const newFilters = {
        ...filters,
        ...validUpdates,
      };

      updateUrlWithFilters(newFilters);
    },
    [filters, updateUrlWithFilters]
  );

  const clearFilters = useCallback(() => {
    startTransition(() => {
      router.push(window.location.pathname);
    });
  }, [router, startTransition]);

  const applyQuickFilter = useCallback(
    (quickFilter: QuickFilter) => {
      updateFilters(quickFilter.filters);
    },
    [updateFilters]
  );

  const getFilterValue = useCallback(
    (key: keyof TransactionFilters) => {
      return filters[key];
    },
    [filters]
  );

  const isFilterActive = useCallback(
    (key: keyof TransactionFilters) => {
      const value = filters[key];
      return value !== undefined && value !== null && value !== "";
    },
    [filters]
  );

  const serializeFilters = useCallback(() => {
    return buildUrlParams(filters).toString();
  }, [filters]);

  return {
    // State
    filters: debouncedFilters,
    isLoading: isPending,
    activeFiltersCount,

    // Actions
    updateFilter,
    updateFilters,
    clearFilters,
    applyQuickFilter,

    // Utilities
    getFilterValue,
    isFilterActive,
    serializeFilters,
  };
}
