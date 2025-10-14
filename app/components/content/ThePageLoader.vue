<!--
/**
 * ThePageLoader - Full-page loading indicator component.
 *
 * Displays a centered loading message with animated GIF for full-page loads.
 * Uses larger margins and text size compared to TheLoader for better visibility
 * when used as the main page content during loading states.
 *
 * @component
 * @example
 * <ThePageLoader />
 */
-->
<template>
  <!--
    Full-page loading indicator with generous vertical spacing.
    Ensures the loading message is visible in the viewport center.
  -->
  <div style="margin-top: 150px; margin-bottom: 150px" class="text-center">
    <div class="text-center">
      <!-- Large, bold loading text -->
      <div style="font-weight: 700; font-size: 25px" class="mb-3">
        LOADING...
      </div>
      <!-- Animated loading GIF -->
      <img src="/loading.gif" alt="Loading animation" />
    </div>
  </div>
</template>

<script>
export default {};
</script>

<style lang="scss" scoped></style>
