import { getFinancialAccounts } from "@/actions/dashboard-actions";
import { AccountCard } from "@/components/accounts/account-card";

export default async function AccountsPage() {
  const accounts = await getFinancialAccounts();

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Accounts</h1>
          <p className="text-muted-foreground">
            Manage your financial accounts
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((account) => (
          <AccountCard
            key={account.id}
            account={{
              ...account,
              balance: Number(account.balance),
            }}
          />
        ))}
        
        {accounts.length === 0 && (
          <div className="col-span-full">
            <div className="text-center py-12">
              <p className="text-muted-foreground">No accounts found</p>
              <p className="text-sm text-muted-foreground mt-2">
                Add your first account to get started
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}