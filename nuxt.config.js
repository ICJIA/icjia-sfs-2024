import vuetify, { transformAssetUrls } from "vite-plugin-vuetify";
import vue from "@vitejs/plugin-vue";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import appRoutes from "./src/json/appRoutes.json";
export default defineNuxtConfig({
  app: {
    // pageTransition: { name: "page", mode: "out-in" },
    head: {
      charset: "utf-8",
      viewport: "width=device-width, initial-scale=1",

      titleTemplate: "Safe From the Start | %s ",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          hid: "description",
          name: "description",
          content: "SFS Description here",
        },
      ],
      link: [
        { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
        // {
        //   rel: "stylesheet",
        //   href: "https://cdn.datatables.net/v/dt/dt-1.13.1/b-2.3.3/b-print-2.3.3/fh-3.3.1/r-2.4.0/sb-1.4.0/sp-2.1.0/datatables.min.css",
        // },
      ],
      script: [
        {
          src: "https://code.jquery.com/jquery-3.7.1.slim.min.js",
          type: "text/javascript",
        },
        // {
        //   src: "https://cdn.datatables.net/v/dt/dt-1.13.1/b-2.3.3/b-print-2.3.3/fh-3.3.1/r-2.4.0/sb-1.4.0/sp-2.1.0/datatables.min.js",
        //   type: "text/javascript",
        // },
        // {
        //   src: "https://cdn.jsdelivr.net/mark.js/8.6.0/mark.min.js",
        //   type: "text/javascript",
        // },
        // {
        //   src: "https://plausible.icjia.cloud/js/script.tagged-events.outbound-links.js",
        //   "data-domain": "r3.illinois.gov",
        //   defer: true,
        // },
        // {
        //   src: "plausibleEvents.js",
        // },
      ],
    },
  },
  devtools: { enabled: true, timeline: { enabled: true } },
  css: [
    "vuetify/lib/styles/main.sass",
    "@mdi/font/css/materialdesignicons.min.css",
    "~/assets/css/variables.scss",
    "~/assets/css/app.css",
    "~/assets/css/github-markdown.css",
  ],
  build: {
    transpile: ["vuetify"],
  },
  modules: [
    "@nuxt/content",
    "@nuxt/image",
    "@vueuse/nuxt",
    "@nuxtjs/google-fonts",
    "nuxt-gtag",

    // "@nuxtjs/plausible",
    (_options, nuxt) => {
      nuxt.hooks.hook("vite:extendConfig", (config) => {
        // @ts-expect-error
        config.plugins.push(vuetify({ autoImport: true }));
      });
    },
    //...
  ],
  content: {
    documentDriven: false,
    markdown: {
      mdc: true,
      anchorLinks: false,
      anchorLinks: {
        depth: 0,
        exclude: [0, 1, 2, 3, 4, 5, 6],
      },
    },
  },
  googleFonts: {
    inject: true,
    download: true,
    display: "swap",
    prefetch: true,
    base64: true,
    families: {
      Roboto: {
        wght: [100, 400, 700, 900],
        ital: [100, 400],
      },
      Lato: {
        wght: [100, 300, 400, 700, 900],
        ital: [100, 400],
      },
    },
  },

  image: {
    // The screen sizes predefined by `@nuxt/image`:
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536,
      "2xl": 1536,
    },
  },
  content: {
    // ... options
  },
  // plausible: {
  //   apiHost: "https://plausible.icjia.cloud",
  //   // Prevent tracking on localhost
  //   ignoredHostnames: ["localhost"],
  //   autoOutboundTracking: true,
  // logIgnoredEvents: true,
  // },
  vite: {
    vue: {
      plugins: [vue(), vuetify(), nodePolyfills()],
      optimizeDeps: {
        include: [
          "axios",
          "moment",
          "dompurify",
          "fuse.js",
          "lodash",
          "markdown-it",
          "markdown-it-attrs",
          "thumbor-url-builder-ts",
          "uuid",
          "mitt",
        ],
      },
      template: {
        transformAssetUrls,
      },
    },
  },
  devtools: {
    enabled: true,
    timeline: {
      enabled: true,
    },
  },
  generate: {
    routes: appRoutes,
  },
  // runtimeConfig: {
  //   apiSecret: process.env.NUXT_THUMBOR_KEY,
  //   public: {
  //
  //   },
  // },
});
