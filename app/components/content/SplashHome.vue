<!--
/**
 * SplashHome - Hero image component for the homepage.
 *
 * This component displays the main hero/splash image at the top of the homepage
 * with an overlay message and call-to-action button. It uses the Thumbor image
 * service for optimized, responsive image delivery.
 *
 * Features:
 * - Responsive image with lazy loading
 * - Gradient overlay for text readability
 * - Centered call-to-action message
 * - Optimized WebP format for performance
 * - Accessible alt text
 *
 * @component
 * @example
 * <SplashHome />
 */
-->
<template>
  <div>
    <div>
      <!--
        Hero image with responsive sizing and lazy loading.
        Uses Thumbor for on-the-fly image optimization and WebP conversion.
        Gradient overlay ensures text remains readable over the image.
      -->
      <v-img
        class="bg-grey-lighten-2"
        alt="Children playing together in a safe environment - representing the Safe From the Start program's mission to protect young children"
        :src="
          getThumborUrl({
            url: 'https://sfs.icjia.illinois.gov/splash-24-large-cropped.jpg',
            width: 2000,
            height: 1200,
            quality: 80,
          })
        "
        :lazy-src="
          getThumborUrl({
            url: 'https://sfs.icjia.illinois.gov/splash-24-large-cropped.jpg',
            width: 250,
            height: 150,
            quality: 10,
          })
        "
        width="100%"
        height="700"
        cover
        style="margin-top: 60px; filter: grayscale(10%); position: relative"
        gradient="to bottom, rgba(0,0,0,.3), rgba(0,0,0,.1)"
        ><!-- Loading placeholder with spinner -->
        <template v-slot:placeholder>
          <div class="d-flex align-center justify-center fill-height">
            <v-progress-circular
              color="grey-lighten-4"
              indeterminate
            ></v-progress-circular>
          </div>
        </template>

        <!-- Legacy header content - preserved for reference -->
        <!-- <div id="header" class="hidden-sm-and-down">
          <div id="header-content">
            Developmentally and culturally appropriate direct services to children, ages 0
            – 5
          </div>
        </div> -->

        <!--
          Hero message overlay.
          Positioned absolutely over the image with text shadow and gradient background
          for maximum readability. Includes call-to-action button.
        -->
        <div
          class="text-center"
          style="
            position: absolute;
            bottom: 25%;
            width: 100%;
            font-size: 46px;
            font-weight: 700;
            color: #fff;
            text-shadow: 2px 2px 8px rgba(0, 0, 0, 1),
              1px 1px 4px rgba(0, 0, 0, 0.9);
            background: linear-gradient(
              to bottom,
              rgba(0, 0, 0, 0.3),
              rgba(0, 0, 0, 0.6)
            );
            padding: 20px 30px;
            border-radius: 8px;
          "
        >
          Direct services to children who have been exposed to violence
          <br />

          <!-- Call-to-action button -->
          <div class="mt-6">
            <v-btn color="blue-darken-4" to="/about"
              >Learn More&nbsp;&raquo;</v-btn
            >&nbsp;

            <!-- Contact button - currently disabled -->
            <!-- &nbsp;&nbsp;<v-btn varient="outlined" style="color: black">Contact</v-btn> -->
          </div>
        </div>
      </v-img>
    </div>
  </div>
</template>

<script setup>
import { ThumborUrlBuilder } from "thumbor-url-builder-ts";

// Track component mount state (currently unused but available for future enhancements)
let isMounted = ref(false);

/**
 * Generates optimized Thumbor image URLs for the hero image.
 *
 * This function creates URLs for both the full-quality image and the low-quality
 * placeholder used during lazy loading. It uses the Thumbor service to resize,
 * optimize, and convert images to WebP format for better performance.
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
  // Set default values for all parameters
  let options = {
    url: url || "https://sfs.icjia.illinois.gov/error.jpg",
    width: width || 1024,
    height: height || 768,
    quality: quality || 50,
    format: format || "webp",
  };

  // Initialize Thumbor URL builder with security key and service endpoint
  const thumbor = new ThumborUrlBuilder(
    import.meta.env.VITE_THUMBOR_KEY,
    "https://image.icjia.cloud"
  );

  // Build and return the complete Thumbor URL with transformations
  return thumbor
    .setImagePath(options.url)
    .resize(options.width, options.height)
    .filter(`quality(${options.quality}):format('${options.format}')`)
    .smartCrop(true) // Enable smart cropping to preserve focal points
    .buildUrl();
};

/**
 * Lifecycle hook - runs when component is mounted.
 * Sets the mounted flag for potential future use.
 */
onMounted(async () => {
  isMounted.value = true;
});
</script>

<style scoped></style>
