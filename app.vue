<template>
  <NuxtLayout>
    <v-app>
      <NavHome v-if="route.path === '/'"></NavHome>
      <NuxtPage />
    </v-app>
  </NuxtLayout>
</template>
<script setup>
let isHome = ref();
let hideBreadcrumbBar = ref(false);
const route = useRoute();
const routePath = ref(route.path);
let isMounted = ref(false);
watchEffect(() => {
  routePath.value = route.path;
  console.log("route.path from app.vue: ", routePath.value);

  // if (route.path === "/") {
  //   hideBreadcrumbBar.value = true;
  //   isHome = true;
  // } else {
  //   hideBreadcrumbBar.value = false;
  //   isHome = false;
  // }
});

const scrollToTop = () => {
  if (!isMounted.value) {
    return;
  }
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: "smooth",
  });
};

onMounted(() => {
  isMounted.value = true;
  console.log("isMounted: ", isMounted);
});
</script>
