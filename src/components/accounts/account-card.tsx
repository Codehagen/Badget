import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  institution?: string | null;
  color?: string | null;
}

interface AccountCardProps {
  account: Account;
}

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

function getAccountTypeLabel(type: string) {
  return type.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
}

export function AccountCard({ account }: AccountCardProps) {
  return (
    <Link href={`/dashboard/financial/${account.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer group">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h3 className="font-semibold flex items-center gap-2">
                  {account.color && (
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ backgroundColor: account.color }}
                    />
                  )}
                  {account.name}
                </h3>
                <Badge variant="secondary" className="text-xs">
                  {getAccountTypeLabel(account.type)}
                </Badge>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </div>

            {/* Institution */}
            {account.institution && (
              <p className="text-sm text-muted-foreground">
                {account.institution}
              </p>
            )}

            {/* Balance */}
            <div>
              <p className="text-2xl font-bold">
                {formatCurrency(account.balance, account.currency)}
              </p>
              <p className="text-xs text-muted-foreground">Current Balance</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}