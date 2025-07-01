import { allBlogs } from "../../../../.content-collections/generated";
import { notFound } from "next/navigation";
import { MDXContent } from "@content-collections/mdx/react";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { TableOfContents } from "@/components/table-of-contents";
import { mdxComponents } from "@/components/mdx/mdx-components";

export async function generateStaticParams() {
  return allBlogs.map((post: any) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = allBlogs.find((post: any) => post.slug === params.slug);
  
  if (!post) {
    return {
      title: "Post not found",
    };
  }

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.publishedAt,
      authors: post.author ? [post.author] : undefined,
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

export default function BlogPost({ params }: { params: { slug: string } }) {
  const post = allBlogs.find((post: any) => post.slug === params.slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="p-0 h-auto">
            <Link href="/blog" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </Link>
          </Button>
        </div>

        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-8">
            {/* Article Header */}
            <header className="mb-12">
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
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

              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                {post.title}
              </h1>

              <p className="text-xl text-muted-foreground leading-relaxed mb-6">
                {post.description}
              </p>

              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag: string) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </header>

            {/* Article Content */}
            <article className="prose prose-gray dark:prose-invert max-w-none
                               prose-headings:font-bold prose-headings:tracking-tight
                               prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
                               prose-p:leading-relaxed prose-p:text-muted-foreground
                               prose-strong:text-foreground prose-strong:font-semibold
                               prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                               prose-blockquote:border-l-primary prose-blockquote:bg-muted/50 prose-blockquote:py-2 prose-blockquote:px-4
                               prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-code:text-sm
                               prose-pre:bg-muted prose-pre:border prose-pre:rounded-lg
                               prose-img:rounded-lg prose-img:border
                               prose-hr:border-border
                               prose-table:border prose-table:rounded-lg
                               prose-th:bg-muted prose-th:font-semibold
                               prose-td:border-border prose-th:border-border">
              <MDXContent code={post.mdx} components={mdxComponents} />
            </article>
          </div>

          {/* Sidebar with Table of Contents */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-24">
              {/* Mobile Table of Contents */}
              <div className="lg:hidden mb-8 bg-muted/30 rounded-lg p-4 border border-border">
                <TableOfContents />
              </div>
              
              {/* Desktop Table of Contents */}
              <div className="hidden lg:block bg-muted/30 rounded-lg p-6 border border-border">
                <TableOfContents />
              </div>
            </div>
          </div>
        </div>

        {/* Related Posts */}
        {post.related && post.related.length > 0 && (
          <section className="mt-16 pt-12 border-t border-border">
            <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {post.related.map((relatedSlug: string) => {
                const relatedPost = allBlogs.find((p: any) => p.slug === relatedSlug);
                if (!relatedPost) return null;
                
                return (
                  <Link
                    key={relatedSlug}
                    href={`/blog/${relatedPost.slug}`}
                    className="block p-6 border border-border rounded-lg hover:border-border/80 transition-colors"
                  >
                    <h3 className="font-semibold mb-2 line-clamp-2">
                      {relatedPost.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {relatedPost.description}
                    </p>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}