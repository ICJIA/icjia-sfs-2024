<!--
/**
 * TheNavV2 - Main navigation component for the ICJIA Safe From the Start application.
 *
 * This is the primary navigation bar displayed at the top of all pages. It provides:
 * - Responsive design with mobile hamburger menu
 * - ICJIA branding and logo
 * - Main navigation menu with dropdown support
 * - Accessibility features (ARIA labels, keyboard navigation)
 * - Integration with the mobile sidebar drawer
 *
 * The component adapts its layout based on screen size:
 * - Desktop: Full horizontal menu with dropdowns
 * - Tablet/Mobile: Hamburger menu that toggles the sidebar drawer
 *
 * @component
 * @example
 * <TheNavV2 />
 */
-->
<template>
  <div>
    <!--
      Main application bar with fixed positioning.
      High z-index ensures it stays above page content.
      overflow: unset allows dropdown menus to extend beyond the bar.
    -->
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
      <!--
        Mobile hamburger menu button (visible only on small screens).
        Toggles between menu icon and close icon based on drawer state.
        Includes keyboard accessibility with Enter and Space key handlers.
      -->
      <v-btn
        v-if="!nav"
        @click="toggleNav"
        @keydown.enter="toggleNav"
        @keydown.space="toggleNav"
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
        variant="text"
        class="hover hamburger text-center hidden-md-and-up"
        style="min-width: auto; padding: 8px"
      >
        <div class="d-flex flex-column align-center">
          <v-icon icon="mdi-window-close" size="large"></v-icon>
          <div style="font-size: 10px; font-weight: 900">CLOSE</div>
        </div>
      </v-btn>

      <!-- Spacer to push logo to center on mobile -->
      <v-spacer class="hidden-md-and-up"></v-spacer>
      <!--
        ICJIA logo button - navigates to homepage.
        Visible on all screen sizes.
      -->
      <v-btn
        @click="$router.push('/')"
        @keydown.enter="$router.push('/')"
        @keydown.space="$router.push('/')"
        variant="text"
        class="hover ml-4 mr-4"
        style="min-width: auto; padding: 4px"
      >
        <img alt="ICJIA Logo" src="/icjia-logo.png" width="55" />
      </v-btn>

      <!--
        Full application title - visible on medium screens and up.
        Displays "SAFE FROM THE START" text.
      -->
      <v-btn
        @click="$router.push('/')"
        @keydown.enter="$router.push('/')"
        @keydown.space="$router.push('/')"
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

      <!--
        Abbreviated application title - visible only on small/mobile screens.
        Displays "SFS" acronym to save space.
      -->
      <v-btn
        @click="$router.push('/')"
        @keydown.enter="$router.push('/')"
        @keydown.space="$router.push('/')"
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

      <!-- Spacer to push navigation menu to the right -->
      <v-spacer></v-spacer>
      <!--
        Main navigation menu - only rendered after component is mounted (client-side).
        This prevents hydration mismatches between server and client rendering.
      -->
      <span v-if="isMounted">
        <!--
          Loop through each menu item from app.config.js navMenu.
          Each item can be either a direct link or a dropdown menu with children.
        -->
        <span
          v-for="(menu, index) in navMenu"
          :key="`main-${index}`"
          style="display: inline-block"
        >
          <!--
            Dropdown menu for items with children.
            Includes full ARIA support and keyboard navigation.
          -->
          <span v-if="menu && menu?.children">
            <v-menu
              :close-on-content-click="true"
              :close-on-click="true"
              offset-y
            >
              <!--
                Dropdown activator button.
                Keyboard handlers allow opening dropdown with Down, Enter, or Space keys.
              -->
              <template #activator="{ props }">
                <v-btn
                  variant="text"
                  size="default"
                  class="hidden-md-and-down navItem"
                  v-bind="props"
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
              <!--
                Dropdown menu list containing child navigation items.
                Supports dividers, section headers, and both internal/external links.
                ESC key closes the dropdown for keyboard accessibility.
              -->
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
                  <!-- Optional divider between menu items -->
                  <v-divider v-if="child.divider"></v-divider>

                  <!-- Optional section header for grouping menu items -->
                  <v-list-item-title
                    v-if="child.section"
                    style="margin-top: 10px; font-weight: 900; color: #555"
                    class="pr-5"
                    role="presentation"
                    >{{ child.section }}</v-list-item-title
                  >

                  <!--
                    Individual menu item.
                    Handles both internal navigation (via :to) and external links (via :href).
                    Keyboard accessible with Enter and Space key handlers.
                  -->
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
                      <!-- Indicate external links for screen readers -->
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
          <!--
            Direct link menu item (no dropdown children).
            Handles both internal navigation and external links.
          -->
          <span v-else class="d-flex">
            <v-btn
              :to="menu?.external ? null : menu?.link"
              :href="menu?.external ? menu.link : null"
              :target="menu?.external ? '_blank' : null"
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

      <!--
        Loading indicator shown during server-side rendering or before mount.
        Prevents layout shift and provides visual feedback.
      -->
      <span v-else class="text center ml-12"><TheLoader></TheLoader></span>
    </v-app-bar>
  </div>
