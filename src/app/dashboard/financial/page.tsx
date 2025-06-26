import {
  SuspendedAccountsHeaderSection,
  SuspendedAccountsFilterSection,
  SuspendedAccountsGridSection,
} from "@/components/accounts/accounts-async-components";

interface FinancialPageProps {
  searchParams: {
    search?: string;
    type?: string;
    institution?: string;
  };
}

export default async function FinancialPage({ searchParams }: FinancialPageProps) {
  const filters = {
    search: searchParams.search,
    type: searchParams.type,
    institution: searchParams.institution,
  };

  const searchKey = JSON.stringify(searchParams);

  return (
    <div className="flex flex-col gap-6 p-6">
      <SuspendedAccountsHeaderSection />
      <SuspendedAccountsFilterSection filters={filters} />
      <SuspendedAccountsGridSection key={`grid-${searchKey}`} filters={filters} />
    </div>
  );
}
