<template>
  <div>
    <SplashHome></SplashHome>

    <div>
      <HomeSplits></HomeSplits>

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
