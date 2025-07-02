"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  IconSearch,
  IconHelp,
  IconBook,
  IconCurrencyDollar,
  IconArrowsExchange,
  IconCoins,
  IconArrowRight,
  type Icon,
} from "@tabler/icons-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { HelpSearchDialog } from "@/components/help/help-search-dialog";
import { useSearchShortcut } from "@/hooks/use-search-shortcut";
import { getPopularArticles, getCategoryArticleCount } from "@/lib/help-utils";
import { DotPattern } from "@/components/ui/dot-pattern";

// Define help categories with icons and descriptions
interface HelpCategory {
  id: string;
  title: string;
  description: string;
  icon: Icon;
  tags: string[];
  color: string;
}

const HELP_CATEGORIES: HelpCategory[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    description:
      "Basic guides and tutorials to help you get up and running with Badget.",
    icon: IconBook,
    tags: ["tutorial", "basics", "setup"],
    color: "bg-purple-500/10 text-purple-600 border-purple-200",
  },
  {
    id: "budget",
    title: "Budget Management",
    description:
      "Create and manage budgets, set spending limits, and track your financial goals.",
    icon: IconCurrencyDollar,
    tags: ["budget", "planning", "goals"],
    color: "bg-green-500/10 text-green-600 border-green-200",
  },
  {
    id: "transactions",
    title: "Transactions",
    description:
      "Record, categorize, and manage your income and expenses effectively.",
    icon: IconArrowsExchange,
    tags: ["transactions", "expenses", "income"],
    color: "bg-blue-500/10 text-blue-600 border-blue-200",
  },
  {
    id: "assets",
    title: "Assets & Investments",
    description:
      "Track your assets, investments, and build comprehensive financial reports.",
    icon: IconCoins,
    tags: ["assets", "investments", "reports"],
    color: "bg-orange-500/10 text-orange-600 border-orange-200",
  },
];

// Functions moved to @/lib/help-utils for better organization

export default function HelpPage() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const popularArticles = getPopularArticles();

  // Handle keyboard shortcuts
  useSearchShortcut({
    onOpenSearch: () => setIsSearchOpen(true),
  });

  return (
    <>
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight mb-6">
              👋 How can we help today?
            </h1>

            {/* Search Bar */}
            <div className="relative max-w-lg mx-auto">
              <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="search"
                placeholder="Search for articles..."
                className="pl-10 cursor-pointer h-12 text-base"
                readOnly
                onClick={() => setIsSearchOpen(true)}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <kbd className="px-2 py-1 bg-muted border rounded text-xs text-muted-foreground">
                  ⌘H
                </kbd>
              </div>
            </div>
          </div>

          {/* Popular Articles */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">Popular Articles</h2>
            <div className="grid gap-1 md:grid-cols-2">
              {popularArticles.map((article) => (
                <Link
                  key={article.slug}
                  href={`/help/${article.slug}`}
                  className="flex items-center justify-between p-4 rounded-lg border hover:border-border hover:bg-muted/50 transition-all duration-200 group"
                >
                  <span className="text-foreground group-hover:text-primary transition-colors">
                    {article.title}
                  </span>
                  <IconArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </Link>
              ))}
            </div>
          </section>
        </div>

        {/* Wider layout for categories and actions */}
        <div className="max-w-6xl mx-auto">
          {/* Category Cards */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-8 text-center">
              Browse by Category
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {HELP_CATEGORIES.map((category) => {
                const Icon = category.icon;
                const articleCount = getCategoryArticleCount(category.tags);

                // Only show categories that have articles
                if (articleCount === 0) return null;

                return (
                  <Link
                    key={category.id}
                    href={`/help/category/${category.tags[0]}`}
                  >
                    <Card className="h-full hover:shadow-lg transition-all duration-200 border hover:border-border group cursor-pointer relative overflow-hidden bg-transparent">
                      {/* Dot Pattern Background */}
                      <DotPattern
                        className="opacity-30"
                        width={20}
                        height={20}
                        cx={1}
                        cy={1}
                        cr={1}
                      />
                      <CardHeader className="pb-4 relative z-10">
                        <div className="flex items-start gap-4">
                          <div
                            className={`p-3 rounded-lg ${category.color} group-hover:scale-110 transition-transform duration-200`}
                          >
                            <Icon className="w-6 h-6" />
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                              {category.title}
                            </CardTitle>
                            <Badge variant="secondary" className="text-xs">
                              {articleCount}{" "}
                              {articleCount === 1 ? "article" : "articles"}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0 relative z-10">
                        <CardDescription className="text-base leading-relaxed">
                          {category.description}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* Quick Actions */}
          <section className="border-t border-border pt-12">
            <h2 className="text-2xl font-semibold mb-6">Quick Actions</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Link
                href="/help/getting-started"
                className="p-6 border border-border rounded-lg hover:border-border/80 hover:shadow-md transition-all duration-200 text-center group"
              >
                <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <IconBook className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                  Getting Started
                </h3>
                <p className="text-sm text-muted-foreground">
                  Learn the basics
                </p>
              </Link>

              <Link
                href="/help/budget-management"
                className="p-6 border border-border rounded-lg hover:border-border/80 hover:shadow-md transition-all duration-200 text-center group"
              >
                <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <IconCurrencyDollar className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                  Budget Management
                </h3>
                <p className="text-sm text-muted-foreground">
                  Create and manage budgets
                </p>
              </Link>

              <Link
                href="/help/transactions"
                className="p-6 border border-border rounded-lg hover:border-border/80 hover:shadow-md transition-all duration-200 text-center group"
              >
                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <IconArrowsExchange className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                  Transactions
                </h3>
                <p className="text-sm text-muted-foreground">
                  Manage income & expenses
                </p>
              </Link>

              <Link
                href="/contact"
                className="p-6 border border-border rounded-lg hover:border-border/80 hover:shadow-md transition-all duration-200 text-center group"
              >
                <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <IconHelp className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                  Contact Support
                </h3>
                <p className="text-sm text-muted-foreground">
                  Get help from our team
                </p>
              </Link>
            </div>
          </section>
        </div>
      </div>

      {/* Search Dialog */}
      <HelpSearchDialog open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </>
  );
}
