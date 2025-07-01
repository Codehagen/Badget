// content-collections.ts
import { defineCollection, defineConfig } from "@content-collections/core";
import { compileMDX } from "@content-collections/mdx";
import { z } from "zod";
import readingTime from "reading-time";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
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
    authorImage: z.string().optional(),
    authorUrl: z.string().optional(),
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
