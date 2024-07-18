<template>
  <nav>
    <div
      variant="text"
      class="text-center pt-3 pb-3 footer-bg"
      style="justify-content: space-around; background: #1263a5"
    >
      <span v-for="(item, index) in navMenu" :key="index">
        <NuxtLink
          :to="item.link"
          class="context-link px-2"
          style="font-size: 14px; font-family: 'Oswald', sans-serif !important"
          >{{ item.main }}</NuxtLink
        >
        <span v-if="menuLength - 1 !== index"> | </span>
      </span>
    </div>
  </nav>
</template>

<script setup>
const appConfig = useAppConfig();
const navMenu = JSON.parse(JSON.stringify(appConfig.footerMenu));
const menuLength = navMenu.length;
</script>

<style scoped>
a.context-link {
  font-family: "Raleway" !important;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  text-decoration: none;

  text-transform: uppercase;
  letter-spacing: 0.09em;
}

a.context-link:hover {
  /* text-decoration: underline; */
  color: #aaa;
}
.footer-bg {
  background: #522c74;
  min-width: 100%;
  color: #fff;
  font-size: 16px;
  font-weight: 900;
}
</style>
