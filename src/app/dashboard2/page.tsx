import { DataTable } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Mail,
  MousePointer,
  MessageCircle,
  UserMinus,
} from "lucide-react";

import data from "./data.json";

// Sample metrics data - you can replace this with your actual data
const metrics = [
  {
    title: "Active subscribers",
    value: "202,123",
    change: "+22,325 (12.2%)",
    changeType: "positive",
    period: "last 12 months",
    icon: Users,
  },
  {
    title: "Email open rate",
    value: "78,500",
    change: "+8,500 (12.1%)",
    changeType: "positive",
    period: "last 12 months",
    icon: Mail,
  },
  {
    title: "Avg click rate",
    value: "26.2%",
    change: "-2.3% (-8.1%)",
    changeType: "negative",
    period: "last 12 months",
    icon: MousePointer,
  },
  {
    title: "Replied",
    value: "23,212",
    change: "-2,123 (12.3%)",
    changeType: "negative",
    period: "last 12 months",
    icon: MessageCircle,
  },
  {
    title: "Unsubscribe rate",
    value: "14,000",
    change: "+1,500 (12.3%)",
    changeType: "positive",
    period: "last 12 months",
    icon: UserMinus,
  },
];

export default function Page() {
  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header Section */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Overview</span>
            <Badge
              variant="outline"
              className="bg-black text-white hover:bg-black/90"
            >
              Upgrade
            </Badge>
          </div>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div key={index} className="border rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {metric.title}
                  </p>
                  <p className="text-2xl font-bold">{metric.value}</p>
                  <div className="flex items-center gap-1 text-xs">
                    {metric.changeType === "positive" ? (
                      <TrendingUp className="h-3 w-3 text-emerald-600" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-600" />
                    )}
                    <span
                      className={
                        metric.changeType === "positive"
                          ? "text-emerald-600"
                          : "text-red-600"
                      }
                    >
                      {metric.change}
                    </span>
                    <span className="text-muted-foreground ml-1">
                      {metric.period}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics Section */}
      <div className="border rounded-lg">
        <div className="p-6 pb-0">
          <h3 className="text-lg font-semibold">Analytics</h3>
          <p className="text-sm text-muted-foreground">
            Overall performance of your email campaign trends
          </p>
        </div>
        <div className="p-6">
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            Chart will be rendered here
          </div>
        </div>
      </div>

      {/* Newsletter Posts & Data Table Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Newsletter Posts */}
        <div className="border rounded-lg">
          <div className="p-6 pb-0">
            <h3 className="text-lg font-semibold">Newsletter Post</h3>
            <p className="text-sm text-muted-foreground">
              View existing posts, create new posts, and edit templates
            </p>
          </div>
          <div className="p-6 space-y-4">
            <div className="space-y-3">
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium text-sm mb-1">
                  Maximizing Your Productivity: Tools for Success
                </h4>
                <p className="text-xs text-muted-foreground mb-2">
                  This newsletter focuses on the best productivity tools
                </p>
                <div className="flex items-center gap-2 text-xs">
                  <Badge
                    variant="secondary"
                    className="bg-emerald-100 text-emerald-700"
                  >
                    ✓ Published
                  </Badge>
                  <span className="text-muted-foreground">12342</span>
                  <span className="text-muted-foreground">2313 (15.7%)</span>
                  <span className="text-muted-foreground">1222 (58%)</span>
                </div>
              </div>

              <div className="p-3 border rounded-lg">
                <h4 className="font-medium text-sm mb-1">
                  Maximizing Your Productivity: Tools for Success
                </h4>
                <p className="text-xs text-muted-foreground mb-2">
                  This newsletter focuses on the best productivity tools
                </p>
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-700 text-xs"
                >
                  📄 Draft
                </Badge>
              </div>

              <div className="p-3 border rounded-lg">
                <h4 className="font-medium text-sm mb-1">
                  Maximizing Your Productivity: Tools for Success
                </h4>
                <p className="text-xs text-muted-foreground">
                  This newsletter focuses on the best productivity tools
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Subscribers Table */}
        <div className="lg:col-span-2">
          <DataTable data={data} />
        </div>
      </div>
    </div>
  );
}
