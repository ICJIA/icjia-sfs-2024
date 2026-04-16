<!--
/**
 * Resources Page - Collection of helpful resources and materials.
 *
 * This page displays markdown content from /content/resources.md with:
 * - Dynamic page title from markdown frontmatter
 * - Markdown content rendered via ContentDoc component
 * - Links to external resources and downloadable materials
 *
 * No hero image is displayed on this page for a cleaner, more focused layout.
 *
 * @page
 * @route /resources
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
            {{ data?.title }}
          </h1></v-col
        >
      </v-row></v-container
    >

    <v-container
      ><v-row
        ><v-col cols="12" class="mt-0">
          <ContentRenderer
            :key="data?.title"
            :value="data"
            class="markdown-body"
            style="font-family: &quot;Lato&quot;, sans-serif"
          /> </v-col></v-row
    ></v-container>
  </div>
</template>

<script setup>
const { data } = await useAsyncData("content-resources", async () => {
  return await queryCollection("content").path("/resources").first();
});

useHead({
  title: data.value?.title || "Resources",
  meta: [
    {
      name: "description",
      content:
        data.value?.description ||
        "Helpful resources and materials related to the Safe From the Start program.",
    },
  ],
});
</script>

<style lang="scss" scoped></style>
