import { FinancialTabs } from "@/components/financial/financial-tabs";
import {
  SuspendedFinancialOverviewSection,
  SuspendedAccountsHeaderSection,
  SuspendedAccountsFilterSection,
  SuspendedEnhancedAccountsGridSection,
} from "@/components/financial/financial-async-components";

interface FinancialPageProps {
  searchParams: {
    search?: string;
    type?: string;
    institution?: string;
  };
}

export default async function FinancialPage({
  searchParams,
}: FinancialPageProps) {
  const awaitedSearchParams = await searchParams;

  const filters = {
    search: awaitedSearchParams.search,
    type: awaitedSearchParams.type,
    institution: awaitedSearchParams.institution,
  };

  const searchKey = JSON.stringify(awaitedSearchParams);

  return (
    <div className="flex flex-col gap-6 p-6">
      <FinancialTabs
        header={<SuspendedAccountsHeaderSection />}
        accountsContent={
          <>
            <SuspendedAccountsFilterSection filters={filters} />
            <SuspendedEnhancedAccountsGridSection
              key={`grid-${searchKey}`}
              filters={filters}
            />
          </>
        }
        overviewContent={<SuspendedFinancialOverviewSection />}
      />
    </div>
  );
}
