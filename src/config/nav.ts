/**
 * Navigation menus mirrored from the Nuxt app.config.js so the Astro spike
 * renders the same primary, sidebar, and footer link sets.
 */
export type NavItem = {
  main: string;
  link?: string;
  external?: boolean;
  children?: { title: string; link: string; external?: boolean }[];
};

export const primaryNav: NavItem[] = [
  { main: "Home", link: "/" },
  {
    main: "About",
    children: [
      { title: "About", link: "/about" },
      { title: "Program Summary", link: "/program-summary" },
      { title: "Research", link: "/research" },
    ],
  },
  { main: "Sites", link: "/sites" },
  { main: "Resources", link: "/resources" },
];

export const sidebarNav: NavItem[] = [
  {
    main: "About",
    children: [
      { title: "About", link: "/about" },
      { title: "Program Summary", link: "/program-summary" },
      { title: "Research", link: "/research" },
    ],
  },
  { main: "SFS Sites", link: "/sites" },
  { main: "Resources", link: "/resources" },
];

export const footerNav: NavItem[] = [
  { main: "Home", link: "/" },
  { main: "About", link: "/about" },
  { main: "Program Summary", link: "/program-summary" },
  { main: "Research", link: "/research" },
  { main: "Resources", link: "/resources" },
  { main: "Sites", link: "/sites" },
  { main: "Search", link: "/search" },
];
