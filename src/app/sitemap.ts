import type { MetadataRoute } from "next";
import { allBlogs, allHelps } from "content-collections";
import { HOME_DOMAIN } from "@/lib/construct-metadata";

// Get all unique categories from blog posts
function getAllCategories() {
  const categories = new Set<string>();
  allBlogs.forEach((post) => {
    if (post.tags) {
      post.tags.forEach((tag) => categories.add(tag.toLowerCase()));
    }
  });
  return Array.from(categories);
}

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

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrls: MetadataRoute.Sitemap = [
    {
      url: HOME_DOMAIN,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${HOME_DOMAIN}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${HOME_DOMAIN}/help`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${HOME_DOMAIN}/pricing`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${HOME_DOMAIN}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${HOME_DOMAIN}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  // Add blog posts
  const blogUrls: MetadataRoute.Sitemap = allBlogs.map((post) => ({
    url: `${HOME_DOMAIN}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  // Add blog categories
  const categoryUrls: MetadataRoute.Sitemap = getAllCategories().map((category) => ({
    url: `${HOME_DOMAIN}/blog/category/${category}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  // Add help categories
  const helpCategoryUrls: MetadataRoute.Sitemap = getAllHelpCategories().map((category) => ({
    url: `${HOME_DOMAIN}/help/category/${category}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  // Add help articles
  const helpUrls: MetadataRoute.Sitemap = allHelps.map((article) => ({
    url: `${HOME_DOMAIN}/help/${article.slug}`,
    lastModified: article.updatedAt ? new Date(article.updatedAt) : new Date(article.publishedAt),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...baseUrls, ...blogUrls, ...categoryUrls, ...helpCategoryUrls, ...helpUrls];
}