import vuetify, { transformAssetUrls } from "vite-plugin-vuetify";
import vue from "@vitejs/plugin-vue";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import appRoutes from "./src/json/appRoutes.json";
export default defineNuxtConfig({
  devtools: { enabled: true },
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
  content: {
    documentDriven: false,
    markdown: {
      mdc: true,
      anchorLinks: {
        depth: 0,
        exclude: [1, 2, 3, 4, 5, 6],
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
        include: ["axios", "moment", "dompurify", "fuse.js", "lodash"],
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
