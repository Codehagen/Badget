"use client";

import { DonutChart } from "@tremor/react";

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

export function AccountBreakdownChart({ data }: AccountBreakdownChartProps) {
  // Convert data format for Tremor chart
  const chartData = data.map((item) => ({
    name: item.name,
    amount: item.value,
    share: item.share,
    borderColor: item.borderColor,
  }));

  // Extract colors for the chart (Tremor accepts color names)
  const colorMap: Record<string, string> = {
    "#0066CC": "blue",
    "#28A745": "green",
    "#6F42C1": "purple",
    "#FFC107": "yellow",
    "#DC3545": "red",
    "#17A2B8": "cyan",
  };

  const colors = data.map((item) => {
    // Extract color from the data or fall back to default
    const colorKey = Object.keys(colorMap).find(
      (key) => item.borderColor?.includes(key) || false
    );
    return colorKey ? colorMap[colorKey] : "gray";
  });

  return (
    <div className="grid grid-cols-1 gap-0 sm:grid-cols-2 sm:gap-8">
      <DonutChart
        data={chartData}
        category="amount"
        index="name"
        valueFormatter={currencyFormatter}
        showTooltip={true}
        className="h-40"
        colors={
          colors.length > 0 ? colors : ["blue", "green", "purple", "yellow"]
        }
      />
      <div className="flex items-center">
        <ul role="list" className="space-y-3">
          {chartData.map((item) => (
            <li key={item.name} className="flex space-x-3">
              <span
                className={classNames(item.borderColor, "w-1 shrink-0 rounded")}
              />
              <div>
                <p className="text-sm font-medium text-foreground">
                  {currencyFormatter(item.amount)}{" "}
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
