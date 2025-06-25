import { Skeleton } from "@/components/ui/skeleton";

export function MetricsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="border rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2 w-full">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4" />
              </div>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-20" />
              <div className="flex items-center gap-1">
                <Skeleton className="h-3 w-3" />
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function AnalyticsSkeleton() {
  return (
    <div className="lg:col-span-2">
      <div className="border rounded-lg">
        <div className="p-6 pb-0">
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="p-6 pt-4">
          <div className="h-80">
            <Skeleton className="h-full w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function InsightsSkeleton() {
  return (
    <div className="border rounded-lg">
      <div className="p-6 pb-0">
        <Skeleton className="h-6 w-36 mb-2" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="p-6 space-y-4">
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="p-3 border rounded-lg">
              <Skeleton className="h-4 w-64 mb-2" />
              <Skeleton className="h-3 w-80 mb-2" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function TransactionTableSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="border rounded-lg p-6">
            <Skeleton className="h-20 w-full" />
          </div>
        ))}
      </div>

      <div className="border rounded-lg p-6">
        <Skeleton className="h-96 w-full" />
      </div>
    </div>
  );
}

export function TransactionsOnlySkeleton() {
  return (
    <div className="border rounded-lg">
      <div className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-6 w-24" />
          </div>

          {/* Table Header */}
          <div className="border rounded-lg">
            <div className="border-b p-4">
              <div className="grid grid-cols-5 gap-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>

            {/* Table Rows */}
            {[...Array(8)].map((_, i) => (
              <div key={i} className="border-b p-4 last:border-b-0">
                <div className="grid grid-cols-5 gap-4 items-center">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-4 w-12" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div className="border-t p-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
          <div className="flex gap-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-8 w-8" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function HeaderSkeleton() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
}
