<template>
  <div>
    <h1>About Us</h1>
    {{ data }}
  </div>
</template>

<script setup>
import { getThumborUrl } from "@/src/utils/thumbor.js";
console.log(
  "getThumborUrl: ",
  getThumborUrl({
    url: "https://icjia-sfs.netlify.app/splash-24-large-cropped.jpg",
  })
);
let isMounted = ref(false);

const { data } = await useAsyncData(`content-about`, async () => {
  const post = await queryContent().where({ _path: "/about" }).findOne();
  return post;
});

onMounted(async () => {
  isMounted.value = true;
});
</script>

<style lang="scss" scoped></style>
