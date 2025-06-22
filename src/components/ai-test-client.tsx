"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2,
  Brain,
  TrendingUp,
  AlertTriangle,
  Target,
  Lightbulb,
  MessageSquare,
  Eye,
  Code,
} from "lucide-react";

type AiTestClientProps = {
  generateBudgetRecommendations: (months?: number) => Promise<any>;
  detectTransactionAnomalies: (months?: number) => Promise<any>;
  forecastCategorySpending: (months?: number) => Promise<any>;
  answerFinanceQuestion: (question: string) => Promise<string>;
  generateBudgetTips: (months?: number) => Promise<string>;
  runAiPrompt: (prompt: string) => Promise<string>;
};

export function AiTestClient({
  generateBudgetRecommendations,
  detectTransactionAnomalies,
  forecastCategorySpending,
  answerFinanceQuestion,
  generateBudgetTips,
  runAiPrompt,
}: AiTestClientProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, any>>({});
  const [question, setQuestion] = useState("");
  const [prompt, setPrompt] = useState("");
  const [months, setMonths] = useState(3);

  // Debug: Log what functions we received
  console.log("🔍 AiTestClient - Functions received:", {
    generateBudgetRecommendations: typeof generateBudgetRecommendations,
    detectTransactionAnomalies: typeof detectTransactionAnomalies,
    forecastCategorySpending: typeof forecastCategorySpending,
    answerFinanceQuestion: typeof answerFinanceQuestion,
    generateBudgetTips: typeof generateBudgetTips,
    runAiPrompt: typeof runAiPrompt,
  });

  const handleTest = async (
    functionName: string,
    testFunction: () => Promise<any>
  ) => {
    console.log(`🚀 Starting test: ${functionName}`);
    setLoading(functionName);
    try {
      console.log(`⏳ Calling function: ${functionName}`);
      const result = await testFunction();
      console.log(`✅ Result for ${functionName}:`, result);
      setResults((prev) => ({ ...prev, [functionName]: result }));
    } catch (error) {
      console.error(`❌ Error in ${functionName}:`, error);
      setResults((prev) => ({
        ...prev,
        [functionName]: {
          error: error instanceof Error ? error.message : "Unknown error",
        },
      }));
    } finally {
      setLoading(null);
      console.log(`🏁 Finished test: ${functionName}`);
    }
  };

  // Format budget recommendations for user-friendly display
  const formatBudgetRecommendations = (result: any) => {
    if (!result?.recommendations) return "No recommendations available";

    return (
      <div className="space-y-4">
        {result.summary && (
          <div className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50">
            <h4 className="font-medium text-blue-900 mb-2">AI Summary</h4>
            <p className="text-blue-800 text-sm whitespace-pre-wrap">
              {result.summary}
            </p>
          </div>
        )}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Budget Recommendations</h4>
          {result.recommendations.map((rec: any, index: number) => (
            <div key={index} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-center mb-2">
                <h5 className="font-medium text-gray-900">
                  {rec.categoryName}
                </h5>
                <div className="text-right">
                  <div className="text-lg font-semibold text-green-600">
                    ${rec.recommendedBudget}
                  </div>
                  <div className="text-sm text-gray-500">
                    Avg: ${Math.abs(rec.averageMonthlySpend)}/month
                  </div>
                </div>
              </div>
              {rec.explanation && (
                <p className="text-sm text-gray-600">{rec.explanation}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Format anomalies for user-friendly display
  const formatAnomalies = (result: any) => {
    if (!Array.isArray(result) || result.length === 0) {
      return (
        <div className="text-gray-600">
          No anomalies detected in your transactions.
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">
          Unusual Transactions Found
        </h4>
        {result.map((anomaly: any, index: number) => (
          <div
            key={index}
            className="border border-orange-200 rounded-lg p-4 bg-orange-50"
          >
            <div className="flex justify-between items-center mb-2">
              <h5 className="font-medium text-orange-900">
                {anomaly.categoryName}
              </h5>
              <div className="text-lg font-semibold text-orange-600">
                ${anomaly.amount}
              </div>
            </div>
            <p className="text-sm text-orange-700">{anomaly.reason}</p>
          </div>
        ))}
      </div>
    );
  };

  // Format forecasts for user-friendly display
  const formatForecasts = (result: any) => {
    if (!Array.isArray(result) || result.length === 0) {
      return <div className="text-gray-600">No forecasts available.</div>;
    }

    return (
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">
          Next Month's Spending Forecast
        </h4>
        {result.map((forecast: any, index: number) => (
          <div key={index} className="border rounded-lg p-4 bg-gray-50">
            <div className="flex justify-between items-center">
              <h5 className="font-medium text-gray-900">
                {forecast.categoryName}
              </h5>
              <div className="text-lg font-semibold text-blue-600">
                ${forecast.projectedNextMonth}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Format text responses (tips, questions, prompts)
  const formatTextResponse = (result: any) => {
    if (typeof result === "string") {
      return (
        <div className="border rounded-lg p-4 bg-gray-50">
          <div className="whitespace-pre-wrap text-gray-900">{result}</div>
        </div>
      );
    }
    return <div className="text-gray-600">No response available.</div>;
  };

  // Enhanced result display with tabs
  const formatResult = (result: any, functionName: string) => {
    if (!result) return null;

    if (result.error) {
      return (
        <div className="border border-red-300 rounded-lg p-4 bg-red-50 text-red-800 text-sm">
          <strong>Error:</strong> {result.error}
        </div>
      );
    }

    // Get user-friendly formatted content based on function type
    let userFriendlyContent;
    switch (functionName) {
      case "generateBudgetRecommendations":
        userFriendlyContent = formatBudgetRecommendations(result);
        break;
      case "detectTransactionAnomalies":
        userFriendlyContent = formatAnomalies(result);
        break;
      case "forecastCategorySpending":
        userFriendlyContent = formatForecasts(result);
        break;
      case "generateBudgetTips":
      case "answerFinanceQuestion":
      case "runAiPrompt":
        userFriendlyContent = formatTextResponse(result);
        break;
      default:
        userFriendlyContent = (
          <div className="text-gray-600">Result available in JSON tab.</div>
        );
    }

    return (
      <Tabs defaultValue="formatted" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="formatted" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            User View
          </TabsTrigger>
          <TabsTrigger value="json" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            JSON Debug
          </TabsTrigger>
        </TabsList>
        <TabsContent value="formatted" className="mt-4">
          {userFriendlyContent}
        </TabsContent>
        <TabsContent value="json" className="mt-4">
          <pre className="border rounded-lg p-4 bg-gray-50 overflow-auto text-sm max-h-96 text-gray-900">
            {JSON.stringify(result, null, 2)}
          </pre>
        </TabsContent>
      </Tabs>
    );
  };

  return (
    <div className="space-y-8">
      {/* Controls */}
      <div className="border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-2">Test Controls</h2>
        <p className="text-muted-foreground mb-4">
          Configure parameters for testing the AI functions
        </p>
        <div>
          <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Months of data to analyze:
          </label>
          <Input
            type="number"
            value={months}
            onChange={(e) => setMonths(parseInt(e.target.value) || 3)}
            min={1}
            max={12}
            className="w-20 mt-1"
          />
        </div>
      </div>

      {/* Main AI Functions - 2x2 Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Budget Recommendations */}
        <div className="border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Budget Recommendations</h3>
          </div>
          <p className="text-muted-foreground mb-4">
            Generate AI-powered budget recommendations based on spending history
          </p>
          <Button
            onClick={() =>
              handleTest("generateBudgetRecommendations", () =>
                generateBudgetRecommendations(months)
              )
            }
            disabled={loading === "generateBudgetRecommendations"}
            className="w-full mb-4"
          >
            {loading === "generateBudgetRecommendations" ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                Generate Recommendations
              </>
            )}
          </Button>
          {results.generateBudgetRecommendations && (
            <div className="space-y-2">
              <Badge
                variant="outline"
                className="text-gray-900 border-gray-300"
              >
                Result:
              </Badge>
              {formatResult(
                results.generateBudgetRecommendations,
                "generateBudgetRecommendations"
              )}
            </div>
          )}
        </div>

        {/* Transaction Anomalies */}
        <div className="border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <h3 className="text-lg font-semibold">Transaction Anomalies</h3>
          </div>
          <p className="text-muted-foreground mb-4">
            Detect unusual transactions that might need attention
          </p>
          <Button
            onClick={() =>
              handleTest("detectTransactionAnomalies", () =>
                detectTransactionAnomalies(months)
              )
            }
            disabled={loading === "detectTransactionAnomalies"}
            className="w-full mb-4"
          >
            {loading === "detectTransactionAnomalies" ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Detecting...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                Detect Anomalies
              </>
            )}
          </Button>
          {results.detectTransactionAnomalies && (
            <div className="space-y-2">
              <Badge
                variant="outline"
                className="text-gray-900 border-gray-300"
              >
                Result:
              </Badge>
              {formatResult(
                results.detectTransactionAnomalies,
                "detectTransactionAnomalies"
              )}
            </div>
          )}
        </div>

        {/* Spending Forecast */}
        <div className="border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold">Spending Forecast</h3>
          </div>
          <p className="text-muted-foreground mb-4">
            Predict next month&apos;s spending using trend analysis
          </p>
          <Button
            onClick={() =>
              handleTest("forecastCategorySpending", () =>
                forecastCategorySpending(months)
              )
            }
            disabled={loading === "forecastCategorySpending"}
            className="w-full mb-4"
          >
            {loading === "forecastCategorySpending" ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Forecasting...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                Generate Forecast
              </>
            )}
          </Button>
          {results.forecastCategorySpending && (
            <div className="space-y-2">
              <Badge
                variant="outline"
                className="text-gray-900 border-gray-300"
              >
                Result:
              </Badge>
              {formatResult(
                results.forecastCategorySpending,
                "forecastCategorySpending"
              )}
            </div>
          )}
        </div>

        {/* Budget Tips */}
        <div className="border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="h-5 w-5 text-yellow-600" />
            <h3 className="text-lg font-semibold">Budget Tips</h3>
          </div>
          <p className="text-muted-foreground mb-4">
            Get AI-generated money-saving tips based on your spending
          </p>
          <Button
            onClick={() =>
              handleTest("generateBudgetTips", () => generateBudgetTips(months))
            }
            disabled={loading === "generateBudgetTips"}
            className="w-full mb-4"
          >
            {loading === "generateBudgetTips" ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                Generate Tips
              </>
            )}
          </Button>
          {results.generateBudgetTips && (
            <div className="space-y-2">
              <Badge
                variant="outline"
                className="text-gray-900 border-gray-300"
              >
                Result:
              </Badge>
              {formatResult(results.generateBudgetTips, "generateBudgetTips")}
            </div>
          )}
        </div>
      </div>

      {/* Interactive Functions - Full Width */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Finance Question */}
        <div className="border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-semibold">Ask Finance Question</h3>
          </div>
          <p className="text-muted-foreground mb-4">
            Ask AI a question about your finances
          </p>
          <Textarea
            placeholder="e.g., How much am I spending on food each month?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="mb-4"
          />
          <Button
            onClick={() =>
              handleTest("answerFinanceQuestion", () =>
                answerFinanceQuestion(question)
              )
            }
            disabled={loading === "answerFinanceQuestion" || !question.trim()}
            className="w-full mb-4"
          >
            {loading === "answerFinanceQuestion" ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Asking AI...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                Ask Question
              </>
            )}
          </Button>
          {results.answerFinanceQuestion && (
            <div className="space-y-2">
              <Badge
                variant="outline"
                className="text-gray-900 border-gray-300"
              >
                Answer:
              </Badge>
              {formatResult(
                results.answerFinanceQuestion,
                "answerFinanceQuestion"
              )}
            </div>
          )}
        </div>

        {/* Custom AI Prompt */}
        <div className="border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="h-5 w-5 text-indigo-600" />
            <h3 className="text-lg font-semibold">Run Custom AI Prompt</h3>
          </div>
          <p className="text-muted-foreground mb-4">
            Run any custom prompt with the AI
          </p>
          <Textarea
            placeholder="e.g., Give me 5 tips for saving money on groceries"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="mb-4"
          />
          <Button
            onClick={() => handleTest("runAiPrompt", () => runAiPrompt(prompt))}
            disabled={loading === "runAiPrompt" || !prompt.trim()}
            className="w-full mb-4"
          >
            {loading === "runAiPrompt" ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                Run Prompt
              </>
            )}
          </Button>
          {results.runAiPrompt && (
            <div className="space-y-2">
              <Badge
                variant="outline"
                className="text-gray-900 border-gray-300"
              >
                Response:
              </Badge>
              {formatResult(results.runAiPrompt, "runAiPrompt")}
            </div>
          )}
        </div>
      </div>

      {/* Info Section */}
      <div className="border border-blue-300 rounded-lg p-6 bg-blue-50">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <strong>Note:</strong> These functions use OpenAI&apos;s API and
            your actual transaction data. Make sure you have OPENAI_API_KEY set
            in your environment variables. The functions analyze your
            family&apos;s financial data to provide personalized insights.
          </div>
        </div>
      </div>
    </div>
  );
}
