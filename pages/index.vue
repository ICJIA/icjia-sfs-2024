<template>
  <div>
    <SplashHome></SplashHome>

    <div>
      <HomeSplits></HomeSplits>
    </div>
  </div>
</template>

<script setup>
let isMounted = ref(false);

onMounted(async () => {
  isMounted.value = true;
});
</script>
