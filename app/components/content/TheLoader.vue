<!--
/**
 * TheLoader - Inline loading indicator.
 * Uses Vuetify's <v-progress-circular> which respects prefers-reduced-motion
 * and exposes an accessible name.
 *
 * @component
 */
-->
<template>
  <div class="d-inline-flex align-center ga-2">
    <v-progress-circular
      indeterminate
      size="20"
      width="2"
      color="primary"
      aria-label="Loading"
    />
    <span>Loading</span>
  </div>
</template>
