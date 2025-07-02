"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import BlurImage from "@/lib/blur-image";
import { allBlogs } from "content-collections";

interface RelatedPostsProps {
  currentSlug: string;
  currentTags?: string[];
  currentAuthor?: string;
  manualRelated?: string[];
  limit?: number;
}

export function RelatedPosts({
  currentSlug,
  currentTags = [],
  currentAuthor,
  manualRelated = [],
  limit = 4,
}: RelatedPostsProps) {
  // Find related posts using multiple strategies
  const getRelatedPosts = () => {
    const otherPosts = allBlogs.filter((post) => post.slug !== currentSlug);

    // Strategy 1: Manual curation (highest priority)
    const manualPosts = manualRelated
      .map((slug) => otherPosts.find((post) => post.slug === slug))
      .filter(Boolean);

    // Strategy 2: Same tags
    const tagMatches = otherPosts
      .filter((post) => post.tags?.some((tag) => currentTags.includes(tag)))
      .filter((post) => !manualRelated.includes(post.slug))
      .sort((a, b) => {
        // Sort by number of matching tags
        const aMatches =
          a.tags?.filter((tag) => currentTags.includes(tag)).length || 0;
        const bMatches =
          b.tags?.filter((tag) => currentTags.includes(tag)).length || 0;
        return bMatches - aMatches;
      });

    // Strategy 3: Same author
    const authorMatches = otherPosts
      .filter((post) => post.author === currentAuthor && post.author)
      .filter((post) => !manualRelated.includes(post.slug))
      .filter((post) => !tagMatches.includes(post));

    // Strategy 4: Recent posts fallback
    const recentPosts = otherPosts
      .filter((post) => !manualRelated.includes(post.slug))
      .filter((post) => !tagMatches.includes(post))
      .filter((post) => !authorMatches.includes(post))
      .sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );

    // Combine strategies
    const combined = [
      ...manualPosts,
      ...tagMatches.slice(0, limit - manualPosts.length),
      ...authorMatches.slice(0, limit - manualPosts.length - tagMatches.length),
      ...recentPosts.slice(
        0,
        limit - manualPosts.length - tagMatches.length - authorMatches.length
      ),
    ];

    return combined.slice(0, limit);
  };

  const relatedPosts = getRelatedPosts();

  if (relatedPosts.length === 0) {
    return null;
  }

  return (
    <section className="mt-16 pt-12 border-t border-border">
      <h2 className="text-2xl font-bold mb-8">Read more</h2>
      <div className="grid gap-6">
        {relatedPosts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group flex gap-6 p-6 rounded-lg border border-border hover:border-border/80 transition-all duration-200 hover:shadow-sm"
          >
            {/* Article Image */}
            <div className="relative w-32 h-24 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
              <BlurImage
                src={
                  post.image ||
                  `/api/og?title=${encodeURIComponent(post.title)}`
                }
                alt={post.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="128px"
              />
            </div>

            {/* Article Content */}
            <div className="flex-1 min-w-0">
              {/* Category and Date */}
              <div className="flex items-center gap-3 mb-3">
                {post.tags && post.tags.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {post.tags[0]}
                  </Badge>
                )}
                <time
                  dateTime={post.publishedAt}
                  className="text-xs text-muted-foreground"
                >
                  {format(new Date(post.publishedAt), "MMM d, yyyy")}
                </time>
              </div>

              {/* Title */}
              <h3 className="font-semibold text-lg leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">
                {post.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {post.description}
              </p>

              {/* Author */}
              {post.author && (
                <div className="mt-3 text-xs text-muted-foreground">
                  By {post.author}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
