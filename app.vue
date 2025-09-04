<template>
  <NuxtLayout>
    <v-app>
      <!-- Skip to main content link for accessibility -->
      <a
        href="#main-content"
        class="skip-link"
        @click="skipToMain"
        @keydown.enter="skipToMain"
      >
        Skip to main content
      </a>

      <!-- <NavHome v-if="route.path === '/'"></NavHome>
      <TheNav v-else></TheNav> -->
      <TheNavV2></TheNavV2>

      <TheSidebar></TheSidebar>

      <NuxtLoadingIndicator color="blue" />
      <main id="main-content" tabindex="-1">
        <NuxtPage style="min-height: 90vh" />
      </main>
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

const skipToMain = (event) => {
  event.preventDefault();
  const mainContent = document.getElementById("main-content");
  if (mainContent) {
    mainContent.focus();
    mainContent.scrollIntoView({ behavior: "smooth" });
  }
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

/* Skip link styles for accessibility */
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: #000;
  color: #fff;
  padding: 8px;
  text-decoration: none;
  z-index: 1000;
  border-radius: 4px;
  font-weight: bold;
  transition: top 0.3s;
}

.skip-link:focus {
  top: 6px;
}
</style>
