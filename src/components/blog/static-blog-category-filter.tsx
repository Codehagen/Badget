import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { allBlogs } from "content-collections";
import { cn } from "@/lib/utils";

// Get categories with post counts
function getCategoriesWithCounts() {
  const categoryMap = new Map<string, number>();
  
  allBlogs.forEach((post) => {
    if (post.tags) {
      post.tags.forEach((tag) => {
        const normalizedTag = tag.toLowerCase();
        categoryMap.set(normalizedTag, (categoryMap.get(normalizedTag) || 0) + 1);
      });
    }
  });

  // Convert to array and sort by count (descending)
  return Array.from(categoryMap.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);
}

export function StaticBlogCategoryFilter() {
  const categoriesWithCounts = getCategoriesWithCounts().slice(0, 3); // Limit to top 3 categories
  const totalPosts = allBlogs.length;

  return (
    <div className="flex flex-wrap gap-2 mb-8">
      {/* All Posts */}
      <Link href="/blog">
        <div
          className={cn(
            "relative transition-all duration-200 ease-in-out",
            "hover:scale-105 focus:outline-none"
          )}
        >
          <Badge
            variant="secondary"
            className={cn(
              "px-4 py-2 text-sm font-medium cursor-pointer transition-all duration-200",
              "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            )}
          >
            All
            <span className="ml-1.5 text-xs opacity-75">
              {totalPosts}
            </span>
          </Badge>
        </div>
      </Link>

      {/* Category Links */}
      {categoriesWithCounts.map(({ category, count }) => (
        <Link key={category} href={`/blog/category/${category}`}>
          <div
            className={cn(
              "relative transition-all duration-200 ease-in-out",
              "hover:scale-105 focus:outline-none"
            )}
          >
            <Badge
              variant="secondary"
              className={cn(
                "px-4 py-2 text-sm font-medium cursor-pointer transition-all duration-200",
                "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              )}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
              <span className="ml-1.5 text-xs opacity-75">
                {count}
              </span>
            </Badge>
          </div>
        </Link>
      ))}
    </div>
  );
}