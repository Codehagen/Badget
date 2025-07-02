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

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sortedPosts.map((post, index) => (
            <div key={post.slug} className="relative">
              {/* Decorative borders for grid items */}
              <div className="absolute inset-0 -z-10">
                {/* Top border */}
                <div className="absolute top-0 left-0 w-full h-px bg-border" />
                {/* Left border */}
                <div className="absolute top-0 left-0 w-px h-full bg-border" />
                {/* Only show right border on last item of row */}
                {((index + 1) % 3 === 0 ||
                  index === sortedPosts.length - 1) && (
                  <div className="absolute top-0 right-0 w-px h-full bg-border" />
                )}
                {/* Bottom border on last row */}
                {index >=
                  sortedPosts.length - (sortedPosts.length % 3 || 3) && (
                  <div className="absolute bottom-0 left-0 w-full h-px bg-border" />
                )}
              </div>

              <Link href={`/blog/${post.slug}`} className="block h-full">
                <Card className="h-full border-0 shadow-none bg-transparent hover:bg-muted/30 transition-[color,background-color] group">
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

                  <CardHeader className="px-6 pb-4">
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
                    <CardDescription className="text-sm leading-relaxed line-clamp-3">
                      {post.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="px-6 pt-0">
                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {post.tags.slice(0, 3).map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
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
                    {post.author && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <User className="w-3 h-3" />
                        <span>{post.author}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {sortedPosts.length === 0 && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-2">No blog posts yet</h2>
            <p className="text-muted-foreground">
              Check back soon for insights and tutorials from the Badget team.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
