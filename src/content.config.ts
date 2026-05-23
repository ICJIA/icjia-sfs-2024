import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

/**
 * Markdown pages migrated from /content/*.md in the Nuxt project.
 * Loose schema mirrors the Nuxt @nuxt/content frontmatter so existing files
 * can be moved over without edits.
 */
const pages = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/pages" }),
  schema: z.object({
    title: z.string(),
    slug: z.string().optional(),
    summary: z.string().optional(),
    publishedAt: z.string().optional(),
    section: z.string().optional(),
    searchMeta: z.any().optional(),
    splash: z.any().optional(),
    description: z.string().optional(),
  }),
});

export const collections = { pages };
