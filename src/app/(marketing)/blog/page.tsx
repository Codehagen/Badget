import { allBlogs } from "../../../.content-collections/generated";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default function BlogPage() {
  // Sort blog posts by publishedAt date, newest first
  const sortedPosts = allBlogs.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Blog</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Insights, tutorials, and updates from the Badget team. Learn how to optimize your link management strategy.
          </p>
        </div>

        {/* Blog Posts Grid */}
        <div className="space-y-8">
          {sortedPosts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`}>
              <Card className="hover:shadow-lg transition-shadow duration-200 border-border/50 hover:border-border">
                <CardHeader>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <time dateTime={post.publishedAt}>
                        {formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true })}
                      </time>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{post.readingTime}</span>
                    </div>
                    {post.author && (
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{post.author}</span>
                      </div>
                    )}
                  </div>
                  
                  <CardTitle className="text-2xl font-bold leading-tight hover:text-primary transition-colors">
                    {post.title}
                  </CardTitle>
                  
                  <CardDescription className="text-base leading-relaxed">
                    {post.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  {post.summary && (
                    <p className="text-muted-foreground mb-4 leading-relaxed">
                      {post.summary}
                    </p>
                  )}
                  
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
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