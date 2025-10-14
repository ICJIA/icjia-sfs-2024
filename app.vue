<!--
/**
 * Root application component for the ICJIA Safe From the Start website.
 *
 * This is the main app.vue file that wraps all pages and provides the core layout structure.
 * It includes:
 * - Accessibility features (skip to main content link)
 * - Global navigation (header and sidebar)
 * - Main content area with page routing
 * - Footer
 * - Loading indicators
 *
 * The component uses Vuetify's v-app wrapper and Nuxt's layout system to provide
 * a consistent structure across all pages.
 *
 * @component
 */
-->
<template>
  <NuxtLayout>
    <v-app>
      <!--
        Skip to main content link for keyboard navigation accessibility.
        Hidden by default, becomes visible when focused via Tab key.
        Allows keyboard users to bypass navigation and jump directly to page content.
      -->
      <a
        href="#main-content"
        class="skip-link"
        @click="skipToMain"
        @keydown.enter="skipToMain"
      >
        Skip to main content
      </a>

      <!--
        Main navigation component.
        TheNavV2 is the current active navigation.
        Previous navigation components (NavHome, TheNav) are commented out but preserved.
      -->
      <TheNavV2></TheNavV2>

      <!-- Mobile sidebar/drawer navigation -->
      <TheSidebar></TheSidebar>

      <!-- Loading indicator shown during page transitions -->
      <NuxtLoadingIndicator color="blue" />

      <!--
        Main content area with ARIA landmark.
        tabindex="-1" allows programmatic focus for skip link functionality.
        min-height ensures footer stays at bottom even on short pages.
      -->
      <main id="main-content" tabindex="-1">
        <NuxtPage style="min-height: 90vh" />
      </main>

      <!-- Global footer component -->
      <TheFooter></TheFooter>
    </v-app>
  </NuxtLayout>
</template>

<script setup>
// Reactive state for tracking if current page is the home page
// Currently unused but preserved for potential future home page customization
let isHome = ref();

// Flag to control breadcrumb bar visibility
// Currently unused but preserved for potential future breadcrumb implementation
let hideBreadcrumbBar = ref(false);

// Access the current route for path tracking
const route = useRoute();

// Reactive reference to the current route path
const routePath = ref(route.path);

// Track whether the component has been mounted (client-side only)
let isMounted = ref(false);

/**
 * Watch for route changes and log the current path.
 * This helps with debugging navigation and can be extended for analytics tracking.
 *
 * The commented code shows a previous implementation that toggled breadcrumbs
 * based on whether the user was on the home page.
 */
watchEffect(() => {
  routePath.value = route.path;
  console.log("route.path from app.vue: ", routePath.value);

  // Previous breadcrumb logic - preserved for reference
  // if (route.path === "/") {
  //   hideBreadcrumbBar.value = true;
  //   isHome = true;
  // } else {
  //   hideBreadcrumbBar.value = false;
  //   isHome = false;
  // }
});

/**
 * Smoothly scrolls the page to the top.
 *
 * This function is currently defined but not actively used in the template.
 * It's preserved for potential future use in navigation or UI interactions.
 * The isMounted check ensures it only runs on the client side.
 *
 * @returns {void}
 */
const scrollToTop = () => {
  // Prevent execution during server-side rendering
  if (!isMounted.value) {
    return;
  }

  // Smooth scroll to top of page
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: "smooth",
  });
};

/**
 * Handles the skip to main content link functionality for accessibility.
 *
 * When activated (via click or Enter key), this function:
 * 1. Prevents default anchor link behavior
 * 2. Programmatically focuses the main content area
 * 3. Smoothly scrolls the main content into view
 *
 * This is a WCAG 2.1 Level A requirement (2.4.1 Bypass Blocks) that allows
 * keyboard users to skip repetitive navigation and jump directly to page content.
 *
 * @param {Event} event - The click or keydown event
 * @returns {void}
 */
const skipToMain = (event) => {
  event.preventDefault();

  // Find the main content landmark element
  const mainContent = document.getElementById("main-content");

  if (mainContent) {
    // Set focus to main content (enables keyboard navigation from this point)
    mainContent.focus();

    // Smoothly scroll the main content into view
    mainContent.scrollIntoView({ behavior: "smooth" });
  }
};

/**
 * Lifecycle hook that runs when the component is mounted on the client.
 * Sets the isMounted flag to true, enabling client-side only functionality.
 */
onMounted(() => {
  isMounted.value = true;
  console.log("isMounted: ", isMounted.value);
});
</script>

<style>
/**
 * Global styles for the application.
 * These styles are not scoped and apply throughout the entire app.
 */

/*
 * Remove default link styling from heading anchor links.
 * This ensures heading links (often used for anchor navigation) appear as
 * regular headings without underlines or color changes.
 */
h2,
h3,
h4,
h5,
h6 {
  a {
    color: black;
    text-decoration: none;
  }
}

/*
 * Skip to main content link styles for accessibility.
 *
 * The skip link is hidden off-screen by default (top: -40px) and only
 * becomes visible when focused via keyboard navigation (Tab key).
 * This is a WCAG 2.1 accessibility requirement that helps keyboard users
 * bypass repetitive navigation elements.
 */
.skip-link {
  position: absolute;
  top: -40px; /* Hidden above viewport */
  left: 6px;
  background: #000;
  color: #fff;
  padding: 8px;
  text-decoration: none;
  z-index: 1000; /* Ensure it appears above other content */
  border-radius: 4px;
  font-weight: bold;
  transition: top 0.3s; /* Smooth animation when appearing */
}

/*
 * When the skip link receives keyboard focus, slide it into view.
 * This provides a clear visual indicator for keyboard users.
 */
.skip-link:focus {
  top: 6px; /* Visible at top of viewport */
}
</style>
