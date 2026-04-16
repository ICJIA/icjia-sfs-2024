<!--
/**
 * Privacy Policy Page - Privacy policy and data handling information.
 *
 * This page displays markdown content from /content/privacy.md with:
 * - Privacy policy details
 * - Data collection and usage information
 * - User rights and contact information
 *
 * This is a standard legal/compliance page required for government websites.
 *
 * @page
 * @route /privacy
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
const { data } = await useAsyncData("content-privacy", async () => {
  return await queryCollection("content").path("/privacy").first();
});

useHead({
  title: data.value?.title || "Privacy",
  meta: [
    {
      name: "description",
      content:
        data.value?.description ||
        "Privacy policy for the Safe From the Start website.",
    },
  ],
});
</script>

<style lang="scss" scoped></style>
