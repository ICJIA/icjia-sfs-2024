# Changelog

All notable changes to the ICJIA Safe From the Start (SFS) website are documented in this file. Entries are in reverse chronological order.

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
