<template>
  <div>
    <v-container style="margin-top: 65px; margin-bottom: 75px"
      ><v-row
        ><v-col cols="12" class="text-center"
          ><h1 style="font-size: 36px">About Safe From the Start</h1>
          <div style="font-size: 22px" class="mt-6">
            The Safe From the Start (SFS) program provides developmentally and
            culturally appropriate direct services to children, ages 0 – 5, who
            have witnessed or been exposed to violence and their families. SFS
            focuses on serving young children who are victims of abuse, neglect,
            or maltreatment, and/or witnesses to domestic violence, sexual
            assault, or other violent crimes.
          </div>

          <div class="text-center mt-6">
            <v-btn color="blue-darken-4" style="font-weight: 900"
              >Program Summary&nbsp;&raquo;</v-btn
            >&nbsp;
            <v-btn variant="outlined" style="font-weight: 900"
              >Find SFS Locations in Illinois&nbsp;&raquo;
            </v-btn>
          </div></v-col
        ></v-row
      ></v-container
    >

    <div
      style="background: #f5f5f5; min-height: 200px; border-top: 1px #ddd solid"
      class="py-8"
    >
      <v-container class="text-center"
        ><v-row
          ><v-col
            ><h2 style="font-size: 36px">Core Components</h2></v-col
          ></v-row
        ></v-container
      >
      <v-container style="margin-top: 100px"
        ><v-row
          ><v-col cols="12" md="6"
            ><h2>Coalition-Building and Collaboration</h2>
            <p style="font-size: 20px">
              Coalition building, collaboration, and coordination are central
              components of the SFS program model. State and local agency,
              including community-based organizations, collaboration and
              coordination is required. SFS Coalitions develop strategies to
              build relationships with community partners to establish referrals
              into the program as well as link program participants with
              referrals in the community.
            </p>
            <!-- <div class="text-center mt-10">
              <v-btn color="blue-darken-3">Learn More</v-btn>
            </div> -->
          </v-col>

          <v-col cols="12" md="6" class="px-16 hidden-sm-and-down">
            <v-img
              class="bg-grey-lighten-2"
              :src="
                getThumborUrl({
                  url: 'https://icjia-sfs.netlify.app/splash-04.jpg',
                  width: 1200,
                  height: 800,
                  quality: 50,
                })
              "
              :lazy-src="
                getThumborUrl({
                  url: 'https://icjia-sfs.netlify.app/splash-04.jpg',
                  width: 250,
                  height: 150,
                  quality: 10,
                })
              "
              width="100%"
              height="400"
              cover
              style="
                margin-top: -65px;
                filter: grayscale(10%);
                position: relative;
              "
              gradient="to bottom, rgba(0,0,0,.6), rgba(0,0,0,.1)"
              ><template v-slot:placeholder>
                <div class="d-flex align-center justify-center fill-height">
                  <v-progress-circular
                    color="grey-lighten-4"
                    indeterminate
                  ></v-progress-circular>
                </div>
              </template>
            </v-img>
          </v-col> </v-row
      ></v-container>

      <v-container style="margin-top: 100px"
        ><v-row>
          <v-col cols="12" md="6" class="px-16 hidden-sm-and-down">
            <v-img
              class="bg-grey-lighten-2"
              :src="
                getThumborUrl({
                  url: 'https://icjia-sfs.netlify.app/splash-05.jpg',
                  width: 1200,
                  height: 800,
                  quality: 50,
                })
              "
              :lazy-src="
                getThumborUrl({
                  url: 'https://icjia-sfs.netlify.app/splash-05.jpg',
                  width: 250,
                  height: 150,
                  quality: 10,
                })
              "
              width="100%"
              height="400"
              cover
              style="
                margin-top: -65px;
                filter: grayscale(10%);
                position: relative;
              "
              gradient="to bottom, rgba(0,0,0,.6), rgba(0,0,0,.1)"
              ><template v-slot:placeholder>
                <div class="d-flex align-center justify-center fill-height">
                  <v-progress-circular
                    color="grey-lighten-4"
                    indeterminate
                  ></v-progress-circular>
                </div>
              </template>
            </v-img> </v-col
          ><v-col cols="12" md="6"
            ><h2>Direct Services</h2>
            <p style="font-size: 20px">
              Safe From the Start primarily serves young children (birth to 5
              years of age) who have been exposed to violence in the home or
              community and their families or caregivers. “Exposure to violence”
              is defined as being a victim or witness of abuse, neglect, or
              maltreatment or a witness to domestic, physical, or sexual
              violence, or other violent crime. Children older than five years
              maybe served if the primary client is ages 0-5.
            </p>
            <!-- <div class="text-center mt-10">
              <v-btn color="blue-darken-3">Find Out More</v-btn>
            </div> -->
          </v-col>
        </v-row></v-container
      >
      <v-container style="margin-top: 100px"
        ><v-row
          ><v-col cols="12" md="6"
            ><h2>Public Awareness</h2>
            <p style="font-size: 20px">
              The SFS program model’s third component is public awareness.
              Efforts to involve community members, increase public awareness,
              incorporate community input during planning, and educate residents
              about the scope of the problem are essential. These efforts range
              from community presentations, community events, professional
              trainings, media campaigns, and other methods for increasing
              awareness of childhood exposure to violence.
            </p>
            <!-- <div class="text-center mt-10">
              <v-btn color="blue-darken-3">Learn More</v-btn>
            </div> -->
          </v-col>

          <v-col cols="12" md="6" class="px-16 hidden-sm-and-down">
            <v-img
              class="bg-grey-lighten-2"
              :src="
                getThumborUrl({
                  url: 'https://icjia-sfs.netlify.app/splash-06.jpg',
                  width: 1200,
                  height: 800,
                  quality: 50,
                })
              "
              :lazy-src="
                getThumborUrl({
                  url: 'https://icjia-sfs.netlify.app/splash-06.jpg',
                  width: 250,
                  height: 150,
                  quality: 10,
                })
              "
              width="100%"
              height="400"
              cover
              style="
                margin-top: -65px;
                filter: grayscale(10%);
                position: relative;
              "
              gradient="to bottom, rgba(0,0,0,.6), rgba(0,0,0,.1)"
              ><template v-slot:placeholder>
                <div class="d-flex align-center justify-center fill-height">
                  <v-progress-circular
                    color="grey-lighten-4"
                    indeterminate
                  ></v-progress-circular>
                </div>
              </template>
            </v-img>
          </v-col> </v-row
      ></v-container>
      <v-container class="text-center mb-12" style="margin-top: -50px"
        ><v-row
          ><v-col cols="12"
            ><div class="text-center mt-10">
              <v-btn color="blue-darken-3"
                >Read More about Core Components&nbsp;&raquo;</v-btn
              >
            </div>
          </v-col></v-row
        ></v-container
      >
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

<style lang="scss" scoped></style>
