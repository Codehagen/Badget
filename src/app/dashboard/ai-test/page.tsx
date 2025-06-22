import {
  generateBudgetRecommendations,
  detectTransactionAnomalies,
  forecastCategorySpending,
  answerFinanceQuestion,
  generateBudgetTips,
  runAiPrompt,
} from "@/actions/ai-budget-actions";
import { AiTestClient } from "@/components/ai-test-client";

export default function AiTestPage() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold">AI Budget Actions Test Page</h1>
        <p className="text-muted-foreground mt-2">
          Test all the AI-powered budgeting functions with your actual data
        </p>
      </div>

      <AiTestClient
        generateBudgetRecommendations={generateBudgetRecommendations}
        detectTransactionAnomalies={detectTransactionAnomalies}
        forecastCategorySpending={forecastCategorySpending}
        answerFinanceQuestion={answerFinanceQuestion}
        generateBudgetTips={generateBudgetTips}
        runAiPrompt={runAiPrompt}
      />
    </div>
  );
}
