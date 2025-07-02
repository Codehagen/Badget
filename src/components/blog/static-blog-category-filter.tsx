import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { allBlogs } from "content-collections";

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
  const categoriesWithCounts = getCategoriesWithCounts();
  const totalPosts = allBlogs.length;

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {/* All Posts */}
      <Link href="/blog">
        <Badge 
          variant="outline" 
          className="px-3 py-1 hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
        >
          All ({totalPosts})
        </Badge>
      </Link>

      {/* Category Links */}
      {categoriesWithCounts.map(({ category, count }) => (
        <Link key={category} href={`/blog/category/${category}`}>
          <Badge 
            variant="outline" 
            className="px-3 py-1 hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
          >
            {category.charAt(0).toUpperCase() + category.slice(1)} ({count})
          </Badge>
        </Link>
      ))}
    </div>
  );
}