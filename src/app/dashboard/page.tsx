import { HeaderSection } from "@/components/dashboard/header-section";
import { MetricsSection } from "@/components/dashboard/metrics-section";
import { AnalyticsSection } from "@/components/dashboard/analytics-section";
import { InsightsSection } from "@/components/dashboard/insights-section";
import { TransactionManagementSection } from "@/components/dashboard/data-table-section";

export default function Page() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <HeaderSection />
      <MetricsSection />

      {/* Analytics & Newsletter Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AnalyticsSection />
        <InsightsSection />
      </div>

      <TransactionManagementSection />
    </div>
  );
}
