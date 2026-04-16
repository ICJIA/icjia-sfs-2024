<!--
/**
 * ThePageLoader - Full-page loading indicator.
 *
 * @component
 */
-->
<template>
  <div
    style="margin-top: 150px; margin-bottom: 150px"
    class="text-center d-flex flex-column align-center ga-4"
  >
    <v-progress-circular
      indeterminate
      size="48"
      width="4"
      color="primary"
      aria-label="Loading"
    />
    <div style="font-weight: 700; font-size: 25px">LOADING…</div>
  </div>
</template>
