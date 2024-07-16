<template>
  <div>
    <div>
      <v-img
        class="bg-grey-lighten-2"
        :src="
          getThumborUrl({
            url: 'https://icjia-sfs.netlify.app/splash-24-large-cropped.jpg',
            width: 2000,
            height: 1200,
            quality: 80,
          })
        "
        :lazy-src="
          getThumborUrl({
            url: 'https://icjia-sfs.netlify.app/splash-24-large-cropped.jpg',
            width: 250,
            height: 150,
            quality: 10,
          })
        "
        width="100%"
        height="700"
        cover
        style="margin-top: 60px; filter: grayscale(10%); position: relative"
        gradient="to bottom, rgba(0,0,0,.6), rgba(0,0,0,.1)"
        ><template v-slot:placeholder>
          <div class="d-flex align-center justify-center fill-height">
            <v-progress-circular
              color="grey-lighten-4"
              indeterminate
            ></v-progress-circular>
          </div>
        </template>
        <!-- <div id="header" class="hidden-sm-and-down">
          <div id="header-content">
            Developmentally and culturally appropriate direct services to children, ages 0
            – 5
          </div>
        </div> -->
        <div
          class="text-center"
          style="
            position: absolute;
            bottom: 25%;
            width: 100%;
            font-size: 46px;
            font-weight: 700;
            color: #fff;
            padding-left: 30px;
            padding-right: 30px;
          "
        >
          Direct services to children who have been exposed to violence
          <br />

          <div class="mt-6">
            <v-btn color="blue-darken-4" to="/about"
              >Learn More&nbsp;&raquo;</v-btn
            >&nbsp;

            <!-- &nbsp;&nbsp;<v-btn varient="outlined" style="color: black">Contact</v-btn> -->
          </div>
        </div>
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

<style scoped></style>
