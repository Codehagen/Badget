import { allHelps } from "../../../../.content-collections/generated";
import { notFound } from "next/navigation";
import { MDXContent } from "@content-collections/mdx/react";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, ArrowLeft, Edit } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { TableOfContents } from "@/components/table-of-contents";
import { mdxComponents } from "@/components/mdx/mdx-components";

export async function generateStaticParams() {
  return allHelps.map((article: any) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const article = allHelps.find((article: any) => article.slug === params.slug);
  
  if (!article) {
    return {
      title: "Help article not found",
    };
  }

  return {
    title: `${article.title} - Help Center`,
    description: article.description,
    openGraph: {
      title: article.title,
      description: article.description,
      type: "article",
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
    },
    twitter: {
      card: "summary",
      title: article.title,
      description: article.description,
    },
  };
}

export default function HelpArticle({ params }: { params: { slug: string } }) {
  const article = allHelps.find((article: any) => article.slug === params.slug);

  if (!article) {
    notFound();
  }

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="p-0 h-auto">
            <Link href="/help" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4" />
              Back to Help Center
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
                  <time dateTime={article.publishedAt}>
                    Published {formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}
                  </time>
                </div>
                {article.updatedAt && (
                  <div className="flex items-center gap-1">
                    <Edit className="w-4 h-4" />
                    <time dateTime={article.updatedAt}>
                      Updated {formatDistanceToNow(new Date(article.updatedAt), { addSuffix: true })}
                    </time>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{article.readingTime}</span>
                </div>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                {article.title}
              </h1>

              <p className="text-xl text-muted-foreground leading-relaxed mb-6">
                {article.description}
              </p>

              {article.tags && article.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag: string) => (
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
                               prose-td:border-border prose-th:border-border
                               prose-li:text-muted-foreground
                               prose-ul:text-muted-foreground prose-ol:text-muted-foreground">
              <MDXContent code={article.mdx} components={mdxComponents} />
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

        {/* Related Articles */}
        {article.related && article.related.length > 0 && (
          <section className="mt-16 pt-12 border-t border-border">
            <h2 className="text-2xl font-bold mb-6">Related Documentation</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {article.related.map((relatedSlug: string) => {
                const relatedArticle = allHelps.find((a: any) => a.slug === relatedSlug);
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
                          <Badge key={tag} variant="outline" className="text-xs">
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

        {/* Feedback Section */}
        <section className="mt-16 pt-12 border-t border-border">
          <div className="bg-muted/50 rounded-lg p-8 text-center">
            <h3 className="text-xl font-semibold mb-4">Was this helpful?</h3>
            <p className="text-muted-foreground mb-6">
              Let us know if you found this documentation useful or if you need additional help.
            </p>
            <div className="flex justify-center gap-4">
              <Button variant="outline">
                👍 Yes, helpful
              </Button>
              <Button variant="outline">
                👎 Needs improvement
              </Button>
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