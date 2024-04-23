<template>
  <div>
    <HomeSplash></HomeSplash>

    <div>
      <HomeSplits></HomeSplits>
      <HomeSplashSecondary class="mt-16"></HomeSplashSecondary>
      <div style="height: 500px; background: #fafafa" class="pt-10">
        <v-container
          ><v-row
            ><v-col class="text-center">
              <h2 style="font-size: 36px">Childhood Exposure to Violence and Trauma</h2>
              <p style="font-size: 22px" class="mt-5">
                Childhood exposure to violence is pervasive and negatively impacts
                communities. This includes physical abuse, sexual assault,
                maltreatment/neglect, domestic violence, and other violent crimes.
              </p></v-col
            ></v-row
          ></v-container
        >
      </div>
      <div
        style="height: 200px; background: #1a237e; font-weight: 900; color: #fff"
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
