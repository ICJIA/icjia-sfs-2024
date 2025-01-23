<template>
  <div class="pb-16">
    <v-container
      ><v-row>
        <v-col class="text-center mb-6">
          <h1
            style="font-size: 40px; margin-top: 80px; text-transform: uppercase"
          >
            {{ data?.title }}
          </h1>
        </v-col>
        <v-img
          src="https://agency.icjia-api.cloud/uploads/large_pexels_freestockpro_oleksander_p_80cff2f2da.jpg"
          lazy-src="https://agency.icjia-api.cloud/uploads/thumbnail_pexels_freestockpro_oleksander_p_80cff2f2da.jpg"
          width="100%"
          height="700"
          cover
          style="filter: grayscale(60%); position: relative"
          class="hidden-sm-and-down"
          ><template v-slot:placeholder>
            <v-row class="fill-height ma-0" align="center" justify="center">
              <v-progress-circular
                indeterminate
                color="blue darken-3"
                aria-label="Progress bar: Loading"
              ></v-progress-circular>
            </v-row> </template
        ></v-img> </v-row
    ></v-container>

    <v-container
      ><v-row
        ><v-col cols="12" class="mt-10">
          <ContentDoc
            :key="data?.title"
            :value="data"
            class="markdown-body"
            style="font-family: 'Lato', sans-serif"
          >
            <template #empty>Document not found</template>
            <template #not-found>Document not found</template>
          </ContentDoc>
          <div class="markdown-body mt-10">
            <br />
            <p style="margin-top: -45px">
              Analysis of pre- and post-intervention data has shown
              <sup>1</sup>:
            </p>
            <div class="flex-container">
              <div class="flex-item">
                <div>
                  <v-icon style="font-size: 120px; color: green" class="mb-6"
                    >mdi-human-greeting-variant</v-icon
                  >
                  <br />
                  A significant reduction in the number of children that scored
                  in the borderline or clinical ranges for social, emotional,
                  and behavioral concerns after receiving services.
                </div>
              </div>
              <div class="flex-item">
                <div>
                  <v-icon style="font-size: 120px; color: green" class="mb-6"
                    >mdi-human-greeting-variant</v-icon
                  ><br />
                  Caregivers had reduced stress.
                </div>
              </div>
              <div class="flex-item">
                <div>
                  <v-icon style="font-size: 120px; color: green" class="mb-6"
                    >mdi-thought-bubble-outline</v-icon
                  ><br />
                  Children’s ability to identify feelings and caregiver’s
                  knowledge of trauma and its impact improved.
                </div>
              </div>
            </div>

            <h2 id="sfs-evaluation-resources" class="mt-8">
              SFS Evaluation Resources
            </h2>
            <p><em>Forms</em></p>
            <ul>
              <li>
                <p>Intake Form - Forthcoming</p>
              </li>
              <li>
                <p>Exit Form - Forthcoming</p>
              </li>
            </ul>
            <p><em>Evaluation Protocol</em></p>
            <ul>
              <li>
                <p>
                  <a
                    href="https://agency.icjia-api.cloud/uploads/SFS_Evaluation_Protocol_FINAL_10012024_b9ba78161c.docx"
                    >Evaluation Protocol</a
                  >
                </p>
              </li>
              <li>
                <p>Frequently Asked Questions - Forthcoming</p>
              </li>
            </ul>
            <p><em>Training Materials</em></p>
            <ul>
              <li>
                SFS Database 1.0 User's Quick Start Guide PT 1. - Forthcoming
              </li>
            </ul>
            <h2 id="sfs-and-related-research-publications">
              SFS and Related Research Publications
            </h2>
            <ul>
              <li>
                <p>
                  <a
                    href="https://icjia.illinois.gov/researchhub/articles/addressing-child-exposure-to-violence"
                    >Addressing Child Exposure to Violence</a
                  >
                </p>
              </li>
              <li>
                <p>
                  <a
                    href="https://icjia.illinois.gov/researchhub/articles/state-fiscal-year-2020-safe-from-the-start-annual-report-2001-2020/"
                    >State Fiscal Year 2020 Safe From the Start Annual Report:
                    2001-2020</a
                  >
                </p>
              </li>
              <li>
                <p>
                  <a
                    href="https://icjia.illinois.gov/about/publications/safe-from-the-start-year-13-2001-2014/"
                    >Safe From the Start Year 13: 2001-2014</a
                  >
                </p>
              </li>
              <li>
                <p>
                  <a
                    href="https://icjia.illinois.gov/about/publications/safe-from-the-start-year-12-report-2001-2013/"
                    >Safe From the Start Year 12 Report: 2001-2013</a
                  >
                </p>
              </li>
              <li>
                <p>
                  <a
                    href="https://icjia.illinois.gov/about/publications/2022-victim-service-planning-research-report/"
                    >2022 Victim Service Planning Research Report</a
                  >
                </p>
              </li>
              <li>
                <p>
                  <a
                    href="https://icjia.illinois.gov/researchhub/articles/2022-safe-from-the-start-process-evaluation/"
                    >2022 Safe From the Start Process Evaluation</a
                  >
                </p>
              </li>
            </ul>

            <h2>References</h2>
            <span style="font-size: 12px"
              ><sup>1</sup> Gonzalez, L. F., Nguyen, S. L., & Kirkner, A.
              (2022).
              <i
                >State fiscal year 2020 Safe From the Start annual report:
                2001-2020</i
              >. Illinois Criminal Justice Information Authority.</span
            >
          </div>
        </v-col></v-row
      ></v-container
    >
  </div>
</template>

<script setup>
import { getThumborUrl } from "@/src/utils/thumbor.js";

let isMounted = ref(false);
let splashFull = ref(null);
let splashThumbnail = ref(null);

const { data } = await useAsyncData(`content-research`, async () => {
  const post = await queryContent().where({ _path: "/research" }).findOne();
  return post;
});

if (data && data.value.splash && data.value.splash[0]) {
  splashFull.value = getThumborUrl(data.value.splash[0]);
  splashThumbnail.value = getThumborUrl({
    url: data.value.splash[0].url,
    width: 150,
    height: 150,
    quality: 10,
  });
} else {
  splashFull.value = null;
  splashThumbnail.value = null;
}

onMounted(async () => {
  isMounted.value = true;
  let footnoteLabel = document.getElementById("footnote-label");

  // Check if the element exists
  if (footnoteLabel) {
    // Change the inner text of the element
    footnoteLabel.innerText = "References";
  } else {
    console.log("Element with ID 'footnote-label' not found.");
  }
});
</script>

<style lang="scss" scoped>
:deep(.footnotes) {
  font-size: 12px !important;
}

.footnote-label {
  color: #666 !important;
}

.flex-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.flex-item {
  flex: 1 1 calc(33.333% - 20px);
  box-sizing: border-box;
  padding: 40px;
  background-color: #fafafa;
  border: 1px solid #ddd;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
</style>
