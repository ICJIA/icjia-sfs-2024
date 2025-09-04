<template>
  <div>
    <v-app-bar
      fixed
      app
      color="white"
      density="default"
      style="z-index: 50; width: 100%; overflow: unset !important"
      size="150px"
      elevation="3"
      class="pl-5 pr-5"
    >
      <v-btn
        v-if="!nav"
        @click="toggleNav"
        @keydown.enter="toggleNav"
        @keydown.space="toggleNav"
        aria-label="Open navigation menu"
        variant="text"
        class="hover hamburger text-center hidden-md-and-up"
        style="min-width: auto; padding: 8px"
      >
        <div class="d-flex flex-column align-center">
          <v-icon icon="mdi-menu" size="large"></v-icon>
          <div style="font-size: 10px; font-weight: 900">MENU</div>
        </div>
      </v-btn>
      <v-btn
        v-else
        @click="toggleNav"
        @keydown.enter="toggleNav"
        @keydown.space="toggleNav"
        aria-label="Close navigation menu"
        variant="text"
        class="hover hamburger text-center hidden-md-and-up"
        style="min-width: auto; padding: 8px"
      >
        <div class="d-flex flex-column align-center">
          <v-icon icon="mdi-window-close" size="large"></v-icon>
          <div style="font-size: 10px; font-weight: 900">CLOSE</div>
        </div>
      </v-btn>
      <v-spacer class="hidden-md-and-up"></v-spacer>
      <v-btn
        @click="$router.push('/')"
        @keydown.enter="$router.push('/')"
        @keydown.space="$router.push('/')"
        aria-label="Go to homepage"
        variant="text"
        class="hover ml-4 mr-4"
        style="min-width: auto; padding: 4px"
      >
        <img alt="ICJIA Logo" src="/icjia-logo.png" width="55" />
      </v-btn>
      <v-btn
        @click="$router.push('/')"
        @keydown.enter="$router.push('/')"
        @keydown.space="$router.push('/')"
        aria-label="Go to homepage - Safe From the Start"
        variant="text"
        class="hover hidden-sm-and-down"
        style="min-width: auto; padding: 8px"
      >
        <span
          style="
            font-weight: 900 !important;
            font-size: 22px;
            letter-spacing: 0.004em;
          "
          class="agency app-title"
          >SAFE FROM THE START <span class="hidden-md-and-down"> </span
        ></span>
      </v-btn>
      <v-btn
        @click="$router.push('/')"
        @keydown.enter="$router.push('/')"
        @keydown.space="$router.push('/')"
        aria-label="Go to homepage - SFS"
        variant="text"
        class="hover hidden-md-and-up"
        style="min-width: auto; padding: 8px"
      >
        <span
          style="
            font-weight: 900 !important;
            font-size: 24px;
            letter-spacing: 0.004em;
          "
          class="agency app-title"
          >SFS <span class="hidden-md-and-down"> </span
        ></span>
      </v-btn>

      <v-spacer></v-spacer>
      <span v-if="isMounted">
        <span
          v-for="(menu, index) in navMenu"
          :key="`main-${index}`"
          style="display: inline-block"
        >
          <span v-if="menu && menu?.children">
            <v-menu
              :close-on-content-click="true"
              :close-on-click="true"
              offset-y
            >
              <template #activator="{ props }">
                <v-btn
                  variant="text"
                  size="default"
                  class="hidden-md-and-down navItem"
                  v-bind="props"
                  :aria-label="`${menu.main} menu`"
                  :aria-expanded="props['aria-expanded']"
                  :aria-haspopup="true"
                  @keydown.down.prevent="$event.target.click()"
                  @keydown.enter.prevent="$event.target.click()"
                  @keydown.space.prevent="$event.target.click()"
                  style="
                    font-weight: 900 !important;
                    font-size: 18px;
                    margin-bottom: 5px;
                  "
                >
                  {{ menu.main }}
                  <v-icon right small>mdi-menu-down</v-icon></v-btn
                >
              </template>
              <v-list
                nav
                density="compact"
                elevation="2"
                role="menu"
                @keydown.esc="$event.target.closest('.v-menu').click()"
              >
                <span
                  v-for="(child, index) in menu.children"
                  :key="`child-${index}`"
                >
                  <v-divider v-if="child.divider"></v-divider>
                  <v-list-item-title
                    v-if="child.section"
                    style="margin-top: 10px; font-weight: 900; color: #555"
                    class="pr-5"
                    role="presentation"
                    >{{ child.section }}</v-list-item-title
                  >
                  <v-list-item
                    v-if="child?.link"
                    class="appNav hover"
                    :to="child?.external ? null : child?.link"
                    :href="child?.external ? child?.link : null"
                    :target="child?.external ? '_blank' : null"
                    role="menuitem"
                    tabindex="0"
                    @keydown.enter="navigateToChild(child)"
                    @keydown.space.prevent="navigateToChild(child)"
                  >
                    <v-list-item-title
                      style="font-size: 14px !important; font-weight: 700"
                      >{{ child.title }}
                      <span v-if="child?.external"> (external link)</span>
                      <v-icon v-if="child.icon" small right color="black">{{
                        child.icon
                      }}</v-icon></v-list-item-title
                    >
                  </v-list-item>
                </span>
              </v-list>
            </v-menu>
          </span>
          <span v-else class="d-flex">
            <v-btn
              :to="menu?.external ? null : menu?.link"
              :href="menu?.external ? menu.link : null"
              :target="menu?.external ? '_blank' : null"
              :aria-label="menu.main"
              variant="text"
              size="default"
              class="hidden-sm-and-down navItem"
              style="font-weight: 900 !important; font-size: 18px"
              >{{ menu.main }}&nbsp;
              <v-icon v-if="menu.icon" right small color="black">{{
                menu.icon
              }}</v-icon>
            </v-btn>
          </span>
        </span>
      </span>

      <span v-else class="text center ml-12"><TheLoader></TheLoader></span>
    </v-app-bar>
  </div>
</template>

<script setup>
const { isTranslationEnabled } = useAppConfig();
const isMounted = ref(false);
const nav = useNavToggle();
const toggleNav = () => {
  nav.value = !nav.value;
};

const appConfig = useAppConfig();
const navMenu = JSON.parse(JSON.stringify(appConfig.navMenu));

const isExternalUrl = (url) => {
  return true;
};

onMounted(() => {
  isMounted.value = true;
});

const router = useRouter();

const goToSearch = () => {
  router.push({ path: "/search" });
};

const navigateToChild = (child) => {
  if (child?.external) {
    window.open(child.link, "_blank");
  } else if (child?.link) {
    router.push(child.link);
  }
};

const items = ref([
  { title: "Click Me" },
  { title: "Click Me" },
  { title: "Click Me" },
  { title: "Click Me 2" },
]);
</script>

<style lang="scss" scoped>
.navItem {
  color: #333 !important;
  font-weight: 900;
}
</style>
