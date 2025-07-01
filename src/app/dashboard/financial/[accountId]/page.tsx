import { notFound } from "next/navigation";
import { getFinancialAccountById } from "@/actions/financial-actions";
import { getAllTransactions, getCategories } from "@/actions/dashboard-actions";
import { AccountDetailHeader } from "@/components/financial/account-detail-header";
import { AccountDetailMetrics } from "@/components/financial/account-detail-metrics";
import { AccountTransactionsList } from "@/components/financial/account-transactions-list";
import { TransactionStatus } from "@/types/filters";
import { Suspense } from "react";

interface AccountDetailPageProps {
  params: {
    accountId: string;
  };
  searchParams: {
    page?: string;
    search?: string;
    status?: string;
  };
}

export default async function AccountDetailPage({
  params,
  searchParams,
}: AccountDetailPageProps) {
  const awaitedParams = await params;
  const awaitedSearchParams = await searchParams;

  const { accountId } = awaitedParams;

  // Get account details
  const account = await getFinancialAccountById(accountId);

  if (!account) {
    notFound();
  }

  // Get transactions for this account
  const page = parseInt(awaitedSearchParams.page || "1");
  const limit = 20;
  const offset = (page - 1) * limit;

  const transactionFilters = {
    accountId,
    search: awaitedSearchParams.search,
    status: awaitedSearchParams.status as TransactionStatus,
    limit,
    offset,
  };

  const [transactionsData, categories] = await Promise.all([
    getAllTransactions(transactionFilters),
    getCategories(),
  ]);

  // Create a key that changes when search params change to trigger re-renders
  const searchKey = JSON.stringify(awaitedSearchParams);

  return (
    <div className="flex flex-col gap-6 p-6">
      <AccountDetailHeader account={account} />
      <Suspense
        fallback={<div className="h-32 animate-pulse bg-muted rounded-lg" />}
      >
        <AccountDetailMetrics account={account} />
      </Suspense>
      <AccountTransactionsList
        key={`transactions-${searchKey}`}
        account={account}
        transactions={transactionsData.transactions}
        totalCount={transactionsData.totalCount}
        totalPages={transactionsData.totalPages}
        currentPage={page}
        searchParams={awaitedSearchParams}
        categories={categories}
      />
    </div>
  );
}
