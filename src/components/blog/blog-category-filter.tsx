"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface BlogCategory {
  id: string;
  label: string;
  tags: string[];
  count?: number;
}

export const BLOG_CATEGORIES: BlogCategory[] = [
  {
    id: "all",
    label: "All",
    tags: [],
  },
  {
    id: "tutorial",
    label: "Tutorial",
    tags: ["tutorial", "getting-started", "basics"],
  },
  {
    id: "analytics",
    label: "Analytics",
    tags: ["analytics", "optimization", "advanced"],
  },
  {
    id: "company",
    label: "Company",
    tags: ["company", "welcome", "founder"],
  },
];

interface BlogCategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
  categories: BlogCategory[];
}

export function BlogCategoryFilter({
  selectedCategory,
  onCategoryChange,
  categories,
}: BlogCategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-8">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          className={cn(
            "relative transition-all duration-200 ease-in-out",
            "hover:scale-105 focus:outline-none"
          )}
        >
          <Badge
            variant={selectedCategory === category.id ? "default" : "secondary"}
            className={cn(
              "px-4 py-2 text-sm font-medium cursor-pointer transition-all duration-200",
              selectedCategory === category.id
                ? "bg-foreground text-background hover:bg-foreground/90"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            )}
          >
            {category.label}
            {category.count !== undefined && (
              <span className="ml-1.5 text-xs opacity-75">
                {category.count}
              </span>
            )}
          </Badge>
        </button>
      ))}
    </div>
  );
}

// Helper function to determine which category a post belongs to
export function getPostCategory(postTags: string[] = []): string {
  for (const category of BLOG_CATEGORIES.slice(1)) {
    // Skip "all" category
    if (category.tags.some((tag) => postTags.includes(tag))) {
      return category.id;
    }
  }
  return "all";
}

// Helper function to filter posts by category
export function filterPostsByCategory<T extends { tags?: string[] }>(
  posts: T[],
  categoryId: string
): T[] {
  if (categoryId === "all") {
    return posts;
  }

  const category = BLOG_CATEGORIES.find((cat) => cat.id === categoryId);
  if (!category) {
    return posts;
  }

  return posts.filter((post) => {
    const postTags = post.tags || [];
    return category.tags.some((tag) => postTags.includes(tag));
  });
}

// Helper function to get categories with post counts
export function getCategoriesWithCounts<T extends { tags?: string[] }>(
  posts: T[]
): BlogCategory[] {
  return BLOG_CATEGORIES.map((category) => ({
    ...category,
    count:
      category.id === "all"
        ? posts.length
        : filterPostsByCategory(posts, category.id).length,
  }));
}
