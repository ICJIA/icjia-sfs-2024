<!--
/**
 * SplashHomeSecondary - Secondary decorative image for the homepage.
 *
 * This component displays a large decorative image in the middle section of the homepage.
 * It provides visual interest and breaks up text content sections. The image uses
 * Thumbor for optimization and is displayed with a subtle grayscale filter.
 *
 * Features:
 * - Responsive image with lazy loading
 * - Lower quality setting (30%) for faster loading of decorative content
 * - Grayscale filter for aesthetic consistency
 * - Border styling for visual separation
 * - Negative margin to overlap with previous section
 *
 * @component
 * @example
 * <SplashHomeSecondary />
 */
-->
<template>
  <div>
    <div>
      <!--
        Decorative image with optimized loading.
        Uses lower quality (30%) since this is decorative rather than primary content.
        Negative top margin creates an overlapping effect with the previous section.
      -->
      <v-img
        class="bg-grey-lighten-2"
        alt=""
        role="presentation"
        aria-hidden="true"
        :src="
          getThumborUrl({
            url: 'https://sfs.icjia.illinois.gov/splash-28-large.jpg',
            width: 2000,
            height: 1200,
            quality: 30, // Lower quality for decorative image
          })
        "
        :lazy-src="
          getThumborUrl({
            url: 'https://sfs.icjia.illinois.gov/splash-28-large.jpg',
            width: 250,
            height: 150,
            quality: 10,
          })
        "
        width="100%"
        height="650"
        cover
        style="
          margin-top: -65px;
          filter: grayscale(10%);
          position: relative;
          border-top: 1px solid #bbb;
          border-bottom: 1px solid #444;
        "
        ><!-- Loading placeholder with spinner -->
        <template v-slot:placeholder>
          <div class="d-flex align-center justify-center fill-height">
            <v-progress-circular
              color="grey-lighten-4"
              indeterminate
            ></v-progress-circular>
          </div>
        </template>
      </v-img>
    </div>
  </div>
</template>

<script setup>
import { ThumborUrlBuilder } from "thumbor-url-builder-ts";

// Track component mount state
let isMounted = ref(false);

/**
 * Generates optimized Thumbor image URLs for the secondary splash image.
 *
 * Creates URLs for both full-quality and placeholder images using the Thumbor
 * image optimization service. This component uses lower quality settings since
 * the image is decorative rather than primary content.
 *
 * @param {Object} params - Image processing parameters
 * @param {string} params.url - Source image URL
 * @param {number} params.width - Target width in pixels
 * @param {number} params.height - Target height in pixels
 * @param {number} params.quality - Image quality (0-100)
 * @param {string} params.format - Output format (e.g., "webp")
 * @returns {string} Signed Thumbor URL for the processed image
 */
const getThumborUrl = ({ url, width, height, quality, format }) => {
  let options = {
    url: url || "https://sfs.icjia.illinois.gov/error.jpg",
    width: width || 1024,
    height: height || 768,
    quality: quality || 50,
    format: format || "webp",
  };

  const thumbor = new ThumborUrlBuilder(
    import.meta.env.VITE_THUMBOR_KEY,
    "https://image.icjia.cloud"
  );

  return thumbor
    .setImagePath(options.url)
    .resize(options.width, options.height)
    .filter(`quality(${options.quality}):format('${options.format}')`)
    .smartCrop(true)
    .buildUrl();
};

/**
 * Lifecycle hook - runs when component is mounted.
 */
onMounted(async () => {
  isMounted.value = true;
});
</script>

<style scoped>
/**
 * Legacy header styles - preserved for reference.
 * These styles were used in a previous version of the component
 * that included text overlay on the image.
 */
/* #header {
  position: relative;
  min-height: 650px;
  font-size: 45px;
  max-width: 70%;
  font-weight: 700;
  color: #fff;
}

#header-content {
  position: absolute;
  bottom: 10px;
  left: 50%;
  color: #fff;
  padding-left: 120px;
  padding-right: 20px;
  line-height: 60px;

  font-weight: 400;
} */
</style>
