import vuetify, { transformAssetUrls } from "vite-plugin-vuetify";
import vue from "@vitejs/plugin-vue";
export default defineNuxtConfig({
  devtools: { enabled: true },
  build: {
    transpile: ["vuetify"],
  },
  modules: [
    "@nuxt/content",
    "@nuxt/image",
    "@vueuse/nuxt",
    // "@nuxtjs/plausible",
    (_options, nuxt) => {
      nuxt.hooks.hook("vite:extendConfig", (config) => {
        // @ts-expect-error
        config.plugins.push(vuetify({ autoImport: true }));
      });
    },
    //...
  ],
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
      plugins: [vue(), vuetify()],
      template: {
        transformAssetUrls,
      },
    },
  },
});
