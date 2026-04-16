<!--
/**
 * About Page - Information about the Safe From the Start program.
 *
 * This page displays markdown content from /content/about.md with:
 * - Page title
 * - Hero image (hidden on mobile)
 * - Markdown content rendered via ContentDoc component
 *
 * The page uses Nuxt Content to fetch and render markdown files,
 * allowing non-technical users to update content without code changes.
 *
 * @page
 * @route /about
 */
-->
<template>
  <div class="pb-16">
    <v-container
      ><v-row
        ><v-col class="text-center mb-6">
          <h1
            style="font-size: 40px; margin-top: 80px; text-transform: uppercase"
          >
            About Safe from the Start
          </h1></v-col
        >
        <v-img
          v-if="splashFull && splashThumbnail"
          :src="splashFull"
          :lazy-src="splashThumbnail"
          width="100%"
          height="700"
          cover
          style="filter: grayscale(60%); position: relative"
          class="hidden-sm-and-down"
        ></v-img></v-row
    ></v-container>

    <v-container
      ><v-row
        ><v-col cols="12" class="mt-0">
          <ContentRenderer
            :key="data?.title"
            :value="data"
            class="markdown-body"
            style="font-family: &quot;Lato&quot;, sans-serif"
          />
          <!-- <div
            v-html="renderer.render(data.rawMarkdown)"
            class="markdown-body"
          ></div> -->
        </v-col></v-row
      ></v-container
    >
  </div>
</template>

<script setup>
import { getThumborUrl } from "@/utils/thumbor.js";

const splashFull = ref(null);
const splashThumbnail = ref(null);

const { data } = await useAsyncData("content-about", async () => {
  return await queryCollection("content").path("/about").first();
});

useHead({
  title: "About",
  meta: [
    {
      name: "description",
      content:
        data.value?.description ||
        "About the Safe From the Start program – services for children ages 0–5 who have been exposed to violence.",
    },
  ],
});

if (data.value?.splash?.[0]) {
  splashFull.value = getThumborUrl(data.value.splash[0]);
  splashThumbnail.value = getThumborUrl({
    url: data.value.splash[0].url,
    width: 150,
    height: 150,
    quality: 10,
  });
}
</script>

<style lang="scss" scoped>
h2 a {
  color: #000 !important;
}
</style>
