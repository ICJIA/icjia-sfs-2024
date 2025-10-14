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
  compabilityDate: "2024-07-03",

  // Opt into Nuxt 4 compatibility features
  future: {
    compatibilityVersion: "4",
  },

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
    "../assets/css/variables.scss", // Custom SCSS variables
    "../assets/css/app.css", // Application-specific styles
    "../assets/css/github-markdown.css", // Markdown content styling
  ],

  /**
   * Build configuration.
   * Transpile specifies packages that need to be transpiled for compatibility.
   */
  build: {
    transpile: ["vuetify"], // Vuetify must be transpiled for SSR compatibility
  },

  /**
   * Experimental features configuration.
   * App manifest is disabled to avoid potential build issues.
   */
  experimental: { appManifest: false },

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
   * @nuxt/content module configuration.
   * Manages markdown content files and their rendering.
   */
  content: {
    documentDriven: false, // Disable automatic page generation from content

    markdown: {
      mdc: true, // Enable Markdown Components (MDC) syntax

      // Disable automatic anchor link generation for headings
      // This prevents duplicate anchor link configurations
      anchorLinks: false,
      anchorLinks: {
        depth: 0, // Don't generate anchor links at any heading level
        exclude: [0, 1, 2, 3, 4, 5, 6], // Exclude all heading levels
      },
    },
  },

  /**
   * Google Fonts configuration.
   * Downloads and optimizes fonts for performance.
   */
  googleFonts: {
    inject: true, // Automatically inject font CSS
    download: true, // Download fonts locally for better performance and privacy
    display: "swap", // Use font-display: swap for better perceived performance
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
    enabled: true, // Enable DevTools in development
    timeline: {
      enabled: true, // Enable timeline feature for performance tracking
    },
  },

  /**
   * Static site generation configuration.
   * Specifies which routes to pre-render during build.
   */
  generate: {
    routes: appRoutes, // Use the consolidated routes from appRoutes.json
  },

  /**
   * Compatibility date for Nuxt behavior versioning.
   * Ensures consistent behavior across Nuxt updates.
   */
  compatibilityDate: "2024-07-22",
});
