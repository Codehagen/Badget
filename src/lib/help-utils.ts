import { allHelps } from "content-collections";

// Define popular articles configuration
// This can be easily moved to a database or CMS later
export const POPULAR_ARTICLES_CONFIG = {
  // Array of article slugs in order of popularity
  slugs: [
    "getting-started",
    "budget-management",
    "transactions", 
    "assets-investments",
    "troubleshooting",
  ],
  // Maximum number of popular articles to show
  maxCount: 8,
  // Whether to show articles that don't exist in the slugs array
  showOthersIfNeeded: true,
};

/**
 * Get popular articles based on configuration
 * Can be easily extended to fetch from database or CMS
 */
export function getPopularArticles() {
  const { slugs, maxCount, showOthersIfNeeded } = POPULAR_ARTICLES_CONFIG;
  
  // Get articles in the specified order
  const popularArticles = slugs
    .map(slug => allHelps.find(article => article.slug === slug))
    .filter((article): article is NonNullable<typeof article> => Boolean(article));

  // If we need more articles and showOthersIfNeeded is true
  if (showOthersIfNeeded && popularArticles.length < maxCount) {
    const usedSlugs = new Set(popularArticles.map(article => article.slug));
    const remainingArticles = allHelps
      .filter(article => !usedSlugs.has(article.slug))
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()) // Sort by newest first
      .slice(0, maxCount - popularArticles.length);
    
    popularArticles.push(...remainingArticles);
  }

  return popularArticles.slice(0, maxCount);
}

/**
 * Get article count for a category
 */
export function getCategoryArticleCount(categoryTags: string[]) {
  return allHelps.filter((article) => {
    if (!article.tags) return false;
    return article.tags.some((tag) => 
      categoryTags.some((categoryTag) => 
        tag.toLowerCase() === categoryTag.toLowerCase()
      )
    );
  }).length;
}

/**
 * Search articles by query (for future search API)
 */
export function searchArticles(query: string, limit = 10) {
  const lowercaseQuery = query.toLowerCase();
  
  return allHelps
    .filter(article => 
      article.title.toLowerCase().includes(lowercaseQuery) ||
      article.description.toLowerCase().includes(lowercaseQuery) ||
      article.summary?.toLowerCase().includes(lowercaseQuery) ||
      article.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    )
    .sort((a, b) => {
      // Sort by relevance: title matches first, then description, then tags
      const aTitle = a.title.toLowerCase().includes(lowercaseQuery) ? 3 : 0;
      const aDesc = a.description.toLowerCase().includes(lowercaseQuery) ? 2 : 0;
      const aTags = a.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ? 1 : 0;
      const aScore = aTitle + aDesc + aTags;
      
      const bTitle = b.title.toLowerCase().includes(lowercaseQuery) ? 3 : 0;
      const bDesc = b.description.toLowerCase().includes(lowercaseQuery) ? 2 : 0;
      const bTags = b.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ? 1 : 0;
      const bScore = bTitle + bDesc + bTags;
      
      return bScore - aScore;
    })
    .slice(0, limit);
}