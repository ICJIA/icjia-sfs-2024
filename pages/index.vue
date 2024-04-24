<template>
  <div>
    <HomeSplash></HomeSplash>

    <div>
      <HomeSplits></HomeSplits>
      <HomeSplashSecondary class="mt-16"></HomeSplashSecondary>
      <div style="background: #fafafa" class="pt-10">
        <v-container
          ><v-row
            ><v-col class="py-16 text-center">
              <h2 style="font-size: 36px" class="text-center">
                Childhood Exposure to Violence and Trauma
              </h2>
              <p style="font-size: 22px" class="mt-5">
                Childhood exposure to violence is pervasive and negatively
                impacts communities. This includes physical abuse, sexual
                assault, maltreatment/neglect, domestic violence, and other
                violent crimes.
              </p>
              <p style="font-size: 22px" class="mt-3">
                In their third National Survey of Children's Exposure to
                Violence , the U.S. Department of Justice and the Centers for
                Disease Control and Prevention found that almost 58% of children
                and youth between 0 and 17 years old had been exposed to at
                least one type of violence and 48% had experienced more than one
                type of victimization within the previous year. In the 2020
                edition of the annual Child Maltreatment report series, child
                protective services agencies found that 618,000 children in the
                United States were victims of child abuse and neglect; 29% of
                them were under the age of two.
              </p>
              <p style="font-size: 22px" class="mt-3">
                The U.S. Advisory Board on Child Abuse suggests that domestic
                violence may be the single major precursor to child abuse and
                neglect fatalities in the county.
              </p>

              <div class="text-center mt-8">
                <v-btn color="blue-darken-4">Learn More&nbsp;&raquo;</v-btn
                >&nbsp;&nbsp;

                <!-- <v-btn variant="outlined">Find SFS Locations in Illinois </v-btn> -->
              </div>
            </v-col></v-row
          ></v-container
        >
      </div>
      <div
        style="
          height: 200px;
          background: #1a237e;
          font-weight: 900;
          color: #fff;
        "
        class="text-center pt-10"
      >
        Footer here
      </div>
    </div>
  </div>
</template>

<script setup>
let isMounted = ref(false);

onMounted(async () => {
  isMounted.value = true;
});
</script>
