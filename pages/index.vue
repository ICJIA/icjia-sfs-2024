<template>
  <div>
    <div>
      <v-img
        class="bg-grey-lighten-2"
        :src="
          getThumborUrl({
            url: 'https://r3.icjia-api.cloud/uploads/getty_images_Q_Ygr_G6nkm4g_unsplash_c29c2710e6.jpg',
          })
        "
        :lazy-src="
          getThumborUrl({
            url: 'https://r3.icjia-api.cloud/uploads/thumbnail_getty_images_Q_Ygr_G6nkm4g_unsplash_c29c2710e6.jpg',
            width: 125,
            height: 125,
            quality: 90,
          })
        "
        width="100%"
        height="700"
        cover
        style="margin-top: -65px; filter: grayscale(40%)"
        gradient="to bottom, rgba(0,0,0,.6), rgba(0,0,0,0)"
      ></v-img>
    </div>
  </div>
</template>

<script setup>
import { ThumborUrlBuilder } from "thumbor-url-builder-ts";

let isMounted = ref(false);

const thumbor = new ThumborUrlBuilder(
  import.meta.env.VITE_THUMBOR_KEY,
  "https://image.icjia.cloud"
);

const getThumborUrl = ({ url, width, height, quality, format }) => {
  let options = {
    url:
      url ||
      "https://r3.icjia-api.cloud/uploads/getty_images_Q_Ygr_G6nkm4g_unsplash_c29c2710e6.jpg",
    width: width || 2048,
    height: height || 1536,
    quality: quality || 50,
    format: format || "webp",
  };

  // console.log(options);

  return thumbor
    .setImagePath(options.url)
    .resize(options.width, options.height)
    .filter(`quality(${options.quality}):format('${options.format}')`)
    .smartCrop(true)
    .buildUrl();
};

onMounted(async () => {
  isMounted.value = true;
});
</script>

<style lang="scss" scoped></style>
