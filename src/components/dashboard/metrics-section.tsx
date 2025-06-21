import {
  IconTrendingUp,
  IconTrendingDown,
  IconCurrencyDollar,
  IconCreditCard,
  IconWallet,
  IconTarget,
  IconPigMoney,
} from "@tabler/icons-react";

type DashboardMetrics = {
  monthlyIncome: number;
  monthlyExpenses: number;
  netWorth: number;
  savingsRate: number;
  budgetRemaining: number;
  accountBalances: {
    checking: number;
    savings: number;
    creditCard: number;
    total: number;
  };
};

interface MetricsSectionProps {
  data: DashboardMetrics;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function formatPercentage(value: number) {
  return `${value.toFixed(1)}%`;
}

export function MetricsSection({ data }: MetricsSectionProps) {
  const metrics = [
    {
      title: "Monthly Income",
      value: formatCurrency(data.monthlyIncome),
      change: "+$250 (+4.2%)", // TODO: Calculate from previous period
      changeType: "positive" as const,
      period: "vs last month",
      icon: IconWallet,
    },
    {
      title: "Monthly Expenses",
      value: formatCurrency(data.monthlyExpenses),
      change: "-$180 (-4.4%)", // TODO: Calculate from previous period
      changeType: "positive" as const,
      period: "vs last month",
      icon: IconCreditCard,
    },
    {
      title: "Net Worth",
      value: formatCurrency(data.netWorth),
      change: "+$2,450 (+5.7%)", // TODO: Calculate from previous period
      changeType: "positive" as const,
      period: "last 30 days",
      icon: IconCurrencyDollar,
    },
    {
      title: "Savings Rate",
      value: formatPercentage(data.savingsRate),
      change: "+3.2% (+9.2%)", // TODO: Calculate from previous period
      changeType: "positive" as const,
      period: "vs last month",
      icon: IconPigMoney,
    },
    {
      title: "Budget Remaining",
      value: formatCurrency(data.budgetRemaining),
      change: "+$320 (+21.1%)", // TODO: Calculate from previous period
      changeType: "positive" as const,
      period: "this month",
      icon: IconTarget,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <div key={index} className="border rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  {metric.title}
                </p>
                <p className="text-2xl font-bold">{metric.value}</p>
                <div className="flex items-center gap-1 text-xs">
                  {metric.changeType === "positive" ? (
                    <IconTrendingUp className="h-3 w-3 text-emerald-600" />
                  ) : (
                    <IconTrendingDown className="h-3 w-3 text-red-600" />
                  )}
                  <span
                    className={
                      metric.changeType === "positive"
                        ? "text-emerald-600"
                        : "text-red-600"
                    }
                  >
                    {metric.change}
                  </span>
                  <span className="text-muted-foreground ml-1">
                    {metric.period}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
