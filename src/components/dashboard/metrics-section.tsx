import {
  IconTrendingUp,
  IconTrendingDown,
  IconCurrencyDollar,
  IconCreditCard,
  IconWallet,
  IconTarget,
  IconPigMoney,
} from "@tabler/icons-react";

// Financial metrics data for Badget dashboard
const metrics = [
  {
    title: "Monthly Income",
    value: "$6,250",
    change: "+$250 (+4.2%)",
    changeType: "positive",
    period: "vs last month",
    icon: IconWallet,
  },
  {
    title: "Monthly Expenses",
    value: "$3,890",
    change: "-$180 (-4.4%)",
    changeType: "positive",
    period: "vs last month",
    icon: IconCreditCard,
  },
  {
    title: "Net Worth",
    value: "$45,230",
    change: "+$2,450 (+5.7%)",
    changeType: "positive",
    period: "last 30 days",
    icon: IconCurrencyDollar,
  },
  {
    title: "Savings Rate",
    value: "37.8%",
    change: "+3.2% (+9.2%)",
    changeType: "positive",
    period: "vs last month",
    icon: IconPigMoney,
  },
  {
    title: "Budget Remaining",
    value: "$1,840",
    change: "+$320 (+21.1%)",
    changeType: "positive",
    period: "this month",
    icon: IconTarget,
  },
];

export function MetricsSection() {
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
