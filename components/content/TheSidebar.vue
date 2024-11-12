<template>
  <div class="d-flex">
    <v-navigation-drawer
      v-if="isMounted"
      v-model="drawer"
      temporary
      style="background: #fff"
    >
      <v-list v-model:opened="open" density="compact" id="myVlist">
        <v-list-item exact to="/" style="font-weight: 900; color: #000"
          >Home</v-list-item
        >
        <div
          v-for="(menu, index) in navMenu"
          :key="`sidebar-accordion-${index}`"
        >
          <div v-if="menu && menu.children">
            <v-list-group :value="menu.children.title">
              <template #activator="{ props }">
                <v-list-item
                  v-bind="props"
                  style="font-weight: 900 !important"
                  >{{ menu.main }}</v-list-item
                >
              </template>

              <div v-for="(child, i) in menu.children" :key="`main-${i}`">
                <v-list-item
                  v-if="child.section"
                  style="margin-top: 0px; font-weight: 900; color: #555"
                >
                  {{ child.section }}
                </v-list-item>
                <div
                  v-if="child.divider"
                  style="margin-top: 0px; font-weight: 900; color: #555"
                >
                  <v-divider></v-divider>
                </div>
                <v-list-item
                  v-if="child.title"
                  exact
                  style="margin-top: 0px; font-weight: 400; color: #555"
                  :to="child.link"
                >
                  <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{ child.title }}</span>
                </v-list-item>
              </div>
            </v-list-group>
          </div>
          <div v-else>
            <v-list-item
              style="font-weight: 900 !important"
              :to="menu.link"
              class="hover"
              >{{ menu.main }}</v-list-item
            >
          </div>
        </div>
        <!-- <v-list-item exact to="/contact" style="font-weight: 900 !important">
          Contact</v-list-item
        > -->
        <v-divider class="my-3"></v-divider>

        <!-- <v-list-item exact to="/contact">
          <v-icon left icon="mdi-magnify" size="x-small"></v-icon
          >&nbsp;&nbsp;&nbsp;Contact</v-list-item
        >-->
      </v-list>
    </v-navigation-drawer>
  </div>
</template>

<script setup>
const { isTranslationEnabled } = useAppConfig();
const appConfig = useAppConfig();
const navMenu = JSON.parse(JSON.stringify(appConfig.sidebarMenu));
const isMounted = ref(false);
const drawer = ref(false);
const open = ref([]);
const altState = useNavToggle();
watch(drawer, (val) => {
  altState.value = drawer.value;
});
watchEffect(() => {
  drawer.value = altState.value;
});
const click = () => {
  console.log("click sidebar");
  altState.value = false;
};

onMounted(async () => {
  isMounted.value = true;
  //TODO: a11y
  console.log("sidebar mounted");
  await nextTick();
  const el = document.getElementById("myVlist");
  console.log('sidebar a11y: remove role="list"');
  // console.log("Sidebar el: ", el);
  if (el) {
    el.removeAttribute("role");
  }
});

const router = useRouter();
const routeTo = (url) => {
  altState.value = false;

  router.push({ path: url });
};

const translationToggle = () => {
  const translationState = useTranslateToggle();
  translationState.value = !translationState.value;
};
</script>

<style lang="scss" scoped>
.sidebar-item {
  font-weight: 700;
  font-family: "Roboto", sans-serif;
}
</style>
