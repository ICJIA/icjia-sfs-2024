/**
 * Nuxt 3 configuration for the ICJIA Safe From the Start application.
 *
 * This file configures the Nuxt framework with all necessary modules, plugins,
 * build settings, and application metadata. It sets up:
 * - Vuetify UI framework integration
 * - Content management with @nuxt/content
 * - Image optimization
 * - Google Fonts
 * - Analytics (Google Tag Manager)
 * - Static site generation routes
 * - Development tools
 *
 * @see https://nuxt.com/docs/api/configuration/nuxt-config
 */

import vuetify, { transformAssetUrls } from "vite-plugin-vuetify";
import vue from "@vitejs/plugin-vue";
import { nodePolyfills } from "vite-plugin-node-polyfills";
// Import the consolidated list of all application routes for static generation
import appRoutes from "./src/json/appRoutes.json";

export default defineNuxtConfig({
  // Compatibility date for Nuxt behavior versioning
  compatibilityDate: "2024-07-03",

  /**
   * Application-level configuration including head metadata and page transitions.
   */
  app: {
    // Page transitions are currently disabled but can be re-enabled
    // pageTransition: { name: "page", mode: "out-in" },

    /**
     * Global head configuration for SEO and metadata.
     * These settings apply to all pages unless overridden by individual pages.
     */
    head: {
      htmlAttrs: { lang: "en" }, // Set document language for accessibility
      charset: "utf-8",
      viewport: "width=device-width, initial-scale=1",

      // Template for page titles - %s is replaced with page-specific title
      titleTemplate: "Safe From the Start %s ",

      // Default meta tags for SEO
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          hid: "description",
          name: "description",
          content:
            "The Safe From the Start (SFS) program provides developmentally and culturally appropriate direct services to children, ages 0 through 5, who have witnessed or been exposed to violence and their families",
        },
      ],

      // Favicon configuration
      link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],

      /**
       * External scripts loaded on all pages.
       * jQuery is included for potential legacy compatibility or third-party integrations.
       */
      script: [
        {
          src: "https://code.jquery.com/jquery-3.7.1.slim.min.js",
          type: "text/javascript",
        },
      ],
    },
  },

  /**
   * Global CSS imports.
   * These stylesheets are loaded on every page in the specified order.
   */
  css: [
    "vuetify/lib/styles/main.sass", // Vuetify core styles
    "@mdi/font/css/materialdesignicons.min.css", // Material Design Icons
    "@/assets/css/variables.scss", // Custom SCSS variables (now in /app/assets)
    "@/assets/css/app.css", // Application-specific styles (now in /app/assets)
    "@/assets/css/github-markdown.css", // Markdown content styling (now in /app/assets)
  ],

  /**
   * Build configuration.
   * Transpile specifies packages that need to be transpiled for compatibility.
   */
  build: {
    transpile: ["vuetify"], // Vuetify must be transpiled for SSR compatibility
  },

  /**
   * Nuxt modules to extend functionality.
   * Modules are loaded in order and can modify the Nuxt configuration.
   */
  modules: [
    "@nuxt/content", // Content management system for markdown files
    "@nuxt/image", // Image optimization and responsive images
    "@vueuse/nuxt", // Vue composition utilities
    "@nuxtjs/google-fonts", // Google Fonts integration
    "nuxt-gtag", // Google Tag Manager / Analytics

    // Plausible analytics is currently disabled but can be re-enabled
    // "@nuxtjs/plausible",

    /**
     * Inline module to configure Vuetify with auto-import.
     * This hooks into Vite's configuration to add the Vuetify plugin.
     */
    (_options, nuxt) => {
      nuxt.hooks.hook("vite:extendConfig", (config) => {
        // @ts-expect-error - Type definitions may not match perfectly
        config.plugins.push(vuetify({ autoImport: true }));
      });
    },
  ],

  /**
   * @nuxt/content module configuration (v3).
   *
   * In Nuxt Content v3, most configuration has moved to content.config.ts.
   * This section now only contains module-level options.
   *
   * @see https://content.nuxt.com/docs/getting-started/configuration
   */
  content: {
    // Module-level options can be configured here if needed
    // Collection-specific configuration is in content.config.ts
  },

  /**
   * Google Fonts configuration.
   * Downloads and optimizes fonts for performance.
   */
  googleFonts: {
    inject: true, // Automatically inject font CSS
    download: true, // Download fonts locally for better performance and privacy
    display: "optional", // Use font-display: optional to prevent layout shift from font swap
    prefetch: true, // Prefetch font files
    base64: true, // Inline small fonts as base64

    // Font families and weights to load
    families: {
      Roboto: {
        wght: [100, 400, 700, 900], // Font weights
        ital: [100, 400], // Italic variants
      },
      Lato: {
        wght: [100, 300, 400, 700, 900],
        ital: [100, 400],
      },
    },
  },

  /**
   * @nuxt/image module configuration.
   * Defines responsive breakpoints for image optimization.
   */
  image: {
    /**
     * Screen size breakpoints for responsive images.
     * These match common device widths and Vuetify's breakpoint system.
     */
    screens: {
      xs: 320, // Extra small devices (phones)
      sm: 640, // Small devices (large phones)
      md: 768, // Medium devices (tablets)
      lg: 1024, // Large devices (desktops)
      xl: 1280, // Extra large devices (large desktops)
      xxl: 1536, // Extra extra large devices
      "2xl": 1536, // Alias for xxl
    },
  },

  /**
   * Plausible analytics configuration (currently disabled).
   * Uncomment to enable privacy-friendly analytics tracking.
   */
  // plausible: {
  //   apiHost: "https://plausible.icjia.cloud",
  //   // Prevent tracking on localhost
  //   ignoredHostnames: ["localhost"],
  //   autoOutboundTracking: true,
  // logIgnoredEvents: true,
  // },

  /**
   * Vite configuration for build optimization and plugins.
   */
  vite: {
    /**
     * Dependency optimization configuration.
     * Pre-bundles specified dependencies for faster dev server startup.
     */
    optimizeDeps: {
      include: [
        "axios", // HTTP client
        "moment", // Date/time manipulation
        "dompurify", // HTML sanitization
        "fuse.js", // Fuzzy search
        "lodash", // Utility functions
        "markdown-it", // Markdown parser
        "markdown-it-attrs", // Markdown attribute plugin
        "thumbor-url-builder-ts", // Image URL generation
        "uuid", // UUID generation
        "mitt", // Event emitter
      ],
    },

    /**
     * Vue-specific Vite configuration.
     */
    vue: {
      // Vite plugins for Vue processing
      plugins: [
        vue(), // Core Vue plugin
        vuetify(), // Vuetify integration
        nodePolyfills(), // Node.js polyfills for browser compatibility
      ],

      template: {
        // Transform asset URLs in templates for proper bundling
        transformAssetUrls,
      },
    },
  },

  /**
   * Nuxt DevTools configuration.
   * Provides debugging and development utilities.
   */
  devtools: {
    enabled: false, // DevTools disabled for this project
    timeline: {
      enabled: false, // Timeline feature disabled
    },
  },

  /**
   * Nitro configuration for server and prerendering.
   * Specifies which routes to pre-render during build.
   * 
   * Note: Routes under /docs/* are static HTML files in public/ directory,
   * not Nuxt routes. They must be ignored during prerendering to prevent
   * Nitro from attempting to prerender them as routes (which would cause 404 errors).
   * 
   * @see https://github.com/ICJIA/icjia-accessibility-portal - Challenge 8
   */
  nitro: {
    prerender: {
      routes: appRoutes, // Use the consolidated routes from appRoutes.json
      ignore: [
        '/docs',
        '/docs/**',
        '/documentation',
        '/documentation/**',
      ],
    },
  },
});
