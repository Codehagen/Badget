import { allBlogs } from "content-collections";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import BlurImage from "@/lib/blur-image";
import { StaticBlogCategoryFilter } from "@/components/blog/static-blog-category-filter";
import { constructMetadata } from "@/lib/construct-metadata";

export const metadata = constructMetadata({
  title: "Blog - Badget",
  description: "Insights, tutorials, and updates from the Badget team. Learn how to optimize your link management strategy.",
});

export default function BlogPage() {
  // Sort blog posts by publishedAt date, newest first
  const sortedPosts = allBlogs.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Blog</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Insights, tutorials, and updates from the Badget team. Learn how to
            optimize your link management strategy.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex justify-center mb-12">
          <StaticBlogCategoryFilter />
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
                          <Link key={tag} href={`/blog/category/${tag.toLowerCase()}`}>
                            <Badge
                              variant="secondary"
                              className="text-xs px-2 py-0.5 hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
                            >
                              {tag}
                            </Badge>
                          </Link>
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

        {/* Total posts indicator */}
        {sortedPosts.length > 0 && (
          <div className="text-center mt-12 text-sm text-muted-foreground">
            {sortedPosts.length} {sortedPosts.length === 1 ? 'post' : 'posts'} published
          </div>
        )}
      </div>
    </div>
  );
}
