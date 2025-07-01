import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Activity,
  Link as LinkIcon,
} from "lucide-react";
import Link from "next/link";
import { AccountMiniChart } from "./charts/account-mini-chart";
import type { EnhancedAccount } from "@/actions/financial-actions";

interface EnhancedAccountsGridProps {
  accounts: EnhancedAccount[];
}

function formatCurrency(amount: number, currency: string = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

function formatPercentage(value: number) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}

export function EnhancedAccountsGrid({ accounts }: EnhancedAccountsGridProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "attention":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      case "inactive":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <Activity className="h-3 w-3" />;
      case "attention":
        return <AlertTriangle className="h-3 w-3" />;
      case "inactive":
        return <TrendingDown className="h-3 w-3" />;
      default:
        return <Activity className="h-3 w-3" />;
    }
  };

  const getTrendIcon = (change: number) => {
    if (change > 0) {
      return <TrendingUp className="h-3 w-3 text-green-600" />;
    } else if (change < 0) {
      return <TrendingDown className="h-3 w-3 text-red-600" />;
    }
    return null;
  };

  const getTrendColor = (change: number) => {
    if (change > 0) return "text-green-600";
    if (change < 0) return "text-red-600";
    return "text-muted-foreground";
  };

  // Simulate connected status - in real implementation, this would come from the account data
  const isPlaidConnected = (account: EnhancedAccount) => {
    // This would check if the account has a related plaidAccount record
    // For now, we'll show as connected if it's from a major institution
    const connectedInstitutions = ["chase", "bank of america", "wells fargo", "citi"];
    return account.institution && 
           connectedInstitutions.some(bank => 
             account.institution?.toLowerCase().includes(bank)
           );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {accounts.map((account) => (
        <Link
          key={account.id}
          href={`/dashboard/financial/${account.id}`}
          className="group block"
        >
          <div className="border rounded-lg p-6 transition-[color,box-shadow] hover:shadow-md cursor-pointer space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h3 className="text-base font-semibold flex items-center gap-2">
                  {account.color && (
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ backgroundColor: account.color }}
                    />
                  )}
                  {account.name}
                  {isPlaidConnected(account) && (
                    <span title="Connected via Plaid">
                      <LinkIcon className="h-3 w-3 text-blue-600" />
                    </span>
                  )}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {account.type.replace(/_/g, " ")}
                  </span>
                  <Badge
                    variant="secondary"
                    className={`text-xs ${getStatusColor(account.status)}`}
                  >
                    {getStatusIcon(account.status)}
                    <span className="ml-1 capitalize">{account.status}</span>
                  </Badge>
                  {isPlaidConnected(account) && (
                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                      Auto-sync
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            {account.institution && (
              <p className="text-xs text-muted-foreground">
                {account.institution}
              </p>
            )}

            {/* Balance */}
            <div className="space-y-1">
              <p className="text-2xl font-bold">
                {formatCurrency(account.balance, account.currency)}
              </p>
              <div className="flex items-center gap-2">
                {getTrendIcon(account.monthlyChange)}
                <span
                  className={`text-sm ${getTrendColor(account.monthlyChange)}`}
                >
                  {formatCurrency(Math.abs(account.monthlyChange))} (
                  {formatPercentage(account.monthlyChangePercentage)})
                </span>
                <span className="text-xs text-muted-foreground">
                  this month
                </span>
              </div>
            </div>

            {/* Mini Chart */}
            <div>
              <AccountMiniChart
                data={account.trend}
                color={account.color || "#0066CC"}
                currency={account.currency}
              />
            </div>

            {/* Transaction Activity */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{account.recentTransactionCount} transactions</span>
              <span>last 6 months</span>
            </div>
          </div>
        </Link>
      ))}

      {accounts.length === 0 && (
        <div className="col-span-full">
          <div className="border rounded-lg p-6">
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">No accounts found</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
