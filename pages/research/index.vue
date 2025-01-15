<template>
  <div class="pb-16">
    <v-container
      ><v-row>
        <v-col class="text-center mb-6">
          <h1
            style="font-size: 40px; margin-top: 80px; text-transform: uppercase"
          >
            {{ data?.title }}
          </h1>
        </v-col>
        <v-img
          src="https://agency.icjia-api.cloud/uploads/large_pexels_freestockpro_oleksander_p_80cff2f2da.jpg"
          lazy-src="https://agency.icjia-api.cloud/uploads/thumbnail_pexels_freestockpro_oleksander_p_80cff2f2da.jpg"
          width="100%"
          height="700"
          cover
          style="filter: grayscale(60%); position: relative"
          class="hidden-sm-and-down"
          ><template v-slot:placeholder>
            <v-row class="fill-height ma-0" align="center" justify="center">
              <v-progress-circular
                indeterminate
                color="blue darken-3"
                aria-label="Progress bar: Loading"
              ></v-progress-circular>
            </v-row> </template
        ></v-img> </v-row
    ></v-container>

    <v-container
      ><v-row
        ><v-col cols="12" class="mt-10">
          <ContentDoc
            :key="data?.title"
            :value="data"
            class="markdown-body"
            style="font-family: 'Lato', sans-serif"
          >
            <template #empty>Document not found</template>
            <template #not-found>Document not found</template>
          </ContentDoc>
        </v-col></v-row
      ></v-container
    >
  </div>
</template>

<script setup>
import { getThumborUrl } from "@/src/utils/thumbor.js";

let isMounted = ref(false);
let splashFull = ref(null);
let splashThumbnail = ref(null);

const { data } = await useAsyncData(`content-research`, async () => {
  const post = await queryContent().where({ _path: "/research" }).findOne();
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
:deep(.footnotes) {
  font-size: 12px !important;
}

.footnote-label {
  color: #666 !important;
}
</style>
