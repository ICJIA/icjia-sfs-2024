<template>
  <div class="pb-16">
    <v-container
      ><v-row
        ><v-col class="text-center mb-6">
          <h1 style="font-size: 40px; margin-top: 70px">
            {{ data?.title }}
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
        ><v-col cols="12" class="mt-10">
          <ContentDoc :key="data?.title" :value="data" class="markdown-body">
            <template #empty>Document not found</template>
            <template #not-found>Document not found</template>
          </ContentDoc>
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
import { getThumborUrl } from "@/src/utils/thumbor.js";

let isMounted = ref(false);
let splashFull = ref(null);
let splashThumbnail = ref(null);

const { data } = await useAsyncData(`content-sites`, async () => {
  const post = await queryContent().where({ _path: "/sites" }).findOne();
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

<style lang="scss" scoped></style>
