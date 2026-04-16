<!--
/**
 * HomeSplits - Main content component for the homepage.
 *
 * This component displays the primary content sections of the homepage, including:
 * - Program introduction and overview
 * - Three core components (Coalition-Building, Direct Services, Public Awareness)
 * - Responsive image/text layouts
 * - Call-to-action buttons
 *
 * The layout uses a split-screen design on desktop (text + image) and stacks
 * vertically on mobile devices. Images are hidden on small screens to improve
 * mobile performance and readability.
 *
 * @component
 * @example
 * <HomeSplits />
 */
-->
<template>
  <div>
    <!--
      Program introduction section.
      Full-width container with centered text and call-to-action.
    -->
    <v-container style="margin-top: 65px; margin-bottom: 75px"
      ><v-row
        ><v-col cols="12" md="12" class="">
          <v-sheet>
            <h2 style="font-size: 36px" class="text-center">
              About Safe From the Start
            </h2>
            <div
              style="font-size: 20px; font-family: 'Lato', sans-serif"
              class="mt-6 text-left"
            >
              <!-- Program overview with link to full About page -->
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

              <!-- Historical context -->
              <p>
                Safe From the Start began as a national initiative to reduce the
                impact of early childhood exposure to violence. The program was
                implemented in 2001 to develop, implement, and evaluate
                comprehensive, coordinated, community-based models to identify,
                assess, and serve children, ages 0 to 5, who have been exposed
                to violence in their homes and/or communities.
              </p>
            </div>

            <!-- Call-to-action button -->
            <div class="text-center mt-16">
              <!-- Learn More button - currently disabled -->
              <!-- <v-btn color="blue-darken-4" to="/about" style="font-weight: 900"
              >Learn More&nbsp;&raquo;</v-btn
            >&nbsp; -->
              <v-btn variant="outlined" to="/sites" style="font-weight: 900"
                >Find SFS sites in Illinois&nbsp;&raquo;
              </v-btn>
            </div></v-sheet
          ></v-col
        >

        <!-- News section - currently disabled -->
        <!-- <v-col cols="12" md="6">
          <v-sheet class="text-center">
            <h2 style="font-size: 36px">News and Information</h2>
          </v-sheet>
        </v-col> -->
      </v-row></v-container
    >

    <!--
      Core Components section.
      Light gray background distinguishes this section from the introduction.
      Contains three subsections with alternating text/image layouts.
    -->
    <div
      style="
        background: #f5f5f5;
        min-height: 200px;
        border-top: 1px #ddd solid;
        font-family: 'Lato', sans-serif;
      "
      class="py-8"
    >
      <!-- Section header -->
      <v-container class="text-center"
        ><v-row
          ><v-col
            ><h2 style="font-size: 36px">Core Components</h2></v-col
          ></v-row
        ></v-container
      >

      <!--
        Component 1: Coalition-Building and Collaboration
        Layout: Text (left) + Image (right) on desktop
      -->
      <v-container style="margin-top: 100px"
        ><v-row
          ><v-col cols="12" md="6"
            ><h3>Coalition-Building and Collaboration</h3>
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
            <!-- Learn More button - currently disabled -->
            <!-- <div class="text-center mt-10">
              <v-btn color="blue-darken-3">Learn More</v-btn>
            </div> -->
          </v-col>

          <!--
            Decorative image for Coalition-Building section.
            Hidden on small/medium screens to improve mobile performance.
          -->
          <v-col cols="12" md="6" class="px-16 hidden-sm-and-down">
            <v-img
              class="bg-grey-lighten-2"
              alt="Community members collaborating in a meeting - representing coalition building and collaboration"
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

      <!--
        Component 2: Direct Services
        Layout: Image (left) + Text (right) on desktop - reversed from Component 1
      -->
      <v-container style="margin-top: 100px"
        ><v-row>
          <!--
            Decorative image for Direct Services section.
            Positioned on left side for visual variety.
          -->
          <v-col cols="12" md="6" class="px-16 hidden-sm-and-down">
            <v-img
              class="bg-grey-lighten-2"
              alt="Healthcare provider working with a young child - representing direct services to children exposed to violence"
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
            ><h3>Direct Services</h3>
            <p style="font-size: 20px">
              SFS primarily serves young children from birth to 5 years of age
              who have been exposed to violence in the home or community and
              their families or caregivers. Children older than five years may
              be served if the primary client is aged 0 to 5.
              <em>Exposure to violence</em> occurs with being victimized or
              witnessing abuse,
              neglect, or maltreatment or a witness to domestic, physical, or
              sexual violence, or other violent crime.
            </p>
            <!-- <div class="text-center mt-10">
              <v-btn color="blue-darken-3">Find Out More</v-btn>
            </div> -->
          </v-col>
        </v-row></v-container
      >
      <!--
        Component 3: Public Awareness
        Layout: Text (left) + Image (right) on desktop - same as Component 1
      -->
      <v-container style="margin-top: 100px"
        ><v-row
          ><v-col cols="12" md="6"
            ><h3>Public Awareness</h3>
            <p style="font-size: 20px">
              The SFS program model’s third component is public awareness.
              Essential efforts include community member involvement, increased
              public awareness, community-informed planning, education about the
              scope and impact of childhood exposure to violence, and promoting
              healing services. Public awareness activities range from community
              presentations and events to professional trainings and media
              campaigns.
            </p>
            <!-- Learn More button - currently disabled -->
            <!-- <div class="text-center mt-10">
              <v-btn color="blue-darken-3">Learn More</v-btn>
            </div> -->
          </v-col>

          <!--
            Decorative image for Public Awareness section.
            Hidden on small/medium screens.
          -->
          <v-col cols="12" md="6" class="px-16 hidden-sm-and-down">
            <v-img
              class="bg-grey-lighten-2"
              alt="Community presentation or training session - representing public awareness and education efforts"
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

      <!--
        Call-to-action section.
        Centered button linking to the full program summary.
      -->
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
import { getThumborUrl } from "@/utils/thumbor.js";
</script>

<style lang="scss" scoped></style>
