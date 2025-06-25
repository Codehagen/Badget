"use client";

import { useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconCircleCheckFilled, IconLoader } from "@tabler/icons-react";
import { updateTransactionCategory } from "@/actions/dashboard-actions";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
  icon?: string | null;
  color?: string | null;
}

interface InteractiveTransactionBadgeProps {
  transactionId: string;
  status:
    | "RECONCILED"
    | "NEEDS_CATEGORIZATION"
    | "NEEDS_REVIEW"
    | "IN_PROGRESS";
  category: Category | null;
  categories: Category[];
  onUpdate?: (transactionId: string, category: Category) => void;
}

export function InteractiveTransactionBadge({
  transactionId,
  status,
  category,
  categories,
  onUpdate,
}: InteractiveTransactionBadgeProps) {
  const [isPending, startTransition] = useTransition();

  const handleCategorySelect = (categoryId: string) => {
    startTransition(async () => {
      try {
        const result = await updateTransactionCategory(
          transactionId,
          categoryId
        );

        if (result.success && result.transaction.category) {
          const updatedCategory = {
            id: categoryId,
            name: result.transaction.category.name,
            icon: result.transaction.category.icon,
            color: result.transaction.category.color,
          };
          onUpdate?.(transactionId, updatedCategory);
          toast.success("Transaction categorized successfully");
        } else {
          toast.error("Failed to update transaction");
        }
      } catch {
        toast.error("Failed to update transaction");
      }
    });
  };

  // If transaction needs categorization or review, show select directly
  if (status === "NEEDS_CATEGORIZATION" || status === "NEEDS_REVIEW") {
    const placeholder = isPending
      ? "Updating..."
      : status === "NEEDS_CATEGORIZATION"
        ? "Select category..."
        : "Review & select category...";

    return (
      <Select onValueChange={handleCategorySelect} disabled={isPending}>
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

  // Show status badge for other statuses
  switch (status) {
    case "RECONCILED":
      return (
        <Badge variant="outline" className="text-muted-foreground px-1.5">
          <IconCircleCheckFilled className="h-3 w-3 fill-green-500 dark:fill-green-400 mr-1" />
          {category ? category.name : "Reconciled"}
        </Badge>
      );
    case "IN_PROGRESS":
      return (
        <Badge variant="outline" className="text-muted-foreground px-1.5">
          <IconLoader
            className={`h-3 w-3 mr-1 ${isPending ? "animate-spin" : ""}`}
          />
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
