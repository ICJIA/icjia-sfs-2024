<!--
/**
 * TheContextFooter - Contextual navigation footer component.
 *
 * Displays a horizontal navigation bar above the main footer with links
 * to key pages. The links are separated by pipe characters and styled
 * with uppercase text for visual consistency.
 *
 * This component uses the footerMenu configuration from app.config.js
 * to dynamically generate navigation links.
 *
 * @component
 * @example
 * <TheContextFooter />
 */
-->
<template>
  <nav>
    <!--
      Contextual footer navigation bar.
      Blue background distinguishes it from the main footer below.
    -->
    <div
      variant="text"
      class="text-center pt-3 pb-3 footer-bg"
      style="justify-content: space-around; background: #1263a5"
    >
      <!--
        Loop through footer menu items from app.config.js.
        Each link is separated by a pipe character except the last one.
      -->
      <span v-for="(item, index) in navMenu" :key="index">
        <NuxtLink
          :to="item.link"
          class="context-link px-2"
          style="font-size: 14px; font-family: 'Oswald', sans-serif !important"
          >{{ item.main }}</NuxtLink
        >
        <!-- Pipe separator between links (not after the last link) -->
        <span v-if="menuLength - 1 !== index"> | </span>
      </span>
    </div>
  </nav>
</template>

<script setup>
// Get application configuration
const appConfig = useAppConfig();

// Clone footer menu configuration to prevent reactivity issues
const navMenu = JSON.parse(JSON.stringify(appConfig.footerMenu));

// Calculate menu length for pipe separator logic
const menuLength = navMenu.length;
</script>

<style scoped>
/**
 * Context link styling.
 * White text on blue background with uppercase transformation
 * and increased letter spacing for readability.
 */
a.context-link {
  font-family: "Raleway" !important;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 0.09em;
}

/**
 * Hover state for context links.
 * Changes to gray for visual feedback.
 */
a.context-link:hover {
  color: #aaa;
}

/**
 * Footer background styling.
 * Full-width blue background with white text.
 */
.footer-bg {
  background: #522c74;
  min-width: 100%;
  color: #fff;
  font-size: 16px;
  font-weight: 900;
}
</style>
