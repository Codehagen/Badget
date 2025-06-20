"use client";

import React from "react";
import { ComboChart, ComboChartEventProps } from "@/components/ComboChart";

const spendingChartData = [
  {
    date: "Jan 24",
    Spending: 3890,
    Budget: 4100,
    Income: 6250,
    SavingsRate: 37.8,
  },
  {
    date: "Feb 24",
    Spending: 4150,
    Budget: 4300,
    Income: 6100,
    SavingsRate: 32.0,
  },
  {
    date: "Mar 24",
    Spending: 3650,
    Budget: 3950,
    Income: 6250,
    SavingsRate: 41.6,
  },
  {
    date: "Apr 24",
    Spending: 4380,
    Budget: 4500,
    Income: 6400,
    SavingsRate: 31.6,
  },
  {
    date: "May 24",
    Spending: 3990,
    Budget: 4200,
    Income: 6250,
    SavingsRate: 36.2,
  },
  {
    date: "Jun 24",
    Spending: 3720,
    Budget: 3850,
    Income: 6250,
    SavingsRate: 40.5,
  },
  {
    date: "Jul 24",
    Spending: 4050,
    Budget: 4150,
    Income: 6350,
    SavingsRate: 36.2,
  },
  {
    date: "Aug 24",
    Spending: 3890,
    Budget: 4000,
    Income: 6250,
    SavingsRate: 37.8,
  },
];

export const SpendingTrendsChart = () => {
  const [value, setValue] = React.useState<ComboChartEventProps>(null);

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 min-h-0">
        <ComboChart
          data={spendingChartData}
          index="date"
          enableBiaxial={true}
          onValueChange={(v) => setValue(v)}
          barSeries={{
            categories: ["Income", "Spending"],
            yAxisLabel: "Amount ($)",
            colors: ["green", "red"],
          }}
          lineSeries={{
            categories: ["Budget"],
            showYAxis: true,
            yAxisLabel: "Budget ($)",
            colors: ["blue"],
            yAxisWidth: 80,
          }}
        />
      </div>
    </div>
  );
};
