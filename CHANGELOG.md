# Changelog

All notable changes to the ICJIA Safe From the Start (SFS) website are documented in this file. Entries are in reverse chronological order.

## Unreleased — checklist v2 → v6.4 alignment

A sweep aligning the repo with `docs/astro-conversion-checklist-v6.4.md`
(the canonical ICJIA Astro pattern) and removing the Thumbor dependency.

**v6.4 increment (2026-06-08)** — OG share-card, CORP fix + meta-description cleanup:

- **feat(seo):** replaced the photo-based `public/og-image.jpg` with a
  generated `public/og-image.png` — a 1200×630 brand-color share card
  (navy→blue gradient, "ILLINOIS CRIMINAL JUSTICE INFORMATION AUTHORITY"
  eyebrow, the lightly-condensed core description, and a vector ICJIA
  wordmark). Authored as pure SVG → PNG via Sharp in the new
  `scripts/build-og-image.mjs` (`pnpm og-image`). Per checklist §8 the
  card is set in the generic system sans — librsvg renders any *named*
  Fontsource webfont as `.notdef` boxes, so the brand is carried by
  color/weight/layout instead. Repointed every `og-image.jpg` reference
  to `.png` (`Layout.astro` og:image + Twitter + JSON-LD, `llms.txt`,
  `README.md`) and added a `301` `/og-image.jpg → /og-image.png` redirect
  for any already-cached references.
- **fix(security):** flipped `Cross-Origin-Resource-Policy` from
  `same-origin` to `cross-origin` site-wide (`netlify.toml` +
  `public/_headers`) per checklist §4. `same-origin` made browser-based
  OG scanners refuse the share image even though it's `200 OK` on curl —
  MetaPeek (`metapeek.icjia.app`) renders the preview via a client-side
  `<img>`, and CORP is enforced in any browser context regardless of the
  scanner's own permissive `img-src *`. Server-side crawlers (Facebook,
  LinkedIn) were unaffected, which is why it "worked everywhere but the
  checker." COOP stays `same-origin` (orthogonal — window isolation only).
- **fix(seo):** tightened every page's meta description to ≤160 chars (the
  Google/MetaPeek snippet limit) and replaced the placeholder `summary`
  stubs with real, page-specific descriptions across the seven
  `src/content/pages/*.md` files (these also feed the Fuse search index).
  Home default 195→155, `/about` 194→153; all 10 built pages now ≤160.

**v6.4 increment (2026-05-27)** — SFS-authored canonical pattern:

- **feat(nav):** added magnifying-glass search icon to the top nav
  (`src/components/Nav.astro`, 44×44 touch target, `aria-label="Search"`)
  and appended `{ main: "Search", link: "/search" }` to `footerNav`.
  Filtered `/search` out of the 404 card grid so the Search-card-next-to-
  search-form regression doesn't happen. **The rule of thumb:** search
  appears EXACTLY twice in the chrome (icon + footer).
- **docs(checklist):** rename `astro-conversion-checklist-v6.3.md` →
  `astro-conversion-checklist-v6.4.md`. Added §"What changed from
  v6.3 → v6.4" + §"Search affordances" full pattern. Marked as
  "SFS-authored, awaiting second-site confirmation for canonical
  promotion" per the v6.3 back-port-and-confirm discipline.

**v6.3 increment (2026-05-27)** — back-port of the two Infonet/DVFR
patterns the checklist promoted to canonical:

