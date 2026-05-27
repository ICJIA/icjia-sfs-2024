// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import rehypeExternalLinks from "rehype-external-links";

// https://astro.build/config
export default defineConfig({
  site: "https://sfs.icjia.illinois.gov",
  output: "static",
  // Emit /about.html instead of /about/index.html so Netlify can serve
  // the no-trailing-slash form (/about) directly. Lighthouse otherwise
  // measures ~800 ms of redirect-to-trailing-slash on every internal nav.
  trailingSlash: "never",
  integrations: [
    sitemap({
      // Sitemap filter receives the canonical URL (e.g.
      // "https://sfs.icjia.illinois.gov/search"), not the dist filename
      // — so match against the no-extension path. @astrojs/sitemap also
      // excludes /404 by default, but we belt-and-suspender it. The
      // search results page has no durable content (it's a client-side
      // island over a build-time JSON blob) so it stays out of the index.
      filter: (page) =>
        !/\/(?:404|search)\/?$/.test(page),
    }),
  ],
  markdown: {
    // Auto-decorate external links so CMS authors don't need to write
    // Pandoc-style {target="_blank"} attributes in markdown (Astro's
    // default markdown pipeline doesn't parse that syntax and renders
    // the braces as literal text).
    rehypePlugins: [
      [
        rehypeExternalLinks,
        {
          target: "_blank",
          rel: ["noopener", "noreferrer"],
        },
      ],
    ],
  },
  vite: {
    plugins: [tailwindcss()],
  },
  build: {
    // Inline ALL stylesheets so the HTML payload carries everything it
    // needs to render — no render-blocking external CSS request. We
    // tested "auto" (~80 KB Tailwind goes external): /resources gained
    // ~2 Perf points but the image-heavy / and /sites lost ~3 — the
    // render-blocking CSS hurt LCP more than the smaller HTML helped on
    // pages where the hero image dominates. Production gzip/brotli
    // also makes the inline-HTML weight much less painful on the wire.
    inlineStylesheets: "always",
    // Pair with trailingSlash: "never" — produces /about.html, /privacy.html
    // etc. so the canonical URL has no trailing slash.
    format: "file",
  },
});
