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

const splashFull = ref(null);
const splashThumbnail = ref(null);

const { data } = await useAsyncData("content-childhood-exposure", async () => {
  return await queryCollection("content").path("/childhood-exposure").first();
});

useHead({
  title: data.value?.title || "Childhood Exposure to Violence",
  meta: [
    {
      name: "description",
      content:
        data.value?.description ||
        "Information on childhood exposure to violence (CEV) and trauma, statistics, and intervention strategies.",
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

onMounted(async () => {
  await nextTick();
  const footnoteLabel = document.getElementById("footnote-label");
  if (footnoteLabel) footnoteLabel.innerText = "References";
});
</script>

<style lang="scss" scoped>
h2 a {
  color: #000 !important;
}
</style>
