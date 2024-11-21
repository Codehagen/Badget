import BankAccountOverview from "@/components/transactions/bank-account-overview";
import BankAccountSelector from "@/components/transactions/bank-account-selector";

export default function BankingPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Bank Accounts</h2>
      </div>
      <BankAccountOverview />
      <BankAccountSelector />
    </div>
  );
}
