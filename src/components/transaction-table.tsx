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
  IconCircleCheckFilled,
  IconAlertTriangle,
  IconLoader,
  IconTrendingUp,
  IconTrendingDown,
  IconArrowsExchange,
} from "@tabler/icons-react";

interface Transaction {
  id: number;
  date: string;
  description: string;
  merchant: string;
  amount: number;
  type: "income" | "expense" | "transfer";
  category: string;
  account: string;
  status:
    | "reconciled"
    | "needs_categorization"
    | "needs_review"
    | "in_progress";
  reconciled: boolean;
  categorized: boolean;
}

interface TransactionTableProps {
  data: Transaction[];
}

export function TransactionTable({ data }: TransactionTableProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "reconciled":
        return (
          <Badge variant="outline" className="text-muted-foreground px-1.5">
            <IconCircleCheckFilled className="fill-green-500 dark:fill-green-400" />
            Reconciled
          </Badge>
        );
      case "needs_categorization":
        return (
          <Badge variant="outline" className="text-muted-foreground px-1.5">
            <IconLoader />
            Needs Category
          </Badge>
        );
      case "needs_review":
        return (
          <Badge variant="outline" className="text-muted-foreground px-1.5">
            <IconAlertTriangle className="fill-red-500 dark:fill-red-400" />
            Needs Review
          </Badge>
        );
      case "in_progress":
        return (
          <Badge variant="outline" className="text-muted-foreground px-1.5">
            <IconLoader />
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
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "income":
        return <IconTrendingUp className="h-4 w-4 text-emerald-600" />;
      case "expense":
        return <IconTrendingDown className="h-4 w-4 text-red-600" />;
      case "transfer":
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
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
          {data.map((transaction) => (
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
                  <Badge variant="outline">{transaction.category}</Badge>
                ) : (
                  <span className="text-muted-foreground text-sm">
                    Uncategorized
                  </span>
                )}
              </TableCell>
              <TableCell className="text-sm">{transaction.account}</TableCell>
              <TableCell className="font-mono">
                {formatAmount(transaction.amount)}
              </TableCell>
              <TableCell>{getStatusBadge(transaction.status)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <IconEdit className="h-4 w-4" />
                  </Button>
                  {transaction.status !== "reconciled" && (
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
