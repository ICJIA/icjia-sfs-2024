<!--
/**
 * TheLoader - Simple loading indicator component.
 *
 * Displays a centered "LOADING" text with an animated GIF.
 * Used in navigation components during server-side rendering or
 * before components are fully mounted.
 *
 * @component
 * @example
 * <TheLoader />
 */
-->
<template>
  <div class="text-center">
    <!-- Loading text with animated GIF indicator -->
    LOADING <img src="/loading.gif" alt="Loading animation" />
  </div>
</template>

<script setup></script>

<style lang="scss" scoped></style>
