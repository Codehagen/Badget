"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  IconTrendingUp,
  IconTrendingDown,
  IconArrowsExchange,
  IconCircleCheckFilled,
  IconLoader,
  IconAlertTriangle,
  IconClockQuestion,
} from "@tabler/icons-react";
import { updateTransactionCategory } from "@/actions/dashboard-actions";
import { toast } from "sonner";
import { AccountTransactionsFilter } from "./account-transactions-filter";

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
  category: Category | null;
}

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
}

interface Category {
  id: string;
  name: string;
  icon?: string | null;
  color?: string | null;
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
  categories: Category[];
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

// Status Badge Component - matching the enhanced transaction table
function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "RECONCILED":
      return (
        <Badge variant="outline" className="text-muted-foreground px-1.5">
          <IconCircleCheckFilled className="h-3 w-3 fill-green-500 dark:fill-green-400 mr-1" />
          Reconciled
        </Badge>
      );
    case "NEEDS_CATEGORIZATION":
      return (
        <Badge variant="outline" className="text-muted-foreground px-1.5">
          <IconClockQuestion className="h-3 w-3 text-orange-500 mr-1" />
          Needs Category
        </Badge>
      );
    case "NEEDS_REVIEW":
      return (
        <Badge variant="outline" className="text-muted-foreground px-1.5">
          <IconAlertTriangle className="h-3 w-3 text-red-500 mr-1" />
          Needs Review
        </Badge>
      );
    case "IN_PROGRESS":
      return (
        <Badge variant="outline" className="text-muted-foreground px-1.5">
          <IconLoader className="h-3 w-3 mr-1" />
          In Progress
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="text-muted-foreground px-1.5">
          {status.replace(/_/g, " ")}
        </Badge>
      );
  }
}

// Type Icon Component - matching the enhanced transaction table
function TypeIcon({ type }: { type: string }) {
  switch (type) {
    case "INCOME":
      return <IconTrendingUp className="h-4 w-4 text-green-600" />;
    case "EXPENSE":
      return <IconTrendingDown className="h-4 w-4 text-red-600" />;
    case "TRANSFER":
      return <IconArrowsExchange className="h-4 w-4 text-blue-600" />;
    default:
      return <IconArrowsExchange className="h-4 w-4 text-muted-foreground" />;
  }
}

// Category Cell Component - shows category or category selector
function CategoryCell({
  transaction,
  categories,
  onUpdate,
}: {
  transaction: Transaction;
  categories: Category[];
  onUpdate: (transactionId: string, category: Category) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);

  const handleCategorySelect = (categoryId: string) => {
    startTransition(async () => {
      try {
        const result = await updateTransactionCategory(
          transaction.id,
          categoryId
        );

        if (result.success && result.transaction.category) {
          const updatedCategory = {
            id: categoryId,
            name: result.transaction.category.name,
            icon: result.transaction.category.icon,
            color: result.transaction.category.color,
          };
          onUpdate(transaction.id, updatedCategory);
          setIsEditing(false); // Close the editor
          toast.success("Category updated successfully");
        } else {
          toast.error("Failed to update category");
        }
      } catch {
        toast.error("Failed to update category");
      }
    });
  };

  // Show category selector if no category exists OR if editing existing category
  if (!transaction.category || isEditing) {
    const placeholder = isPending
      ? "Updating..."
      : !transaction.category
        ? "Select category..."
        : "Change category...";

    return (
      <Select
        onValueChange={handleCategorySelect}
        disabled={isPending}
        value={transaction.category?.id || ""}
        onOpenChange={(open) => {
          if (!open && transaction.category) {
            setIsEditing(false); // Close editing when dropdown closes
          }
        }}
      >
        <SelectTrigger className="w-[180px] h-6 text-xs">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {categories.map((cat) => (
            <SelectItem key={cat.id} value={cat.id}>
              <div className="flex items-center gap-2">
                {cat.icon && <span>{cat.icon}</span>}
                <span>{cat.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  // Show clickable category badge if category exists
  return (
    <Badge
      variant="outline"
      className="flex items-center gap-1 cursor-pointer hover:bg-muted/50 transition-colors w-fit"
      onClick={() => setIsEditing(true)}
      title="Click to change category"
    >
      {transaction.category.icon && <span>{transaction.category.icon}</span>}
      {transaction.category.name}
    </Badge>
  );
}

export function AccountTransactionsList({
  account,
  transactions,
  totalCount,
  totalPages,
  currentPage,
  searchParams,
  categories,
}: AccountTransactionsListProps) {
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
  return (
    <div className="border rounded-lg">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Transactions</h3>
            <p className="text-sm text-muted-foreground">
              View and manage transactions for {account.name}
            </p>
          </div>
          <AccountTransactionsFilter
            accountId={account.id}
            currentSearch={searchParams.search}
            currentStatus={searchParams.status}
          />
        </div>
      </div>

      {/* Table Content */}
      <div className="p-6">
        {localTransactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No transactions found</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Merchant</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {localTransactions.map((transaction) => (
                <TableRow key={transaction.id} className="hover:bg-muted/50">
                  <TableCell>
                    <TypeIcon type={transaction.type} />
                  </TableCell>
                  <TableCell className="font-medium">
                    {transaction.description}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {transaction.merchant}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(transaction.date)}
                  </TableCell>
                  <TableCell>
                    <CategoryCell
                      transaction={transaction}
                      categories={categories}
                      onUpdate={handleTransactionUpdate}
                    />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={transaction.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={`font-semibold ${
                        transaction.type === "INCOME"
                          ? "text-green-600"
                          : transaction.type === "EXPENSE"
                            ? "text-red-600"
                            : "text-muted-foreground"
                      }`}
                    >
                      {transaction.type === "INCOME"
                        ? "+"
                        : transaction.type === "EXPENSE"
                          ? "-"
                          : ""}
                      {formatCurrency(
                        Math.abs(transaction.amount),
                        account.currency
                      )}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="border-t p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * 20 + 1} to{" "}
              {Math.min(currentPage * 20, totalCount)} of {totalCount}{" "}
              transactions
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
        </div>
      )}
    </div>
  );
}
