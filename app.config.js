export default defineAppConfig({
  title: "SFS: Safe from the Start",
  description: "SFS description.",
  isTranslationEnabled: false,
  root: "https://sfs.icjia.illinois.gov",
  underConstruction: false,

  navMenu: [
    {
      main: "Home",
      link: "/",
      nudgeLeft: "78px",
    },
    {
      main: "About",
      nudgeLeft: "57px",
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
    {
      main: "News",
      link: "/news",
      nudgeLeft: "78px",
    },
    {
      main: "Resources",
      link: "/resources",
      nudgeLeft: "78px",
    },

    {
      main: "Contact",
      link: "/contact",
      nudgeLeft: "78px",
    },
  ],
  sidebarMenu: [
    {
      main: "About",
      nudgeLeft: "57px",
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
      main: "SFS Sites",
      link: "/sites",
      nudgeLeft: "78px",
    },
    {
      main: "News",
      link: "/news",
      nudgeLeft: "78px",
    },
    {
      main: "Resources",
      link: "/resources",
      nudgeLeft: "78px",
    },
  ],
  footerMenu: [
    {
      main: "Home",
      link: "/",
    },
    {
      main: "About",
      link: "/about",
    },

    {
      main: "Contact",
      link: "/contact",
    },
    {
      main: "News",
      link: "/news",
      nudgeLeft: "78px",
    },
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
