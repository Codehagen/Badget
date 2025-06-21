import {
  SuspendedHeaderSection,
  SuspendedMetricsSection,
  SuspendedAnalyticsSection,
  SuspendedInsightsSection,
  SuspendedTransactionSection,
} from "@/components/dashboard/async-components";

export default function Page() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <SuspendedHeaderSection />
      <SuspendedMetricsSection />

      {/* Analytics & Newsletter Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SuspendedAnalyticsSection />
        <SuspendedInsightsSection />
      </div>

      <SuspendedTransactionSection />
    </div>
  );
}
