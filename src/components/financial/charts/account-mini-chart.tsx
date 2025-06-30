"use client";

import { LineChart, Line, ResponsiveContainer, Tooltip } from "recharts";

interface TrendData {
  date: string;
  balance: number;
}

interface AccountMiniChartProps {
  data: TrendData[];
  color?: string;
  currency?: string;
}

function formatCurrency(amount: number, currency: string = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

export function AccountMiniChart({
  data,
  color = "#0066CC",
  currency = "USD",
}: AccountMiniChartProps) {
  return (
    <div className="h-16 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="balance"
            stroke={color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 3 }}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-background border rounded-lg p-2 shadow-md">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-sm font-medium">
                      {formatCurrency(payload[0].value as number, currency)}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
