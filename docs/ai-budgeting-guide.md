# Using AI to Create a Budget

Badget includes automated budgeting features powered by machine learning. These features analyze your transaction history and generate recommended spending plans.

## Quick Start

1. **Connect your accounts** – Use the Plaid integration to link your bank and credit card data.
2. **Import transactions** – Transactions are categorized automatically using AI-driven pattern recognition.
3. **Generate a budget** – From the dashboard, select "Create Budget" to let Badget build a smart spending plan.
4. **Review recommendations** – Budgets adjust dynamically based on new data and your financial goals.
5. **Track progress** – Monitor spending against AI suggestions and receive alerts when you're off track.

### How It Works

Badget examines your historical transactions to identify spending patterns. It then provides:

- **Smart Budget Creation** – Budgets suggested from past spending habits.
- **Dynamic Adjustments** – Real‑time budget recommendations as new transactions arrive.
- **Goal Alignment** – Budgets that factor in your savings or payoff targets.
- **Optimization Alerts** – Suggestions to reallocate funds when opportunities arise.

These capabilities are outlined in the project vision in `README2.md`.

### Using Vercel AI

Badget can leverage the Vercel AI SDK to run machine learning models in real time using **server actions**.

1. Install the Vercel AI SDK: `pnpm add vercel-ai`
2. Create a server action that sends prompts to your preferred model.
3. Consume the returned text or stream directly from your components.

```ts
// Example: src/actions/ai-budget-actions.ts
export async function runAiPrompt(prompt: string) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
  const chat = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
  });
  return chat.choices[0]?.message?.content?.trim() || '';
}
```

Call this server action from your React components whenever you need on-demand budget insights.

### Programmatic Recommendations

The `generateBudgetRecommendations` server action computes suggested monthly budgets from the last few months of spending. It groups expenses by category and optionally summarizes the results with OpenAI.

```ts
import { generateBudgetRecommendations } from '@/actions/ai-budget-actions';

const { recommendations, summary } = await generateBudgetRecommendations(3);
```

Each recommendation includes the average monthly spend and a slightly padded budget amount.

### Advanced AI Features

Badget's AI toolkit goes beyond basic budgeting. Additional server actions expose:

- **Anomaly Detection** – `detectTransactionAnomalies()` flags transactions that deviate from historical averages.
- **Spending Forecasts** – `forecastCategorySpending()` predicts next month's expenses per category.
- **Goal Driven Adjustments** – `generateBudgetRecommendations()` automatically accounts for active savings goals.
- **Natural Language Insights** – `answerFinanceQuestion()` lets you ask free‑form questions about recent spending.
- **Personalized Tips** – `generateBudgetTips()` creates short suggestions to save money based on your habits.
- **Streaming Interfaces** – Server actions like `runAiPrompt()` can power voice or chat assistants.

These functions are intended as building blocks for dashboards, notifications or conversational interfaces.
