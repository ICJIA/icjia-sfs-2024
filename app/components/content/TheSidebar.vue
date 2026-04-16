<!--
/**
 * TheSidebar - Mobile navigation drawer.
 *
 * Renders a native <nav><ul> inside a Vuetify temporary drawer so ARIA
 * semantics map correctly to nav/list/listitem/link without JS role patches.
 *
 * Focus is moved into the first link when the drawer opens
 * (WCAG 2.4.3 Focus Order). The drawer also closes on Escape.
 *
 * @component
 */
-->
<template>
  <v-navigation-drawer
    id="site-sidebar"
    v-model="drawer"
    temporary
    style="background: #fff"
    role="dialog"
    aria-modal="true"
    aria-label="Main navigation"
  >
    <nav aria-label="Main navigation" class="sidebar-nav">
      <ul class="sidebar-list" @keydown.esc="drawer = false">
        <li>
          <NuxtLink
            ref="firstLinkRef"
            to="/"
            class="sidebar-link sidebar-link--top"
            @click="drawer = false"
            >Home</NuxtLink
          >
        </li>

        <li
          v-for="(menu, index) in navMenu"
          :key="`sidebar-${index}`"
          class="sidebar-group"
        >
          <template v-if="menu.children">
            <button
              type="button"
              class="sidebar-link sidebar-link--top sidebar-group__toggle"
              :aria-expanded="openGroups[index] ? 'true' : 'false'"
              :aria-controls="`sidebar-group-${index}`"
              @click="toggleGroup(index)"
            >
              <span>{{ menu.main }}</span>
              <v-icon
                :icon="openGroups[index] ? 'mdi-chevron-up' : 'mdi-chevron-down'"
                aria-hidden="true"
              />
            </button>
            <ul
              v-show="openGroups[index]"
              :id="`sidebar-group-${index}`"
              class="sidebar-sublist"
            >
              <li v-for="(child, ci) in menu.children" :key="`c-${index}-${ci}`">
                <NuxtLink
                  v-if="child.link"
                  :to="child.link"
                  class="sidebar-link sidebar-link--child"
                  @click="drawer = false"
                  >{{ child.title }}</NuxtLink
                >
              </li>
            </ul>
          </template>
          <NuxtLink
            v-else
            :to="menu.link"
            class="sidebar-link sidebar-link--top"
            @click="drawer = false"
            >{{ menu.main }}</NuxtLink
          >
        </li>
      </ul>
    </nav>
  </v-navigation-drawer>
</template>

<script setup>
const appConfig = useAppConfig();
const navMenu = appConfig.sidebarMenu;

const drawer = useNavToggle();
const firstLinkRef = ref(null);
const openGroups = ref(
  navMenu.map((m) => Boolean(m.children && m.children.length))
);

const toggleGroup = (index) => {
  openGroups.value[index] = !openGroups.value[index];
};

watch(drawer, async (isOpen) => {
  if (!isOpen) return;
  await nextTick();
  // NuxtLink renders as <a>; its root element is exposed via $el when using ref.
  const el = firstLinkRef.value?.$el ?? firstLinkRef.value;
  if (el && typeof el.focus === "function") el.focus();
});
</script>

<style lang="scss" scoped>
.sidebar-nav {
  padding: 8px 0;
}

.sidebar-list,
.sidebar-sublist {
  list-style: none;
  margin: 0;
  padding: 0;
}

.sidebar-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 12px 16px;
  color: #1a1a1a;
  text-decoration: none;
  font-family: "Roboto", sans-serif;
  background: transparent;
  border: 0;
  cursor: pointer;
  font-size: 16px;
}

.sidebar-link--top {
  font-weight: 900;
}

.sidebar-link--child {
  padding-left: 32px;
  font-weight: 400;
  color: #333;
}

.sidebar-link:hover,
.sidebar-link:focus-visible {
  background: #f2f2f2;
  text-decoration: underline;
}

.sidebar-link.router-link-active {
  background: #eef4fb;
}

.sidebar-group__toggle {
  text-align: left;
}
</style>
