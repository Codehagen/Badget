// content-collections.ts
import { defineCollection, defineConfig } from "@content-collections/core";
import { compileMDX } from "@content-collections/mdx";
import { z } from "zod";
import readingTime from "reading-time";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";

// src/data/authors.ts
var authors = {
  christerhagen: {
    id: "christerhagen",
    name: "Christer Hagen",
    defaultTitle: "Founder & CEO",
    image: "/avatars/christer.jpg",
    bio: "Founder of Badget, passionate about building tools that help people manage their digital life more effectively.",
    twitter: "christerhagen",
    linkedin: "christerhagen"
  },
  "badget-team": {
    id: "badget-team",
    name: "Badget Team",
    defaultTitle: "Product Team",
    image: "/avatars/team.jpg",
    bio: "The official Badget team account. Building the future of link management with AI-powered insights.",
    twitter: "badgetapp"
  },
  "sarah-johnson": {
    id: "sarah-johnson",
    name: "Sarah Johnson",
    defaultTitle: "Product Manager",
    image: "/avatars/sarah.jpg",
    bio: "Product Manager at Badget with 8+ years in analytics and data visualization. Passionate about turning data into actionable insights.",
    twitter: "sarahjdev"
  }
};
function getAuthorByKey(authorKey) {
  return authors[authorKey];
}

// content-collections.ts
var blog = defineCollection({
  name: "blog",
  directory: "content/blog",
  include: "**/*.mdx",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishedAt: z.string(),
    summary: z.string().optional(),
    image: z.string().optional(),
    author: z.string().optional(),
    // Simple author key (e.g., "christerhagen")
    tags: z.array(z.string()).optional(),
    related: z.array(z.string()).optional()
  }),
  transform: async (document, context) => {
    const mdx = await compileMDX(context, document, {
      rehypePlugins: [
        rehypeSlug,
        [
          rehypePrettyCode,
          {
            theme: {
              dark: "github-dark",
              light: "github-light"
            },
            keepBackground: false
          }
        ],
        [
          rehypeAutolinkHeadings,
          {
            properties: {
              className: ["subheading-anchor"],
              ariaLabel: "Link to section"
            }
          }
        ]
      ]
    });
    const readingTimeStats = readingTime(document.content);
    let authorData = null;
    if (document.author) {
      const author = getAuthorByKey(document.author);
      if (author) {
        authorData = {
          ...author,
          displayTitle: author.defaultTitle
        };
      }
    }
    return {
      ...document,
      mdx,
      readingTime: readingTimeStats.text,
      wordCount: readingTimeStats.words,
      slug: document._meta.path,
      authorData
      // Resolved author information
    };
  }
});
var help = defineCollection({
  name: "help",
  directory: "content/help",
  include: "**/*.mdx",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishedAt: z.string(),
    updatedAt: z.string().optional(),
    summary: z.string().optional(),
    tags: z.array(z.string()).optional(),
    related: z.array(z.string()).optional()
  }),
  transform: async (document, context) => {
    const mdx = await compileMDX(context, document, {
      rehypePlugins: [
        rehypeSlug,
        [
          rehypePrettyCode,
          {
            theme: {
              dark: "github-dark",
              light: "github-light"
            },
            keepBackground: false
          }
        ],
        [
          rehypeAutolinkHeadings,
          {
            properties: {
              className: ["subheading-anchor"],
              ariaLabel: "Link to section"
            }
          }
        ]
      ]
    });
    const readingTimeStats = readingTime(document.content);
    return {
      ...document,
      mdx,
      readingTime: readingTimeStats.text,
      wordCount: readingTimeStats.words,
      slug: document._meta.path
    };
  }
});
var content_collections_default = defineConfig({
  collections: [blog, help]
});
export {
  content_collections_default as default
};
