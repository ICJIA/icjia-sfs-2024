<!--
/**
 * TheNavV2 - Main navigation component.
 *
 * Desktop: horizontal menu with dropdown support.
 * Mobile: hamburger button toggles TheSidebar drawer.
 *
 * Navigation items render as real links (<a>/<nuxt-link> via Vuetify's `to`
 * prop) so that middle-click, right-click, and screen-reader link semantics
 * all work correctly.
 *
 * @component
 */
-->
<template>
  <header>
    <v-app-bar
      color="white"
      density="default"
      location="top"
      style="z-index: 50; overflow: unset !important"
      size="150px"
      elevation="3"
      class="pl-5 pr-5"
    >
      <!-- Mobile hamburger toggle -->
      <v-btn
        @click="toggleNav"
        variant="text"
        class="hover hamburger text-center hidden-md-and-up"
        style="min-width: auto; padding: 8px"
        :aria-expanded="nav ? 'true' : 'false'"
        :aria-label="nav ? 'Close navigation menu' : 'Open navigation menu'"
        aria-controls="site-sidebar"
      >
        <div class="d-flex flex-column align-center">
          <v-icon
            :icon="nav ? 'mdi-window-close' : 'mdi-menu'"
            size="large"
            aria-hidden="true"
          ></v-icon>
          <div style="font-size: 10px; font-weight: 900">
            {{ nav ? "CLOSE" : "MENU" }}
          </div>
        </div>
      </v-btn>

      <v-spacer class="hidden-md-and-up"></v-spacer>

      <!-- Logo + home link -->
      <v-btn
        to="/"
        variant="text"
        class="hover ml-4 mr-4"
        aria-label="Safe From the Start home"
        style="min-width: auto; padding: 4px; background-color: white !important"
      >
        <img
          alt=""
          role="presentation"
          src="/icjia-logo.png"
          width="55"
          height="39"
          decoding="async"
        />
      </v-btn>

      <!-- Full title - md+ -->
      <v-btn
        to="/"
        variant="text"
        class="hover hidden-sm-and-down"
        aria-label="Safe From the Start home"
        style="
          min-width: auto;
          padding: 8px;
          background-color: white !important;
          color: #333 !important;
        "
      >
        <span
          style="
            font-weight: 900 !important;
            font-size: 22px;
            letter-spacing: 0.004em;
          "
          class="agency app-title"
          >SAFE FROM THE START</span
        >
      </v-btn>

      <!-- Abbreviated title - sm -->
      <v-btn
        to="/"
        variant="text"
        class="hover hidden-md-and-up"
        aria-label="SFS – Safe From the Start home"
        style="
          min-width: auto;
          padding: 8px;
          background-color: white !important;
          color: #333 !important;
        "
      >
        <span
          style="
            font-weight: 900 !important;
            font-size: 24px;
            letter-spacing: 0.004em;
          "
          class="agency app-title"
        >
          <abbr
            title="Safe From the Start"
            style="text-decoration: none; border-bottom: 0"
            >SFS</abbr
          >
        </span>
      </v-btn>

      <v-spacer></v-spacer>

      <!-- Desktop menu -->
      <nav aria-label="Primary">
        <template v-for="(menu, index) in navMenu" :key="`main-${index}`">
          <!-- Dropdown group -->
          <v-menu
            v-if="menu && menu.children"
            :close-on-content-click="true"
          >
            <template #activator="{ props: activatorProps }">
              <v-btn
                variant="text"
                size="default"
                class="hidden-md-and-down navItem"
                v-bind="activatorProps"
                :aria-haspopup="true"
                style="
                  font-weight: 900 !important;
                  font-size: 18px;
                  margin-bottom: 5px;
                  background-color: white !important;
                  color: #333 !important;
                "
              >
                {{ menu.main }}
                <v-icon end aria-hidden="true">mdi-menu-down</v-icon>
              </v-btn>
            </template>

            <v-list nav density="compact" elevation="2" role="menu">
              <template
                v-for="(child, ci) in menu.children"
                :key="`child-${index}-${ci}`"
              >
                <v-divider v-if="child.divider" />
                <v-list-item
                  v-if="child.link"
                  class="appNav hover"
                  :to="child.external ? undefined : child.link"
                  :href="child.external ? child.link : undefined"
                  :target="child.external ? '_blank' : undefined"
                  :rel="child.external ? 'noopener noreferrer' : undefined"
                  role="menuitem"
                >
                  <v-list-item-title
                    style="font-size: 14px !important; font-weight: 700"
                  >
                    {{ child.title
                    }}<span v-if="child.external" class="sr-only">
                      (opens in new window)</span
                    >
                  </v-list-item-title>
                </v-list-item>
              </template>
            </v-list>
          </v-menu>

          <!-- Direct top-level link -->
          <v-btn
            v-else
            :to="menu.external ? undefined : menu.link"
            :href="menu.external ? menu.link : undefined"
            :target="menu.external ? '_blank' : undefined"
            :rel="menu.external ? 'noopener noreferrer' : undefined"
            variant="text"
            size="default"
            class="hidden-sm-and-down navItem"
            style="
              font-weight: 900 !important;
              font-size: 18px;
              background-color: white !important;
              color: #333 !important;
            "
          >
            {{ menu.main
            }}<span v-if="menu.external" class="sr-only">
              (opens in new window)</span
            >
          </v-btn>
        </template>
      </nav>

    </v-app-bar>
  </header>
</template>

<script setup>
const nav = useNavToggle();

const toggleNav = () => {
  nav.value = !nav.value;
};

const appConfig = useAppConfig();
const navMenu = appConfig.navMenu;
</script>

<style lang="scss" scoped>
.navItem {
  color: #333 !important;
  font-weight: 900;
  background-color: white !important;

  :deep(.v-btn__content) {
    background-color: white !important;
    color: #333 !important;
  }
}

:deep(.v-btn.navItem) {
  background-color: white !important;
  color: #333 !important;
}

:deep(.v-btn.navItem .v-btn__content) {
  background-color: white !important;
  color: #333 !important;
}
</style>
