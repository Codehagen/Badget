"use client";

import { useState } from "react";
import { allHelps } from "content-collections";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, FileText, Code, Settings, HelpCircle, Book, Zap } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { HelpSearchDialog } from "@/components/help/help-search-dialog";
import { useSearchShortcut } from "@/hooks/use-search-shortcut";

// Define help categories with icons and descriptions
interface HelpCategory {
  id: string;
  title: string;
  description: string;
  icon: any;
  tags: string[];
  color: string;
}

const HELP_CATEGORIES: HelpCategory[] = [
  {
    id: "api",
    title: "API & Developers",
    description: "Complete API reference, SDKs, and developer guides for integrating with Badget.",
    icon: Code,
    tags: ["api", "reference", "developers"],
    color: "bg-blue-500/10 text-blue-600 border-blue-200",
  },
  {
    id: "domains",
    title: "Custom Domains",
    description: "Set up branded domains, SSL certificates, and domain configuration.",
    icon: Settings,
    tags: ["domains", "branding", "setup"],
    color: "bg-green-500/10 text-green-600 border-green-200",
  },
  {
    id: "getting-started",
    title: "Getting Started",
    description: "Basic guides and tutorials to help you get up and running with Badget.",
    icon: Book,
    tags: ["tutorial", "basics", "setup"],
    color: "bg-purple-500/10 text-purple-600 border-purple-200",
  },
  {
    id: "analytics",
    title: "Analytics & Tracking",
    description: "Understanding your link performance, analytics, and tracking features.",
    icon: Zap,
    tags: ["analytics", "tracking", "reports"],
    color: "bg-orange-500/10 text-orange-600 border-orange-200",
  },
];

// Get article count for a category
function getCategoryArticleCount(categoryTags: string[]) {
  return allHelps.filter((article) => {
    if (!article.tags) return false;
    return article.tags.some((tag) => 
      categoryTags.some((categoryTag) => 
        tag.toLowerCase() === categoryTag.toLowerCase()
      )
    );
  }).length;
}

export default function HelpPage() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Handle keyboard shortcuts
  useSearchShortcut({
    onOpenSearch: () => setIsSearchOpen(true),
  });

  return (
    <>
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight mb-4">
              Help Center
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Find answers to common questions and learn how to get the most out
              of Badget.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="search"
                placeholder="Search documentation..."
                className="pl-10 cursor-pointer"
                readOnly
                onClick={() => setIsSearchOpen(true)}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <kbd className="px-2 py-1 bg-muted border rounded text-xs text-muted-foreground">
                  ⌘K
                </kbd>
              </div>
            </div>
          </div>

        {/* Category Cards */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-8 text-center">Browse by Category</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            {HELP_CATEGORIES.map((category) => {
              const Icon = category.icon;
              const articleCount = getCategoryArticleCount(category.tags);
              
              // Only show categories that have articles
              if (articleCount === 0) return null;

              return (
                <Link key={category.id} href={`/help/category/${category.tags[0]}`}>
                  <Card className="h-full hover:shadow-lg transition-all duration-200 border-border/50 hover:border-border group cursor-pointer">
                    <CardHeader className="pb-4">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${category.color} group-hover:scale-110 transition-transform duration-200`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                            {category.title}
                          </CardTitle>
                          <Badge variant="secondary" className="text-xs">
                            {articleCount} {articleCount === 1 ? 'article' : 'articles'}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
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
              href="/help/api-reference"
              className="p-6 border border-border rounded-lg hover:border-border/80 hover:shadow-md transition-all duration-200 text-center group"
            >
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">API Reference</h3>
              <p className="text-sm text-muted-foreground">
                Complete API documentation
              </p>
            </Link>
            
            <Link
              href="/help/custom-domains"
              className="p-6 border border-border rounded-lg hover:border-border/80 hover:shadow-md transition-all duration-200 text-center group"
            >
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Settings className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">Custom Domains</h3>
              <p className="text-sm text-muted-foreground">
                Set up branded domains
              </p>
            </Link>
            
            <Link
              href="/blog/getting-started"
              className="p-6 border border-border rounded-lg hover:border-border/80 hover:shadow-md transition-all duration-200 text-center group"
            >
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Book className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">Getting Started</h3>
              <p className="text-sm text-muted-foreground">Learn the basics</p>
            </Link>
            
            <Link
              href="/contact"
              className="p-6 border border-border rounded-lg hover:border-border/80 hover:shadow-md transition-all duration-200 text-center group"
            >
              <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <HelpCircle className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">Contact Support</h3>
              <p className="text-sm text-muted-foreground">
                Get help from our team
              </p>
            </Link>
          </div>
        </section>
      </div>
    </div>

    {/* Search Dialog */}
    <HelpSearchDialog 
      open={isSearchOpen} 
      onOpenChange={setIsSearchOpen} 
    />
  </>
  );
}
