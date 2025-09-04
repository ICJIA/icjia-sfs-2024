<template>
  <div class="d-flex">
    <v-navigation-drawer
      v-if="isMounted"
      v-model="drawer"
      temporary
      style="background: #fff"
    >
      <nav aria-label="Main navigation">
        <v-list
          v-model:opened="open"
          density="compact"
          id="myVlist"
          role="navigation"
          aria-label="Site navigation menu"
        >
          <v-list-item exact to="/" style="font-weight: 900; color: #000"
            >Home</v-list-item
          >

          <template
            v-for="(menu, index) in navMenu"
            :key="`sidebar-accordion-${index}`"
          >
            <v-list-group
              v-if="menu && menu.children"
              :value="menu.children.title"
            >
              <template #activator="{ props }">
                <v-list-item
                  v-bind="props"
                  style="font-weight: 900 !important"
                  :aria-label="`${menu.main} submenu`"
                  >{{ menu.main }}</v-list-item
                >
              </template>

              <template v-for="(child, i) in menu.children" :key="`main-${i}`">
                <v-list-item
                  v-if="child.section"
                  style="margin-top: 0px; font-weight: 900; color: #555"
                  role="presentation"
                  tabindex="-1"
                >
                  {{ child.section }}
                </v-list-item>

                <v-divider
                  v-if="child.divider"
                  role="separator"
                  aria-hidden="true"
                  class="my-1"
                />

                <v-list-item
                  v-if="child.title"
                  exact
                  style="margin-top: 0px; font-weight: 400; color: #555"
                  :to="child.link"
                  :aria-label="child.title"
                >
                  <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{ child.title }}</span>
                </v-list-item>
              </template>
            </v-list-group>

            <v-list-item
              v-else
              style="font-weight: 900 !important"
              :to="menu.link"
              class="hover"
              :aria-label="menu.main"
              >{{ menu.main }}</v-list-item
            >
          </template>

          <!-- <v-list-item exact to="/contact" style="font-weight: 900 !important">
            Contact</v-list-item
          > -->
          <v-divider
            class="my-3"
            role="separator"
            aria-hidden="true"
          ></v-divider>

          <!-- <v-list-item exact to="/contact">
            <v-icon left icon="mdi-magnify" size="x-small"></v-icon
            >&nbsp;&nbsp;&nbsp;Contact</v-list-item
          >-->
        </v-list>
      </nav>
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
  console.log("sidebar mounted");
  await nextTick();
  // Navigation now uses proper ARIA semantics with nav element and role="navigation"
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
