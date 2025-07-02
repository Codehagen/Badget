import { allHelps } from "content-collections";
import { notFound } from "next/navigation";
import { MDXContent } from "@content-collections/mdx/react";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, ArrowLeft, Edit } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow, format } from "date-fns";
import { EnhancedTableOfContents } from "@/components/blog/enhanced-table-of-contents";
import { mdxComponents } from "@/components/mdx/mdx-components";
import { constructMetadata } from "@/lib/construct-metadata";

export async function generateStaticParams() {
  return allHelps.map((article: any) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = allHelps.find((article: any) => article.slug === slug);

  if (!article) {
    return constructMetadata({
      title: "Help article not found",
      description: "The requested help article could not be found.",
      noIndex: true,
    });
  }

  return constructMetadata({
    title: `${article.title} - Help Center`,
    description: article.description,
  });
}

export default async function HelpArticle({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = allHelps.find((article: any) => article.slug === slug);

  if (!article) {
    notFound();
  }

  return (
    <div className="container mx-auto py-12">
      <div className="max-w-7xl mx-auto px-8 lg:px-12">
        {/* Back Button */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="p-0 h-auto">
            <Link
              href="/help"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Help Center
            </Link>
          </Button>
        </div>

        {/* Full Width Header */}
        <header className="mb-16">
          {/* Category and Date */}
          <div className="flex items-center gap-3 mb-6">
            {article.tags && article.tags.length > 0 && (
              <Badge variant="secondary" className="px-3 py-1">
                {article.tags[0]}
              </Badge>
            )}
            <time
              dateTime={article.publishedAt}
              className="text-sm text-muted-foreground"
            >
              {format(new Date(article.publishedAt), "MMMM d, yyyy")}
            </time>
            {article.updatedAt && (
              <>
                <span className="text-muted-foreground">•</span>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Edit className="w-3 h-3" />
                  <span>Updated {format(new Date(article.updatedAt), "MMM d, yyyy")}</span>
                </div>
              </>
            )}
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-8">
            {article.title}
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8 max-w-4xl">
            {article.description}
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
              <MDXContent code={article.mdx} components={mdxComponents} />
            </article>

            {/* Related Articles */}
            {article.related && article.related.length > 0 && (
              <section className="mt-16 pt-12 border-t border-border">
                <h2 className="text-2xl font-bold mb-6">Related Documentation</h2>
                <div className="grid gap-6 md:grid-cols-2">
                  {article.related.map((relatedSlug: string) => {
                    const relatedArticle = allHelps.find(
                      (a: any) => a.slug === relatedSlug
                    );
                    if (!relatedArticle) return null;

                    return (
                      <Link
                        key={relatedSlug}
                        href={`/help/${relatedArticle.slug}`}
                        className="block p-6 border border-border rounded-lg hover:border-border/80 transition-colors"
                      >
                        <h3 className="font-semibold mb-2 line-clamp-2">
                          {relatedArticle.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {relatedArticle.description}
                        </p>
                        {relatedArticle.tags && relatedArticle.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {relatedArticle.tags.slice(0, 3).map((tag: string) => (
                              <Badge
                                key={tag}
                                variant="outline"
                                className="text-xs"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar with Documentation Info and Table of Contents */}
          <div className="lg:col-span-3">
            <div className="lg:sticky lg:top-24">
              {/* Mobile Table of Contents */}
              <div className="lg:hidden mb-8 bg-muted/30 rounded-lg p-4 border border-border">
                <EnhancedTableOfContents />
              </div>

              {/* Desktop Sidebar Content */}
              <div className="hidden lg:block space-y-8 pt-8">
                {/* Documentation Info */}
                <div>
                  <h3 className="font-semibold mb-4 text-sm">Article Info</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{article.readingTime}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>Published {format(new Date(article.publishedAt), "MMM d, yyyy")}</span>
                    </div>
                    {article.updatedAt && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Edit className="w-4 h-4" />
                        <span>Updated {format(new Date(article.updatedAt), "MMM d, yyyy")}</span>
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  {article.tags && article.tags.length > 1 && (
                    <div className="mt-4">
                      <h4 className="text-xs font-medium text-muted-foreground mb-2">TAGS</h4>
                      <div className="flex flex-wrap gap-1">
                        {article.tags.slice(1).map((tag: string) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Table of Contents */}
                <div className="bg-muted/30 rounded-lg p-6 border border-border">
                  <EnhancedTableOfContents />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback Section */}
        <section className="mt-16 pt-12 border-t border-border">
          <div className="bg-muted/50 rounded-lg p-8 text-center">
            <h3 className="text-xl font-semibold mb-4">Was this helpful?</h3>
            <p className="text-muted-foreground mb-6">
              Let us know if you found this documentation useful or if you need
              additional help.
            </p>
            <div className="flex justify-center gap-4">
              <Button variant="outline">👍 Yes, helpful</Button>
              <Button variant="outline">👎 Needs improvement</Button>
              <Button asChild>
                <Link href="/contact">Contact Support</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
