import { SpendingTrendsChart } from "@/components/charts/SpendingTrendsChart";

export function AnalyticsSection() {
  return (
    <div className="lg:col-span-2">
      <div className="border rounded-lg">
        <div className="p-6 pb-0">
          <h3 className="text-lg font-semibold">Spending Trends</h3>
          <p className="text-sm text-muted-foreground">
            Monthly spending vs budget and income analysis
          </p>
        </div>
        <div className="p-6 pt-4">
          <div className="h-80">
            <SpendingTrendsChart />
          </div>
        </div>
      </div>
    </div>
  );
}
