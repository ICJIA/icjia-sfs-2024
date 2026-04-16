<!--
/**
 * TheContextFooter - Contextual navigation bar shown above the main footer.
 *
 * Uses a proper <nav><ul> structure and high-contrast colors so both mouse
 * and keyboard/AT users can perceive and operate it.
 *
 * @component
 */
-->
<template>
  <nav aria-label="Footer navigation" class="context-nav">
    <ul class="context-list">
      <li
        v-for="(item, index) in navMenu"
        :key="`fm-${index}`"
        class="context-item"
      >
        <NuxtLink :to="item.link" class="context-link">{{
          item.main
        }}</NuxtLink>
        <span
          v-if="index !== navMenu.length - 1"
          aria-hidden="true"
          class="context-sep"
          >|</span
        >
      </li>
    </ul>
  </nav>
</template>

<script setup>
const appConfig = useAppConfig();
const navMenu = appConfig.footerMenu;
</script>

<style scoped>
.context-nav {
  background: #1263a5;
  padding: 12px 8px;
}

.context-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 4px 12px;
}

.context-item {
  display: inline-flex;
  align-items: center;
}

.context-sep {
  color: #ffffff;
  margin-left: 12px;
  opacity: 0.6;
}

a.context-link {
  font-family: "Raleway", sans-serif !important;
  color: #ffffff;
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 0.09em;
  padding: 4px 8px;
  border-radius: 2px;
}

a.context-link:hover,
a.context-link:focus-visible {
  color: #ffffff;
  text-decoration: underline;
  outline: 2px solid #ffffff;
  outline-offset: 2px;
}
</style>
