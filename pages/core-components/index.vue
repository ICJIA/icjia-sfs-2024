<template>
  <div>
    <h1>Core Components</h1>
    {{ data }}
  </div>
</template>

<script setup>
import { ThumborUrlBuilder } from "thumbor-url-builder-ts";

let isMounted = ref(false);

const getThumborUrl = ({ url, width, height, quality, format }) => {
  let options = {
    url: url || "https://icjia-sfs.netlify.app/error.jpg",
    width: width || 1024,
    height: height || 768,
    quality: quality || 80,
    format: format || "webp",
  };
  const thumbor = new ThumborUrlBuilder(
    import.meta.env.VITE_THUMBOR_KEY,
    "https://image.icjia.cloud"
  );

  return thumbor
    .setImagePath(options.url)
    .resize(options.width, options.height)
    .filter(`quality(${options.quality}):format('${options.format}')`)
    .smartCrop(true)
    .buildUrl();
};

const { data } = await useAsyncData(`content-core-components`, async () => {
  const post = await queryContent()
    .where({ _path: "/core-components" })
    .findOne();
  return post;
});

onMounted(async () => {
  isMounted.value = true;
});
</script>

<style lang="scss" scoped></style>
