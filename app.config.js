export default defineAppConfig({
  title: "SFS: Safe from the Start",
  description: "SFS description.",

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
          title: "Program  Summary",
          link: "/program-summary",
        },
        {
          title: "Childhood Exposure to Violence and Trauma",
          link: "/childhood-exposure",
        },
        // {
        //   title: "News & Updates",
        //   link: "/news",
        // },
      ],
    },
    {
      main: "SFS Sites",
      link: "/sites",
      nudgeLeft: "78px",
    },

    {
      main: "Contact",
      link: "/contact",
      nudgeLeft: "78px",
    },
  ],
  footerMenu: [
    {
      main: "Home",
      link: "/",
    },

    {
      main: "Contact",
      link: "/contact",
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
      main: "Search",
      link: "/search",
    },
  ],
});
