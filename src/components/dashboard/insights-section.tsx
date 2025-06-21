import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow, subHours, subDays } from "date-fns";

type FinancialGoal = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: Date | null;
  type: string;
  isActive: boolean;
};

interface InsightsSectionProps {
  goals: FinancialGoal[];
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function calculateProgress(current: number, target: number) {
  return Math.min((current / target) * 100, 100);
}

export function InsightsSection({ goals }: InsightsSectionProps) {
  // Find the emergency fund goal for display
  const emergencyFundGoal = goals.find(
    (goal) => goal.type === "EMERGENCY_FUND" && goal.isActive
  );

  return (
    <div className="border rounded-lg">
      <div className="p-6 pb-0">
        <h3 className="text-lg font-semibold">Financial Insights</h3>
        <p className="text-sm text-muted-foreground">
          Latest market updates and personalized financial advice
        </p>
      </div>
      <div className="p-6 space-y-4">
        <div className="space-y-3">
          <div className="p-3 border rounded-lg">
            <h4 className="font-medium text-sm mb-1">
              Tech Stocks Rally: AAPL & MSFT Lead Gains
            </h4>
            <p className="text-xs text-muted-foreground mb-2">
              Your portfolio gained 2.3% this week driven by tech sector growth
            </p>
            <div className="flex items-center gap-2 text-xs">
              <Badge
                variant="secondary"
                className="bg-emerald-100 text-emerald-700"
              >
                📈 Market Update
              </Badge>
              <span className="text-muted-foreground">
                {formatDistanceToNow(subHours(new Date(), 2), {
                  addSuffix: true,
                })}
              </span>
            </div>
          </div>

          <div className="p-3 border rounded-lg">
            <h4 className="font-medium text-sm mb-1">
              Budget Alert: Dining Out Category 85% Used
            </h4>
            <p className="text-xs text-muted-foreground mb-2">
              Consider reducing restaurant spending to stay within budget
            </p>
            <div className="flex items-center gap-2 text-xs">
              <Badge
                variant="secondary"
                className="bg-amber-100 text-amber-700 text-xs"
              >
                ⚠️ Budget Alert
              </Badge>
              <span className="text-muted-foreground">
                {formatDistanceToNow(subHours(new Date(), 6), {
                  addSuffix: true,
                })}
              </span>
            </div>
          </div>

          {emergencyFundGoal && (
            <div className="p-3 border rounded-lg">
              <h4 className="font-medium text-sm mb-1">
                {emergencyFundGoal.name}:{" "}
                {Math.round(
                  calculateProgress(
                    emergencyFundGoal.currentAmount,
                    emergencyFundGoal.targetAmount
                  )
                )}
                % Complete
              </h4>
              <p className="text-xs text-muted-foreground mb-2">
                You&apos;re{" "}
                {formatCurrency(
                  emergencyFundGoal.targetAmount -
                    emergencyFundGoal.currentAmount
                )}{" "}
                away from your target
              </p>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(subDays(new Date(), 1), {
                  addSuffix: true,
                })}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
