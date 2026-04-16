# Changelog

All notable changes to the ICJIA Safe From the Start (SFS) website are documented in this file. Entries are in reverse chronological order.

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
