<template>
  <div>
    <h1>About Us</h1>
    {{ data }}
    <br />
    <br />
    {{ splashFull }}
    <br /><br />
    {{ splashThumbnail }}
    <br /><br />
    <v-img
      :src="splashFull"
      :lazy-src="splashThumbnail"
      width="100%"
      height="700"
      cover
    ></v-img>
  </div>
</template>

<script setup>
import { getThumborUrl } from "@/src/utils/thumbor.js";

let isMounted = ref(false);

const { data } = await useAsyncData(`content-about`, async () => {
  const post = await queryContent().where({ _path: "/about" }).findOne();
  return post;
});

let splashFull = ref(getThumborUrl(data.value.splash[0]));
let splashThumbnail = ref(
  getThumborUrl({
    url: data.value.splash[0].url,
    width: 150,
    height: 150,
    quality: 10,
  })
);

onMounted(async () => {
  isMounted.value = true;
});
</script>

<style lang="scss" scoped></style>
