<template>
  <div>
    <SplashHome></SplashHome>

    <div>
      <HomeSplits></HomeSplits>
      <SplashHomeSecondary class="mt-16"></SplashHomeSecondary>
      <div style="background: #fafafa" class="pt-10">
        <v-container
          ><v-row
            ><v-col class="py-16 text-left">
              <h2 style="font-size: 36px" class="text-center">
                Childhood Exposure to Violence and Trauma
              </h2>
              <p
                style="font-size: 20px; font-family: 'Lato', sans-serif"
                class="mt-5"
              >
                Childhood exposure to violence (CEV) is pervasive and negatively
                impacts communities. CEV includes experiencing or witnessing
                physical abuse, sexual assault, maltreatment/neglect, domestic
                violence, and other violent crimes. In its third National Survey
                of Children’s Exposure to Violence, the U.S. Department of
                Justice and the Centers for Disease Control and Prevention found
                that almost 58% of children and youth between 0 and 17 years old
                had been exposed to at least one type of violence; 48% had
                experienced more than one type of victimization within the
                previous year.
              </p>
              <p
                style="font-size: 20px; font-family: 'Lato', sans-serif"
                class="mt-3"
              >
                The U.S. Department of Health and Human Services’ 2020 Child
                Maltreatment report series revealed 618,000 children in the
                United States were victims of child abuse and neglect; 29% of
                them were under age two.
              </p>

              <div class="text-center mt-12">
                <v-btn to="/childhood-exposure" color="blue-darken-4"
                  >Read more&nbsp;&raquo;</v-btn
                >&nbsp;&nbsp;
              </div>
            </v-col></v-row
          ></v-container
        >
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
