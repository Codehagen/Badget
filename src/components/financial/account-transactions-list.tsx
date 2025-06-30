import { Search, Filter } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Transaction {
  id: string;
  date: Date;
  description: string;
  merchant: string;
  amount: number;
  type: string;
  status: string;
  category?: {
    name: string;
    color?: string | null;
  } | null;
}

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
}

interface AccountTransactionsListProps {
  account: Account;
  transactions: Transaction[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  searchParams: {
    search?: string;
    status?: string;
  };
}

function formatCurrency(amount: number, currency: string = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function AccountTransactionsList({
  account,
  transactions,
  totalCount,
  totalPages,
  currentPage,
  searchParams,
}: AccountTransactionsListProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Transactions</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                className="pl-8 w-64"
                defaultValue={searchParams.search || ""}
              />
            </div>
            <Select defaultValue={searchParams.status || "all"}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="RECONCILED">Reconciled</SelectItem>
                <SelectItem value="NEEDS_CATEGORIZATION">Needs Category</SelectItem>
                <SelectItem value="NEEDS_REVIEW">Needs Review</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No transactions found</p>
            </div>
          ) : (
            <>
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="space-y-1">
                      <p className="font-medium">{transaction.description}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{transaction.merchant}</span>
                        <span>•</span>
                        <span>{formatDate(transaction.date)}</span>
                        {transaction.category && (
                          <>
                            <span>•</span>
                            <Badge
                              variant="secondary"
                              className="text-xs"
                              style={{
                                backgroundColor: transaction.category.color || undefined,
                              }}
                            >
                              {transaction.category.name}
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge
                      variant={transaction.status === "RECONCILED" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {transaction.status.replace(/_/g, " ")}
                    </Badge>
                    <div className="text-right">
                      <p
                        className={`font-semibold ${
                          transaction.type === "INCOME"
                            ? "text-green-600"
                            : transaction.type === "EXPENSE"
                            ? "text-red-600"
                            : "text-muted-foreground"
                        }`}
                      >
                        {transaction.type === "INCOME" ? "+" : transaction.type === "EXPENSE" ? "-" : ""}
                        {formatCurrency(Math.abs(transaction.amount), account.currency)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * 20 + 1} to{" "}
                    {Math.min(currentPage * 20, totalCount)} of {totalCount} transactions
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage <= 1}
                      asChild
                    >
                      <Link
                        href={`/dashboard/financial/${account.id}?page=${currentPage - 1}`}
                      >
                        Previous
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage >= totalPages}
                      asChild
                    >
                      <Link
                        href={`/dashboard/financial/${account.id}?page=${currentPage + 1}`}
                      >
                        Next
                      </Link>
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}