"use client";

import { useCallback, useTransition, useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AccountTransactionsFilterProps {
  accountId: string;
  currentSearch?: string;
  currentStatus?: string;
}

export function AccountTransactionsFilter({
  accountId,
  currentSearch,
  currentStatus,
}: AccountTransactionsFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Local state for immediate UI feedback
  const [localSearch, setLocalSearch] = useState(currentSearch || "");
  const searchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Handle search with debouncing
  const handleSearchChange = useCallback(
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

  // Handle status filter change
  const handleStatusChange = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (value && value !== "all") {
        params.set("status", value);
      } else {
        params.delete("status");
      }

      // Reset to page 1 when filter changes
      params.delete("page");

      startTransition(() => {
        router.push(`?${params.toString()}`);
      });
    },
    [router, searchParams, startTransition]
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Sync local search with current search when it changes from outside
  useEffect(() => {
    setLocalSearch(currentSearch || "");
  }, [currentSearch]);

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search transactions..."
          className="pl-10 bg-background"
          value={localSearch}
          onChange={(e) => handleSearchChange(e.target.value)}
          disabled={isPending}
        />
      </div>
      <Select
        value={currentStatus || "all"}
        onValueChange={handleStatusChange}
        disabled={isPending}
      >
        <SelectTrigger className="w-40 bg-background">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="RECONCILED">Reconciled</SelectItem>
          <SelectItem value="NEEDS_CATEGORIZATION">Needs Category</SelectItem>
          <SelectItem value="NEEDS_REVIEW">Needs Review</SelectItem>
          <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
