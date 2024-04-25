<template>
  <div>
    <div>
      <v-img
        class="bg-grey-lighten-2"
        :src="
          getThumborUrl({
            url: 'https://r3.icjia-api.cloud/uploads/large_splash_05_bc97fc68d2.jpg',
            quality: 90,
          })
        "
        :lazy-src="
          getThumborUrl({
            url: 'https://r3.icjia-api.cloud/uploads/thumbnail_splash_05_bc97fc68d2.jpg',
            width: 150,
            height: 150,
            quality: 10,
          })
        "
        width="100%"
        height="650"
        cover
        gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,0)"
        style="
          filter: grayscale(30%);
          position: relative;
          border-top: 1px solid #bbb;
          border-bottom: 1px solid #444;
        "
        ><template v-slot:placeholder>
          <div class="d-flex align-center justify-center fill-height">
            <v-progress-circular
              color="grey-lighten-4"
              indeterminate
            ></v-progress-circular>
          </div>
        </template>
      </v-img>
    </div>
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

onMounted(async () => {
  isMounted.value = true;
});
</script>

<style lang="scss" scoped></style>
