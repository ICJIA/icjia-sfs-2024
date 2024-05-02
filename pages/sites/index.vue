<template>
  <div class="pb-16">
    <v-img
      v-if="splashFull && splashThumbnail"
      :src="splashFull"
      :lazy-src="splashThumbnail"
      width="100%"
      height="700"
      cover
      style="filter: grayscale(60%); position: relative"
    ></v-img>
    <h1>SFS Sites</h1>
    {{ data }}
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
