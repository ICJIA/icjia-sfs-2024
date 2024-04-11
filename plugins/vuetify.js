// import this after install `@mdi/font` package
import "@mdi/font/css/materialdesignicons.css";

import * as labsComponents from "vuetify/labs/components";

import "vuetify/styles";
import { createVuetify } from "vuetify";

export default defineNuxtPlugin((app) => {
  const vuetify = createVuetify({
    icons: {
      defaultSet: "mdi", // This is already the default value - only for display purposes
    },
    ...labsComponents,
  });
  app.vueApp.use(vuetify);
});
