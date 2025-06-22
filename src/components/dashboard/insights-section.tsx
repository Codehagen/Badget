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

type AssetNewsItem = {
  id: string;
  title: string;
  url: string;
  source: string;
  publishedAt: string;
};

interface InsightsSectionProps {
  goals: FinancialGoal[];
  assetNews: AssetNewsItem[];
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

function formatTimeAgo(dateString: string) {
  if (!dateString) return "recently";
  try {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return "recently";
  }
}

export function InsightsSection({ goals, assetNews }: InsightsSectionProps) {
  // Find the emergency fund goal for display
  const emergencyFundGoal = goals.find(
    (goal) => goal.type === "EMERGENCY_FUND" && goal.isActive
  );

  // Get the latest asset news items (limit to 2 most recent)
  const recentNews = assetNews.slice(0, 2);

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
          {/* Display real asset news if available */}
          {recentNews.map((newsItem) => {
            const isFallback = newsItem.id.startsWith("fallback-");
            return (
              <div key={newsItem.id} className="p-3 border rounded-lg">
                <h4 className="font-medium text-sm mb-1">
                  {newsItem.url === "#" ? (
                    <span>{newsItem.title}</span>
                  ) : (
                    <a
                      href={newsItem.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {newsItem.title}
                    </a>
                  )}
                </h4>
                <p className="text-xs text-muted-foreground mb-2">
                  Related to your investment portfolio
                  {isFallback && " • Sample news (API unavailable)"}
                </p>
                <div className="flex items-center gap-2 text-xs">
                  <Badge
                    variant="secondary"
                    className={
                      isFallback
                        ? "bg-gray-100 text-gray-700"
                        : "bg-emerald-100 text-emerald-700"
                    }
                  >
                    {isFallback ? "📰" : "📈"} {newsItem.source}
                  </Badge>
                  <span className="text-muted-foreground">
                    {formatTimeAgo(newsItem.publishedAt)}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Fallback content if no news available */}
          {recentNews.length === 0 && (
            <div className="p-3 border rounded-lg">
              <h4 className="font-medium text-sm mb-1">
                Market News Unavailable
              </h4>
              <p className="text-xs text-muted-foreground mb-2">
                Add some investment assets to see personalized market updates
              </p>
              <div className="flex items-center gap-2 text-xs">
                <Badge
                  variant="secondary"
                  className="bg-gray-100 text-gray-700"
                >
                  💡 Tip
                </Badge>
              </div>
            </div>
          )}

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
