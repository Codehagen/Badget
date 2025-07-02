import { allHelps } from "content-collections";
import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, ArrowLeft, Edit } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { constructMetadata } from "@/lib/construct-metadata";

// Get all unique categories from help articles
function getAllHelpCategories() {
  const categories = new Set<string>();
  allHelps.forEach((article) => {
    if (article.tags) {
      article.tags.forEach((tag) => categories.add(tag.toLowerCase()));
    }
  });
  return Array.from(categories);
}

// Get help articles by category
function getHelpArticlesByCategory(category: string) {
  return allHelps.filter((article) => {
    if (!article.tags) return false;
    return article.tags.some((tag) => tag.toLowerCase() === category.toLowerCase());
  });
}

export async function generateStaticParams() {
  const categories = getAllHelpCategories();
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
  const articles = getHelpArticlesByCategory(category);

  if (articles.length === 0) {
    return constructMetadata({
      title: "Category not found",
      description: "The requested help category could not be found.",
      noIndex: true,
    });
  }

  return constructMetadata({
    title: `${categoryDisplay} - Help Center`,
    description: `Browse all ${categoryDisplay.toLowerCase()} documentation and guides from the Badget team.`,
  });
}

export default async function HelpCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const articles = getHelpArticlesByCategory(category);

  if (articles.length === 0) {
    notFound();
  }

  // Sort articles by publishedAt date, newest first
  const sortedArticles = articles.sort(
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
              href="/help"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Help Center
            </Link>
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            {categoryDisplay}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Browse all {categoryDisplay.toLowerCase()} documentation and guides from the Badget team.
          </p>
          <div className="mt-4">
            <Badge variant="secondary" className="text-sm px-3 py-1">
              {sortedArticles.length} {sortedArticles.length === 1 ? 'article' : 'articles'}
            </Badge>
          </div>
        </div>

        {/* Help Articles Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sortedArticles.map((article) => (
            <Link key={article.slug} href={`/help/${article.slug}`}>
              <Card className="h-full hover:shadow-lg transition-shadow duration-200 border-border/50 hover:border-border group">
                <CardHeader>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <time dateTime={article.publishedAt}>
                        {formatDistanceToNow(new Date(article.publishedAt), {
                          addSuffix: true,
                        })}
                      </time>
                    </div>
                    {article.updatedAt && (
                      <div className="flex items-center gap-1">
                        <Edit className="w-3 h-3" />
                        <span>Updated</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{article.readingTime}</span>
                    </div>
                  </div>

                  <CardTitle className="text-lg font-semibold leading-tight group-hover:text-primary transition-colors">
                    {article.title}
                  </CardTitle>

                  <CardDescription className="text-sm leading-relaxed">
                    {article.description}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  {article.summary && (
                    <p className="text-muted-foreground text-sm mb-4 leading-relaxed line-clamp-3">
                      {article.summary}
                    </p>
                  )}

                  {article.tags && article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {article.tags.slice(0, 3).map((tag) => (
                        <Badge
                          key={tag}
                          variant={tag.toLowerCase() === category.toLowerCase() ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                      {article.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{article.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}