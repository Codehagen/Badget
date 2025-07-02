import { allBlogs } from "content-collections";
import { notFound } from "next/navigation";
import { MDXContent } from "@content-collections/mdx/react";
import { Badge } from "@/components/ui/badge";
import { Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { EnhancedTableOfContents } from "@/components/blog/enhanced-table-of-contents";
import { mdxComponents } from "@/components/mdx/mdx-components";
import BlurImage from "@/lib/blur-image";
import { RelatedPosts } from "@/components/blog/related-posts";
import { constructMetadata } from "@/lib/construct-metadata";

type BlogPost = (typeof allBlogs)[0];

export async function generateStaticParams() {
  return allBlogs.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = allBlogs.find((post) => post.slug === slug);

  if (!post) {
    return constructMetadata({
      title: "Post not found",
      description: "The requested blog post could not be found.",
      noIndex: true,
    });
  }

  return constructMetadata({
    title: post.title,
    description: post.description,
    image: post.image || `/api/og?title=${encodeURIComponent(post.title)}`,
  });
}

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = allBlogs.find((post) => post.slug === slug);

  if (!post) {
    notFound();
  }

  // Author data is already resolved by content collections
  const authorInfo = post.authorData;

  return (
    <div className="container mx-auto py-12">
      <div className="max-w-7xl mx-auto px-8 lg:px-12">
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

        {/* Full Width Header */}
        <header className="mb-16">
          {/* Category and Date */}
          <div className="flex items-center gap-3 mb-6">
            {post.tags && post.tags.length > 0 && (
              <Link href={`/blog/category/${post.tags[0].toLowerCase()}`}>
                <Badge variant="secondary" className="px-3 py-1 hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer">
                  {post.tags[0]}
                </Badge>
              </Link>
            )}
            <time
              dateTime={post.publishedAt}
              className="text-sm text-muted-foreground"
            >
              {format(new Date(post.publishedAt), "MMMM d, yyyy")}
            </time>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-8">
            {post.title}
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8 max-w-4xl">
            {post.description}
          </p>
        </header>

        <div className="lg:grid lg:grid-cols-12 lg:gap-16">
          {/* Main Content */}
          <div className="lg:col-span-9">
            {/* Article Content */}
            <article
              className="prose prose-gray dark:prose-invert prose-lg max-w-none
                               prose-headings:font-bold prose-headings:tracking-tight
                               prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
                               prose-p:leading-relaxed prose-p:text-foreground/90
                               prose-strong:text-foreground prose-strong:font-semibold
                               prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                               prose-blockquote:border-l-primary prose-blockquote:bg-muted/50 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r
                               prose-code:bg-muted prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:font-mono prose-code:text-sm
                               prose-pre:bg-muted prose-pre:border prose-pre:rounded-lg prose-pre:p-4
                               prose-img:rounded-lg prose-img:border prose-img:shadow-sm
                               prose-hr:border-border prose-hr:my-8
                               prose-table:border prose-table:rounded-lg
                               prose-th:bg-muted prose-th:font-semibold prose-th:p-3
                               prose-td:border-border prose-th:border-border prose-td:p-3
                               prose-ul:my-6 prose-ol:my-6
                               prose-li:my-2"
            >
              <MDXContent code={post.mdx} components={mdxComponents} />
            </article>

            {/* Related Posts */}
            <RelatedPosts
              currentSlug={post.slug}
              currentTags={post.tags}
              currentAuthor={post.author}
              manualRelated={post.related}
              limit={4}
            />
          </div>

          {/* Sidebar with Author Info and Table of Contents */}
          <div className="lg:col-span-3">
            <div className="lg:sticky lg:top-24">
              {/* Mobile Table of Contents */}
              <div className="lg:hidden mb-8 bg-muted/30 rounded-lg p-4 border border-border">
                <EnhancedTableOfContents />
              </div>

              {/* Desktop Sidebar Content */}
              <div className="hidden lg:block space-y-8 pt-8">
                {/* Author Info */}
                {authorInfo && (
                  <div>
                    <h3 className="font-semibold mb-4 text-sm">Written by</h3>
                    <div className="flex items-start gap-3 mb-6">
                      <div className="relative w-12 h-12 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                        {authorInfo.image ? (
                          <BlurImage
                            src={authorInfo.image}
                            alt={authorInfo.name}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        ) : (
                          <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                            {authorInfo.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">
                          {authorInfo.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {authorInfo.displayTitle}
                        </div>
                      </div>
                    </div>

                    {/* Reading Time */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{post.readingTime}</span>
                    </div>
                  </div>
                )}

                {/* Table of Contents */}
                <div className="bg-muted/30 rounded-lg p-6 border border-border">
                  <EnhancedTableOfContents />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
