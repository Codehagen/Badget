"use client";

import { Pie, PieChart } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface AccountBreakdownData {
  name: string;
  value: number;
  share: string;
  borderColor: string;
}

interface AccountBreakdownChartProps {
  data: AccountBreakdownData[];
}

function classNames(...classes: (string | undefined | boolean)[]) {
  return classes.filter(Boolean).join(" ");
}

const currencyFormatter = (number: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(number);
};

// Map account types to chart colors
const chartConfig = {
  amount: {
    label: "Amount",
  },
  checking: {
    label: "Checking",
    color: "hsl(var(--chart-1))",
  },
  savings: {
    label: "Savings",
    color: "hsl(var(--chart-2))",
  },
  investment: {
    label: "Investment",
    color: "hsl(var(--chart-3))",
  },
  other: {
    label: "Other",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig;

export function AccountBreakdownChart({ data }: AccountBreakdownChartProps) {
  // Convert data format for shadcn chart
  const chartData = data.map((item) => ({
    name: item.name.toLowerCase(),
    amount: item.value,
    share: item.share,
    fill: `var(--color-${item.name.toLowerCase()})`,
  }));

  return (
    <div className="grid grid-cols-1 gap-0 sm:grid-cols-2 sm:gap-8">
      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square max-h-[250px]"
      >
        <PieChart>
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Pie
            data={chartData}
            dataKey="amount"
            nameKey="name"
            stroke="hsl(var(--border))"
            strokeWidth={2}
          />
        </PieChart>
      </ChartContainer>

      <div className="flex items-center">
        <ul role="list" className="space-y-3">
          {data.map((item) => (
            <li key={item.name} className="flex space-x-3">
              <span
                className={classNames(item.borderColor, "w-1 shrink-0 rounded")}
              />
              <div>
                <p className="text-sm font-medium text-foreground">
                  {currencyFormatter(item.value)}{" "}
                  <span className="font-normal">({item.share})</span>
                </p>
                <p className="mt-0.5 whitespace-nowrap text-sm text-muted-foreground">
                  {item.name}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
