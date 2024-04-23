<template>
  <div>
    <div>
      <v-img
        class="bg-grey-lighten-2"
        :src="
          getThumborUrl({
            url: 'https://icjia-sfs.netlify.app/splash-01.jpg',
            width: 2000,
            height: 1200,
            quality: 30,
          })
        "
        :lazy-src="
          getThumborUrl({
            url: 'https://icjia-sfs.netlify.app/splash-01.jpg',
            width: 250,
            height: 150,
            quality: 10,
          })
        "
        width="100%"
        height="500"
        cover
        style="
          margin-top: -65px;
          filter: grayscale(10%);
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
    quality: quality || 50,
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

<style scoped>
/* #header {
  position: relative;
  min-height: 650px;
  font-size: 45px;
  max-width: 70%;
  font-weight: 700;
  color: #fff;
}

#header-content {
  position: absolute;
  bottom: 10px;
  left: 50%;
  color: #fff;
  padding-left: 120px;
  padding-right: 20px;
  line-height: 60px;

  font-weight: 400;
} */
</style>
