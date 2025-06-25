"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  IconEdit,
  IconCheck,
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

// Status Badge Component - only shows status
function StatusBadge({ status }: { status: Transaction["status"] }) {
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
          {status}
        </Badge>
      );
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
      className="flex items-center gap-1 cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={() => setIsEditing(true)}
      title="Click to change category"
    >
      {transaction.category.icon && <span>{transaction.category.icon}</span>}
      {transaction.category.name}
    </Badge>
  );
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
                <CategoryCell
                  transaction={transaction}
                  categories={categories}
                  onUpdate={handleTransactionUpdate}
                />
              </TableCell>
              <TableCell className="text-sm">
                {transaction.account.name}
              </TableCell>
              <TableCell className="font-mono">
                {formatAmount(transaction.amount)}
              </TableCell>
              <TableCell>
                <StatusBadge status={transaction.status} />
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
