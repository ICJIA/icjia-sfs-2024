/**
 * Application configuration for the ICJIA Safe From the Start website.
 *
 * This file defines global application settings, navigation menus, and feature flags
 * that are accessible throughout the Nuxt application via useAppConfig().
 *
 * Configuration includes:
 * - Site metadata (title, description, root URL)
 * - Feature flags (translation, construction mode)
 * - Navigation menu structures for header, sidebar, and footer
 *
 * @module app.config
 */

export default defineAppConfig({
  /** Site title displayed in browser tabs and meta tags */
  title: "SFS: Safe from the Start",

  /** Site description for SEO and meta tags */
  description:
    "The Safe From the Start (SFS) program provides developmentally and culturally appropriate direct services to children, ages 0-5, who have witnessed or been exposed to violence and their families.",

  /** Feature flag to enable/disable translation functionality */
  isTranslationEnabled: false,

  /** Production root URL for the application */
  root: "https://sfs.icjia.illinois.gov",

  /** Feature flag to display "under construction" messaging */
  underConstruction: false,

  /**
   * Main navigation menu configuration for the header/top navigation bar.
   * Used by TheNav.vue and TheNavV2.vue components.
   *
   * Each menu item can have:
   * - main: Display text for the menu item
   * - link: URL path for direct navigation
   * - children: Array of submenu items (for dropdown menus)
   * - nudgeLeft: CSS positioning adjustment for fine-tuning menu alignment
   */
  navMenu: [
    {
      main: "Home",
      link: "/",
      nudgeLeft: "78px", // Fine-tune horizontal positioning
    },
    {
      main: "About",
      nudgeLeft: "57px",
      // Dropdown menu with child items
      children: [
        {
          title: "About",
          link: "/about",
        },
        {
          title: "Program Summary",
          link: "/program-summary",
        },
        {
          title: "Research",
          link: "/research",
        },
      ],
    },
    {
      main: "Sites",
      link: "/sites",
      nudgeLeft: "78px",
    },
    // News section is currently disabled
    // Uncomment to re-enable news functionality
    // {
    //   main: "News",
    //   link: "/news",
    //   nudgeLeft: "78px",
    // },
    {
      main: "Resources",
      link: "/resources",
      nudgeLeft: "78px",
    },
    // Contact page is currently disabled
    // Uncomment to re-enable contact functionality
    // {
    //   main: "Contact",
    //   link: "/contact",
    //   nudgeLeft: "78px",
    // },
  ],

  /**
   * Sidebar navigation menu configuration for mobile/drawer navigation.
   * Used by TheSidebar.vue component.
   *
   * Structure is similar to navMenu but optimized for vertical/drawer layout.
   * Some items may differ from the main nav for better mobile UX.
   */
  sidebarMenu: [
    {
      main: "About",
      nudgeLeft: "57px",
      // Expandable section with child items
      children: [
        {
          title: "About",
          link: "/about",
        },
        {
          title: "Program Summary",
          link: "/program-summary",
        },
        {
          title: "Research",
          link: "/research",
        },
      ],
    },
    {
      main: "SFS Sites", // Slightly different label than main nav
      link: "/sites",
      nudgeLeft: "78px",
    },
    // News section is currently disabled
    // {
    //   main: "News",
    //   link: "/news",
    //   nudgeLeft: "78px",
    // },
    {
      main: "Resources",
      link: "/resources",
      nudgeLeft: "78px",
    },
  ],

  /**
   * Footer navigation menu configuration.
   * Used by TheContextFooter.vue component.
   *
   * Provides a simplified, flat navigation structure in the footer.
   * All items are direct links without dropdowns for better footer UX.
   */
  footerMenu: [
    {
      main: "Home",
      link: "/",
    },
    {
      main: "About",
      link: "/about",
    },
    // Contact page is currently disabled
    // {
    //   main: "Contact",
    //   link: "/contact",
    // },
    // News section is currently disabled
    // {
    //   main: "News",
    //   link: "/news",
    //   nudgeLeft: "78px",
    // },
    {
      main: "Program Summary",
      link: "/program-summary",
    },
    {
      main: "Research",
      link: "/research",
    },
    {
      main: "Resources",
      link: "/resources",
    },
    {
      main: "Sites",
      link: "/sites",
    },
  ],
});