- **feat(search):** added `/search` with a Fuse.js client island over a build-time JSON index (`src/pages/search-index.json.ts`). Index covers home + the seven markdown pages, ~30 KB uncompressed. Page uses DOM API (createElement / textContent) for result rendering — no innerHTML, defense-in-depth against XSS. `noindex` via the new Layout prop.
- **feat(404):** added `src/pages/404.astro` per the v6.3 "Standard 404 page" template: navy-to-blue gradient `404` numeral (`aria-hidden`), `<h1>` carries the announcement, Fuse-deep-link search form (`action="/search"`, `name="q"`), 6-card quick-link grid mirroring `footerNav` (Home / About / Program Summary / Research / Resources / Sites), help line. `.sfs-nf-*` class prefix. `noindex={true}` + `min-h-[40vh]` to avoid the CLS dip from footer drop-in.
- **feat(seo):** added `noindex?: boolean` prop to `Layout.astro`, threaded into `astro-seo`'s `<SEO noindex={…}>`. `/404` and `/search` opt in.
- **fix(sitemap):** two `[[redirects]]` in `netlify.toml` so `/sitemap.xml` (and the trailing-slash variant) 200-rewrite to `/sitemap-0.xml`. Closes the `@astrojs/sitemap` emits-two-files / never-emits-`sitemap.xml` gap so SEO scanners probing the conventional URL get the URL list directly. `public/robots.txt` now points at `/sitemap.xml`.
- **fix(sitemap):** `astro.config.mjs` filter excludes `/404` and `/search` from `sitemap-0.xml`. Filter receives the canonical URL (no `.html` suffix) so the regex anchors on `\/(?:404|search)\/?$`.
- **feat(seo):** JSON-LD `WebPage` schema emitted from `Layout.astro` (one block per page) — name/description/url/image/inLanguage + `datePublished`/`dateModified` (build time fallback) + `isPartOf` WebSite + `publisher` Organization (ICJIA with logo). CSP doesn't enforce on `type="application/ld+json"` data blocks, so no hash needed. Layout also takes optional `publishedAt`/`updatedAt` props for future per-page freshness.
- **feat(ai-readiness):** `public/llms.txt` per [llmstxt.org](https://llmstxt.org) — site overview, URL index, reference docs, topic taxonomy, and citation guidance for AI crawlers (ChatGPT, Claude, Perplexity, Bing Copilot).
- **chore(tooling):** `scripts/csp-hashes.mjs` now skips `type="application/ld+json"` blocks (data blocks don't need CSP hashes), keeping the helper's output clean.
- **docs(readme):** OG image header + 7-badge tech-stack row (License / Astro / Tailwind / Alpine / Fuse / Node / pnpm / Sharp). Mentioned the new `/search`, JSON-LD, and `/llms.txt` features in the Stack section.

---



- **chore(pkg):** migrated yarn → **pnpm 10.33**. Removed `yarn.lock` + `node_modules`, added `packageManager: "pnpm@10.33.0"` + `engines.pnpm` + `pnpm.onlyBuiltDependencies: ["esbuild", "sharp"]`. Updated `netlify.toml` to `command = "pnpm build"` + `PNPM_VERSION = "10.33.0"`. Codified "pnpm only — never yarn, never npm" as a hard rule near the top of the v2 checklist (§intro + §18).
- **perf(images):** removed Thumbor entirely. The five splash images and the remote research hero now live in `src/assets/` and are processed at build time by Astro `<Image>` + Sharp into hashed WebP variants under `/_astro/`. Hero `splash-24-large-cropped.jpg` went from a 918 KB JPEG to **34 KB at the 1200w variant** picked by mobile DPR-3 devices. `splash-05.jpg` dropped from 5 MB → ~46 KB at 640w. Deleted `src/lib/thumbor.ts` and `thumbor-url-builder-ts`; dropped the `https://image.icjia.cloud` preconnect from `<head>`.
- **feat(seo):** swapped hand-rolled `<meta>` tags for `astro-seo` with full OG / Twitter / canonical / hreflang coverage. Added `public/og-image.jpg` (1200×630 generated from the hero via Sharp). Fixed canonical URLs that previously included `.html` (e.g. `https://sfs.icjia.illinois.gov/index.html` → `…/`).
- **feat(analytics):** added the self-hosted Plausible script (`script.file-downloads.outbound-links.js`, `data-domain="sfs.icjia.illinois.gov"`). Pairs with a tiny inline trailing-slash normalizer so Plausible doesn't double-count `/foo` and `/foo/`.
- **feat(security):** full CSP with the SHA-256 hash of the inline normalizer (drops `'unsafe-inline'` from `script-src`). Added `Strict-Transport-Security`, `Permissions-Policy`, `Cross-Origin-Opener-Policy`, `Cross-Origin-Resource-Policy`, `X-XSS-Protection: 0`. Context-scoped deploy-preview override allows `app.netlify.com` in `frame-src` without relaxing prod.
- **feat(scripts):** added `scripts/check-links.mjs` (internal + external link scanner — internal failures exit 1, external warn), `scripts/audit-lh.mjs` (Lighthouse mobile with process-group cleanup), `scripts/audit-axe.mjs` (axe-core CLI wrapper). Wired `pnpm check:links`, `pnpm check:links:internal`, `pnpm audit:lh`, `pnpm audit:axe`. Internal link sweep passed (16 internal links, 0 broken) after fixing a stale `/sitemap.xml` reference in `public/docs/index.html`.
- **feat(dev):** `start-dev-server` wrapper at repo root checks `pnpm`, installs deps if missing, **and auto-kills any existing listener on port 4321** (SIGTERM → SIGKILL fallback) before starting. Flags pass through (`--host`, `--port N`).
- **feat(markdown):** added `rehype-external-links` so all external `<a>` get `target="_blank" rel="noopener noreferrer"` automatically. Stripped the literal Pandoc-style `{target="\_blank"}` annotations from `content/pages/resources.md` (markdown-it style; remark doesn't parse them so they were rendering as visible text).
- **fix(css):** Tailwind preflight strips default `list-style-type`; restored `disc`/`decimal` (plus nested `circle`/`square`/`lower-alpha`/`lower-roman`) on `.markdown-body ul/ol` so the /resources lists actually show bullets.
- **chore(seo):** added `public/robots.txt` pointing crawlers at the generated `sitemap-index.xml`.

Local `pnpm preview` mobile Lighthouse (4x CPU throttle, no compression):

| Route | Perf | A11y | BP | SEO |
|---|---|---|---|---|
| `/about` | **100** | 100 | 100 | 100 |
| `/research` | **98** | 100 | 100 | 100 |
| `/` (home) | 96 | 100 | 100 | 100 |
| `/resources` | 96 | 100 | 100 | 100 |
| `/sites` | 93 | 100 | 96 | 100 |

Production Netlify deploy adds gzip/brotli + real-network behavior, which
typically lifts scores 2-3 points (per checklist §14) — the prod-deployed
run should land at 98-100 across the board.

## 2.0.1 — 2026-05-23

Post-migration polish.

- **a11y:** removed the redundant `role="contentinfo"` from `<section>` inside the footer. The outer `<footer>` was already a contentinfo landmark, so the inner one created two nested landmarks. axe-devtools-html flagged it as two moderate findings (`landmark-contentinfo-is-top-level`, `landmark-no-duplicate-contentinfo`); both are gone. (`22ffe15`)
- **perf:** switched the build to flat `.html` output (`build.format: "file"` + `trailingSlash: "never"`). Internal nav no longer triggers the Netlify trailing-slash redirect — Lighthouse measured ~760–870 ms savings per page. Mobile `/about` jumped from 97 → **100**; other markdown routes joined it at 100. (`2da5388`)
- **chore:** deleted the `feat/astro-spike` branch and 28 stale Nuxt-era branches (2 local migration branches + 26 remote dependabot branches that targeted dependencies no longer present in the Astro build).
- **docs:** README updated with the post-fix Lighthouse numbers and the new build-format setting.

Production Lighthouse after these fixes:

| | Desktop | Mobile |
|---|---|---|
| Perfect 100/100/100/100 | 7 of 8 | 5 of 8 |
| Lowest score | `/sites` 99 BP 96 (ArcGIS iframe) | `/` and `/sites` at 94 |

## 2.0.0 — 2026-05-23

Full rewrite of the site from Nuxt 4 + Vuetify to **Astro 6 + Tailwind v4** as a pure static SSG build. Visual design is unchanged; all routes, content, accessibility behavior, and links are preserved 1:1. The migration shipped on the `feat/astro-spike` branch and was merged in `593c493`.

### Why

Mobile Lighthouse Performance on the Nuxt build sat around 57 on production despite an A11y/SEO/BP sweep that already pushed those to 100. The 547 KB Vuetify JS chunk + ~785 KiB of unused CSS were the bottleneck — both structural to keeping the framework. Astro ships zero JS by default; the only client script that remains is Alpine for the mobile drawer and desktop dropdown.

### Production Lighthouse (incognito)

| | Nuxt + Vuetify | Astro + Tailwind |
|---|---|---|
| Mobile Performance | 57 | **95** |
| Desktop Performance | 82 | **100** |
| Mobile FCP | 10.6 s | 1.8 s |
| Mobile LCP | 13.7 s | 2.9 s |
| A11y / SEO / BP | 100 / 100 / 100 | 100 / 100 / 100 |

### Bundle weight

| | Before | After |
|---|---|---|
| `_nuxt/` / `_astro/` total | ~15 MB | ~70 KB JS + ~20 KB CSS (inlined) |

### Stack

- **Astro 6** static SSG with `output: "static"` and `inlineStylesheets: "always"`
- **Tailwind v4** via `@tailwindcss/vite`; theme tokens for the SFS palette and Vuetify-matching breakpoints (`sm=600`, `md=960`, `lg=1280`)
- **Alpine.js** (~14 KB gz) for the mobile drawer + desktop dropdown via a shared store
- **Fontsource** (`@fontsource/lato`, `/roboto`, `/raleway`) — self-hosted fonts with immutable cache; no more `fonts.googleapis.com` round trip
- **Astro Content Collections** backed by the same markdown files that powered `@nuxt/content`
- **Thumbor** image utility ported as-is for splash imagery

### Pages

All routes 1:1 with the previous site:

- `/` — splash hero, About intro, three Core Components subsections, secondary splash, Childhood Exposure callout
- `/about` — markdown
- `/childhood-exposure` — markdown
- `/privacy` — markdown
- `/program-summary` — markdown
- `/research` — markdown + three-stat flex grid + Evaluation Resources + publications list
- `/resources` — markdown
- `/sites` — markdown + lazy ArcGIS map iframe + table hover-tooltips

### Accessibility

- Native `<NuxtLink>` → `<a href>` everywhere — middle/right-click and screen-reader semantics intact
- Mobile drawer is a `<nav><ul>` with focus-on-open and Escape-to-close (WCAG 2.4.3)
- Skip-link respects `prefers-reduced-motion`
- Hero headline sits on a solid navy backdrop so `color-contrast` is measurable (12.07:1)
- No more `v-btn` overlay/underlay spans confusing axe-core
- `aria-controls` only emitted when the controlled popup actually exists in the DOM
- 0 axe AA violations across all 8 routes at both desktop and mobile viewports
- Buttons emit Vuetify-matching letter-spacing/elevation so visual focus indicators and contrast remain the same

### Performance work

- `inlineStylesheets: "always"` — kills the render-blocking external CSS link entirely (the biggest single win — Mobile FCP went from 10.6 s to 1.8 s)
- Hero LCP image preloaded with matching `crossorigin="anonymous"` on `<img>` and `<link rel="preload">` (no wasted preload)
- Thumbor URLs sized to the largest container they render at (1600×960 at q72 WebP for hero, 1200×800 at q50 for splits)
- Splash imagery served `loading="lazy"` below the fold; hero is `eager fetchpriority="high"`
- `crossorigin="anonymous"` on every Thumbor `<img>` to drop the third-party cookies that Lighthouse `inspector-issues` flagged
- Custom `@font-face` Roboto/Lato/Raleway fallback families with `size-adjust` + `ascent-override`/`descent-override` so font swap is invisible (CLS = 0)

### Infrastructure

- `netlify.toml`: `command = yarn build`, `publish = dist`, Node 22; immutable cache on `/_astro/*`, 7-day cache with `stale-while-revalidate` on images, `must-revalidate` (NOT `no-store`) on HTML so back/forward cache stays eligible
- `public/_headers`: same policy duplicated for any tooling that reads it
- Baseline security headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`)

### Removed (no longer present on `main`)

- `app/`, `content/`, `creators/`, `scripts/`, `server/`, `test/`, `src/json/`
- `nuxt.config.js`, `vitest.config.ts`, `typedoc.json`, `jsconfig.json`, `.eslintrc`, `.eslintignore`
- Historical `accessibility-reports/`, `lighthouse-reports/`, and the old root `docs/` (the runtime tree the footer links to lives at `public/docs/`)

## 2026-04-16 (hotfix)

- Restore correct fonts on production — `font-family: 'Roboto' !important` (app.css) and `$body-font-family: "Lato"` (variables.scss) had no fallback stack, so with Google Fonts `display: "optional"` any font variant that missed the 100ms activation window fell through to the UA default (Times/serif). Added a system-font fallback stack to both so fallback is still a sans-serif.

## 2026-04-16

### Accessibility (WCAG 2.1 AA — 100/100 on all routes)

- Convert navigation `<v-btn @click="$router.push">` buttons to real `<NuxtLink>` / `:to` links so screen readers announce "link" and middle/right-click work correctly (TheNavV2)
- Restructure mobile sidebar to native `<nav><ul><li><NuxtLink>` — eliminates the post-mount `role="listitem"` → `role="button"` DOM patching hack (TheSidebar)
- Move focus into the sidebar drawer when it opens and close on <kbd>Escape</kbd> (WCAG 2.4.3)
- Wrap footer ICJIA logo in a real `<a href target="_blank" rel="noopener noreferrer">` so it's keyboard operable (TheFooter)
- Add `rel="noopener noreferrer"` to every `target="_blank"` link
- Homepage: exactly one `<h1>` (the hero headline); `HomeSplits` headings demoted to `<h2>`/`<h3>` to preserve heading order
- Mobile "SFS" title now `<abbr title="Safe From the Start">` with an aria-label that contains "SFS" (WCAG 2.5.3 label-in-name)
- Dropdown menus use `<template v-for>` so `role="menu"` contains `role="menuitem"` directly
- Skip-link respects `prefers-reduced-motion`; global `scroll-behavior: smooth` gated behind the same media query
- Loading indicators swapped from animated GIFs to `<v-progress-circular>` (SVG, respects reduced motion)
- Context-footer hover contrast fixed (white underline on blue, removed `#aaa on #1263a5` = 2.24:1)
- Removed double "(external link)" announcements; single "(opens in new window)" via aria-label
- Fixed `_Exposure to violence_` rendering as literal markdown on the homepage

### SEO / Best Practices (100/100)

- Add `useHead` with title + description on every content page (fixes missing `<title>` on `/about`, `/sites`, `/research`, `/resources`, `/privacy`, `/program-summary`, `/childhood-exposure`, `/news`)
- Rewrote `titleTemplate` to `"Page | Safe From the Start"` pattern
- Added `og:*` and `twitter:card` meta tags, `theme-color`, `format-detection`
- Fix root `description` meta (was `"SFS description."`)
- Explicit `width`/`height` on nav + footer logos (correct 250:175 aspect) fixes unsized-images CLS warning
- `loading="lazy"` / `decoding="async"` on the footer logo
- `robots.txt` now points at the sitemap and allows crawling

### Performance

- Remove jQuery from global `<script>` (saved ~30 KB + third-party CDN dep)
- Remove `vite-plugin-node-polyfills` from the client bundle (large prod savings)
- Homepage nav is now fully SSR-rendered (was gated behind `v-if="isMounted"`) — removes a large CLS on hydration
- Deduplicate `getThumborUrl`: SplashHome, HomeSplits, SplashHomeSecondary all import `@/utils/thumbor.js`

### Code quality

- Strip production `console.log` calls from app.vue, TheSidebar, research, childhood-exposure pages
- Remove dead `isMounted`/`splashFull`/`splashThumbnail` refs and unused `markdown-it` imports across pages
- Add `data.value?.splash?.[0]` null-guards (prevents SSR crashes on missing splash metadata)
- Move `/sites` `watch` out of `onMounted` to prevent HMR leaks
- Remove empty `content: {}` block and deprecated `fixed`/`app`/`dark` Vuetify 2 props
- Move `.sr-only` to global `assets/css/app.css` (dedupe across components)
- Delete `/sandbox` test page
- Nitro prerender: `failOnError: false`, ignore `/news` (placeholder)

## 2026-04-09

- Fix `label-content-name-mismatch` accessibility violations across all pages (footer, homepage button, research page link)
- Fix heading order on `/program-summary` (h3 changed to h2 to follow sequential order after h1)
- Fix `/sites` performance (Perf 55 to 88) by deferring ArcGIS iframe load via IntersectionObserver
- Fix CLS on `/childhood-exposure` by changing Google Fonts `font-display` from `swap` to `optional`
- Clean up root directory: move 20 markdown files to `docs/`, axe/lighthouse JSON to report directories
- Remove `markdown-documentation/` directory (merged into `docs/`)
- Lighthouse audit: all 8 pages scoring 100/100/100/100 (Perf/A11y/BP/SEO) except `/sites` (98/100/96/100)
- Remove mismatched `aria-label` attributes from footer links, SplashHome button, and research training materials link
- Update `.nvmrc` to Node.js 22
- Add MIT LICENSE
- Add CHANGELOG

## 2026-01-08

- Add Vitest test reports and axe-core accessibility reports via documentation reference prompt

## 2026-01-06

- Add full documentation portal prompt (DOCUMENTATION-PORTAL-PROMPT.md)

## 2025-12-22

- Add axe-core accessibility audits for both desktop and mobile viewports

## 2025-12-16

- Update SFS program sites content for SFY 2026

## 2025-10-16

- Consolidate accessibility audit reports
- Fix Nuxt Content v3 query issues
- Upgrade Nuxt Content from v2 to v3 (SQL-based query engine, `queryCollection()` API)
- Update `.nvmrc` to Node.js 23 for Nuxt Content v3 native module compatibility
- Update documentation with Content v3 migration details

## 2025-10-15

- Add dynamic copyright year in footer
- Fix color contrast to meet WCAG AA requirements
- Apply ARIA fixes per Illinois DoIT recommendation

## 2025-10-14

- Migrate from Nuxt 3 to Nuxt 4 (`/app` directory structure, updated path aliases)
- Add interactive ArcGIS map iframe on `/sites` page
- Comprehensive accessibility audit and fixes (WCAG 2.1 Level AA)
- Add skip-to-content link, ARIA labels, screen reader text throughout
- Add Nuxt 3 to Nuxt 4 migration guide (MIGRATION-PROMPT.md)
- Update Node.js to 20.x for Nuxt 4 compatibility
- Add JSDoc comments throughout codebase

## 2025-09-04

- Update SFS program sites table content
- Phase 1 and final phase of accessibility fixes
- Add URL tooltips on sites page agency links

## 2024-04-10 to 2024-04-17

- Initial project scaffold with Nuxt 3, Vuetify 3, and Nuxt Content v2
- Add splash/hero images via Thumbor image service
- Configure static site generation for Netlify deployment
