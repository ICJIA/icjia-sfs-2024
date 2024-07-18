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
      <div
        v-if="!nav"
        class="hover hamburger text-center hidden-md-and-up"
        @click="toggleNav"
      >
        <v-icon icon="mdi-menu" size="large"></v-icon>
        <div style="font-size: 10px; font-weight: 900">MENU</div>
      </div>
      <div
        v-else
        class="hover hamburger text-center hidden-md-and-up"
        @click="toggleNav"
      >
        <v-icon icon="mdi-window-close" size="large"></v-icon>
        <div style="font-size: 10px; font-weight: 900">CLOSE</div>
      </div>
      <v-spacer class="hidden-md-and-up"></v-spacer>
      <img
        alt="ICJIA Logo"
        class="hover ml-4 mr-4"
        src="/icjia-logo.png"
        width="55"
        @click="$router.push('/')"
      />
      <div class="hover hidden-sm-and-down">
        <span
          style="
            font-weight: 900 !important;
            font-size: 24px;

            letter-spacing: 0.004em;
          "
          class="agency app-title"
          @click="$router.push('/')"
          >SAFE FROM THE START <span class="hidden-md-and-down"> </span
        ></span>
      </div>
      <div class="hover hidden-md-and-up">
        <span
          style="
            font-weight: 900 !important;
            font-size: 28px;

            letter-spacing: 0.004em;
          "
          class="agency app-title"
          @click="$router.push('/')"
          >SFS <span class="hidden-md-and-down"> </span
        ></span>
      </div>

      <v-spacer></v-spacer>
      <span v-if="isMounted">
        <span
          v-for="(menu, index) in navMenu"
          :key="`main-${index}`"
          style="display: inline-block"
        >
          <span v-if="menu && menu?.children">
            <v-menu>
              <template #activator="{ props }">
                <v-btn
                  variant="text"
                  size="default"
                  class="hidden-md-and-down navItem"
                  v-bind="props"
                  :aria-label="menu.main"
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
              <v-list nav density="compact" elevation="2">
                <span
                  v-for="(child, index) in menu.children"
                  :key="`child-${index}`"
                >
                  <v-divider v-if="child.divider"></v-divider>
                  <v-list-item-title
                    v-if="child.section"
                    style="margin-top: 10px; font-weight: 900; color: #555"
                    class="pr-5"
                    >{{ child.section }}</v-list-item-title
                  >
                  <v-list-item
                    v-if="child?.link"
                    class="appNav hover"
                    :to="child?.external ? null : child?.link"
                    :href="child?.external ? child?.link : null"
                    :target="child?.external ? '_blank' : null"
                  >
                    <v-list-item-title
                      style="font-size: 14px !important; font-weight: 700"
                      >{{ child.title }}
                      <span v-if="child?.external">External</span>
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

        <!-- <v-btn
          variant="text"
          aria-label="Search"
          size="default"
          class="hidden-md-and-down navItem"
          style="font-weight: 900 !important; font-size: 16px"
          @click="goToSearch"
        >
          <v-tooltip
            activator="parent"
            location="bottom"
            aria-label="Tooltip: Search"
          >
            Search
          </v-tooltip>
          <v-icon icon="mdi-magnify" size="large"></v-icon>
        </v-btn> -->

        <!-- <v-btn
          v-if="isTranslationEnabled"
          size="default"
          aria-label="Translate"
          class="hidden-md-and-down navItem"
          style="font-weight: 900 !important; font-size: 16px"
          @click="goToTranslate"
        >
          <v-tooltip
            activator="parent"
            location="bottom"
            aria-label="Tooltip: Translate"
          >
            Translate </v-tooltip
          ><v-icon icon="mdi-web" size="large"></v-icon
        ></v-btn> -->

        <!-- <span class="hidden-lg-and-up hidden-sm-and-down">
          <v-tooltip
            activator="parent"
            location="bottom"
            aria-label="Tooltip: More menu items"
          >
            More
          </v-tooltip>
          <v-menu transition="scale-transition">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                style="margin-top: -9px"
                aria-label="More menu items"
              >
                <v-icon>mdi-dots-vertical</v-icon>
              </v-btn>
            </template>

            <v-list>
              <v-list-item exact to="/about">
                <v-list-item-title style="font-size: 16px; font-weight: 700"
                  >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;About SFS</v-list-item-title
                >
              </v-list-item>

              <v-list-item exact to="/faq">
                <v-list-item-title style="font-size: 16px; font-weight: 700"
                  >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;FAQs</v-list-item-title
                >
              </v-list-item>
              <v-divider></v-divider>

              <v-list-item exact to="/search">
                <v-list-item-title style="font-size: 16px; font-weight: 700"
                  ><v-icon size="x-small" icon="mdi-magnify" left></v-icon
                  >&nbsp;&nbsp;Search</v-list-item-title
                >
              </v-list-item>
              <v-list-item
                v-if="isTranslationEnabled"
                exact
                style="cursor: pointer"
                to="/translate"
              >
                <v-list-item-title style="font-size: 16px; font-weight: 700"
                  ><v-icon size="x-small" icon="mdi-web" left></v-icon
                  >&nbsp;&nbsp;Translate</v-list-item-title
                >
              </v-list-item>
            </v-list>
          </v-menu>
        </span> -->
        <!-- <span
          class="hover hamburger text-center hidden-md-and-up"
          @click="goToSearch"
        >
          <v-icon icon="mdi-magnify" size="large"></v-icon>
          <div style="font-size: 10px; font-weight: 900">SEARCH</div>
        </span> -->
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

const goToTranslate = () => {
  router.push({ path: "/translate" });
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
