// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: "https://sfs.icjia.illinois.gov",
  output: "static",
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
  build: {
    // Inline ALL stylesheets into HTML to remove the render-blocking <link>
    // path entirely. Net win on slow-4G FCP vs. the ~20 KB of extra inline.
    inlineStylesheets: "always",
  },
});
