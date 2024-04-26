<template>
  <div>
    <h1>About Us</h1>
    {{ data }}
  </div>
</template>

<script setup>
import { getThumborUrl } from "@/src/utils/thumbor.js";

let isMounted = ref(false);

const { data } = await useAsyncData(`content-about`, async () => {
  const post = await queryContent().where({ _path: "/about" }).findOne();
  return post;
});

console.log(
  "thumborURL: ",
  getThumborUrl({
    url: data.value.splash[0].url,
  })
);

onMounted(async () => {
  isMounted.value = true;
});
</script>

<style lang="scss" scoped></style>
