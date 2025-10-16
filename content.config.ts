/**
 * Nuxt Content v3 Configuration
 * 
 * This file defines content collections for the ICJIA Safe From the Start application.
 * Collections define how content files are organized, validated, and queried.
 * 
 * @see https://content.nuxt.com/docs/collections/define
 */

import { defineContentConfig, defineCollection } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    /**
     * Main content collection for markdown pages
     * 
     * This collection processes all markdown files in the /content directory.
     * Each markdown file becomes a queryable content item with frontmatter metadata.
     * 
     * Type: 'page' means there is a 1-to-1 relationship between content files and pages.
     */
    content: defineCollection({
      type: 'page',
      source: '**/*.md'
    })
  }
})

