import { allBlogs } from "content-collections";
import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import BlurImage from "@/lib/blur-image";
import { Button } from "@/components/ui/button";
import { constructMetadata } from "@/lib/construct-metadata";

// Get all unique categories from blog posts
function getAllCategories() {
  const categories = new Set<string>();
  allBlogs.forEach((post) => {
    if (post.tags) {
      post.tags.forEach((tag) => categories.add(tag.toLowerCase()));
    }
  });
  return Array.from(categories);
}

// Get posts by category
function getPostsByCategory(category: string) {
  return allBlogs.filter((post) => {
    if (!post.tags) return false;
    return post.tags.some((tag) => tag.toLowerCase() === category.toLowerCase());
  });
}

export async function generateStaticParams() {
  const categories = getAllCategories();
  return categories.map((category) => ({
    category: category,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const categoryDisplay = category.charAt(0).toUpperCase() + category.slice(1);
  const posts = getPostsByCategory(category);

  if (posts.length === 0) {
    return constructMetadata({
      title: "Category not found",
      description: "The requested category could not be found.",
      noIndex: true,
    });
  }

  return constructMetadata({
    title: `${categoryDisplay} - Blog`,
    description: `Browse all ${categoryDisplay.toLowerCase()} articles and tutorials from the Badget team.`,
  });
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const posts = getPostsByCategory(category);

  if (posts.length === 0) {
    notFound();
  }

  // Sort posts by publishedAt date, newest first
  const sortedPosts = posts.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  const categoryDisplay = category.charAt(0).toUpperCase() + category.slice(1);

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="p-0 h-auto">
            <Link
              href="/blog"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </Link>
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            {categoryDisplay}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Browse all {categoryDisplay.toLowerCase()} articles and tutorials from the Badget team.
          </p>
          <div className="mt-4">
            <Badge variant="secondary" className="text-sm px-3 py-1">
              {sortedPosts.length} {sortedPosts.length === 1 ? 'article' : 'articles'}
            </Badge>
          </div>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedPosts.map((post) => (
            <div
              key={post.slug}
              className="relative border border-border rounded-lg p-1"
            >
              <Link href={`/blog/${post.slug}`} className="block h-full">
                <Card className="h-full border-0 shadow-none bg-transparent hover:bg-muted/30 transition-[color,background-color] group flex flex-col">
                  {/* Blog Post Image */}
                  <div className="relative aspect-[16/10] overflow-hidden rounded-lg mb-6">
                    <BlurImage
                      src={
                        post.image ||
                        `/api/og?title=${encodeURIComponent(post.title)}`
                      }
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>

                  <CardHeader className="px-6 pb-4 flex-1">
                    {/* Meta information */}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <time dateTime={post.publishedAt}>
                          {formatDistanceToNow(new Date(post.publishedAt), {
                            addSuffix: true,
                          })}
                        </time>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{post.readingTime}</span>
                      </div>
                    </div>

                    {/* Title */}
                    <CardTitle className="text-xl font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2 mb-3">
                      {post.title}
                    </CardTitle>

                    {/* Description */}
                    <CardDescription className="text-sm leading-relaxed line-clamp-3 flex-1">
                      {post.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="px-6 pt-0 mt-auto">
                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {post.tags.slice(0, 3).map((tag) => (
                          <Badge
                            key={tag}
                            variant={tag.toLowerCase() === category.toLowerCase() ? "default" : "secondary"}
                            className="text-xs px-2 py-0.5"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {post.tags.length > 3 && (
                          <Badge
                            variant="outline"
                            className="text-xs px-2 py-0.5"
                          >
                            +{post.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Author */}
                    {(post.authorData?.name || post.author) && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <User className="w-3 h-3" />
                        <span>{post.authorData?.name || post.author}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}