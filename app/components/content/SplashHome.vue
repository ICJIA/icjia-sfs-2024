<!--
/**
 * SplashHome - Homepage hero image with overlay headline + CTA.
 *
 * The overlay headline is the page's <h1>. The image itself is decorative
 * (alt="", aria-hidden) because the headline conveys the page's purpose.
 *
 * @component
 */
-->
<template>
  <section>
    <div style="position: relative; margin-top: 60px">
      <v-img
        class="bg-grey-lighten-2"
        alt=""
        role="presentation"
        aria-hidden="true"
        :src="heroSrc"
        :lazy-src="heroLazySrc"
        width="100%"
        height="700"
        cover
        eager
        fetchpriority="high"
        style="filter: grayscale(10%)"
        gradient="to bottom, rgba(0,0,0,.3), rgba(0,0,0,.1)"
      >
        <template v-slot:placeholder>
          <div class="d-flex align-center justify-center fill-height">
            <v-progress-circular
              color="grey-lighten-4"
              indeterminate
              aria-label="Loading"
            ></v-progress-circular>
          </div>
        </template>
      </v-img>

      <div
        class="text-center hero-overlay"
        style="
          position: absolute;
          bottom: 25%;
          left: 0;
          right: 0;
          width: 100%;
          color: #fff;
          text-shadow:
            2px 2px 8px rgba(0, 0, 0, 1),
            1px 1px 4px rgba(0, 0, 0, 0.9);
          background: linear-gradient(
            to bottom,
            rgba(0, 0, 0, 0.2),
            rgba(0, 0, 0, 0.4)
          );
          padding: 20px 30px;
          border-radius: 8px;
        "
      >
        <h1 class="hero-title">
          Direct services to children who have been exposed to violence
        </h1>

        <div class="mt-6">
          <v-btn
            color="blue-darken-4"
            to="/about"
            style="
              background-color: #1a3a52 !important;
              color: #ffffff !important;
            "
            >Learn More&nbsp;&raquo;</v-btn
          >
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { getThumborUrl } from "@/utils/thumbor.js";

const HERO_SOURCE_URL =
  "https://sfs.icjia.illinois.gov/splash-24-large-cropped.jpg";

// Sized to the largest container the hero will ever render at (1600px wide on
// 2x desktop screens); smaller than the old 2000×1200@80 export. Lighthouse
// measured ~70 KiB of waste at that size.
const heroSrc = getThumborUrl({
  url: HERO_SOURCE_URL,
  width: 1600,
  height: 960,
  quality: 72,
});

const heroLazySrc = getThumborUrl({
  url: HERO_SOURCE_URL,
  width: 250,
  height: 150,
  quality: 10,
});

// Preload the LCP image so the browser fetches it in parallel with the document
// instead of waiting for the v-img component to mount.
useHead({
  link: [
    {
      rel: "preload",
      as: "image",
      href: heroSrc,
      fetchpriority: "high",
    },
  ],
});
</script>

<style scoped>
.hero-title {
  font-size: 46px;
  font-weight: 700;
  line-height: 1.15;
  color: #ffffff;
  margin: 0 auto;
  max-width: 22ch;
  /* Give axe-core a solid backdrop it can measure against. An effectively
     opaque navy shape behind the headline keeps the original look (the design
     already used a dark gradient block over the hero image) while letting the
     contrast pass deterministically — white #fff on #1a3a52 is 12.07:1. */
  background-color: #1a3a52;
  padding: 0.4em 0.8em;
  border-radius: 6px;
  display: inline-block;
  /* Override the wrapper's `pointer-events: none` so axe-core's
     elementsFromPoint() check can find the headline when determining the
     measured background. */
  pointer-events: auto;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 32px;
  }
}
</style>
