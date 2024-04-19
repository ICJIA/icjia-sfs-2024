<template>
  <div>
    <HomeSplash></HomeSplash>
  </div>
</template>

<script setup>
let isMounted = ref(false);

onMounted(async () => {
  isMounted.value = true;
});
</script>
