import { allHelps } from "../../../.content-collections/generated";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Search } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { formatDistanceToNow } from "date-fns";

export default function HelpPage() {
  // Sort help articles by publishedAt date, newest first
  const sortedHelp = allHelps.sort(
    (a: any, b: any) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  // Group help articles by tags
  const helpByTag = sortedHelp.reduce((acc: any, article: any) => {
    if (article.tags) {
      article.tags.forEach((tag: string) => {
        if (!acc[tag]) {
          acc[tag] = [];
        }
        acc[tag].push(article);
      });
    }
    return acc;
  }, {});

  const popularTags = Object.keys(helpByTag).sort((a, b) => helpByTag[b].length - helpByTag[a].length);

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Help Center</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Find answers to common questions and learn how to get the most out of Badget.
          </p>
          
          {/* Search Bar */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="search"
              placeholder="Search documentation..."
              className="pl-10"
            />
          </div>
        </div>

        {/* Popular Categories */}
        {popularTags.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">Popular Categories</h2>
            <div className="flex flex-wrap gap-2">
              {popularTags.slice(0, 8).map((tag: string) => (
                <Badge key={tag} variant="outline" className="text-sm py-1 px-3">
                  {tag} ({helpByTag[tag].length})
                </Badge>
              ))}
            </div>
          </section>
        )}

        {/* Help Articles */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">All Documentation</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sortedHelp.map((article: any) => (
              <Link key={article.slug} href={`/help/${article.slug}`}>
                <Card className="h-full hover:shadow-lg transition-shadow duration-200 border-border/50 hover:border-border">
                  <CardHeader>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <time dateTime={article.publishedAt}>
                          {formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}
                        </time>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{article.readingTime}</span>
                      </div>
                    </div>
                    
                    <CardTitle className="text-lg font-semibold leading-tight hover:text-primary transition-colors">
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
                        {article.tags.slice(0, 3).map((tag: string) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
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
        </section>

        {/* Empty State */}
        {sortedHelp.length === 0 && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-2">No documentation yet</h2>
            <p className="text-muted-foreground">
              We're working on comprehensive documentation. Check back soon!
            </p>
          </div>
        )}

        {/* Quick Links */}
        <section className="mt-16 pt-12 border-t border-border">
          <h2 className="text-2xl font-semibold mb-6">Quick Links</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Link 
              href="/help/api-reference" 
              className="p-4 border border-border rounded-lg hover:border-border/80 transition-colors text-center"
            >
              <h3 className="font-semibold mb-2">API Reference</h3>
              <p className="text-sm text-muted-foreground">Complete API documentation</p>
            </Link>
            <Link 
              href="/help/custom-domains" 
              className="p-4 border border-border rounded-lg hover:border-border/80 transition-colors text-center"
            >
              <h3 className="font-semibold mb-2">Custom Domains</h3>
              <p className="text-sm text-muted-foreground">Set up branded domains</p>
            </Link>
            <Link 
              href="/blog/getting-started" 
              className="p-4 border border-border rounded-lg hover:border-border/80 transition-colors text-center"
            >
              <h3 className="font-semibold mb-2">Getting Started</h3>
              <p className="text-sm text-muted-foreground">Learn the basics</p>
            </Link>
            <Link 
              href="/contact" 
              className="p-4 border border-border rounded-lg hover:border-border/80 transition-colors text-center"
            >
              <h3 className="font-semibold mb-2">Contact Support</h3>
              <p className="text-sm text-muted-foreground">Get help from our team</p>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}