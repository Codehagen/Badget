"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  IconEdit,
  IconCheck,
  IconTrendingUp,
  IconTrendingDown,
  IconArrowsExchange,
} from "@tabler/icons-react";
import { InteractiveTransactionBadge } from "./interactive-transaction-badge";

interface Category {
  id: string;
  name: string;
  icon?: string | null;
  color?: string | null;
}

interface Transaction {
  id: string;
  date: Date;
  description: string;
  merchant: string;
  amount: number;
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  status:
    | "RECONCILED"
    | "NEEDS_CATEGORIZATION"
    | "NEEDS_REVIEW"
    | "IN_PROGRESS";
  account: {
    name: string;
    type: string;
  };
  category: Category | null;
}

interface EnhancedTransactionTableProps {
  transactions: Transaction[];
  categories: Category[];
}

export function EnhancedTransactionTable({
  transactions,
  categories,
}: EnhancedTransactionTableProps) {
  const [localTransactions, setLocalTransactions] = useState(transactions);

  const handleTransactionUpdate = (
    transactionId: string,
    category: Category
  ) => {
    setLocalTransactions((prev) =>
      prev.map((tx) =>
        tx.id === transactionId
          ? { ...tx, category, status: "RECONCILED" as const }
          : tx
      )
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "INCOME":
        return <IconTrendingUp className="h-4 w-4 text-emerald-600" />;
      case "EXPENSE":
        return <IconTrendingDown className="h-4 w-4 text-red-600" />;
      case "TRANSFER":
        return <IconArrowsExchange className="h-4 w-4 text-blue-600" />;
      default:
        return null;
    }
  };

  const formatAmount = (amount: number) => {
    const isNegative = amount < 0;
    const formattedAmount = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(Math.abs(amount));

    return (
      <span className={isNegative ? "text-red-600" : "text-emerald-600"}>
        {isNegative ? "-" : "+"}${formattedAmount.slice(1)}
      </span>
    );
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Transaction</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Account</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {localTransactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell className="font-mono text-sm">
                {formatDate(transaction.date)}
              </TableCell>
              <TableCell>
                <div className="flex items-start gap-3">
                  {getTypeIcon(transaction.type)}
                  <div>
                    <div className="font-medium">{transaction.description}</div>
                    <div className="text-sm text-muted-foreground">
                      {transaction.merchant}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {transaction.category ? (
                  <Badge variant="outline" className="flex items-center gap-1">
                    {transaction.category.icon && (
                      <span>{transaction.category.icon}</span>
                    )}
                    {transaction.category.name}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground text-sm">
                    Uncategorized
                  </span>
                )}
              </TableCell>
              <TableCell className="text-sm">
                {transaction.account.name}
              </TableCell>
              <TableCell className="font-mono">
                {formatAmount(transaction.amount)}
              </TableCell>
              <TableCell>
                <InteractiveTransactionBadge
                  transactionId={transaction.id}
                  status={transaction.status}
                  category={transaction.category}
                  categories={categories}
                  onUpdate={handleTransactionUpdate}
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <IconEdit className="h-4 w-4" />
                  </Button>
                  {transaction.status !== "RECONCILED" && (
                    <Button variant="ghost" size="sm">
                      <IconCheck className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
