<!--
/**
 * TheSidebar - Mobile navigation drawer component for the ICJIA Safe From the Start application.
 *
 * This component provides a slide-out navigation drawer for mobile and tablet devices.
 * It's controlled by the global navigation toggle state and works in conjunction with
 * TheNavV2's hamburger menu button.
 *
 * Features:
 * - Temporary drawer that overlays content
 * - Accordion-style expandable menu groups
 * - Synchronized with global nav state
 * - Full ARIA accessibility support
 * - Auto-closes when navigation occurs
 *
 * @component
 * @example
 * <TheSidebar />
 */
-->
<template>
  <div class="d-flex">
    <!--
      Navigation drawer - only rendered after mount to prevent SSR hydration issues.
      Temporary drawer overlays content and can be dismissed by clicking outside.
    -->
    <v-navigation-drawer
      v-if="isMounted"
      v-model="drawer"
      temporary
      style="background: #fff"
    >
      <!--
        Navigation list with accordion functionality.
        v-model:opened tracks which accordion groups are expanded.
        role="navigation" overrides Vuetify's default role="list" to avoid ARIA validation
        issues with child elements that have role="link" instead of role="listitem".
        This is more semantically appropriate for a navigation menu.
      -->
      <v-list
        v-model:opened="open"
        density="compact"
        id="myVlist"
        role="navigation"
        aria-label="Main navigation menu"
      >
        <!-- Home link - always visible at top of menu -->
        <v-list-item exact to="/" style="font-weight: 900; color: #000"
          >Home</v-list-item
        >

        <!--
            Loop through sidebar menu items from app.config.js.
            Each item can be either a direct link or an expandable group.
          -->
        <template
          v-for="(menu, index) in navMenu"
          :key="`sidebar-accordion-${index}`"
        >
          <!--
              Expandable accordion group for menu items with children.
              Clicking the activator expands/collapses the child items.
            -->
          <v-list-group
            v-if="menu && menu.children"
            :value="menu.children.title"
          >
            <template #activator="{ props }">
              <v-list-item
                v-bind="props"
                style="font-weight: 900 !important"
                role="button"
                >{{ menu.main }}</v-list-item
              >
            </template>

            <!-- Child menu items within the accordion -->
            <template v-for="(child, i) in menu.children" :key="`main-${i}`">
              <!-- Optional section header for grouping child items -->
              <v-list-item
                v-if="child.section"
                style="margin-top: 0px; font-weight: 900; color: #555"
                role="presentation"
                tabindex="-1"
              >
                {{ child.section }}
              </v-list-item>

              <!-- Optional divider between child items -->
              <v-divider
                v-if="child.divider"
                role="separator"
                aria-hidden="true"
                class="my-1"
              />

              <!--
                  Individual child navigation link.
                  Indented with spaces for visual hierarchy.
                -->
              <v-list-item
                v-if="child.title"
                exact
                style="margin-top: 0px; font-weight: 400; color: #555"
                :to="child.link"
              >
                <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{ child.title }}</span>
              </v-list-item>
            </template>
          </v-list-group>

          <!--
              Direct link menu item (no children).
              Displayed with bold font weight for top-level items.
            -->
          <v-list-item
            v-else
            style="font-weight: 900 !important"
            :to="menu.link"
            class="hover"
            >{{ menu.main }}</v-list-item
          >
        </template>

        <!-- Contact link - currently disabled -->
        <!-- <v-list-item exact to="/contact" style="font-weight: 900 !important">
            Contact</v-list-item
          > -->

        <!-- Divider before bottom section -->
        <v-divider class="my-3" role="separator" aria-hidden="true"></v-divider>

        <!-- Search/Contact link - currently disabled -->
        <!-- <v-list-item exact to="/contact">
            <v-icon left icon="mdi-magnify" size="x-small"></v-icon
            >&nbsp;&nbsp;&nbsp;Contact</v-list-item
          >-->
      </v-list>
    </v-navigation-drawer>
  </div>
</template>

<script setup>
// Get translation feature flag from app configuration
const { isTranslationEnabled } = useAppConfig();

// Get application configuration
const appConfig = useAppConfig();

// Clone sidebar menu configuration to prevent reactivity issues
const navMenu = JSON.parse(JSON.stringify(appConfig.sidebarMenu));

// Track whether component has been mounted (client-side only)
const isMounted = ref(false);

// Local drawer state (open/closed)
const drawer = ref(false);

// Track which accordion groups are currently expanded
const open = ref([]);

// Access the global navigation toggle state shared with TheNavV2
const altState = useNavToggle();

/**
 * Watch local drawer state and sync to global state.
 * When the drawer opens/closes locally, update the global nav state
 * so the hamburger menu icon in TheNavV2 stays in sync.
 * Also fixes ARIA roles when drawer opens.
 */
watch(drawer, async (val) => {
  altState.value = drawer.value;

  // When drawer opens, fix Vuetify ARIA role issues
  if (val) {
    await nextTick();
    const listGroupHeaders = document.querySelectorAll(
      '.v-list-group__header[role="listitem"]'
    );
    listGroupHeaders.forEach((header) => {
      header.setAttribute("role", "button");
    });
  }
});

/**
 * Watch global nav state and sync to local drawer.
 * When the hamburger menu in TheNavV2 is clicked, this updates
 * the local drawer state to open/close the sidebar.
 */
watchEffect(() => {
  drawer.value = altState.value;
});

/**
 * Handles sidebar click events.
 * Currently logs to console and closes the drawer.
 *
 * @returns {void}
 */
const click = () => {
  console.log("click sidebar");
  altState.value = false;
};

/**
 * Lifecycle hook - runs when component is mounted on the client.
 * Sets up the component and logs mount status for debugging.
 * Also fixes Vuetify ARIA role issues for accessibility compliance.
 */
onMounted(async () => {
  isMounted.value = true;
  console.log("sidebar mounted");
  await nextTick();

  // Fix Vuetify v-list-group ARIA role issue
  // Vuetify adds role="listitem" to v-list-group headers, but when the parent
  // has role="navigation", this creates an ARIA validation error.
  // We set the role to "button" to make aria-label valid and fix WCAG 4.1.2 compliance.
  const listGroupHeaders = document.querySelectorAll(
    '.v-list-group__header[role="listitem"]'
  );
  listGroupHeaders.forEach((header) => {
    header.setAttribute("role", "button");
  });
});

// Access Vue Router for programmatic navigation
const router = useRouter();

/**
 * Programmatically navigates to a URL and closes the drawer.
 *
 * This function is currently defined but not actively used in the template.
 * It's preserved for potential future programmatic navigation needs.
 *
 * @param {string} url - The URL path to navigate to
 * @returns {void}
 */
const routeTo = (url) => {
  altState.value = false; // Close the drawer
  router.push({ path: url });
};

/**
 * Toggles the translation modal.
 * Used when translation features are enabled in the application.
 *
 * @returns {void}
 */
const translationToggle = () => {
  const translationState = useTranslateToggle();
  translationState.value = !translationState.value;
};
</script>

<style lang="scss" scoped>
/**
 * Sidebar item styling.
 * Currently defined but not actively used in the template.
 */
.sidebar-item {
  font-weight: 700;
  font-family: "Roboto", sans-serif;
}
</style>
