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

// Track component mount state
let isMounted = ref(false);
let splashFull = ref(null);
let splashThumbnail = ref(null);
import md from "markdown-it";
import attrs from "markdown-it-attrs";
const renderer = new md({
  html: true,
  xhtmlOut: false,
  breaks: false,
  langPrefix: "language-",
  linkify: true,
  typographer: true,
  quotes: "“”‘’",
}).use(attrs);

const { data } = await useAsyncData(`content-about`, async () => {
  const post = await queryCollection("content").path("/about").first();
  return post;
});

if (data && data.value.splash && data.value.splash[0]) {
  splashFull.value = getThumborUrl(data.value.splash[0]);
  splashThumbnail.value = getThumborUrl({
    url: data.value.splash[0].url,
    width: 150,
    height: 150,
    quality: 10,
  });
} else {
  splashFull.value = null;
  splashThumbnail.value = null;
}

onMounted(async () => {
  isMounted.value = true;
});
</script>

<style lang="scss" scoped>
h2 a {
  color: #000 !important;
}
</style>
