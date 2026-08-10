// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { unified } from "@astrojs/markdown-remark";
import rehypeExternalLinks from "rehype-external-links";

// https://astro.build/config
export default defineConfig({
  site: "https://sfs.icjia.illinois.gov",
  output: "static",
  // Astro 7 changed the default from `true` (HTML-aware) to `'jsx'`, which
  // strips whitespace between inline elements the way JSX does. On this site
  // that silently joined words wherever a text run met an inline tag —
  // "(SFS) programprovides", "Visit theResources page", "(2022).State fiscal
  // year", and "© 2026Illinois Criminal Justice Information Authority" in the
  // footer of all 11 pages. Verified against the v6 build: with `true` every
  // page's rendered innerText is byte-identical to v6, with 'jsx' all 11
  // regress. Keep the v6 semantics; the alternative is hand-auditing every
  // inline boundary in templates and author-managed markdown forever.
  compressHTML: true,
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
    // Astro 7 swapped the default markdown pipeline to Sätteri, which has its
    // own plugin model and does not run remark/rehype. Selecting `unified()`
    // from @astrojs/markdown-remark keeps us on the remark/rehype pipeline v6
    // used, which is what rehype-external-links below plugs into. Dropping
    // this would silently stop decorating external links rather than error.
    processor: unified({
      // Auto-decorate external links so CMS authors don't need to write
      // Pandoc-style {target="_blank"} attributes in markdown (the markdown
      // pipeline doesn't parse that syntax and renders the braces as
      // literal text).
      rehypePlugins: [
        [
          rehypeExternalLinks,
          {
            target: "_blank",
            rel: ["noopener", "noreferrer"],
          },
        ],
      ],
    }),
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
