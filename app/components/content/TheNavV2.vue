<!--
/**
 * TheNavV2 - Main navigation component.
 *
 * Renders the app bar with plain HTML elements (NuxtLink, button) so that
 * automated accessibility checkers can see through to the real foreground /
 * background pair. Vuetify's v-btn injects .v-btn__overlay / .v-btn__underlay
 * spans that confuse axe-core's contrast algorithm, so we avoid it here.
 *
 * Desktop: horizontal links with click-to-open dropdown groups.
 * Mobile: hamburger button toggles TheSidebar drawer.
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
      <button
        type="button"
        class="navBtn navBtn--hamburger hidden-md-and-up"
        :aria-expanded="nav ? 'true' : 'false'"
        :aria-label="nav ? 'Close navigation menu' : 'Open navigation menu'"
        aria-controls="site-sidebar"
        @click="toggleNav"
      >
        <span class="d-flex flex-column align-center">
          <v-icon
            :icon="nav ? 'mdi-window-close' : 'mdi-menu'"
            size="large"
            aria-hidden="true"
          ></v-icon>
          <span class="navBtn__hint">{{ nav ? "CLOSE" : "MENU" }}</span>
        </span>
      </button>

      <v-spacer class="hidden-md-and-up"></v-spacer>

      <!-- Logo + home link -->
      <NuxtLink
        to="/"
        class="navBtn navBtn--logo"
        aria-label="Safe From the Start home"
      >
        <img
          alt=""
          role="presentation"
          src="/icjia-logo.png"
          width="55"
          height="39"
          decoding="async"
        />
      </NuxtLink>

      <!-- Full title - md+ -->
      <NuxtLink
        to="/"
        class="navBtn navBtn--title hidden-sm-and-down"
        aria-label="Safe From the Start home"
      >
        <span class="agency app-title navBtn__title">SAFE FROM THE START</span>
      </NuxtLink>

      <!-- Abbreviated title - sm -->
      <NuxtLink
        to="/"
        class="navBtn navBtn--title hidden-md-and-up"
        aria-label="SFS – Safe From the Start home"
      >
        <span class="agency app-title navBtn__title navBtn__title--abbr">
          <abbr
            title="Safe From the Start"
            style="text-decoration: none; border-bottom: 0"
            >SFS</abbr
          >
        </span>
      </NuxtLink>

      <v-spacer></v-spacer>

      <!-- Desktop menu -->
      <nav aria-label="Primary" class="primaryNav hidden-md-and-down">
        <template v-for="(menu, index) in navMenu" :key="`main-${index}`">
          <!-- Dropdown group -->
          <div
            v-if="menu && menu.children"
            class="primaryNav__group"
            @keydown.esc="closeMenu(index)"
            @mouseleave="scheduleClose(index)"
            @mouseenter="cancelClose(index)"
          >
            <button
              :ref="(el) => setActivator(index, el)"
              type="button"
              class="navItem primaryNav__activator"
              :aria-expanded="openMenu === index ? 'true' : 'false'"
              :aria-controls="`primary-menu-${index}`"
              :data-menu-open="openMenu === index ? 'true' : 'false'"
              @click="toggleMenu(index)"
            >
              {{ menu.main }}
              <v-icon end aria-hidden="true">mdi-menu-down</v-icon>
            </button>
            <ul
              v-show="openMenu === index"
              :id="`primary-menu-${index}`"
              class="primaryNav__menu"
              role="menu"
            >
              <li
                v-for="(child, ci) in menu.children.filter((c) => !c.divider && c.link)"
                :key="`child-${index}-${ci}`"
                role="none"
              >
                <NuxtLink
                  v-if="!child.external"
                  :to="child.link"
                  class="primaryNav__menuItem"
                  role="menuitem"
                  @click="closeMenu(index)"
                  >{{ child.title }}</NuxtLink
                >
                <a
                  v-else
                  :href="child.link"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="primaryNav__menuItem"
                  role="menuitem"
                  @click="closeMenu(index)"
                  >{{ child.title
                  }}<span class="sr-only"> (opens in new window)</span></a
                >
              </li>
            </ul>
          </div>

          <!-- Direct top-level link -->
          <NuxtLink
            v-else-if="!menu.external"
            :to="menu.link"
            class="navItem primaryNav__link"
            >{{ menu.main }}</NuxtLink
          >
          <a
            v-else
            :href="menu.link"
            target="_blank"
            rel="noopener noreferrer"
            class="navItem primaryNav__link"
            >{{ menu.main
            }}<span class="sr-only"> (opens in new window)</span></a
          >
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

const openMenu = ref(-1);
const activators = new Map();
const closeTimers = new Map();

const setActivator = (index, el) => {
  if (el) activators.set(index, el);
  else activators.delete(index);
};

const toggleMenu = (index) => {
  openMenu.value = openMenu.value === index ? -1 : index;
};

const closeMenu = (index) => {
  if (openMenu.value === index) openMenu.value = -1;
};

const scheduleClose = (index) => {
  cancelClose(index);
  const t = setTimeout(() => {
    if (openMenu.value === index) openMenu.value = -1;
  }, 200);
  closeTimers.set(index, t);
};

const cancelClose = (index) => {
  const t = closeTimers.get(index);
  if (t) {
    clearTimeout(t);
    closeTimers.delete(index);
  }
};

if (typeof window !== "undefined") {
  const onDocClick = (e) => {
    if (openMenu.value === -1) return;
    const activator = activators.get(openMenu.value);
    if (activator && (activator === e.target || activator.contains(e.target))) {
      return;
    }
    const menuEl = document.getElementById(`primary-menu-${openMenu.value}`);
    if (menuEl && menuEl.contains(e.target)) return;
    openMenu.value = -1;
  };
  onMounted(() => document.addEventListener("click", onDocClick));
  onBeforeUnmount(() => document.removeEventListener("click", onDocClick));
}
</script>

<style lang="scss" scoped>
.navBtn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  color: #333;
  text-decoration: none;
  border: 0;
  cursor: pointer;
  font-family: inherit;
  font-weight: 900;
  line-height: 1;
  padding: 8px;
  min-width: auto;
  border-radius: 4px;
}

.navBtn:focus-visible {
  outline: 2px solid #1263a5;
  outline-offset: 2px;
}

.navBtn--hamburger {
  font-size: 10px;
  padding: 8px;
  font-weight: 900;
}

.navBtn__hint {
  font-size: 10px;
  font-weight: 900;
}

.navBtn--logo {
  margin-left: 16px;
  margin-right: 16px;
  padding: 4px;
}

.navBtn__title {
  font-weight: 900;
  font-size: 22px;
  letter-spacing: 0.004em;
}

.navBtn__title--abbr {
  font-size: 24px;
}

.primaryNav {
  display: flex;
  align-items: center;
  gap: 4px;
}

.navItem,
.primaryNav__link,
.primaryNav__activator {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #fff;
  color: #333;
  font-weight: 900;
  font-size: 18px;
  padding: 8px 12px;
  text-decoration: none;
  border: 0;
  border-radius: 4px;
  cursor: pointer;
  font-family: inherit;
  line-height: 1;
}

.primaryNav__link:hover,
.primaryNav__activator:hover {
  background: #f5f5f5;
}

.primaryNav__link:focus-visible,
.primaryNav__activator:focus-visible {
  outline: 2px solid #1263a5;
  outline-offset: 2px;
}

.primaryNav__link.router-link-exact-active,
.primaryNav__link.router-link-active {
  text-decoration: underline;
  text-underline-offset: 4px;
  text-decoration-thickness: 2px;
}

.primaryNav__group {
  position: relative;
}

.primaryNav__menu {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  min-width: 200px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  list-style: none;
  margin: 0;
  padding: 4px 0;
  z-index: 60;
}

.primaryNav__menuItem {
  display: block;
  padding: 8px 16px;
  color: #333;
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
}

.primaryNav__menuItem:hover,
.primaryNav__menuItem:focus-visible {
  background: #f5f5f5;
  outline: none;
}
</style>
