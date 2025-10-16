<!--
/**
 * Childhood Exposure to Violence Page - Detailed information about CEV.
 *
 * This page displays markdown content from /content/childhood-exposure.md with:
 * - Dynamic page title from markdown frontmatter
 * - Hero image (hidden on mobile)
 * - Comprehensive information about childhood exposure to violence
 * - Statistics, impacts, and intervention strategies
 *
 * This is a key informational page linked from the homepage.
 *
 * @page
 * @route /childhood-exposure
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
            Childhood Exposure to Violence and Trauma
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

const { data } = await useAsyncData(`content-childhood-exposure`, async () => {
  const post = await queryCollection("content")
    .path("/childhood-exposure")
    .first();
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
  let footnoteLabel = document.getElementById("footnote-label");

  // Check if the element exists
  if (footnoteLabel) {
    // Change the inner text of the element
    footnoteLabel.innerText = "References";
  } else {
    console.log("Element with ID 'footnote-label' not found.");
  }
});
</script>

<style lang="scss" scoped>
h2 a {
  color: #000 !important;
}
</style>
