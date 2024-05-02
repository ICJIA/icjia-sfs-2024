<template>
  <NuxtLayout>
    <v-app>
      <!-- <NavHome v-if="route.path === '/'"></NavHome>
      <TheNav v-else></TheNav> -->
      <TheNav></TheNav>
      <NuxtPage style="min-height: 90vh" />
      <TheFooter></TheFooter>
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
  console.log("isMounted: ", isMounted.value);
});
</script>

<style>
h2,
h3,
h4,
h5,
h6 {
  a {
    color: black;
    text-decoration: none;
  }
}
</style>
