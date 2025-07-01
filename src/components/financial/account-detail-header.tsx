import { ArrowLeft, Settings, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  institution?: string | null;
  color?: string | null;
  description?: string | null;
  accountNumber?: string | null;
}

interface AccountDetailHeaderProps {
  account: Account;
}

function formatCurrency(amount: number, currency: string = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

export function AccountDetailHeader({ account }: AccountDetailHeaderProps) {
  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/financial" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Accounts
          </Link>
        </Button>
      </div>

      {/* Account Header Card */}
      <div className="border rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {account.color && (
                <span
                  className="inline-block h-3 w-3 rounded-full"
                  style={{ backgroundColor: account.color }}
                />
              )}
              <h1 className="text-3xl font-bold">{account.name}</h1>
            </div>

            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="text-sm">
                {account.type.replace(/_/g, " ")}
              </Badge>
              {account.institution && (
                <span className="text-muted-foreground">
                  {account.institution}
                </span>
              )}
              {account.accountNumber && (
                <span className="text-sm text-muted-foreground">
                  •••• {account.accountNumber.slice(-4)}
                </span>
              )}
            </div>

            {account.description && (
              <p className="text-muted-foreground max-w-2xl">
                {account.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Current Balance</p>
              <p className="text-3xl font-bold">
                {formatCurrency(account.balance, account.currency)}
              </p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Account
                </DropdownMenuItem>
                <DropdownMenuItem>Export Transactions</DropdownMenuItem>
                <DropdownMenuItem className="text-red-600">
                  Deactivate Account
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}
