import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow, subHours, subDays } from "date-fns";

export function InsightsSection() {
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

          <div className="p-3 border rounded-lg">
            <h4 className="font-medium text-sm mb-1">
              Emergency Fund Goal: 67% Complete
            </h4>
            <p className="text-xs text-muted-foreground mb-2">
              You&apos;re $2,340 away from your 6-month emergency fund target
            </p>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(subDays(new Date(), 1), {
                addSuffix: true,
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
