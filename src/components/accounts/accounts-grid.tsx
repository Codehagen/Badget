interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  institution?: string | null;
  color?: string | null;
}

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

export function AccountsGrid({ accounts }: { accounts: Account[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {accounts.map((account) => (
        <div
          key={account.id}
          className="border rounded-lg p-6 flex flex-col gap-2"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              {account.color && (
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: account.color }}
                />
              )}
              {account.name}
            </h3>
            <span className="text-xs text-muted-foreground">
              {account.type.replace(/_/g, " ")}
            </span>
          </div>
          {account.institution && (
            <p className="text-sm text-muted-foreground">
              {account.institution}
            </p>
          )}
          <p className="text-xl font-bold">
            {formatCurrency(account.balance, account.currency)}
          </p>
        </div>
      ))}
    </div>
  );
}
