// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: "https://sfs.icjia.illinois.gov",
  output: "static",
  // Emit /about.html instead of /about/index.html so Netlify can serve
  // the no-trailing-slash form (/about) directly. Lighthouse otherwise
  // measures ~800 ms of redirect-to-trailing-slash on every internal nav.
  trailingSlash: "never",
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
  build: {
    // Inline ALL stylesheets into HTML to remove the render-blocking <link>
    // path entirely. Net win on slow-4G FCP vs. the ~20 KB of extra inline.
    inlineStylesheets: "always",
    // Pair with trailingSlash: "never" — produces /about.html, /privacy.html
    // etc. so the canonical URL has no trailing slash.
    format: "file",
  },
});
