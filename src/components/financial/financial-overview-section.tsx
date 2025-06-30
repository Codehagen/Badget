import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  PiggyBank,
  Target,
} from "lucide-react";
import { AccountBreakdownChart } from "./charts/account-breakdown-chart";
import type { FinancialOverview } from "@/actions/financial-actions";

interface FinancialOverviewSectionProps {
  overview: FinancialOverview;
}

function formatCurrency(amount: number, currency: string = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

function formatPercentage(value: number) {
  return `${value.toFixed(1)}%`;
}

export function FinancialOverviewSection({
  overview,
}: FinancialOverviewSectionProps) {
  const {
    totalNetWorth,
    totalAssets,
    totalLiabilities,
    monthlyIncome,
    monthlyExpenses,
    savingsRate,
    cashFlow,
    accountBreakdown,
    topCategories,
    recentTrend,
    monthlyGoalProgress,
  } = overview;

  // Prepare data for pie chart
  const totalAccountValue =
    accountBreakdown.checking +
    accountBreakdown.savings +
    accountBreakdown.investment +
    accountBreakdown.other;

  const pieData = [
    {
      name: "Checking",
      value: accountBreakdown.checking,
      share:
        totalAccountValue > 0
          ? `${((accountBreakdown.checking / totalAccountValue) * 100).toFixed(1)}%`
          : "0%",
      borderColor: "bg-blue-500",
    },
    {
      name: "Savings",
      value: accountBreakdown.savings,
      share:
        totalAccountValue > 0
          ? `${((accountBreakdown.savings / totalAccountValue) * 100).toFixed(1)}%`
          : "0%",
      borderColor: "bg-green-500",
    },
    {
      name: "Investment",
      value: accountBreakdown.investment,
      share:
        totalAccountValue > 0
          ? `${((accountBreakdown.investment / totalAccountValue) * 100).toFixed(1)}%`
          : "0%",
      borderColor: "bg-purple-500",
    },
    {
      name: "Other",
      value: accountBreakdown.other,
      share:
        totalAccountValue > 0
          ? `${((accountBreakdown.other / totalAccountValue) * 100).toFixed(1)}%`
          : "0%",
      borderColor: "bg-yellow-500",
    },
  ].filter((item) => item.value > 0);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-red-600" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-green-600" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up":
        return "text-red-600";
      case "down":
        return "text-green-600";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Worth */}
        <div className="space-y-4 border rounded-lg p-4">
          <h3 className="text-sm font-medium text-muted-foreground">
            Net Worth
          </h3>
          <div className="space-y-1">
            <p className="text-2xl font-bold">
              {formatCurrency(totalNetWorth)}
            </p>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground">Assets:</span>
              <span className="font-medium">{formatCurrency(totalAssets)}</span>
            </div>
            {totalLiabilities > 0 && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground">Liabilities:</span>
                <span className="font-medium text-red-600">
                  {formatCurrency(totalLiabilities)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Monthly Cash Flow */}
        <div className="space-y-4 border rounded-lg p-4">
          <h3 className="text-sm font-medium text-muted-foreground">
            Monthly Cash Flow
          </h3>
          <div className="space-y-1">
            <p
              className={`text-2xl font-bold ${cashFlow >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              {formatCurrency(cashFlow)}
            </p>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-green-600">
                +{formatCurrency(monthlyIncome)}
              </span>
              <span className="text-muted-foreground">income</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-red-600">
                -{formatCurrency(monthlyExpenses)}
              </span>
              <span className="text-muted-foreground">expenses</span>
            </div>
          </div>
        </div>

        {/* Savings Rate */}
        <div className="space-y-4 border rounded-lg p-4">
          <h3 className="text-sm font-medium text-muted-foreground">
            Savings Rate
          </h3>
          <div className="space-y-3">
            <p className="text-2xl font-bold">
              {formatPercentage(savingsRate)}
            </p>
            <Progress value={Math.min(savingsRate, 100)} className="h-2" />
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <PiggyBank className="h-3 w-3" />
              <span>Target: 20%</span>
            </div>
          </div>
        </div>

        {/* Goals Progress */}
        <div className="space-y-4 border rounded-lg p-4">
          <h3 className="text-sm font-medium text-muted-foreground">
            Goals Progress
          </h3>
          <div className="space-y-3">
            <p className="text-2xl font-bold">
              {formatPercentage(monthlyGoalProgress)}
            </p>
            <Progress
              value={Math.min(monthlyGoalProgress, 100)}
              className="h-2"
            />
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Target className="h-3 w-3" />
              <span>Average progress</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Breakdown Chart */}
        <div className="space-y-4 border rounded-lg p-6">
          <h3 className="text-lg font-semibold">Account Breakdown</h3>
          <AccountBreakdownChart data={pieData} />
        </div>

        {/* Top Categories */}
        <div className="space-y-4 border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Top Spending Categories</h3>
            <div className="flex items-center gap-1">
              {getTrendIcon(recentTrend)}
              <span className={`text-sm ${getTrendColor(recentTrend)}`}>
                vs last month
              </span>
            </div>
          </div>
          <div className="space-y-4">
            {topCategories.map((category) => (
              <div key={category.categoryId} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {category.categoryName}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">
                      {formatCurrency(category.amount)}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {formatPercentage(category.percentage)}
                    </Badge>
                  </div>
                </div>
                <Progress value={category.percentage} className="h-2" />
              </div>
            ))}
            {topCategories.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No spending data for this month
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
