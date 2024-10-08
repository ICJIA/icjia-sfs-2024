<template>
  <div>
    <v-container style="margin-top: 65px; margin-bottom: 75px"
      ><v-row
        ><v-col cols="12" md="12" class="">
          <v-sheet>
            <h1 style="font-size: 36px" class="text-center">
              About Safe From the Start
            </h1>
            <div
              style="font-size: 20px; font-family: 'Lato', sans-serif"
              class="mt-6 text-left"
            >
              <p class="mb-5">
                <nuxt-link to="/about">
                  The Safe From the Start (SFS) program</nuxt-link
                >
                provides developmentally and culturally appropriate direct
                services to children, ages 0 – 5, who have witnessed or been
                exposed to violence and their families. SFS focuses on serving
                young children who are victims of abuse, neglect, or
                maltreatment, and/or witnesses to domestic violence, sexual
                assault, or other violent crimes.
              </p>
              <p>
                Safe From the Start began as a national initiative to reduce the
                impact of early childhood exposure to violence. The program was
                implemented in 2001 to develop, implement, and evaluate
                comprehensive, coordinated, community-based models to identify,
                assess, and serve children, ages 0 to 5, who have been exposed
                to violence in their homes and/or communities.
              </p>
            </div>

            <div class="text-center mt-16">
              <!-- <v-btn color="blue-darken-4" to="/about" style="font-weight: 900"
              >Learn More&nbsp;&raquo;</v-btn
            >&nbsp; -->
              <v-btn variant="outlined" to="/sites" style="font-weight: 900"
                >Find SFS sites in Illinois&nbsp;&raquo;
              </v-btn>
            </div></v-sheet
          ></v-col
        >

        <!-- <v-col cols="12" md="6">
          <v-sheet class="text-center">
            <h2 style="font-size: 36px">News and Information</h2>
          </v-sheet>
        </v-col> -->
      </v-row></v-container
    >

    <div
      style="
        background: #f5f5f5;
        min-height: 200px;
        border-top: 1px #ddd solid;
        font-family: 'Lato', sans-serif;
      "
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
              components of the SFS program model. SFS coalitions build
              relationships with community partners that can both make referrals
              into the program and link program participants with other
              resources. Additionally, SFS coalitions focus on broader program
              implementation, organizational change, information sharing
              enhancements, protocol creation, and other tasks related to
              service collaboration and coordination.
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
                  url: 'https://sfs.icjia.illinois.gov/splash-29-large.jpg',
                  width: 1200,
                  height: 800,
                  quality: 50,
                })
              "
              :lazy-src="
                getThumborUrl({
                  url: 'https://sfs.icjia.illinois.gov/splash-29-large.jpg',
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
                  url: 'https://sfs.icjia.illinois.gov/splash-05.jpg',
                  width: 1200,
                  height: 800,
                  quality: 50,
                })
              "
              :lazy-src="
                getThumborUrl({
                  url: 'https://sfs.icjia.illinois.gov/splash-05.jpg',
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
              SFS primarily serves young children from birth to 5 years of age
              who have been exposed to violence in the home or community and
              their families or caregivers. Children older than five years may
              be served if the primary client is aged 0 to 5. _Exposure to
              violence_ occurs with being victimized or witnessing abuse,
              neglect, or maltreatment or a witness to domestic, physical, or
              sexual violence, or other violent crime.
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
              Essential efforts include community member involvement, increased
              public awareness, community-informed planning, education about the
              scope and impact of childhood exposure to violence, and promoting
              healing services. Public awareness activities range from community
              presentations and events to professional trainings and media
              campaigns.
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
                  url: 'https://sfs.icjia.illinois.gov/splash-06.jpg',
                  width: 1200,
                  height: 800,
                  quality: 50,
                })
              "
              :lazy-src="
                getThumborUrl({
                  url: 'https://sfs.icjia.illinois.gov/splash-06.jpg',
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
              <v-btn color="blue-darken-3" to="/program-summary"
                >Read the Program Summary&nbsp;&raquo;</v-btn
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
    url: url || "https://sfs.icjia.illinois.gov/error.jpg",
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