</template>

<script setup>
// Get translation feature flag from app configuration
const { isTranslationEnabled } = useAppConfig();

// Track whether component has been mounted (client-side only)
const isMounted = ref(false);

// Access the global navigation drawer toggle state
const nav = useNavToggle();

/**
 * Toggles the mobile navigation drawer open/closed.
 * Updates the global nav state used by TheSidebar component.
 *
 * @returns {void}
 */
const toggleNav = () => {
  nav.value = !nav.value;
};

// Get application configuration
const appConfig = useAppConfig();

// Deep clone the navigation menu to prevent reactivity issues
// This ensures modifications don't affect the original config
const navMenu = JSON.parse(JSON.stringify(appConfig.navMenu));

/**
 * Checks if a URL is external.
 *
 * Currently returns true for all URLs as a placeholder.
 * TODO: Implement actual external URL detection logic if needed.
 *
 * @param {string} url - The URL to check
 * @returns {boolean} Always returns true
 */
const isExternalUrl = (url) => {
  return true;
};

/**
 * Lifecycle hook - runs when component is mounted on the client.
 * Sets isMounted flag to enable client-side only rendering of navigation.
 */
onMounted(() => {
  isMounted.value = true;
});

// Access Vue Router for programmatic navigation
const router = useRouter();

/**
 * Navigates to the search page.
 *
 * Currently defined but not actively used in the template.
 * Preserved for potential future search functionality.
 *
 * @returns {void}
 */
const goToSearch = () => {
  router.push({ path: "/search" });
};

/**
 * Handles navigation for dropdown menu child items.
 *
 * Supports both internal navigation (via Vue Router) and external links
 * (opened in new tab). This is necessary for keyboard navigation where
 * the default link behavior needs to be programmatically triggered.
 *
 * @param {Object} child - The menu child item to navigate to
 * @param {string} child.link - The URL to navigate to
 * @param {boolean} [child.external] - Whether the link is external
 * @returns {void}
 */
const navigateToChild = (child) => {
  if (child?.external) {
    // Open external links in new tab
    window.open(child.link, "_blank");
  } else if (child?.link) {
    // Navigate internally using Vue Router
    router.push(child.link);
  }
};

/**
 * Placeholder items array.
 * Currently unused but preserved for potential future dropdown functionality.
 */
const items = ref([
  { title: "Click Me" },
  { title: "Click Me" },
  { title: "Click Me" },
  { title: "Click Me 2" },
]);
</script>

<style lang="scss" scoped>
/**
 * Scoped styles for navigation items.
 * These styles only apply to elements within this component.
 */

/*
 * Navigation item styling for consistent appearance.
 * Dark gray color provides good contrast while being softer than pure black.
 * Heavy font weight (900) ensures readability and visual hierarchy.
 */
.navItem {
  color: #333 !important;
  font-weight: 900;
}
</style>
