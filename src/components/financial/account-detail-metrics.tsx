import { TrendingUp, TrendingDown, Activity, DollarSign } from "lucide-react";

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  institution?: string | null;
  color?: string | null;
}

interface AccountDetailMetricsProps {
  account: Account;
}

function formatCurrency(amount: number, currency: string = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

export function AccountDetailMetrics({ account }: AccountDetailMetricsProps) {
  // Mock data for demonstration - in a real app, this would come from props or API
  const metrics = {
    monthlyInflow: 2500,
    monthlyOutflow: 1800,
    avgBalance: 4200,
    transactionCount: 24,
    monthlyChange: 700,
    monthlyChangePercentage: 18.5,
  };

  const metricCards = [
    {
      title: "Monthly Inflow",
      value: formatCurrency(metrics.monthlyInflow, account.currency),
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950",
      description: "Money coming in this month",
    },
    {
      title: "Monthly Outflow",
      value: formatCurrency(metrics.monthlyOutflow, account.currency),
      icon: TrendingDown,
      color: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-950",
      description: "Money going out this month",
    },
    {
      title: "Average Balance",
      value: formatCurrency(metrics.avgBalance, account.currency),
      icon: DollarSign,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950",
      description: "Last 6 months average",
    },
    {
      title: "Transactions",
      value: metrics.transactionCount.toString(),
      icon: Activity,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950",
      description: "This month",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metricCards.map((metric, index) => {
        const IconComponent = metric.icon;
        return (
          <div key={index} className="border rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-md ${metric.bgColor}`}>
                    <IconComponent className={`h-4 w-4 ${metric.color}`} />
                  </div>
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  {metric.title}
                </p>
                <p className="text-2xl font-bold">{metric.value}</p>
                <p className="text-xs text-muted-foreground">
                  {metric.description}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
