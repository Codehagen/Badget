"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition, useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { IconSearch, IconRefresh } from "@tabler/icons-react";

interface AccountsFilterSectionProps {
  types: string[];
  institutions: string[];
  currentFilters: { search?: string; type?: string; institution?: string };
  totalCount: number;
}

export function AccountsFilterSection({
  types,
  institutions,
  currentFilters,
  totalCount,
}: AccountsFilterSectionProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [localSearch, setLocalSearch] = useState(currentFilters.search || "");
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  const handleSearchChange = useCallback(
    (value: string) => {
      setLocalSearch(value);
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = setTimeout(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (value && value.trim() !== "") {
          params.set("search", value);
        } else {
          params.delete("search");
        }
        startTransition(() => {
          router.push(`?${params.toString()}`);
        });
      }, 300);
    },
    [router, searchParams, startTransition]
  );

  const updateFilter = useCallback(
    (key: string, value: string | undefined) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "all") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      startTransition(() => {
        router.push(`?${params.toString()}`);
      });
    },
    [router, searchParams, startTransition]
  );

  const clearFilters = useCallback(() => {
    setLocalSearch("");
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    startTransition(() => {
      router.push(window.location.pathname);
    });
  }, [router, startTransition]);

  useEffect(() => {
    setLocalSearch(currentFilters.search || "");
  }, [currentFilters.search]);

  const activeFiltersCount = [
    localSearch || undefined,
    currentFilters.type,
    currentFilters.institution,
  ].filter(Boolean).length;

  return (
    <div className="space-y-4 border rounded-lg p-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 min-w-0">
          <div className="relative">
            <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search accounts..."
              className="pl-10 bg-background"
              value={localSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              disabled={isPending}
            />
          </div>
        </div>

        <div className="w-full sm:w-[140px]">
          <Select
            value={currentFilters.type || "all"}
            onValueChange={(val) => updateFilter("type", val === "all" ? undefined : val)}
            disabled={isPending}
          >
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {types.map((t) => (
                <SelectItem key={t} value={t}>
                  {t.replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-[140px]">
          <Select
            value={currentFilters.institution || "all"}
            onValueChange={(val) =>
              updateFilter("institution", val === "all" ? undefined : val)
            }
            disabled={isPending}
          >
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Institution" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All institutions</SelectItem>
              {institutions.map((inst) => (
                <SelectItem key={inst} value={inst}>
                  {inst}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            disabled={isPending}
            className="gap-2"
          >
            <IconRefresh className="h-4 w-4" />
            Reset
          </Button>
        )}
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-3">
        <span>
          {isPending ? "Filtering..." : `${totalCount} account${totalCount !== 1 ? "s" : ""} found`}
        </span>
        {activeFiltersCount > 0 && (
          <span className="text-xs">
            {activeFiltersCount} filter{activeFiltersCount !== 1 ? "s" : ""} active
          </span>
        )}
      </div>
    </div>
  );
}
