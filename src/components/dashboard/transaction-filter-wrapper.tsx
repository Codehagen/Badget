"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition, useState, useEffect, useRef } from "react";
import { TransactionFilterBar } from "./transaction-filter-bar";

interface Account {
  id: string;
  name: string;
  type: string;
}

interface Category {
  id: string;
  name: string;
  icon?: string;
  color?: string;
}

interface TransactionFilterWrapperProps {
  accounts: Account[];
  categories: Category[];
  totalCount: number;
  currentFilters: Record<string, any>;
}

export function TransactionFilterWrapper({
  accounts,
  categories,
  totalCount,
  currentFilters,
}: TransactionFilterWrapperProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Local state for immediate UI feedback
  const [localSearch, setLocalSearch] = useState(currentFilters.search || "");
  const searchTimeoutRef = useRef<NodeJS.Timeout | undefined>();

  // Handle search with debouncing
  const updateSearchFilter = useCallback(
    (value: string) => {
      setLocalSearch(value);

      // Clear existing timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      // Set new timeout for debounced search
      searchTimeoutRef.current = setTimeout(() => {
        const params = new URLSearchParams(searchParams.toString());

        if (value && value.trim() !== "") {
          params.set("search", value);
        } else {
          params.delete("search");
        }

        // Reset to page 1 when search changes
        params.delete("page");

        startTransition(() => {
          router.push(`?${params.toString()}`);
        });
      }, 300);
    },
    [router, searchParams, startTransition]
  );

  const updateFilter = useCallback(
    (key: string, value: any) => {
      // Handle search separately with debouncing
      if (key === "search") {
        updateSearchFilter(value || "");
        return;
      }

      const params = new URLSearchParams(searchParams.toString());

      // Map internal key names to URL parameter names
      const getParamKey = (key: string) => {
        switch (key) {
          case "accountId":
            return "account";
          case "categoryId":
            return "category";
          default:
            return key;
        }
      };

      const paramKey = getParamKey(key);

      if (value && value !== "all" && value !== "") {
        params.set(paramKey, value);
      } else {
        params.delete(paramKey);
      }

      // Reset to page 1 when filters change
      params.delete("page");

      startTransition(() => {
        router.push(`?${params.toString()}`);
      });
    },
    [router, searchParams, startTransition, updateSearchFilter]
  );

  const updateFilters = useCallback(
    (updates: Record<string, any>) => {
      const params = new URLSearchParams(searchParams.toString());

      // Map internal key names to URL parameter names
      const getParamKey = (key: string) => {
        switch (key) {
          case "accountId":
            return "account";
          case "categoryId":
            return "category";
          default:
            return key;
        }
      };

      Object.entries(updates).forEach(([key, value]) => {
        const paramKey = getParamKey(key);

        if (value && value !== "all" && value !== "") {
          params.set(paramKey, value);
        } else {
          params.delete(paramKey);
        }
      });

      // Reset to page 1 when filters change
      params.delete("page");

      startTransition(() => {
        router.push(`?${params.toString()}`);
      });
    },
    [router, searchParams, startTransition]
  );

  const clearFilters = useCallback(() => {
    // Clear local search state
    setLocalSearch("");

    // Clear search timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    startTransition(() => {
      router.push(window.location.pathname);
    });
  }, [router, startTransition]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Sync local search with current filters when they change from outside
  useEffect(() => {
    setLocalSearch(currentFilters.search || "");
  }, [currentFilters.search]);

  return (
    <TransactionFilterBar
      filters={{
        ...currentFilters,
        search: localSearch, // Use local search state for immediate UI feedback
      }}
      accounts={accounts}
      categories={categories}
      isLoading={isPending}
      totalCount={totalCount}
      onUpdateFilter={updateFilter}
      onUpdateFilters={updateFilters}
      onClearFilters={clearFilters}
    />
  );
}
