# Safe From the Start (SFS)

The Safe From the Start (SFS) program provides developmentally and culturally appropriate direct services to children, ages 0 – 5, who have witnessed or been exposed to violence and their families. SFS focuses on serving young children who are victims of abuse, neglect, or maltreatment, and/or witnesses to domestic violence, sexual assault, or other violent crimes.

**Live site:** https://sfs.icjia.illinois.gov/

## Stack

- **Framework:** Astro 6 (static SSG)
- **Styling:** Tailwind v4 via `@tailwindcss/vite`
- **Islands:** Alpine.js — only used for the mobile drawer + desktop dropdown
- **Content:** Astro Content Collections (markdown in `src/content/pages/`)
- **Fonts:** Self-hosted via Fontsource (`@fontsource/lato`, `/roboto`, `/raleway`)
- **Images:** Thumbor service at `image.icjia.cloud` for on-the-fly resize/WebP
- **Deploy:** Netlify static hosting
- **Node:** 22.x

## Project layout

```
/
├── astro.config.mjs          # Astro config (output: static, Tailwind, sitemap)
├── netlify.toml              # Build command + cache + security headers
├── package.json
├── public/                   # Static assets served as-is
│   ├── icjia-logo.png
│   ├── splash-*.jpg          # Source images Thumbor pulls from prod
│   ├── docs/                 # Footer-linked docs (accessibility, jsdoc, …)
│   ├── _headers              # Mirrors netlify.toml for non-Netlify hosts
│   └── favicon.ico
└── src/
    ├── components/
    │   ├── Footer.astro      # Context footer + ICJIA brand + socials
    │   ├── HomeSplits.astro  # "Core Components" 3-section grid
    │   ├── Nav.astro         # App bar (logo + wordmark + nav)
    │   ├── Sidebar.astro     # Mobile drawer (Alpine store)
    │   ├── SplashHome.astro  # Hero w/ LCP preload
    │   └── SplashHomeSecondary.astro
    ├── config/
    │   └── nav.ts            # Primary / sidebar / footer menus
    ├── content/
    │   └── pages/*.md        # Page content (Content Collections)
    ├── content.config.ts     # Collection schema
    ├── layouts/
    │   ├── Layout.astro      # HTML shell + head + Alpine boot
    │   └── MarkdownPage.astro# Shared layout for /about, /privacy, …
    ├── lib/
    │   └── thumbor.ts        # Thumbor signed-URL builder
    ├── pages/
    │   ├── index.astro       # /
    │   ├── [slug].astro      # /about, /childhood-exposure, /privacy,
    │   │                       /program-summary, /resources
    │   ├── research.astro    # /research (markdown + custom layout)
    │   └── sites.astro       # /sites (markdown + ArcGIS iframe)
    └── styles/
        └── global.css        # Tailwind theme tokens + brand styles
```

## Local development

```bash
yarn install
yarn dev          # http://localhost:4321
yarn build        # outputs to ./dist
yarn preview      # serve the built site locally
```

Set `VITE_THUMBOR_KEY` in `.env` (the production value lives in the Netlify env).

## Routes

| Path | Source |
|---|---|
| `/` | `src/pages/index.astro` |
| `/about` | `src/content/pages/about.md` via `[slug].astro` |
| `/childhood-exposure` | `src/content/pages/childhood-exposure.md` |
| `/privacy` | `src/content/pages/privacy.md` |
| `/program-summary` | `src/content/pages/program-summary.md` |
| `/research` | `src/pages/research.astro` (markdown + custom layout) |
| `/resources` | `src/content/pages/resources.md` |
| `/sites` | `src/pages/sites.astro` (markdown + ArcGIS iframe) |

## Accessibility

The site is WCAG 2.1 AA. Across all 8 routes at both desktop and mobile viewports, axe-core (4.11) reports **0 violations**. Lighthouse Accessibility is 100/100 on every page.

Key practices in the build:

- Native HTML elements (`<a>`, `<button>`, `<nav>`, `<ul>`) instead of framework components that obscure ARIA semantics
- Skip-link to `#main-content` honoring `prefers-reduced-motion`
- Mobile drawer is `<nav><ul>` with focus-on-open and Escape-to-close
- Vuetify-matching breakpoints (`sm=600`, `md=960`, `lg=1280`) so design responsiveness is unchanged
- `crossorigin="anonymous"` on every Thumbor `<img>` so third-party cookies aren't carried into the page

## Performance

Production Lighthouse (incognito):

- **Desktop:** 100 on 7 of 8 routes; `/sites` lands at 99 (capped by the embedded ArcGIS map iframe).
- **Mobile:** 100 on `/about`, `/childhood-exposure`, `/privacy`, `/research`; 94–98 on the rest. The hero image's LCP and the ArcGIS embed on `/sites` are what's left.

Key optimizations:

- `inlineStylesheets: "always"` removes the render-blocking external CSS link
- `build.format: "file"` + `trailingSlash: "never"` emits flat `/about.html` so internal nav skips the Netlify trailing-slash redirect (~800 ms saved per nav on mobile)
- All fonts self-hosted with immutable cache; fallback `@font-face` with `size-adjust` so font swap is invisible (CLS = 0)
- LCP hero preloaded with `fetchpriority="high"`; preload + `<img>` share `crossorigin` mode so the browser uses the preload
- Thumbor URLs sized to the largest container, served as WebP
- `must-revalidate` (not `no-store`) on HTML so the back/forward cache stays eligible

## Deploy

`main` deploys to production on push via Netlify (`netlify.toml` declares `command = yarn build`, `publish = dist`).

```toml
[build]
  command = "yarn build"
  publish = "dist"
```

## License

See [LICENSE](LICENSE).
