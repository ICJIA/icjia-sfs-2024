/**
 * Vuetify plugin configuration for the ICJIA Safe From the Start application.
 *
 * This plugin initializes Vuetify 3, a Material Design component framework for Vue.js,
 * and makes it available throughout the Nuxt application. It configures the Material
 * Design Icons (MDI) icon set and includes experimental lab components.
 *
 * Vuetify provides the UI component library used for navigation, layouts, buttons,
 * cards, and other interface elements throughout the application.
 *
 * @module plugins/vuetify
 */

// Import Material Design Icons CSS - required for icon display throughout the app
import "@mdi/font/css/materialdesignicons.css";

// Import experimental Vuetify lab components for access to beta/preview features
import * as labsComponents from "vuetify/labs/components";

// Import core Vuetify styles
import "vuetify/styles";
import { createVuetify } from "vuetify";

/**
 * Nuxt plugin that initializes and configures Vuetify for the application.
 *
 * This plugin is automatically loaded by Nuxt during application bootstrap.
 * It creates a Vuetify instance with Material Design Icons as the default icon set
 * and includes lab components to enable experimental features.
 *
 * @param {Object} app - Nuxt app context provided by defineNuxtPlugin
 * @param {Object} app.vueApp - The Vue application instance
 * @returns {void}
 */
export default defineNuxtPlugin((app) => {
  // Create Vuetify instance with configuration
  const vuetify = createVuetify({
    icons: {
      defaultSet: "mdi", // Use Material Design Icons as the default icon set
    },
    // Include lab components to enable experimental Vuetify features
    // This allows usage of components that are in beta/preview status
    components: {
      ...labsComponents,
    },
  });

  // Register Vuetify with the Vue application instance
  // This makes Vuetify components and composables available globally
  app.vueApp.use(vuetify);
});
