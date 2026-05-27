# Astro Migration Checklist — v6.3 (DVFR post-cutover 404 + sitemap.xml polish, 2026-05-27)

> **Checklist version: v6.3 (canonical / current). Continuously updated.**
>
> File renamed from `astro-conversion-checklist-v6.2.md` → `astro-conversion-checklist-v6.3.md` on 2026-05-27 to signal the **DVFR back-port** of v6.2's two highest-impact Infonet patterns (the **"Standard 404 page"** + the **`/sitemap.xml` 200-rewrite + `robots.txt` naming fix**). Both patterns were authored in v6.2 from the Infonet post-cutover work; v6.3 captures their confirmation on a second site (DVFR) and elevates them to canonical-and-replicable status. **The v6.2 ancestor (Infonet post-cutover era) lives in git history at the commit just before this rename.**
>
> - **v6.3** is this file. Shipped after the DVFR post-cutover audit ran against the freshly-written v6.2 checklist. Two patterns earned confirmation as **portable, copy-paste-into-any-ICJIA-site** rather than Infonet-only:
>   - **Standard 404 page** — the BaseLayout + hero band + Pagefind-or-Fuse search form + 4–6-card quick-link grid + help line pattern now has *two* shipping sites (Infonet, DVFR). Both sites ship the same component shape with site-specific brand colors swapped in (DVFR = `#391856` purple + Oswald narrow display; Infonet = `#0d4270` navy + Raleway). **Treat the 404 as a template, not a per-site bespoke design** — copy the structure, swap the palette + font tokens, rename `not-found-*` → `<site>-nf-*`. Detailed pattern in §"404 page — stylish, on-brand" further down.
>   - **`/sitemap.xml` routing** — v6.2 documented the `@astrojs/sitemap` emits-two-files pitfall (`sitemap-index.xml` + `sitemap-0.xml`, but never `sitemap.xml`). DVFR confirmed the two-rewrite Netlify pattern (`/sitemap.xml` + `/sitemap.xml/` both → `/sitemap-0.xml` with `status = 200`) is the right shape for any single-shard site. Plus: **the `_robots.txt` leading-underscore trap** — Astro's `public/` directory does NOT auto-exclude underscore-prefixed files (unlike `src/pages/`), so a file named `public/_robots.txt` ships to production as `/_robots.txt` and the conventional `/robots.txt` returns 404. **Always name it `public/robots.txt` (no underscore).** Added to the §"Common confusions" surface in v6.3.
> - **v6.2** was shipped after IFVCC's cutover to production
>   (`icjia.illinois.gov/ifvcc`) was complete and the legacy Vue 2
>   source had been deleted. It supersedes v5 with the deltas listed in
>   "What changed v5 → v6" below — most notably **§8 now owns the
>   full OG image build pipeline** (SVG → PNG via Sharp, with the
>   librsvg `font-family="sans-serif"` rule so text actually renders on
>   Linux build agents), the **80 ≤ description ≤ 160 hard rule**
>   (build-time assertion in `siteConfig.ts`), the **README convention**
>   (OG image at top + tech-stack badge row), and the **post-cutover
>   listing-page bucketing pattern** (`/news/` and `/events/` group
>   entries by "This Month / Last Month / Previous" rather than flat
>   paginated lists). v5 is still valid; v6 layers on top.
> - **v5** was shipped from the May 2026 ICJIA Illinois Family Violence
>   Coordinating Councils (`icjia.illinois.gov/ifvcc`) migration —
>   pre-cutover snapshot. v5's headline deltas: **Pagefind replaces
>   Fuse.js as the recommended static-search library** (better for
>   large sites, scales to PDF content via
>   [ICJIA/pdf-search-index](https://github.com/ICJIA/pdf-search-index),
>   and the right tool for the upcoming `icjia.illinois.gov`
>   flagship), the canonical `start-dev-server` script at the repo
>   root (kill-port + clear-caches + bypass `pnpm dev` baked into
>   the script body), and second-data-point validation of the
>   Vue 2 → Astro patterns harvested from adultredeploy.
> - **v4** was shipped from the May 2026 ICJIA Domestic
>   Violence Fatality Review (`dvfr.illinois.gov`) migration. Added
>   the dev-port default change (4321 not 8000), Tier 1
>   component-port hygiene (drop nested ARIA landmarks carried
>   over from Vuetify, drop vestigial IDs like `appTop` /
>   `myVlist`), the `start-dev-server` duplicate-port-flag bug,
>   the Thumbor removal pattern, and the "pull Phase 7 CSP hash
>   work forward as soon as ANY inline script lands" rule. v4 is
>   still valid; v5 layers on top.
> - **v3** was shipped from the ICJIA Safe From the Start
>   (`sfs.icjia.illinois.gov`) migration (May 2026). Established the
>   CSP hash-all-inline-scripts rule and the `format: "file"`
>   canonical-URL bug.
> - **v2** was shipped from the `i2i.illinois.gov` migration (May 2026)
>   and standardized on pnpm 10 + Astro 6.3.
> - **v1** lives at
>   [adult-redeploy-client-next/docs/astro-conversion-checklist.md](https://github.com/ICJIA/adult-redeploy-client-next/blob/master/docs/astro-conversion-checklist.md)
>   (Astro 5 + yarn era, mid-2025).
>
> Use **v6** for any new ICJIA Astro migration (next up: infonet).
> **Update this file after every phase of the current migration**
> with anything that abstracts to other ICJIA sites — the explicit
> target is to have a battle-tested checklist before tackling
> `icjia.illinois.gov` (the Vue 2 SPA flagship, the largest and
> most complex site in the portfolio).

Practical patterns that earned their keep on the **Nuxt 3/4 (Vue 3)
→ Astro 6** rewrites of <https://i2i.illinois.gov> (v2),
<https://sfs.icjia.illinois.gov> (v3), and
<https://dvfr.illinois.gov> (v4 — Nuxt 4 + Nuxt UI 4 source rather
than the older Vuetify Nuxt 3). Plus the **Vue 2 SPA → Astro 5**
rewrite of <https://icjia.illinois.gov/adultredeploy> (the v1 source,
re-migrated 2026-05-24). Copy what fits; nothing here is sacred.

**Two migration shapes in this lineage:**
- **Nuxt SSG → Astro** (`i2i`, `sfs`, `r3`, `dvfr`, `infonet`, `vpp`) —
  all Nuxt 3 or 4 (Vue 3.x); SSR config swaps, content collections,
  layout chrome ports. Bulk of the portfolio.
- **Vue 2 SPA → Astro** (`adultredeploy` ✅, `ifvcc`, `icjia.illinois.gov`)
  — client-side routing → file-based routes, Vuex → Alpine `$store`,
  reactive components → Alpine `x-data` islands. Smaller subset but
  the genuinely different shape.

## Why migrate (the two-part case)

The goal isn't just performance — it's **performance AND
accessibility compliance**, both of which suffer under Nuxt + Vuetify
or Nuxt + Nuxt UI defaults.

**Speed:** Mobile Lighthouse Performance 64-91 (Nuxt/Vuetify ceiling)
→ 98-100 (Astro static + Sharp + self-hosted fonts + no runtime JS).
Documented gains: DVFR 64-65 → 98 (Phase 2 chrome only; will be 99-100
when content lands). i2i hit avg 99 vs Nuxt UI ceiling of 87 on the
same source content.

**Accessibility compliance:** Nuxt UI 4 and Vuetify both ship
components that emit problematic ARIA by default — `<UButton>`
wrapping plain links generates `role="button"` mismatches,
`<UNavigationMenu>` emits triple-nested landmarks (`<nav><header><nav>`),
the Nuxt UI 4 `ProseImg` wraps markdown images in a `DialogTrigger`
that applies `type="button"` + `aria-haspopup="dialog"` directly to the
`<img>` (SiteImprove flags as invalid), Vuetify's `v-app-bar` is
implicitly a banner landmark even when nested inside `<nav>`. Fixing
these in-framework is a fight. Migrating to Astro + native HTML + a
single global stylesheet **eliminates the source of the noncompliance
rather than working around it.** Documented gain: DVFR Phase 2
lightcap A11y 100 with native landmarks vs 87 with the Nuxt UI 4
defaults before the port.

ICJIA's compliance posture (ADA Title II + IITAA 2.1) targets WCAG
2.1 Level AA. Every site needs to clear that bar; framework-fighting
to get there is unsustainable as the portfolio grows. The v4
checklist's a11y-specific items (nested landmark collapse, vestigial
ID cleanup, label-content-name-mismatch, `<details>` over `v-menu`,
`inert` over `aria-hidden`) are all there because they save real
audit time per site.

**Production references:**
- <https://i2i.illinois.gov> (mobile Lighthouse on launch: A11y 100 / Perf 100 / BP 100 / SEO 100)
- <https://sfs.icjia.illinois.gov> (mobile Lighthouse on launch: A11y 100 / Perf 98-100 deployed / BP 100 / SEO 100; `/sites` capped at Perf 93 by the embedded 4 MB ArcGIS iframe)
- <https://dvfr.illinois.gov> (Astro migration in progress; chrome-only baseline on `feat/astro-migration`: A11y 100 / Perf 98 / BP 100 / SEO 100 after Phase 2)

---

## Current stack snapshot (as of v5 launch, 2026-05)

| Package | Version on launch | Policy |
|---|---|---|
| **astro** | `6.3.7` | **Always latest stable.** Astro ships frequent patch releases with real perf + a11y fixes — don't pin to an older minor. Check with `pnpm view astro version`; bump with `pnpm up astro@latest`. Avoid 7.0 alphas in production. |
| **@astrojs/sitemap** | `3.7.2` | Latest stable. |
| **@tailwindcss/vite** + **tailwindcss** | `4.3.0` | Latest stable; Tailwind v4 only — do not use the v3 PostCSS plugin. |
| **sharp** | `0.34.5` | Latest stable. Must be explicit dep + in `pnpm.onlyBuiltDependencies` (see §5, §18). |
| **astro-seo** | `1.1.0` | Latest stable. |
| **rehype-external-links** | `3.0.0` | Latest stable. |
| **alpinejs** | `3.15.12` | Latest stable (only if you have islands needing reactivity; see §7). |
| **pnpm** | `10.33.0` | Pin via `packageManager` + `engines.pnpm` + `PNPM_VERSION` in `netlify.toml` (see §18). |
| **node** | `22.22.2` | LTS. Set `NODE_VERSION` in `netlify.toml`. |

**Stay current.** Run `pnpm outdated` periodically; empty output is the goal. If something *is* outdated, bump in a dedicated PR so the upgrade is reviewable independent of feature work. Major bumps (Astro 6 → 7, Tailwind 4 → 5) get their own PR with a build + audit re-run.

---

## What changed from v1 → v2

> **Hard rule for all ICJIA Astro projects from v2 onward:**
> **pnpm only — never yarn, never npm.** This is non-negotiable.
> v1 mixed yarn / npm; v2 standardizes on pnpm 10.x. Every new project
> ships with `packageManager: "pnpm@10.x"` pinned in `package.json`,
> `engines.pnpm: ">=10.0.0"`, and `PNPM_VERSION` in `netlify.toml`. If you
> are migrating a yarn or npm repo, delete its lockfile + `node_modules`
> and regenerate with `pnpm install` before doing anything else. All
> sample commands and scripts in this checklist assume pnpm; do not
> "translate" them back to yarn or npm. (See §18 for full rationale.)

v1 was written in mid-2025 against Astro 5 + yarn. Most of it still
holds. The v2 deltas worth knowing before you start:

| Area | v1 (adultredeploy, 2025) | v2 (i2i, 2026-05) |
|---|---|---|
| **Package manager** | `npm` / `yarn` | **pnpm 10+** (with `packageManager` field + `onlyBuiltDependencies` allowlist; see §18) |
| **Astro version** | 5.x | **6.3+** (`<Image>` API tweaked: `format` singular for single-format, `formats` plural is `<Picture>` only; see §5) |
| **Sharp** | Auto-installed via astro:assets | **Must be a direct dependency** in Astro 6 (`pnpm add sharp`); postinstall must be allowlisted under `pnpm.onlyBuiltDependencies` (see §5, §18) |
| **CSP `script-src`** | `'unsafe-inline'` in the example | **SHA-256 hash** of the one inline executable script — drops `'unsafe-inline'` entirely; JSON-LD `type="application/ld+json"` is a data block and not subject to script-src in modern browsers (see §11) |
| **Other security headers** | X-Frame, X-Content-Type, Referrer, Permissions, HSTS | Same + **COOP, CORP, X-XSS-Protection: 0** (see §11) |
| **Context-scoped headers** | Not mentioned | `[[context.deploy-preview.headers]]` and `[[context.branch-deploy.headers]]` for preview-only allowances (e.g. `app.netlify.com`) that don't ship to prod (see §11) |
| **astro-seo defaults** | Just shows the snippet | Adds `<meta name="robots" content="index, follow">` + `og:image:url` mirror; call those out in any comparison vs hand-rolled meta (see §8) |
| **Audit scripts (§14)** | Aspirational, "exist somewhere" | **Now actually exist** with process-group cleanup, port probe, SIGINT handler, and chrome flags for headless. See `astro/scripts/audit-lh.mjs` and `audit-axe.mjs` |
| **check-links** | Reference impl in adultredeploy repo | Now ships with `decodeURIComponent` and a documented "intentionally HTML-link-only" scope; image references are caught by Astro build-time imports instead (see §13) |
| **Dev-server wrapper** | Not mentioned | `./start-dev-server` at repo root canonicalizes the entry point; `dev.sh` shim preserved for muscle memory (see §19) |

---

## What changed from v2 → v3

v2 was solid; v3 adds the deltas that came out of the SFS migration —
mostly things v2 *said* worked but in practice had sharper edges than
the original example showed.

| Area | v2 (i2i, 2026-05) | v3 (SFS, 2026-05) |
|---|---|---|
| **`<Image>` sizing** | `widths={[...]}` shown without `width`/`height` | **Always pair `widths` with explicit `width`/`height`** matching the rendered display size, or Astro emits the largest variant's dimensions as the HTML width/height and the image blows out the layout (see §5) |
| **Dependency freshness** | Snapshot listed, no policy | **"Always latest stable"** documented as policy. Run `pnpm outdated` periodically; empty output is the goal. Snapshot kept above for context (see "Current stack snapshot") |
| **CSP `script-src`** | Hash **one** inline script (the URL normalizer) | Hash **every** inline `<script>` Astro emits. Astro auto-inlines small `<script>` blocks (Nav active-link markers, Sidebar focus mgmt, /sites lazy-iframe, etc.) even without `is:inline`. Each one needs its own sha256. Ship a `scripts/csp-hashes.mjs` helper that walks `dist/` and prints every unique hash + a ready-to-paste snippet (see §11) |
| **CSP `connect-src`** | "Allow Plausible host" (implied) | **Explicit:** must include `https://plausible.icjia.cloud` or events silently 0. Script loads fine but `/api/event` POSTs are blocked, dashboard sits empty. Easy to miss because no console error is visible without DevTools open (see §9, §11) |
| **Canonical URL** | Default works | **Bug with `format: "file"`** — `Astro.url.pathname` is `/index.html`, `/about.html`, etc. astro-seo's `canonical` prop uses that verbatim, emitting `https://site/index.html` as canonical. Strip `.html` (and `/index.html` → `/`) before passing (see §8) |
| **Markdown external links** | "Use plain `<a>`" (no plugin) | **`rehype-external-links` + drop any Pandoc-style `{target="_blank"}`** annotations in markdown source. Astro/remark doesn't parse the markdown-it-attrs syntax — those braces render as literal text. Plugin auto-applies `target="_blank" rel="noopener noreferrer"` to every external href, no per-link annotation (see §4) |
| **Markdown lists** | Worked by accident | **Tailwind preflight strips `list-style-type`** — markdown-rendered `<ul>`/`<ol>` show no bullets/numbers without an explicit restore in `.markdown-body`. Cosmetically obvious once you load /resources but easy to miss in audit screenshots (see §4) |
| **Image LCP tuning** | `widths=[640, 960, 1280, 1600]`, `quality=82` | Add a **`1200w` intermediate variant** to hit DPR-3 mobile's 1125 device-px sweet spot (browser picks 1280w otherwise = ~15 KB heavier). Quality 45-55 is fine for grayscale-overlaid heroes — the dark gradient hides any compression artifacts. SFS hero went 918 KB JPEG → 34 KB WebP at the picked variant (see §5, §15) |
| **`start-dev-server`** | Bail if port is busy | **Auto-kill the existing listener** (SIGTERM → SIGKILL fallback) before starting. Devs almost always want "restart it" not "free the port first" (see §19) |
| **Audit measurement** | "Deploy to a real URL before trusting numbers" (one line) | **Explicit:** local `pnpm preview` does NOT gzip/brotli; Netlify deploy adds ~2-3 Perf points. A 96 on local preview typically = 98-99 on the prod deploy. Document this prominently or reviewers chase phantom regressions (see §14) |
| **Plausible verification** | "Verify on the deployed page" | **Recipe:** in DevTools console, run `fetch('https://YOUR_PLAUSIBLE/api/event', { method: 'POST', headers: {'Content-Type':'text/plain'}, body: JSON.stringify({n:'pageview', u:location.href, d:'YOUR_DOMAIN', w:innerWidth}) }).then(r=>console.log(r.status))`. 202 confirms the path; final truth is the dashboard. The auto-fired pageview may not appear in the network panel (sendBeacon / timing) — don't conclude broken from that alone (see §9) |
| **netlify.toml + `_headers`** | Both shown but not flagged | **They must stay in sync.** Easy to update one and forget the other; non-Netlify hosts (or Netlify's preview-overlay) trip on the mismatch. CSP changes especially (see §11) |
| **Sharp dep** | "Add it if you use `<Image>`" | **Add it unconditionally** to `pnpm.onlyBuiltDependencies` even if the project uses no `<Image>` directly — Astro 6 pulls Sharp transitively and pnpm 10 will block its postinstall otherwise (see §18) |

---

## What changed from v3 → v4

v3 was shipped from a clean Vuetify → Astro migration (SFS). v4 adds
the deltas that came out of porting from a Nuxt 4 + **Nuxt UI 4**
source (DVFR) — which surfaces some patterns Vuetify-era migrations
didn't see, plus several "this would have saved hours if I'd known
on day 1" items that didn't make it into v3.

| Area | v3 (SFS, 2026-05) | v4 (DVFR, 2026-05) |
|---|---|---|
| **Dev server default port** | `start-dev-server` defaulted to project-arbitrary port (e.g. 8000 carried over from Nuxt) | **Default to Astro's standard `4321`.** Both `package.json` `dev` / `preview` scripts drop the `--port` override, and `start-dev-server` defaults `PORT=4321`. Reasons: one fewer arbitrary number to remember, matches every Astro doc/tutorial out there, and any developer Googling Astro startup will see the same port as their terminal. The override (`./start-dev-server --port 5000`) still works for collision avoidance. |
| **`start-dev-server --port` forwarding** | `exec pnpm dev "$@"` | **Bypass `pnpm dev` and `exec pnpm exec astro dev --port "$PORT"` directly.** If `package.json`'s `dev` script hardcodes `--port` (e.g. `"dev": "astro dev --port 8000"`), forwarding `--port 5000` results in `astro dev --port 8000 --port 5000` — Astro silently falls back to its CLI default (4321). Strip any `--port`/`--port=` flags from forwarded args before re-supplying the parsed `$PORT`. Also: guard `lsof` absence (`command -v lsof`) for Alpine/CI environments. (See §19.) |
| **CSP sha256 hashes** | "Sweep in Phase 7" | **Pull the sweep forward as soon as ANY inline script lands.** v3 said hash-every-inline-script, but the LIVED experience is: ship even one inline script (URL normalizer, drawer toggle, cookie banner) without its hash, and BP drops from 100 → 92 immediately. The script itself is silently CSP-blocked — drawer doesn't toggle, cookie banner doesn't appear, URL doesn't normalize. Always: build, run `pnpm csp-hashes`, paste into `netlify.toml`, redeploy. Don't ship a phase with un-hashed inline scripts. |
| **`scripts/csp-hashes.mjs`** | v3 example walks `dist/` for `<script>` tags | **Skip JSON-LD + JSON data blocks.** Filter on `type="application/ld+json"` / `type="application/json"` — those are data, not script, and modern browsers don't enforce script-src against them. Also skip scripts with `src=` (external; covered by `'self'` or origin allowance). The v3 example didn't filter and would include data blocks, inflating the hash count and confusing future maintainers. |
| **`@fontsource` weight substitution** | "Match the original font weights" | **`@fontsource` may not ship every weight.** Example: source site uses Oswald 100/400/900; `@fontsource/oswald` only ships 200/300/400/500/600/700 — no 100, no 900. Fall back to the **closest neighbors** (200 and 700) and flag the substitution in the commit message + CHANGELOG. Same for italic variants — verify the subpath CSS exists in `node_modules/@fontsource/<family>/<weight>-italic.css` before importing. |
| **Thumbor removal (Nuxt-era image proxy)** | Not mentioned | **Common ICJIA pattern to drop.** Older ICJIA sites declare `NUXT_THUMBOR_KEY` in `.env` and a `runtimeConfig.private.thumborKey` in `nuxt.config.js` for runtime image transforms via the legacy ICJIA Thumbor proxy. Astro replaces it entirely with build-time `<Image>` (Sharp) — no runtime image proxy needed. Removal is one-line in `.env` (and the `runtimeConfig` binding dies with `nuxt.config.js`). Search the repo for `thumbor` to confirm no code references remain. |
| **Env-var rename** | "Rename `NUXT_PUBLIC_*` → `PUBLIC_*`" (single line) | **Explicit list of Nuxt-only env vars to drop entirely**, beyond the rename: `NUXT_MANUAL_ROUTES` (Nuxt creator-script config), `NUXT_BASE_URL` (replaced by `site` in `astro.config.ts`), `NUXT_ACTIVE_SECTIONS` (Nuxt creator-script config), `PLAUSIBLE_API_HOST` (Plausible script URL is hardcoded in `BaseLayout.astro` per v3 §9). Keep only: `PUBLIC_API_BASE_URL`, `PUBLIC_BASE_URL`, `PLAUSIBLE_DOMAIN`. |
| **Nested ARIA landmarks from Vue/Vuetify ports** | Not mentioned | **Common Tier 1 port hazard.** Nuxt/Vuetify markup tends to nest landmarks because of how `v-app-bar` and `v-navigation-drawer` render: `<nav><header id="x">` (where the skip-link target ID is on a banner, not a nav) and `<nav><aside><ul role="navigation">` (three competing landmarks for the same purpose). **Collapse to single landmarks.** `<nav id="x">` for the top bar (skip-link target lives on a real nav landmark). `<nav id="mobile-navigation">` for the drawer (no `<aside>` wrapper, no `role="navigation"` on the `<ul>`). |
| **Vestigial DOM IDs from Vue source** | Not mentioned | **Common drop targets** during port: `id="appTop"` (Nuxt scroll-to-top anchor with no callers post-migration), `id="myVlist"` (Vue camelCase identifier with no callers), legacy class names like `.goToTop` orphaned with the IDs they referenced. Search the post-port working tree for any `id=` or `class=` that isn't referenced by either CSS (`grep '\.id'`) or JS (none in static Astro by definition) — drop the orphans. |
| **`<details>` for nav dropdowns** | Mentioned as Alpine alternative | **Default to native `<details>`/`<summary>` for desktop nav dropdowns.** Semantic, zero JS, no CSP hash, no hydration cost. Tradeoff: does NOT auto-close when a sibling `<details>` opens — but most ICJIA nav menus only have one dropdown at a time (or allow multiple open in the mobile drawer, which matches the original Vuetify behavior). Replaces Vue's `v-menu` / `useState`-driven open/close machinery with one HTML element. |
| **Drawer state without Vue/Vuex** | Mentioned generically | **Use `body.drawer-open` class + a single tiny inline `<script>`.** Click handler lives in `NavHamburger.astro`, toggles the class, flips `aria-expanded` + `inert` on the drawer. CSS does all visual state (`body.drawer-open .mobile-drawer { transform: translateX(0) }`). No shared state, no event bus, no `useState`. Replaces the `v-model="drawer"` Vue pattern with ~10 lines of vanilla JS. Escape-to-close costs ~5 more lines. |
| **MDI icon font dependency** | Not mentioned | **Drop entirely; replace with inline SVG paths.** Nuxt sites typically load `Material Design Icons` via `nuxt-icons` or `@mdi/font` (~30 KB font file + network request). Astro version uses inline SVG `<path d="...">` from the MDI library for the few icons actually used (hamburger menu, X close, chevron down, magnifying glass, vertical-dots). Saves the network request + ~30 KB; CSP doesn't need `font-src` for the icon font; one fewer dependency to maintain. The MDI path data is public-domain. |
| **A11y: `label-content-name-mismatch`** | Not mentioned | **Common Lighthouse gotcha when porting Vuetify `<v-btn>` with `aria-label`.** Vuetify buttons often have a short visible label ("GOT IT") and a verbose `aria-label` ("Accept cookies and close this notice"). Lighthouse flags this — visible text must be a case-insensitive substring of the accessible name. Fix: prepend or include the visible text in the aria-label ("Got it, accept cookies and close this notice"). Audit all `<button aria-label="...">VISIBLE</button>` after a Vuetify → native port. |
| **`tsconfig.json` `baseUrl` deprecation** | Uses `baseUrl: "."` | **Drop `baseUrl` and use relative `paths`.** TypeScript 7.0 deprecates `baseUrl`; the warning fires on `astro check` even today. `paths` resolves relative to `tsconfig.json` location by default in TS 5+, so `"paths": { "~/*": ["./src/*"] }` works without `baseUrl`. |
| **`tsconfig.json` exclude list during migration** | Lists Nuxt source dirs | **Also exclude leftover ROOT files** that survive Phase 1.A: `**/*.vue` (catches `app.vue`, `error.vue`), `vitest.config.ts`, `audit-accessibility.js`, `global.js`. These reference Nuxt/Vue/vitest packages no longer installed; without exclusion, `astro check` reports phantom errors. The exclude list shrinks phase by phase as each directory/file gets deleted. |
| **`<script type="application/ld+json">` warnings** | "Modern browsers don't enforce script-src against it" | **Add `is:inline` directive explicitly** to silence Astro's check hint ("Add the `is:inline` directive explicitly to silence this hint"). `<script is:inline type="application/ld+json" set:html={...} />` — same effective behavior, cleaner check output. |
| **CHANGELOG + version bump cadence** | Not mentioned | **Bump version + CHANGELOG entry per phase, not per migration.** Each phase commit bumps `package.json` `version` (e.g. `3.0.0-alpha.1` Phase 1 → `3.0.0-alpha.2` Phase 2 → ... `3.0.0` on cutover). Phase plan documents go in `docs/superpowers/plans/`; perf baselines go in `docs/perf/<phase>-<short-sha>.md`. Discoverable history. |
| **`pnpm csp-hashes` workflow** | Manual hash computation in v3 | **Wire `csp-hashes` into `package.json` `scripts`.** `"csp-hashes": "node scripts/csp-hashes.mjs"`. Always run as `pnpm build && pnpm csp-hashes`, paste output into `netlify.toml`. Even better: stub `scripts/csp-hashes.mjs` in Phase 1 so the script entry isn't pointing at a nonexistent file (would crash with confusing `Cannot find module`). Stub prints "Phase 7 deliverable" until the real implementation lands. |
| **Strapi integration** | Bespoke fetch pattern in v3 (matched the Nuxt creator scripts) | **Astro's [official Strapi guide](https://docs.astro.build/en/guides/cms/strapi/) is documentation-only — no `@astrojs/strapi` npm package exists.** It shows a manual `src/lib/strapi.ts` wrapper around `fetch()` with `endpoint`/`query`/`wrappedByKey`/`wrappedByList` params, and uses REST. The v4 pattern goes further: GraphQL (existing Nuxt creator queries port directly + one round-trip per collection including nested relations like `attachments`/`splash`), build-time caching to `.cache/strapi/<sha256(query)>.json` (gitignored), and explicit Strapi v4 nested-data unwrapping (`{ data: [{ id, attributes: {...} }] }` → flattened, `{ data: { attributes: {...} } }` for relations → unwrapped). Pair the wrapper with Astro Content Collections (`defineCollection` + `astro/zod`) which the official guide doesn't mention. Choose REST only if your Strapi install has GraphQL disabled or the entity schema is very flat. |
| **Strapi `defineCollection` import path** | Implicit in v3 | **`defineCollection` is in `astro:content`, NOT `astro/zod`.** Only `z` lives in `astro/zod` for Astro 6.3+. Common mis-import that fails with a confusing "is not a function" error. Correct usage: `import { defineCollection } from 'astro:content'; import { z } from 'astro/zod';` |
| **Strapi entity-name traps** | Not mentioned | **The Strapi entity name often differs from your consumer-facing collection name.** ICJIA's news collection is called `posts` in Strapi (legacy); the Astro Content Collection name stays `news` for clarity, but the GraphQL `query { posts { ... } }` targets the Strapi entity. **Always inspect the live GraphQL schema** before naming collections — don't assume entity names match the URL slug. Same trap with FAQ field names (Strapi has `name`/`identifier`/`details`/`ranking`; consumer expects `title`/`slug`/`body`/`ranking` — rename at load time). |
| **Strapi repeatable components** | Not mentioned | **`link` is a repeatable component in ICJIA Strapi** — returns `[]` even when empty, `[{...}]` when populated. Zod schema must be `z.array(LinkSchema).nullable().optional()`, NOT `LinkSchema.nullable().optional()`. The Zod error message when this is wrong is misleading (says "expected object, received array"). When in doubt, check the live cache JSON to confirm shape before tightening the schema. |
| **`_`-prefixed Astro pages** | "Not routed" (implied) | **`_`-prefixed filenames under `src/pages/` are entirely excluded from `dist/` in Astro 6**, not just from the router. If you ship a `src/pages/_diagnostics.astro` expecting it to be reachable for debugging, the file simply won't exist in the deployed output. Use a regular filename (e.g. `diagnostics.astro`) and exclude it from the sitemap via `astro.config.ts` filter (`!page.includes('/diagnostics')`). |
| **`PUBLIC_API_BASE_URL` (or any other env)** | "Set in .env" | **`.env` is gitignored, so Netlify CI doesn't load it.** The `envField` default in `astro.config.ts` doesn't propagate to `import.meta.env.PUBLIC_*` at build time in CI either. Put your build-time env vars in **`netlify.toml`'s `[build.environment]` block** (same place as `NODE_VERSION`/`PNPM_VERSION`). Then local dev reads from `.env` (gitignored) and CI reads from `netlify.toml` (committed). DO NOT use a silent hardcoded fallback in the fetch helper — if the var goes missing on CI, you want a loud build failure, not silently querying prod. The Phase 3 DVFR build failed exactly this way on first push. |
| **`AbortSignal.timeout()` on Strapi `fetch()`** | Not mentioned | **Always wrap the GraphQL `fetch()` in `AbortSignal.timeout(60_000)`** so a down/slow Strapi doesn't hang the build for the full Netlify 15-minute build timeout. ICJIA's Strapi instances are mostly stable but the 60s timeout × 5 collections = 5min max blast radius vs unbounded otherwise. Wrap in a try/catch and re-throw `TimeoutError` with a friendlier message that includes the endpoint. |
| **MDC component invocations inside Strapi markdown bodies** | Not mentioned | **CRITICAL for any ICJIA migration sourced from `@nuxt/content`.** Strapi CMS bodies on these sites often contain Nuxt MDC syntax — `:home-text`, `:home-boxes`, `:home-buttons`, etc. — strings on a line by themselves (or with `\n\n`). @nuxt/content's MDC plugin recognises `:component-name` as an inline invocation of a Vue component from `components/content/`. **markdown-it does not.** It renders `:home-text` as the literal text `home-text` (markdown-it strips the `:` as an emoji prefix attempt). Result: where the live Nuxt site renders a full styled section, the Astro site shows the literal slug text floating in a `<div class="markdown-body">`. **See full section below: "MDC components called from Strapi markdown".** |
| **`xss` package import shape** | Not mentioned | **`xss` is published as CommonJS — named ESM imports fail at runtime.** Astro's static-paths runtime throws `does not provide an export named 'getDefaultWhiteList'` the first time any page actually calls the markdown renderer. Hides until the first phase that exercises `renderMarkdown()` on a real CMS body (Phase 3 wired the function but never called it; Phase 4 surfaced the bug when index.astro tried to render the homepage body). Fix: `import xss from 'xss'; const filter = new xss.FilterXSS({ stripIgnoreTagBody: ['script','style'], whiteList: { ...xss.getDefaultWhiteList(), img: imgAllow } });` — default-import + member access. Astro check / type system doesn't catch this in advance because the named-import shape passes TS type-checking even though the runtime module lacks those exports. |
| **Astro `build` page count does not include sitemap** | "Builds X pages" assumed in plan exit criteria | **`@astrojs/sitemap` runs AFTER the page-emit phase**, so `astro build`'s "N page(s) built" log doesn't include the sitemap. If your plan says "9 pages" and the build log says "8 page(s) built" but `dist/sitemap-index.xml` is present and the count of `dist/**/index.html` matches your expected routes, that's correct — the spec count was off by one. |
| **Cookie banner: never use `hidden`-toggle inline scripts** | "Render banner with `hidden`, un-hide via inline script after first paint" (Phase 2 plan default) | **Lighthouse counts a `position: fixed` banner's appearance as CLS** even though transforms wouldn't. The `hidden`-toggle pattern dropped CLS past 0.10 on every audited route. Replace with: render banner always in DOM, off-screen via `transform: translateY(100%)` (via a `.cookie-banner--hidden` class), inline script removes the class if not previously dismissed. Fixed-position transformed elements don't contribute to CLS — confirmed: DVFR `/faq/` CLS dropped 0.123 → ~0.04 from this single fix. Same script body change → CSP sha256 rotates; remember to `pnpm csp-hashes` + update `netlify.toml`. |
| **CMS-author inline `style="float:left"` on bio images** | Not mentioned | **`xss` strips the `style` attribute on `<img>` by default**, AND the `float`/`clear` CSS properties aren't in xss's default CSS whitelist. CMS authors at ICJIA embed bio headshots with `style="float:left; padding-right:10px;"` so paragraph text wraps around the image. Without this fix the headshots stack ABOVE the bio text (broken Tier 1 fidelity). Two-part fix in `src/lib/markdown.ts`: (1) add `'style'` + `'align'` to the img attribute allowlist, (2) configure xss with `css: { whiteList: { float: true, clear: true, display: true, 'vertical-align': true, margin: true, 'margin-{top,right,bottom,left}': true, padding: true, 'padding-{top,right,bottom,left}': true, width: true, height: true, 'max-{width,height}': true } }`. xss still strips dangerous CSS values (`expression()`, `url(javascript:)`) regardless of which properties are whitelisted. |
| **`@fontsource` weight audit before shipping** | "Import the same weights as the source site" | **Audit `font-weight:` usage in your `src/` source before locking the import list.** DVFR Phase 1 imported 18 `@fontsource` weight files mirroring the legacy Nuxt config. Phase 7 audit (`grep -rhoE "font-weight:\s*[0-9]+" src/`) showed source uses only 300/400/500/600/700/900. The 100/200 weights and the `100-italic` variants were dead imports — `<em>`/`<i>` in CMS markdown synthesizes italic from the regular weight which is fine for body text. Trimmed 7 imports, CSS bundle dropped **132 KB → 113 KB** (-19 KB). Doing this audit at the END of the migration (Phase 7) rather than Phase 1 means you can drop with confidence. |
| **Nav vertical alignment: outer wrapper must be inline-flex** | Implicit (works on text-only nav items) | **When the desktop nav mixes text items (`<a>` with text content) with icon items (`<a><svg></svg></a>`) and `<details>` dropdowns, the outer wrapper `<span>` must be `display: inline-flex; align-items: center;`.** Default `display: inline` lays out children with inline-block boxes via `vertical-align: baseline`, which misaligns SVG icons (they sit at the baseline; text sits one descender-line up). Compounded by Vuetify-era `margin-top: -9px` / `margin-bottom: 5px` nudges that were trying to fight this — drop those once the parent is flex. Match the search/translate icon SVG size to the text item line-height (DVFR used 22×22; 32×32 was visibly too big). |
| **`<main>` padding-top: 64 on home, 96 elsewhere** | Implicit (uniform 64px) | **Home page may have a hero element flush with the nav; every other page starts with a `<h1>` that needs breathing room.** Compute the padding in `BaseLayout.astro` from `Astro.url.pathname`: `const isHome = rawPath === '/' || rawPath === ''; const mainTopPad = isHome ? 64 : 96;`. Apply via inline style. Drops the Vuetify-era negative-margin nudges (`margin-top: -5px` / `-15px` / `-18px`) that legacy pages used to fight uniform padding. |
| **`niceBytes()` legacy KB-not-bytes bug** | Not mentioned | **ICJIA Strapi installs return `attachment.size` in KB (decimal), but Vue's `niceBytes` helper treats the value as bytes** — so a 575 KB PDF renders as "575.8 B" on the legacy site. For Tier 1 visual fidelity, **preserve the bug** in the Astro port — match what users currently see, not the technically-correct number. Document it in a CHANGELOG note. Future Phase 7+ work can fix to `Math.round(size * 1024)` once Tier 1 lock is no longer the dominant constraint. |
| **Search: build-time index via Astro endpoint** | "Fuse.js client-side" (implied) | **Don't import a static JSON file into the search page** — that bundles the index into the page's JS. Instead, emit the index as a separate static asset: `src/pages/search-index.json.ts` (an Astro endpoint that exports `GET`) writes `dist/search-index.json` at build time. The client script `fetch('/search-index.json')` loads it on demand. The search page HTML stays small; the index is cacheable separately. DVFR's index is 65 KB / 54 entries; fetch + parse < 50 ms on a fresh page load. Wire `?q=` deep-link support so category badges on NewsCard etc. can link directly to search results. |
| **Fuse.js client island via bundled `<script>` (not `is:inline`)** | Not mentioned | **Bundle the search island as a same-origin module**: `<script>import '../scripts/search';</script>` at the bottom of the search page. Astro bundles to `/_astro/search.<hash>.js`, served with the existing `script-src 'self'` allowance, no new CSP hash required. Adding it as `is:inline` would require a new hash and every script-body change would invalidate it. |
| **Comprehensive merge-readiness audit pattern** | "Run Lighthouse before merging" (one line) | **Sample 8 representative routes × 2 viewports + axe-core on 4** rather than auditing all routes. ICJIA sites have N collection-detail templates × M entries; the templates are what matters, not each entry. DVFR Phase 7 audit: 8 mobile lightcap + 8 desktop lightcap + 4 mobile axe-core AA = 20 tool calls total. Catches every template defect; doesn't waste effort. Record results in `docs/perf/phase<N>-<sha>.md` with a route-by-route scoring table. |
| **`.gitkeep` files for empty `src/` subdirs** | Implicit | **Explicit.** `src/components/.gitkeep`, `src/lib/.gitkeep`, `src/assets/.gitkeep`. Git doesn't track empty directories; without these, Phase 2-3 work referencing those paths fails on a fresh clone with "no such directory." Trivial fix, easy to forget. |
| **Removing `dist` symlink** | Implicit | **Common Phase 1.A drop.** Nuxt sites often have a `dist -> .output/public` symlink at root (a convenience for static-hosting deploys). Astro emits its own `dist/` directory. Delete the symlink before `pnpm install` runs so the new `dist/` materialises cleanly. |
| **Wave-based subagent dispatch** | Implicit ("subagent per task") | **Group related single-file creates into one implementer dispatch.** For a 19-task phase plan, dispatching 19 implementer + 38 reviewer subagents = 57 dispatches. Group into 4-5 logical waves (e.g. "scaffold files," "utility components," "big component ports," "compose"), each followed by spec + quality review at the wave boundary. Same coverage, ~10x less dispatch overhead, same correctness. |

---

## What changed from v4 → v5

v4 was shipped from the DVFR Nuxt 4 → Astro migration. v5 adds the
deltas that came out of porting **IFVCC (Vue 2 SPA, Strapi v3,
path-mounted at `/ifvcc`)** — the second Vue 2 → Astro data point in
the lineage (adultredeploy was the first). The patterns harvested
from adultredeploy validate, plus a small set of net-new lessons
worth abstracting before the flagship `icjia.illinois.gov` migration.

| Area | v4 (DVFR, 2026-05) | v5 (IFVCC, 2026-05) |
|---|---|---|
| **Static search library** | Fuse.js client-side, fetch JSON index from same-origin endpoint, build via `src/pages/search-index.json.ts` | **Pagefind is now the default recommendation for new ICJIA migrations.** Run `pagefind --site dist` as the final build step; Pagefind walks the rendered HTML, builds a binary index split into per-page chunks under `dist/pagefind/`, and ships a vanilla-JS UI (mountable as a web component or imperatively via `import { PagefindUI } from '/pagefind/pagefind-ui.js'`). **Why now:** (1) **Scales to large sites.** Fuse.js loads the full index into memory on the search page; Pagefind fetches chunks on demand — a 5,000-page corpus still feels instant. (2) **PDF support via [ICJIA/pdf-search-index](https://github.com/ICJIA/pdf-search-index).** The flagship `icjia.illinois.gov` migration will need to search inside PDF research reports; Pagefind's index format integrates cleanly with the pdf-search-index pipeline (pre-extract PDF text, feed into Pagefind's `--source` flag or a manual indexer). (3) **No hand-rolled UI plumbing.** Fuse.js requires you to author the search input, results list, highlighting, keyboard nav, scoring — Pagefind ships all of it. For ICJIA migrations targeting fidelity with a legacy search page, style Pagefind's UI via its documented CSS variables (`--pagefind-ui-*`) to match the original Search.vue look. (4) **CSP-friendly.** Pagefind's UI bundle is a same-origin module — `script-src 'self'` covers it, no inline-hash maintenance. Fuse.js still works for sub-100-page corpora where the index fits in a single JSON blob; don't refactor working Fuse implementations for the sake of it, but pick Pagefind for new builds. |
| **`start-dev-server` script body** | v4 showed kill-port logic in a delta-callout snippet but the canonical §19 script body was still `exec pnpm dev "$@"` (no kill-port, no cache clear). | **Bake every behavior into the canonical script body — one source of truth.** v5's `start-dev-server` (at the repo root, not the astro/ subdir): (1) parses `--port N` / `--port=N` and strips them from forwarded args so `pnpm exec astro dev --port "$PORT"` doesn't get double-supplied; (2) SIGTERMs any listener on `$PORT`, waits 3s, SIGKILLs if it didn't release; (3) clears `astro/.astro/` and `astro/.cache/strapi/` on every start (stale CMS cache + stale Vite cache are the two top causes of "why is dev rendering yesterday's content?"); (4) runs `pnpm install` if `node_modules` is missing; (5) `exec pnpm exec astro dev --port "$PORT"` (bypasses `pnpm dev` to avoid the v4 hardcoded-port collision). See §19 below. |
| **Strapi v3 schema detection** | v4 documented v4 ↔ v5 unwrap differences (`{ data: [{ id, attributes }] }` → `{ data: [{ id, documentId, ...fields }] }`). | **Strapi v3 has its own response shape.** `{ posts: [...] }` returns entries directly — no `data` wrapper, no `attributes` wrapper. Detect by probing for the wrapper on the first GraphQL call: `const wrapped = response.data.posts?.data !== undefined; const entries = wrapped ? response.data.posts.data.map(e => ({ id: e.id, ...e.attributes })) : response.data.posts;`. ICJIA's older Strapi installs (IFVCC's `ilfamilyviolence.icjia-api.cloud` is v3) won't migrate to v4/v5 anytime soon; the v3 lane needs to live in the loader. Update `docs/icjia-strapi-cheatsheet.md` with the v3 column when migrating each site. |
| **Vue 2 SPA → Astro (second data point)** | Patterns derived from adultredeploy (290 pages); inferred to generalize. | **IFVCC validates the pattern at smaller scale and confirms.** The adultredeploy patterns transferred 1:1 with no Vue-2-specific surprises beyond what was already documented. Specifically: (1) Alpine 3 + `@alpinejs/focus` + `Alpine.store()` for drawer/modal state — replaces Vuex cleanly; (2) `<details>`/`<summary>` for nav dropdowns — replaces `v-menu`; (3) `const base = import.meta.env.BASE_URL` for path-mount internal links; (4) markdown-it + xss for CMS body rendering with the legacy `github-markdown.css` for typography continuity; (5) the multi-stage npm script pipeline (`fetch` → `fetch:cms-images` → `build:svg` → `build:og` → `astro build` → `pagefind`) — though for v5, switch the search step from `generateSearchIndex.js` to `pagefind --site dist`. The pattern is now battle-tested on **two Vue 2 → Astro migrations**; the icjia.illinois.gov flagship can rely on it without a spike pass for these specifics (still do a spike for the SPA-specific unknowns called out in §"Before tackling icjia.illinois.gov"). |
| **Build-time-embedded password gate (`VUE_APP_GATE`)** | Not mentioned | **A common Vue 2 ICJIA pattern: `process.env.VUE_APP_GATE` baked into the bundle, compared client-side in a "PLEASE ENTER PASSWORD" modal to reveal CMS pages flagged with `metaData.requiresAuth`.** This is **not real auth** — the password is in the JS bundle and visible to anyone with DevTools — it's a soft gate against casual viewing. Three options on migration: (a) **drop it entirely** (IFVCC's choice — the protected content was outdated, the gate was vestigial); (b) **port as Alpine island** reading from a `PUBLIC_GATE` env var, replicating the modal — same security posture, same fidelity; (c) **upgrade to real auth** — Astro hybrid output + a session cookie + a server endpoint, which is a significant architectural shift. Default: option (a), unless the protected content is genuinely needed AND option (c)'s overhead isn't justified. Document which option each site picks in its spec. |
| **GA + Plausible coexistence in legacy source** | Plausible only (DVFR was a clean Nuxt port). | **Common in older ICJIA Vue 2 sites: `vue-gtag` for Google Analytics AND a static Plausible `<script>` tag in `public/index.html` running simultaneously.** Both were instrumented during the slow migration from Universal Analytics to GA4 to (eventually) Plausible. On Astro migration: **drop GA entirely; keep Plausible.** Check `data-domain` matches the path-mount (e.g. `icjia.illinois.gov/ifvcc` not just the host). Remove `vue-gtag` from `package.json`, the `Vue.use(VueGtag, ...)` block from `main.js`, and the `gtag` script tag from `public/index.html`. Zero visual impact; one less analytics dependency. |
| **Strapi `home` singleton entity** | Not mentioned | **Older ICJIA Strapi installs (v3 era) use a `home` singleton — `query { home { ... } }`, no plural, no pagination.** This holds the homepage's CMS-driven content (the hero text/title/summary, the homepage feature boxes, etc.). Newer Strapi installs (DVFR's v4 era) use a regular `pages` entity with `slug: "index"` instead. When porting, check both patterns — IFVCC has BOTH a `home` singleton AND a `pages` entity — and decide which is canonical for the homepage. IFVCC's pattern: `home.splash` (hero image), `home.title`, `home.summary`, `home.body` are the home-only fields; standard `pages` carries everything else. |
| **Image proxy (`image.icjia.cloud` / Thumbor-style)** | "Drop entirely" (v4 §Thumbor removal) | **Vue 2 sites in this lineage typically also reference a *second* image proxy in `config.json` keyed under `image.server`** (separate from the Nuxt-era `NUXT_THUMBOR_KEY`). IFVCC's `src/config.json` has `image.server: "https://image.icjia.cloud"` with `splashHeight`/`splashWidth`/`thumbHeight`/`thumbWidth` keys. **Remove all of it.** Drop the config block, remove the `thumbor-url-builder` dep, grep for and remove every `myApp.config.image.*` reference in components. Every image now flows through Astro's `<Image>` (local assets) or build-time Sharp via `public/_cms-img/` (CMS-hosted). |
| **Pixel-perfect fidelity overrides v4 perf optimizations — WITH icon-font exception** | v4 recommended replacing MDI icon font (~30 KB) with inline SVG paths. | **When a migration's mandate is "pixel-perfect to the existing site," respect that over the v4 perf-by-default recommendations** — except where the perf cost breaks the binding gate. Examples: (a) ~~**MDI icon font**: keep loading `@mdi/font` from CDN if the legacy site uses it~~ — **REVISED:** IFVCC Phase 2 dropped `@mdi/font` for inline SVG paths after mobile Perf hit 76 (gate ≥ 98). Icon fonts are the canonical exception per the row below ("Icon-font CDN dependency does NOT survive when mobile Perf gate is binding"). Inline SVG = same glyph paths, pixel-identical, ~200 KB CSS savings. **Hard rule from v5.1:** for icon-font dependencies specifically, prefer inline SVG over pixel-perfect-via-icon-font. (b) **`niceBytes` KB-as-bytes bug**: preserve (already in v4). (c) **Vuetify-specific spacing nudges** (`margin-top: -9px` etc.): port verbatim rather than drop. (d) **MDC component porting / @theme rewrites**: do at the END of the migration in a Phase 8+ visual-cleanup pass. Document each pixel-perfect-preserved-bug in CHANGELOG so a future engineer doesn't "fix" it. |
| **Per-phase audit gates (state-government compliance)** | v4 §14 said "run `pnpm audit:lh` + `pnpm audit:axe` after each meaningful change" without explicit numeric gates. | **State-government ICJIA sites need explicit, non-negotiable per-phase exit criteria:** (1) **Mobile Lighthouse Perf ≥ 98 on every public route** — not just the home; sample all template variants (Home, News list, News detail, Events list, Events detail, Councils, Circuits, Page catch-all, Search, 404). Mobile is the gate; desktop is informational. (2) **Lighthouse A11y = 100 on every route** — non-negotiable for ADA Title II + IITAA 2.1 compliance. (3) **axe-core: 0 violations on every audited route** (sample 4 representative templates per phase). (4) **Color contrast verified via `contrastcap-mcp`** when any color change lands or any new component renders against a background — Lighthouse's contrast check can miss complex backgrounds (gradient overlays, semi-transparent layers). **Workflow per phase:** `pnpm build && pnpm preview` → `lightcap` mobile + desktop on 4-8 routes → `axecap` AA on 4 routes → `contrastcap-mcp` if any color/background changed → fix any deficiency → re-audit → only then merge the phase. **No phase ships with even one route below the gate.** Per the [`lightcap` skill](mcp://lightcap), `audit:perf:mobile` is the canonical command; for ad-hoc checks the MCP tools are faster than the CLI scripts. Capture every phase's results in `docs/perf/phase<N>-<sha>.md` with a route-by-route scoring table. |
| **Never use `@astrojs/vue` for Vue 2 → Astro migrations — perf over reusability** | Implicit (the adultredeploy lineage was already native-Astro-only; v4 didn't say it explicitly) | **Hard rule for any Vue 2 → Astro migration: do NOT use `@astrojs/vue` to "save effort" by porting Vue components as-is.** Five reasons, in priority order: (1) **`@astrojs/vue` ships Vue 3.** Current code is Vue 2 (Options API, different reactivity, breaking slot semantics). You can't drop-in existing `.vue` files — they need a Vue 2 → Vue 3 rewrite either way. Same amount of rewriting whether the target is `.astro` or `.vue` (Vue 3). (2) **Vuetify 2 is Vue-2-only.** Vue 3 needs Vuetify 3 (different API surface). Every `<v-btn>`, `<v-card>`, `<v-dialog>`, `<v-app-bar>`, `<v-row>`/`<v-col>`, `<v-menu>`, `<v-list>`, `<v-text-field>` etc. gets rewritten either way. (3) **JS budget.** Astro static = 0 KB JS by default. Adding `@astrojs/vue` + Vue 3 runtime (~50 KB min+gzip) + Alpine (~15 KB) doubles the JS payload before you ship one line of business code. The 98+ mobile Lighthouse Perf gate becomes meaningfully harder. (4) **Pixel-perfect doesn't need Vue.** Fidelity is about the rendered HTML + CSS the user sees. Same `<div class="ifvcc-btn">…</div>` whether emitted by a `.vue` or `.astro` file. (5) **Lineage consistency.** Every Vue 2 → Astro migration in this lineage (adultredeploy ✅, IFVCC ✅, icjia.illinois.gov flagship ⏳) is native `.astro` + Alpine. Using Vue-in-Astro for one site creates a one-off pattern that drags on every future maintainer. **The principle abstracts:** for any migration where the legacy framework version doesn't match the @astrojs integration's version (Vue 2 vs Astro's Vue 3; Nuxt 2 vs Astro's nothing), don't try to save effort by carrying the framework forward. The rewriting cost is the same; the runtime cost is permanent. **Functional parity (same behavior, same look) is the must; performance is the goal.** |
| **SiteImprove trailing-slash 301 avoidance** | Implicit (relied on default Netlify 301 + client URL normalizer for Plausible) | **SiteImprove flags HTTP 301 redirects as findings and deducts DCI points** — including the trivial trailing-slash 301 (`/news` → `/news/`) Netlify emits by default for any Astro `trailingSlash: 'always'` build. v5 fix: layer five things together — (1) `trailingSlash: 'always'`; (2) sitemap entries always use `/path/`; (3) HTML `<link rel="canonical">` always trailing-slash; (4) **`netlify.toml` 200-rewrites** for every route's non-slash form (`status = 200`, `force = true` — this is a rewrite, NOT a redirect — URL bar shows whatever was requested, content comes from `index.html` of the slash form); (5) client-side URL normalizer for Plausible event deduplication. **Result**: external bookmarks at `/news` still resolve (200, not 404), no 301 anywhere for SiteImprove to flag, no duplicate-row in Plausible. Trade-off: ~12 explicit rewrite rules in `netlify.toml` (one per top-level route + one per dynamic-segment template). Verify post-deploy: `curl -fsSI https://<site>/news \| head -1` → expect `HTTP/2 200`, NOT `HTTP/2 301`. **Full pattern in v5 §10a.** This is the v5 evolution of the v3 §9 client-only normalizer — server-side `netlify.toml` 200-rewrites are the additive layer that closes the SiteImprove gap. |
| **`@theme` token calibration to legacy Vuetify** | v4's @theme assumed a clean Tailwind starting point (Nuxt/Vuetify token mapping not documented). | **For Vue 2 + Vuetify 2 → Astro/Tailwind 4 migrations targeting pixel-perfect fidelity: calibrate `@theme` to Vuetify's Material Design defaults at the start of Phase 1.** Key tokens to mirror: (1) **Primary color**: Vuetify's `purple darken-1` = `#673ab7` for IFVCC's primary; check `src/plugins/vuetify.js` and `assets/app.css` for any custom overrides. (2) **Spacing scale**: Vuetify uses a 4 px base (`ma-1` = 4 px, `ma-2` = 8 px, ..., `ma-12` = 48 px); Tailwind 4's default is also 4 px-based (`p-1` = 4 px, `p-2` = 8 px, ...) — happy alignment, no override needed. (3) **Type scale**: Vuetify's `text-h1`/`text-h2`/.../`text-caption` map to specific px/line-height pairs; cross-reference [Vuetify 2 typography docs](https://v2.vuetifyjs.com/en/styles/typography/) and define matching `@theme` `--text-*` tokens. (4) **Elevation/shadows**: Vuetify's `elevation-1`..`elevation-24` use specific `box-shadow` triples (Material Design dp scale); copy the CSS values verbatim into `@theme` `--shadow-*` tokens. (5) **Breakpoints**: Vuetify uses `xs/sm/md/lg/xl` at `600/960/1264/1904` px; Tailwind 4's defaults are `sm/md/lg/xl/2xl` at `640/768/1024/1280/1536` px — **these don't match**. Either override Tailwind's breakpoints to match Vuetify, OR accept the difference and verify per-component that layout shifts at different breakpoints don't matter. IFVCC's choice: override breakpoints to match Vuetify for fidelity. Document the calibration in `docs/superpowers/specs/<date>-astro-migration-design.md` so future migrations can copy it. |

---

## What changed from v5 → v6

v5 was tagged as the IFVCC pre-cutover snapshot. v6 captures the
patterns that earned their keep in the **two weeks of post-cutover
production work** that followed — the legacy Vue 2 source was deleted
(`8b5a4b0`), the `/news/` and `/events/` lists were re-bucketed by
recency (`7c7ad66`, `dc95574`), the `/councils/` and judicial-circuit
select were fixed to render inline (`001f327`, `02cab56`), and the
SEO/OG-image/README hygiene was promoted to canonical §8 status. None
of the v5 patterns are deprecated; v6 adds layers on top.

| Area | v5 (IFVCC pre-cutover, 2026-05) | v6 (IFVCC post-cutover, 2026-05) |
|---|---|---|
| **OG image build pipeline** | One-line bullet in adultredeploy lessons (line 427 of v5): `OG image generator at build via Sharp (scripts/build-og-image.mjs). 1200×630 PNG from a brand-color SVG.` Not in canonical §8. | **§8 now owns the full pipeline.** Inline SVG → Sharp PNG → dual-write to `public/og-image.png` + `dist/og-image.png` → last step in `pnpm build`. Five hard rules abstracted in §8: (1) **generic CSS font-family ONLY** — `font-family="sans-serif"`, NEVER named fonts like `Raleway` or `Roboto`. librsvg's fontconfig has no access to `@fontsource/*` packages in `node_modules`, so named fonts silently drop the entire `<text>` element on Linux build agents (gradient renders, text doesn't, exit code 0 — caught only by opening the PNG). The IFVCC og-image.png shipped as a **blank purple rectangle for the entirety of v5** because of this. (2) dual-write to both `public/` and `dist/`. (3) og-image is the LAST build step. (4) 1200×630 is canonical. (5) PNG only (never SVG/JPG/WebP for OG). |
| **Description length — both floor AND ceiling enforced** | Floor (≥ 80 chars) documented in §"SEO + OG image + CSP scope" rule 2. Ceiling (≤ 160 chars) implicit via the `truncateDescription` helper's `max = 160` default. **`siteConfig.defaultDescription` itself could ship over budget** and the helper would silently truncate every page that fell back. | **Hard rule: 80 ≤ description ≤ 160, enforced at build time.** Both bounds called out in §8. The `siteConfig.defaultDescription` MUST live in the band; the helper handles per-page descriptions. Add an inline assertion at the bottom of `siteConfig.ts` that throws on module load if the default exceeds 160 — impossible to ship an over-budget default once added. IFVCC's pre-v6 default was 204 chars; trimmed to 140 in v6. |
| **README convention** | None — just the `# <Site name>` title + Netlify badge + License badge. | **OG image at the top + tech-stack badge row** baked in §8. The same generated PNG that ships as `og:image` doubles as the README hero. Then 9 shields.io badges in a fixed order: live status (Netlify), license, framework (Astro), styling (Tailwind), interactivity (Alpine), search (Pagefind), runtime (Node), package manager (pnpm), build helpers (Sharp). Scannable as "what is this site built on?" — useful both for human reviewers and for the LLM bootstrap pass via `docs/llm-migration-prompt.md`. |
| **Listing-page recency bucketing for `/news/` and `/events/`** | Flat reverse-chronological lists with date headings inline. | **Three-bucket pattern: "This Month / Last Month / Previous"** (commits `7c7ad66` for news, `dc95574` for events). Buckets are computed in the page-level frontmatter from the same dataset already loaded for the flat list; no extra Strapi fetch. Each bucket gets its own `<section>` with a sticky `<h2>` heading; empty buckets are omitted (don't render an empty "This Month" section in the third week of a slow month). Why this works better than flat: (1) scannable — readers find "what's new" without paging; (2) preserves long-tail content visibility (the "Previous" bucket isn't paginated away to page 4); (3) Plausible/SiteImprove still see one URL per item — no SEO penalty for the visual grouping. Apply this to any CMS-driven listing page where temporal recency is the primary axis (news, events, press releases, blog). |
| **Inline rendering for selection components** (judicial-circuit select, councils body) | `<select onChange="window.location = …">` navigates to a separate page per selection. | **Render inline via Alpine `x-show` / `x-data`** (commits `001f327`, `02cab56`). The `<select>` change updates an Alpine state variable; the corresponding body is already in the DOM, gated by `x-show`. **Why:** (1) eliminates a navigation per click — feels instant; (2) avoids the trailing-slash 301 dance (no new URL to redirect); (3) Plausible doesn't log a phantom "intermediate" pageview; (4) accessible — focus stays on the select, screen readers announce the change. Trade-off: every body is in the rendered HTML (slight Initial Bundle increase). For ICJIA's typical 10-25 options each with a body of ~1-3 KB, the trade-off favors inline. **Rule:** if the listing has < 50 items and < 5 KB of body per item, render inline; otherwise paginate. |
| **Uniform page-title sizing** | Per-template `<h1>` sizing inherited from legacy Vuetify-era CSS (varied 28-52 px across templates). | **Uniform 44 px `<h1>` across all page templates** (commit `001f327`). Defined as a single `@theme --text-page-title` token in `global.css`; every `<h1>` on a page template uses `text-page-title`. Phase-cutover sites should pick one number (typically 40-48 px) and enforce it via the @theme system, not via per-template overrides. Eliminates the "every template is sized slightly differently" code smell that accumulates over a long migration. |
| **Post-cutover legacy-source deletion** | Migration plans assumed legacy source stays in the repo at `legacy/` until "later." | **Delete the legacy Vue 2 source one cutover-stable week after the Astro version goes to production** (commit `8b5a4b0`). Once the new site has had a week in prod with no rollback, the legacy source no longer earns its keep — it dilutes search, confuses LLM bootstrap passes, and represents temptation to "just fix it in the old code" when production has an issue. **Tag the last legacy commit BEFORE deletion** (IFVCC's is `v1-final`) so rollback is a tag checkout, not a git-archeology session. Delete in a single commit (`-r` the `legacy/` dir) so the diff is one clean drop and the git history is searchable for "where did the Vue source go?". |
| **Astro-side README at root, not in `astro/`** | Per the v5 cutover, the canonical README lived at the repo root and at `astro/README.md` redundantly. | **Single canonical README at the repo root.** `astro/README.md` either gets deleted (commit history preserves the snapshot) or trimmed to a one-liner pointing at the root README. The root README is what GitHub shows, what crawlers pick up, and what the LLM bootstrap pass reads first. Duplicate READMEs drift; one source of truth wins. |
| **Checklist version bookkeeping** | "Companion docs (current as of v5.0.0)" — versioning by checklist file revision. | **Bump the version inline AND in the filename** (`docs/astro-conversion-checklist-v6.3.md`) when a phase's lessons accumulate beyond a row-or-two delta. v6 was earned through the post-cutover lesson set above; rename gives commit history a clear "this is the v6 era" anchor. Cross-reference updates needed in: root `README.md`, `CHANGELOG.md`, `docs/llm-migration-prompt.md`, `docs/superpowers/plans/*.md`, `docs/superpowers/specs/*.md`. |
| **Use Tailwind utilities for responsive grid layouts** (Vuetify / Nuxt UI replacement) | InfoNet's v3.0.0 cutover used per-page `<style>` blocks with hand-rolled CSS Grid / `@media (min-width: …)` rules to replace `<v-row><v-col>` markup. | **Default to Tailwind utility classes for any grid that maps onto Vuetify's `<v-row><v-col cols=12 md=6>` (or Nuxt UI's `UGrid`) pattern.** Reasons: (1) **Visual readability** — `<div class="grid grid-cols-1 min-[960px]:grid-cols-2 gap-8">` tells a reviewer the layout at a glance; a 30-line `.foo-grid { display: block } @media (min-width: 960px) { .foo-grid { display: grid; … } }` block buries it. (2) **Vuetify mental-model continuity** — the cols-12 / md=6 abstraction maps 1:1 onto `grid-cols-12 md:col-span-6` (or the simpler `grid-cols-1 md:grid-cols-2`), so migrators recognize the structure. (3) **Eliminates `<style>` block sprawl** — the migration adds dozens of `.home-grid`, `.foo-grid`, `.bar-row` one-off classes that never get reused; replacing them with utilities means one less name to invent. (4) **Breakpoint discipline** — Tailwind's `md:` / `lg:` prefixes (or arbitrary `min-[960px]:` for Vuetify-fidelity sites) sit in the markup right next to the element they affect, not 20 lines down in a `<style>` block. **Hard rules:** (a) **Match Vuetify breakpoints exactly with arbitrary values when pixel-perfect is mandated** — Tailwind's `md:` is 768 px, Vuetify's `md` is 960 px; use `min-[960px]:grid-cols-2` (or override `--breakpoint-md: 960px` in `@theme`). (b) **Keep typography + brand styling in `<style>` blocks** — only the GRID/COL/PADDING utilities move to Tailwind; per-component font sizes, colors, and bespoke spacing (e.g. legacy "margin-top: -10px" nudges) stay in scoped CSS for clarity and to avoid utility-class noise. (c) **Don't refactor working layouts blindly.** Move utility-first ONLY when you're already touching the file or when the grid clearly maps onto a Vuetify row/col. **Reference (InfoNet v3.2.0 commit `f54cc59`):** ```astro <section class="w-full bg-[#f2f2f2] px-8 pt-8 pb-12"> <div class="grid grid-cols-1 min-[960px]:grid-cols-2 gap-8 items-start"> <div class="home-hero-inner">…</div> <HomeBarGraph /> </div> </section> ``` Mirrors legacy `<v-container fluid><v-row><v-col cols=12 md=6 :class="grey lighten-3">`. |

---

## What changed from v6.2 → v6.3

v6.3 is a **back-port-and-confirm** increment, not a new-pattern increment. v6.2 wrote down two Infonet-era patterns (Standard 404 page + `/sitemap.xml` 200-rewrites); v6.3 captures the result of applying them to DVFR and elevates them to **canonical, portable, copy-paste** status. **Single rule of thumb that emerged:** *any pattern that lands cleanly on a second site without site-specific carve-outs has earned canonical status — promote it from "Infonet learned this" to "every ICJIA Astro site does this."*

| Area | v6.2 (Infonet-authored pattern) | v6.3 (DVFR-confirmed canonical pattern) |
|---|---|---|
| **Standard 404 page** | v6.2 §"404 page — stylish, on-brand" described the Infonet implementation: BaseLayout wrap + hero band with gradient `404` numeral + `/search/?q=…` form + 2-col quick-link card grid (≥960 px) + help line. Site-specific palette + font tokens. Authored as Infonet-specific guidance. | **Promoted to canonical "Standard 404 page" template.** DVFR shipped a parameter-swap of the same component shape: `#391856` purple instead of `#0d4270` navy, Oswald narrow display instead of Raleway, Lato body unchanged, card list updated to DVFR's `navMenu` shape (Home / About DVFR / Meetings / Regional DVFR Teams / Resources / FAQs) instead of Infonet's. **Hard rules promoted:** (1) **CSS class prefix is `<site>-nf-*`** (DVFR uses `.dvfr-nf-*`, Infonet `.not-found-*`) — keeps the global CSS scopable and prevents collisions if two ICJIA sites share a build pipeline later. (2) **BaseLayout takes a `noindex?: boolean` prop**, threaded through to `HeadMeta` and `astro-seo`'s `<SEO noindex={...}>` (default `false`; 404 sets `true`). Wire this on every new site BEFORE shipping the 404 — saves the "soft-404 indexed in Google" finding later. (3) **The decorative `404` numeral is `aria-hidden="true"`** and the `<h1>` ("We couldn't find that page") carries the announcement; cards have NO `aria-label` (avoid label-content-name-mismatch). (4) **Search form `method="get"` with `action="/search/"` + `name="q"`** is the universal hand-off — both Fuse.js and Pagefind site searches already read `?q=` from URLSearchParams. (5) **Cards mirror the site's `navMenu` 1:1** plus Home — keeps the 404 maintenance cost zero. When `navMenu` changes, copy the new entries into the 404. Reference DVFR `src/pages/404.astro` + `.dvfr-nf-*` rules in `src/styles/global.css`. |
| **`/sitemap.xml` routing — confirmed two-rewrite shape** | v6.2 §"`/sitemap.xml` routing — rewrite to the flat shard, not the index" documented the `@astrojs/sitemap` emits-two-files pitfall + the two-rewrite Netlify pattern. Authored from Infonet's first encounter with the issue. | **Confirmed on DVFR (the second case).** No site-specific modifications needed. Same two `[[redirects]]` blocks (one for `/sitemap.xml`, one for `/sitemap.xml/`), `status = 200`, both pointing at `/sitemap-0.xml`. **Add it before going to production** rather than after: any SEO checker that probes the conventional URL (Google Search Console's "Sitemap" submission UI, MetaPeek, Ahrefs, SiteImprove) gets the right answer on the first try. **Diagnostic signature** that you're missing this: `curl -sI https://<site>/sitemap.xml | head -1` returns `HTTP/2 404`, but `curl -sI https://<site>/sitemap-index.xml | head -1` returns `HTTP/2 200`. The fix is two `[[redirects]]` blocks; ship them in the same commit that scaffolds the site.|
| **`public/robots.txt` naming — leading-underscore trap** | Not documented in v6.2 (the trap hadn't been hit by any ICJIA Astro site yet). | **Promote to a §"Common confusions" entry.** Astro's `src/pages/` directory excludes underscore-prefixed files (`src/pages/_layout.astro` is NOT routed). Intuition: `public/` does the same. **It does not.** `public/_robots.txt` ships verbatim as `dist/_robots.txt`, deployed as the URL `/_robots.txt`. The conventional `/robots.txt` returns 404 because Astro never emits it. **Detection:** `curl -sI https://<site>/robots.txt | head -1` — if it returns 404, check `public/` for `_robots.txt`. **Fix:** rename to `public/robots.txt` (no underscore). The content body should reference the conventional `/sitemap.xml` URL (which the two-rewrite pattern above makes valid): `Sitemap: https://<site>/sitemap.xml`. DVFR hit this; promote ahead of the Infonet team finding it for themselves. |
| **`noindex` prop in `BaseLayout` / `HeadMeta`** | Infonet's 404 used `<meta name="robots" content="noindex, follow">` inline in the 404 template (override of `HeadMeta`'s default). | **Add a `noindex?: boolean` prop to `BaseLayout` (default `false`) and thread it through to `HeadMeta` and `astro-seo`'s `<SEO noindex={…}>`.** Wire it once; every template can opt-in by passing `noindex={true}`. The 404 is the obvious first consumer; `/search/?q=` result pages and any maintenance/error page are the next. **Rule:** any page that doesn't represent durable content gets `noindex={true}`. Prevents Google's "soft-404" findings and keeps the URL out of the index. Avoid `nofollow` — links from the 404 should still be followable. |
| **"Back-port-and-confirm" as a discipline** | n/a | **New checklist hygiene rule:** when v(n) writes down a pattern on site A and the next site (B) ships the same pattern with no carve-outs, **promote the pattern in v(n+1) from "site A's discovery" to "every ICJIA Astro site does this"**. Captures the difference between a one-shot finding and a portable pattern. Specifically: rename the section, replace site-specific identifiers with `<site>` placeholders, add a "Confirmed on:" line listing every site running it. The current "Confirmed on:" surface for both patterns above: **Infonet (v6.2), DVFR (v6.3).** When the next migration (icjia.illinois.gov flagship) also ships them, add "flagship" to the line. After three confirmations, the pattern is canonical-and-not-going-anywhere. |

**Cross-reference updates that landed with v6.3:**
- Root `README.md` — checklist filename reference bumped to `v6.3`.
- `CHANGELOG.md` — `[3.1.0] - 2026-05-27` entry describing the 404 + sitemap + robots fix landing.
- `package.json` — version `3.0.1` → `3.1.0`.
- `docs/icjia-strapi-cheatsheet.md` — no change needed (Strapi-specific).
- `src/components/HeadMeta.astro` + `src/layouts/BaseLayout.astro` — `noindex?: boolean` prop added.
- `src/pages/404.astro` — full rewrite from the Vuetify-mimic placeholder to the Standard 404 page template.

---

## Portfolio status + attack order

As of 2026-05-25:

| Site | Stack | Status |
|---|---|---|
| `adult-redeploy-client-next` (standalone repo) | Astro 5 + yarn | ✅ Migrated mid-2025 (the v1 source) |
| `icjia.illinois.gov/adultredeploy` (path-mounted) | **Vue 2 → Astro** | ✅ Migrated 2026-05-24 — **first Vue 2 → Astro reference in this lineage** (`base: '/adultredeploy'` pattern proven). Repo: [ICJIA/adult-redeploy-client-next](https://github.com/ICJIA/adult-redeploy-client-next) |
| `i2i.illinois.gov` | Nuxt + Vuetify → Astro 6 | ✅ Migrated (v2 source) |
| `sfs.icjia.illinois.gov` | Nuxt + Vuetify → Astro 6 | ✅ Migrated (v3 source) |
| `r3.illinois.gov` | Nuxt + Vuetify → Astro 6 | ✅ Migrated 2026-05-24 |
| `dvfr.illinois.gov` | Nuxt 4 + Nuxt UI 4 → Astro 6 | ✅ Migrated 2026-05-25 (v4 source — **this repo**). Repo: [ICJIA/icjia-dvfr-nuxt4](https://github.com/ICJIA/icjia-dvfr-nuxt4) |
| `icjia.illinois.gov/ifvcc` | **Vue 2 (SPA, path-mounted)** → Astro 6 | 🚧 **In progress — v5 source (this repo).** Second Vue 2 → Astro data point. Strapi backend confirmed at `ilfamilyviolence.icjia-api.cloud` (v3 schema; note: cheatsheet's earlier `ifvcc.icjia-api.cloud` hint was speculative — `ilfamilyviolence` is canonical). Branch: `feat/astro-migration`. Repo: [ICJIA/icjia-ifvcc-2021](https://github.com/ICJIA/icjia-ifvcc-2021) |
| `infonet.icjia.illinois.gov` | **Nuxt 4** (same shape as pre-migration DVFR) → Astro 6 | ⏳ **Next** after IFVCC ships. Repo: [ICJIA/icjia-infonet-nuxt4](https://github.com/ICJIA/icjia-infonet-nuxt4). **DVFR's full v4 playbook + v5 audit gates apply directly** — same Nuxt 4 + Strapi shape; expect 1-2 day migration with no surprises |
| `icjia.illinois.gov` (flagship) | **Vue 2 SPA** | ⏳ Last. Repo: [ICJIA/icjia-public-client-2021](https://github.com/ICJIA/icjia-public-client-2021). Harvests adultredeploy + IFVCC lessons + a dedicated 2-4 hour spike pass. **Don't start until IFVCC + infonet ship.** |

**Three sites in flight** (as of 2026-05-25 confirmed by maintainer):
1. **IFVCC** 🚧 — Vue 2 SPA, path-mounted, small. Currently being migrated; the second Vue 2 data point. Validates v5 patterns ahead of the flagship.
2. **Infonet** ⏳ — Nuxt 4, similar shape to DVFR. Largely a copy-paste of the v4 playbook + v5 audit gates + the DVFR phase plans. Probably the fastest of the three.
3. **ICJIA flagship** ⏳ — Vue 2 SPA, largest in the portfolio. Last. Spike pass first; expect surprises.

The Nuxt SSG sites (i2i, sfs, r3, dvfr, infonet, vpp) are all
**Nuxt 3/4 (Vue 3.x)** under the hood and share strong DNA. **Vue 2
SPA → Astro is a genuinely different migration shape** — client-side
routing, Vuex state, dynamic regions, possibly more third-party
scripts and authenticated surfaces. The good news: as of 2026-05-25,
**we now have two Vue 2 → Astro data points**: `adultredeploy` shipped
2026-05-24 (the v1 source — 290 static pages, mobile Lighthouse Perf
54 → 96-99, A11y 100, 0 axe violations) and **IFVCC in active
migration** as v5's source (this checklist's current snapshot). Most
of the Vue 2-specific lessons in v4/v5 come from harvesting these
two; the icjia.illinois.gov flagship will be the third (and largest).

### Vue 2 → Astro patterns (HARVESTED from `adult-redeploy-client-next`, 2026-05-24)

> **First Vue 2 → Astro reference in the lineage.** Shipped 2026-05-24.
> Repo: [ICJIA/adult-redeploy-client-next](https://github.com/ICJIA/adult-redeploy-client-next).
> Vue 2 + Vuetify 2 → **Astro 5 + Tailwind 4 + Alpine.js 3** (`+ @alpinejs/focus`),
> path-mounted at `icjia.illinois.gov/adultredeploy`, 290 static pages.
> Mobile Lighthouse Perf **54 → 96-99**, A11y 100, axe-core 0
> violations. Project-local checklist in
> `docs/astro-conversion-checklist.md` (the v1 source for this v4).

#### Stack notes

- **Astro 5, not Astro 6.** Adultredeploy launched on `astro@^5.18.1`.
  Astro 5 lacks the `envField` schema niceties from 6, and `<Image>`
  format singular/plural rule from §5 doesn't apply. Otherwise the
  patterns transfer.
- **npm, not pnpm.** Adultredeploy uses `npm run` throughout the
  build scripts. The "pnpm 10 only" rule from v2 onward was a
  deliberate choice for new ICJIA migrations, but **npm + the
  same `package.json` shape works fine** if you have a reason to
  stay on npm (e.g., toolchain conflict, CI constraint). pnpm is
  still preferred for new starts; don't migrate an existing npm
  project to pnpm during the framework swap.
- **Alpine.js 3 + `@alpinejs/focus` for SPA interactivity.** This is
  the canonical Vue 2 SPA → Astro replacement for Vuex-driven
  reactive components. ~10 KB Alpine + ~3 KB focus plugin. No build
  step. Replaces drawer, dropdown, modal, table-sort, pagination
  state — anything that needs `x-data`/`x-show`/`@click`. The DVFR
  v4 pattern (CSS class on `<body>` + inline script) is even
  lighter but only works for binary state (open/closed); when you
  need real reactive expressions (`x-show="open && filter==='news'"`),
  reach for Alpine.
- **Pagefind for static search.** Alternative to Fuse.js. Better
  for large sites (pre-built index, very fast on 1000+ pages). Runs
  as `pagefind --site dist` after `astro build`. Adultredeploy uses
  it for site-wide search across 290 pages.
- **`graphql-request` for Strapi.** Adultredeploy uses
  [`graphql-request`](https://github.com/jasonkuhrt/graphql-request)
  instead of native `fetch()` for cleaner queries + automatic typed
  responses. DVFR's v4 native-fetch wrapper is more dependency-free
  but you trade off some ergonomics; either is fine.

#### Path-mount config (`base: '/adultredeploy'`)

```js
// astro.config.mjs (adultredeploy)
export default defineConfig({
  site: 'https://icjia.illinois.gov',
  base: '/adultredeploy',
  trailingSlash: 'never',  // DVFR chose 'always'; both work
  output: 'static',
  integrations: [
    sitemap({
      filter: (page) => !/\/404\/?$/.test(page) && !/\/pagefind\//.test(page),
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
      serialize(item) {
        if (item.url === 'https://icjia.illinois.gov/adultredeploy') {
          item.priority = 1.0;
        }
        return item;
      },
    }),
  ],
  vite: { plugins: [tailwindcss()] },
});
```

Internal link pattern: `const base = import.meta.env.BASE_URL || '/adultredeploy';` declared once per component, used as `href={\`${base}/about\`}`. Centralized prefix; hardcoded `/foo` links break in production but work in dev.

#### Alpine.js component patterns (Vuex replacement)

Three components shipped, all worth referencing for IFVCC + icjia.illinois.gov:

**`src/components/alpine/DrawerNav.astro`** — modal drawer.
Key Alpine attributes: `x-data` (component scope), `x-show="$store.drawer.open"` (read shared store), `x-transition.opacity`, **`x-trap.noscroll.inert="$store.drawer.open"`** (focus trap + scroll lock + sibling-inert, all in one), `@keydown.escape.window`, `@click="$store.drawer.open = false"` on the backdrop. `<details>`/`<summary>` for collapsible sections within the drawer.

**`src/components/alpine/DropdownMenu.astro`** — accessible dropdown.
`x-data="{ open: false }"` for local state. `@click.outside="open = false"` + `@keydown.escape.window="if (open) { open = false; $refs.btn.focus(); }"` + `:aria-expanded="open"`. Proper `role="menu"` / `role="menuitem"` ARIA.

**`src/components/alpine/ListingTable.astro`** — whole-row clickable. Real `<a>` stays on the title cell for keyboard/SR users; row-level click handler suppresses itself when:
- The click target is itself a `<a>` / `<button>` / `<input>` (don't double-fire)
- The user has text selected (don't hijack copy-text drags)

Result: SR users get a labeled link; mouse users get a giant click target.

#### `$store` pattern (shared state, Vuex replacement)

Adultredeploy declares `Alpine.store('drawer', { open: false })` in a tiny entry script. Components reference it as `$store.drawer.open`. Reactive across components without a build dependency. For Vue 2 → Astro migrations: the Vuex store usually maps 1:1 onto Alpine stores. Things you'd put in Vuex:

- **Drawer / modal open state** → Alpine `$store`. Works.
- **Filter / search state for a list** → Alpine local component state (`x-data="{ filter: '' }"`). Works.
- **User preferences (theme, lang)** → localStorage + inline pre-paint script (per DVFR's Phase 8 dark-mode plan).
- **Auth / user session** → if you truly have one, you're past Astro's static-only sweet spot. Hybrid output + a client island.

#### Multi-stage build pipeline (npm scripts)

```json
"scripts": {
  "fetch": "node scripts/fetch-content.mjs",
  "fetch:cms-images": "node scripts/fetch-cms-images.mjs",
  "build:svg": "node scripts/build-counties.mjs && node scripts/build-svg.mjs",
  "build:og": "node scripts/build-og-image.mjs",
  "dev": "npm run fetch && npm run fetch:cms-images && astro dev",
  "build": "npm run fetch && npm run fetch:cms-images && npm run build:svg && npm run build:og && astro build && pagefind --site dist"
}
```

Compared to DVFR's Astro Content Collections approach: the script pipeline writes JSON files to `src/content/_data.json` that Astro pages import. Both work; the Content Collections approach (DVFR v4) is more idiomatic for Astro 6+. The script approach (adultredeploy) gives you more control over multi-step pipelines (e.g., the SVG + OG image generators between content fetch and build).

#### `scripts/fetch-cms-images.mjs` — the Tier 2+3 pipeline DVFR Phase 5 needs

Walks the fetched dataset, finds two kinds of CMS-hosted images:
1. **Strapi URL pattern** — `https://<api>.icjia-api.cloud/uploads/<file>.{jpg,jpeg,png,gif,webp}` — downloads via `fetch`, caches to `.cache/cms-img/<hash>`, runs through Sharp at multiple widths `[640, 960, 1280]`, writes `public/_cms-img/<hash>-<width>.webp`, manifest written to `src/lib/cms-image-manifest.json`.
2. **Inline base64 data URIs** — `data:image/...;base64,...` — same processing path, **rewrites the field in the dataset to a small `cms-base64:<hash>` key string** so subsequent build steps and page renders never see the original base64.

**Result on adultredeploy:** `/apps` page HTML 1.56 MB → 24 KB (64× smaller). 202 inline images processed; 245 manifest entries; 34 MB of optimized WebPs on disk.

DVFR's Phase 5 should lift this pattern directly. Strapi origin changes to `dvfr.icjia-api.cloud`; image extensions same; output dir same.

#### Legacy CMS HTML leakage

Vue/Vuetify sites often have CMS content authored with framework-specific CSS class names that the new Astro site doesn't carry. Example: `<span class="heavy">Program Director</span>` was Vuetify-styled bold; in Astro the class is undefined and the markup renders as flat text in unstyled emphasis.

Fix at the markdown post-process step — strip or replace legacy class attributes. Adultredeploy specifically targeted `<span class="heavy">…</span>` → unwrapped. Identify these by spot-checking the first page render after Phase 4/5 lands and the CMS content is rendering.

#### Base64 thumbnail stripping (huge perf lever)

If the CMS returns inline base64 thumbnails on listing/index pages (researchhub-style), DO NOT render them straight into HTML. Adultredeploy's home page would have shipped ~30 MB if all 100 article thumbnails rendered as data URIs. Strategy:

1. Process all base64 images through the Sharp pipeline at build (see above).
2. On listing pages, hide off-screen cards via Alpine `x-show="visible"` (paginated).
3. `loading="lazy"` on the `<img>` so the browser doesn't fetch until in viewport.

Adultredeploy paginates 2 cards per page on the home with an "ellipsis paginator" Alpine component.

#### Other adultredeploy lessons worth recording

- **Self-hosting fonts (`@fontsource/*`) was the single biggest perf lever.** Mobile Perf +8, desktop +27 (73 → 100) on adultredeploy. Same finding DVFR Phase 1 already applied.
- **`scripts/check-links.mjs`** — pre-deploy link sanity scanner. Catches broken internal hrefs. Worth lifting verbatim; adultredeploy keeps it at `scripts/check-links.mjs`.
- **OG image generator** at build via Sharp (`scripts/build-og-image.mjs`). 1200×630 PNG from a brand-color SVG. Adds an OG image to every page without designer involvement per release. **Canonical for v6: see §8** for the full pipeline, the librsvg font-fallback gotcha (`font-family="sans-serif"`, never named fonts), and the README embed convention.
- **`/404` CLS fix:** add `min-h-[40vh]` to the 404 page so the empty viewport doesn't shift when the footer loads. Adultredeploy hit CLS 0.24 on `/404` before this.
- **`whitespace-nowrap` on date columns** in listing tables. Without it, "November 17, 2025" wraps into two lines when the column is narrow.
- **Tag `v1-final`** on the last Vue commit before deletion. Tagged-rollback is easier than reverting + cherry-picking.
- **`docs/superpowers/specs/<date>-parity-punch-list.md`** — track items where the new Astro version diverged from the old Vue version. The team uses this during cutover review.
- **`docs/audits/<date>-full-site-lightcap.md`** — committed lightcap snapshot per cutover. Same pattern as DVFR's `docs/perf/phase<N>-<sha>.md`.

## Before tackling `icjia.illinois.gov` — do a spike pass

Even with IFVCC's lessons folded into v5, `icjia.illinois.gov` is a
larger Vue 2 SPA with more route count, more state, and likely more
third-party integrations. **Before committing to the full migration,
do a 2-4 hour spike pass** to surface SPA-specific unknowns the
smaller migrations didn't reach:

1. **Routing inventory:** `vue-router` config — total route count,
   any dynamic routes that don't trivially map to Astro file-based
   routing, any nested layouts.
2. **State management:** Vuex stores in use. Anything that's truly
   client-side state (cart, user session, form-stepper progress) vs
   stuff that's actually just hydrated from server data and could
   become build-time content. The latter ports trivially; the
   former needs design (Astro client islands? Alpine? something
   else?).
3. **Authenticated surfaces:** any admin, dashboard, or
   logged-in-only regions. ICJIA's public site is mostly read-only,
   but verify — even a single `/dashboard` route changes the build
   target from `output: 'static'` to `output: 'hybrid'` and pulls
   in a new set of considerations.
4. **Just-in-time UI:** modals, drawers, dynamic forms, table sort.
   For each, decide: static + native HTML (`<details>`,
   `<dialog>`) / minimal inline script (drawer toggle) / hydrated
   island (Alpine, the Astro `client:visible` directive) / "this
   has to stay SPA-style and live behind a hosted iframe."
5. **Third-party scripts:** ICJIA's main site likely loads more
   analytics + tracking pixels than the smaller sites. Each needs
   a CSP allowance OR a self-hosted alternative.
6. **CMS:** is content already in Strapi (matches v4's Tier 2
   GraphQL loader pattern) or is it inlined in templates / pulled
   from a different source?
7. **Existing performance + a11y baseline:** lightcap mobile + axe
   on `https://icjia.illinois.gov`. Capture the current scores so
   the migration's gains are documented numerically.

Output of the spike: a "What's new vs the smaller sites?" addendum
appended to this checklist (a "v4 → v5" section) **before** writing
the icjia.illinois.gov migration spec. Surface unknowns early; pay
the discovery cost during a 2-4 hour exploration, not during a
weeks-long migration where every surprise compounds.

If the spike surfaces something that genuinely doesn't fit
("client-side personalization can't be static"), that's the moment
to decide whether the answer is (a) Astro with hybrid output +
islands, (b) Astro for the public surface + a separate SPA region
for the dynamic bits, or (c) a different framework altogether
(Remix? Hono?). Making that call upfront is much cheaper than
discovering it mid-port.

---

## Markdown typography: `github-markdown.css` vs `@tailwindcss/typography`

> **DVFR Phase 4 surfaced this question.** Once the catch-all
> page template started rendering real CMS bodies, the page showed
> no headings, no paragraph spacing, no bullet styling — Tailwind
> preflight had stripped them all and `.markdown-body` had only the
> v3 §4 list-style restore. Two options:

### Option A: Keep the legacy `github-markdown.css` (Tier 1)

Copy `assets/css/github-markdown.css` (the 1013-line GFM stylesheet
the Nuxt site already uses) into `src/styles/github-markdown.css`
and import it in `global.css` AFTER `@import 'tailwindcss';`.

**How it coexists with Tailwind:** every rule in
`github-markdown.css` is scoped under `.markdown-body` (e.g.,
`.markdown-body h1`, `.markdown-body p`, `.markdown-body ul`). Tailwind
preflight resets margins/padding on bare elements globally but does
NOT use `!important`. When CMS content is rendered inside
`<div class="markdown-body" set:html={html} />`, the github-markdown
rules win the cascade inside that div (one extra class segment of
specificity over the preflight bare-element selectors). Outside
`.markdown-body`, Tailwind preflight controls everything as
expected. No conflict.

**Pros:**
- Identical to the legacy Nuxt site's rendering (Tier 1 visual
  continuity, the spec deliverable for DVFR).
- Zero risk of subtle visual drift on every CMS-backed page.
- One-line drop-in.

**Cons:**
- ~1 KB CSS payload added before Tailwind tree-shaking (it's all
  used, so tree-shaking doesn't help).
- The styles bypass Tailwind theme tokens — color/spacing changes
  in `@theme` won't propagate into prose without editing
  `github-markdown.css` directly.

### Option B: Use `@tailwindcss/typography` (`prose` class)

The official Tailwind plugin. Provides a `prose` class (with
`prose-sm`, `prose-lg`, `prose-xl`, `prose-invert`, `prose-purple`,
etc. modifiers) that applies opinionated typography to a content
block. Install:

```sh
pnpm add -D @tailwindcss/typography
```

Then in `astro.config.ts` (Tailwind v4 vite plugin doesn't need a
config file — the plugin is auto-detected from `package.json`).
Usage:

```astro
<article class="prose prose-lg">
  <div set:html={renderedMarkdown} />
</article>
```

**Pros:**
- Tailwind-native — theme tokens propagate (e.g., `prose-purple`
  uses your custom purple).
- Maintained by the Tailwind team; updated with Tailwind v4
  releases.
- Configurable per-prose-size, per-color, per-element (`prose
  h1:font-display` etc.).
- Smaller CSS payload after tree-shaking.

**Cons:**
- Opinionated look that **does NOT match `github-markdown.css`
  visually out of the box.** Headings, link colors, blockquote
  styling, code blocks, table borders — all different. Migrating
  from `github-markdown.css` to `prose` is a visible visual change.
- For an ICJIA Tier 1 migration of an existing Nuxt site that
  uses `github-markdown.css`, this means accepting visible drift.

### Decision rubric

- **Tier 1 visual continuity with an existing site that uses
  `github-markdown.css`:** keep `github-markdown.css`. Don't trade
  identity for orthogonality.
- **Fresh project or willing to redesign prose typography:** use
  `@tailwindcss/typography`. It's the Tailwind-native answer and
  scales with your theme.
- **Hybrid:** load `github-markdown.css` only on CMS-rendered pages
  (catch-all `[...slug]`, news/publications/meetings detail templates)
  and use `prose` elsewhere if a new style is wanted. Complicates
  cascade reasoning; only worth it if both styles need to coexist.

### What DVFR chose

`github-markdown.css` per Tier 1. Phase 4's catch-all template
renders inside `<div class="markdown-body">` and gets the full
legacy typography. No drift from the live site.

---

## MDC components called from Strapi markdown

> **Critical pattern for every ICJIA Astro migration sourced from
> `@nuxt/content`.** Discovered on DVFR Phase 4 (2026-05-25); the
> homepage rendered as a splash image followed by the literal string
> `home-text`, because the Strapi `index` page body is exactly:
>
> ```
> :home-text
>
>
> ```
>
> @nuxt/content's MDC plugin treated `:home-text` as an inline call
> to the Vue component `components/content/HomeText.vue` (or
> `HomeText` auto-imported). Astro has no MDC plugin and no
> equivalent in markdown-it. The renderer outputs `<p>:home-text</p>`,
> the `:` gets stripped (markdown-it interprets it as a stalled emoji
> shortcode), and the page shows literal slug text.

### Detection (do this BEFORE Phase 3)

Before writing any Astro Content Collection loaders, grep every CMS
body for MDC invocations:

```sh
# After scripts/fetch-content writes _data.json or after Phase 3's
# .cache/strapi/*.json materialize:
grep -nE "^\s*:[a-z][a-z0-9-]*\s*$" .cache/strapi/*.json
```

Or, via direct GraphQL:

```sh
curl -X POST https://<api>.icjia-api.cloud/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ pages { data { attributes { slug body } } } }"}' \
  | jq -r '.data.pages.data[] | .attributes.slug + "\n" + .attributes.body' \
  | grep -E "^:[a-z]"
```

Inventory the components invoked. Each one needs an Astro port AND
a placement decision (render directly in the page template, vs
pre-process the markdown to swap the MDC token for inline HTML).

### Strategy 1: Direct render in the page template (simplest)

If a single MDC component is invoked from a single CMS page (e.g.,
`:home-text` only ever appears in the `index` body), the cheapest
fix is to render the Astro version of that component directly in the
page template **instead of** the CMS body. Port the Vue component to
`.astro` once; the page template imports it.

DVFR Phase 4 took this route for `:home-text` — `src/pages/index.astro`
no longer calls `renderMarkdown(entry.data.body)`; it just renders
`<HomeText />` after `<HomeSplash />`. The CMS entry is still
consulted for `title` / `summary` / dates (used for SEO via
`HeadMeta.astro`), but the body string is discarded.

Pros: zero MDC plumbing in markdown.ts; the component lives in
`src/components/<Name>.astro` like every other Astro component;
testable and statically analyzable.
Cons: doesn't scale if many CMS pages embed many different MDC
components in different positions; you'd need per-page logic. For
ICJIA's typical site shape (1-3 MDC components, each used on 1-2
pages), it scales fine.

### Strategy 2: MDC pre-processor (more flexible)

If MDC components appear mid-body (between two paragraphs of
markdown), you can't drop the body entirely. Pre-process the body
string before passing to markdown-it: find `:component-name` tokens
and replace with HTML placeholder strings or inline-rendered HTML
from the Astro components.

```ts
// src/lib/mdc.ts
const MDC_RX = /^\s*:([a-z][a-z0-9-]*)\s*$/gm;

const MDC_COMPONENTS: Record<string, string> = {
  // Map MDC tokens to pre-rendered HTML. Use Astro.compile() at build
  // time or hand-author the HTML once.
  'home-text': '<!-- HomeText: rendered inline -->',
  'home-boxes': '<!-- HomeBoxes: rendered inline -->',
};

export function preprocessMdc(src: string): string {
  return src.replace(MDC_RX, (_full, name: string) => {
    return MDC_COMPONENTS[name] ?? `<!-- unknown MDC component: ${name} -->`;
  });
}
```

This works for sites where MDC components appear in arbitrary body
positions. But: pre-rendering an Astro component to a string is
non-trivial in Astro 6 (no public API for it). Workarounds: hand-
author the HTML once and inject; OR use Strategy 1 with custom
post-render logic per page.

Cons: more code; tightly couples markdown.ts to the component
inventory; pre-rendering is awkward.
Pros: scales to many MDC components in many positions.

### Default recommendation

**Use Strategy 1 unless the body genuinely interleaves prose +
components.** Most ICJIA Nuxt sites have MDC tokens that occupy the
ENTIRE body of a page (the prose lives in the Vue component, not in
markdown), so Strategy 1 covers the case cleanly.

### Catalog of known MDC components per ICJIA site

Track these per migration as they get harvested. Update this list
whenever a new site surfaces one.

| Site | MDC token | Source component (Nuxt) | Astro port location |
|---|---|---|---|
| DVFR | `:home-text` | `components/content/HomeText.vue` | `src/components/HomeText.astro` |
| DVFR | `:home-boxes` | `components/content/HomeBoxes.vue` | (Phase 4; currently commented out in `pages/index.vue`) |
| DVFR | `:home-buttons` | `components/content/HomeButtons.vue` | (not in use on prod) |

### Pre-Phase-3 audit step

Add this to every new ICJIA Astro migration's Phase 0 / Phase 1
checklist:

> Grep all Strapi GraphQL `body` fields for `^:[a-z]` tokens.
> For each unique token found, inventory the Vue component it
> invokes (path under `components/content/`), decide on Strategy 1
> vs Strategy 2, and add the Astro port to the Phase 4-5 plan.

Without this audit, the MDC tokens silently render as literal text on
launch — usually noticed only after deploy when reviewing the live
home page. (DVFR Phase 4 caught it via deploy review; the next site
should catch it during planning.)

---

## Discipline: update this file after every phase

The DVFR migration ships a new phase every 1-3 sessions. After each
phase lands and the perf baseline is committed, **append to "What
changed v3 → v4"** (or open a v4 → v5 section once v4 is canonical
for the next migration) with any lesson that abstracts to other
ICJIA sites — especially patterns that will save time on the
`icjia.illinois.gov` flagship migration.

Hard rule: **no checklist update = phase is not done.** The
single-line CHANGELOG entry doesn't count; the checklist captures
the *abstracted* lesson (what other migrations should know), not
the specific commit.

What counts as "abstractable":

- A pattern that would have saved time if known on day 1
- A bug or violation that bit you and would bite anyone porting a
  similar component or stack
- A tool/script invocation worth pre-installing or pre-stubbing
- A measurement / verification recipe (Lighthouse, Plausible,
  axe-core, CSP) that confirms phase exit criteria

What does NOT count:

- Project-specific routing or content shape (lives in the spec doc)
- Specific commit SHAs or file paths in this repo (lives in
  CHANGELOG + plan)
- "We chose color X" (lives in `@theme` tokens)

## Companion docs

- **`docs/icjia-strapi-cheatsheet.md`** — Strapi-specific reference
  (entity names, field renames, attachment shapes, image URL
  patterns, webhook setup, pre-migration audit recipe). Read this
  FIRST when starting a new ICJIA Astro migration — it captures the
  GraphQL surface details that this checklist abstracts away.
- **`docs/perf/phase<N>-<sha>.md`** files in each migrated repo —
  per-phase Lighthouse + axe-core baselines. Useful as a sanity
  check that your migration is on track ("am I doing better than
  DVFR was at Phase 4?" etc.).
- **`docs/superpowers/plans/<date>-astro-migration-phase<N>.md`** —
  per-phase implementation plans. The DVFR plans are good templates
  to copy + adapt for the next migration's phases.

---

## How to use this checklist

**Direct URL** (preferred):
<https://github.com/ICJIA/icjia-dvfr-nuxt4/blob/main/docs/astro-conversion-checklist-v4.md>

- **In Claude Code (other repos):** point the assistant at the URL —
  e.g. *"apply the patterns from
  github.com/ICJIA/icjia-sfs-2024/blob/main/docs/astro-conversion-checklist-v3.md
  to this codebase, starting with the image pipeline."* Claude will
  fetch and apply.
- **Locally:** clone or `gh api ... | base64 -d` the file into your
  repo's `docs/` folder so it's part of the working set.
- **By section:** each numbered section is self-contained. You can
  reference just one, e.g. *"set up §5 (image optimization) and §6
  (self-host fonts)."*
- **Cherry-pick the scripts.** `astro/scripts/check-links.mjs`,
  `astro/scripts/audit-lh.mjs`, `astro/scripts/audit-axe.mjs`, and
  `start-dev-server` are intentionally small and generic enough to
  drop into another Astro project with light edits (mostly: change
  the SELF_ORIGIN constant, the port numbers, and the path bits if
  your project isn't at `./astro/`).

---

## 1. Project shape

```
astro/
├── src/
│   ├── assets/                # images Astro should optimize (Image / Picture)
│   │   └── *.jpg|.png|.svg
│   ├── content/
│   │   └── config.ts          # Zod schemas + GraphQL loaders for Strapi
│   ├── components/
│   │   ├── ui/                # presentational primitives (Card, Button, Breadcrumb)
│   │   └── *.astro            # page-specific composites
│   ├── layouts/
│   │   └── BaseLayout.astro   # head + skip-link + header/footer
│   ├── lib/                   # small TS helpers (dates, markdown, etc.)
│   ├── pages/                 # routes; one .astro per template
│   └── styles/global.css      # Tailwind 4 entry + @theme tokens + custom rules
├── scripts/
│   ├── check-links.mjs        # internal + external link sanity scanner (§13)
│   ├── audit-lh.mjs           # Lighthouse CLI wrapper, headless mobile (§14)
│   └── audit-axe.mjs          # @axe-core/cli wrapper (§14)
├── public/                    # static, copied to dist as-is
│   ├── favicon.ico
│   ├── robots.txt
│   ├── llms.txt
│   └── og-template.png        # external services hotlink this; do NOT
│                              # move into src/assets/
└── package.json
                               # packageManager: "pnpm@10.x" pin
                               # pnpm.onlyBuiltDependencies: ["esbuild", "sharp"]

start-dev-server               # canonical pnpm-based dev launcher (§19)
dev.sh                         # one-line backward-compat shim
netlify.toml                   # build config + headers (§11) + PNPM_VERSION pin
docs/                          # specs, plans, audits — historical record
```

**Rationale:** `src/assets/` for things you want Vite/Sharp to fingerprint
and optimize. `public/` is reserved for things that need a stable URL
(favicon, robots.txt, sitemap, og-image.png that other services hotlink
or that you reference from external mail templates). Even if a file
*could* go through Sharp, leave it in `public/` if it has external
consumers who hardcoded the URL.

---

## 2. Astro config — the few flags that matter

```ts
// astro.config.ts (Astro 6.3+)
import { defineConfig, envField } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://i2i.illinois.gov',  // absolute origin, no path
  output: 'static',                  // unless you genuinely need SSR
  trailingSlash: 'always',           // pick one; stick to it (see notes)
  build: {
    inlineStylesheets: 'auto',
  },
  vite: { plugins: [tailwindcss()] },  // Tailwind 4 vite plugin, not the v3 PostCSS one
  integrations: [
    sitemap({
      filter: (page) =>
        !page.includes('/sandbox') &&
        !page.includes('/email') &&
        !page.includes('/404'),
      changefreq: 'weekly',
      priority: 0.5,
    }),
  ],
  env: {
    schema: {
      PUBLIC_API_BASE_URL: envField.string({
        context: 'client', access: 'public',
        default: 'https://i2i.icjia-api.cloud',
      }),
    },
  },
});
```

**Pitfalls:**

- `site` is the origin. If your site is mounted under a path (e.g.
  `icjia.illinois.gov/adultredeploy`), use `base: '/adultredeploy'`
  alongside it. i2i is at the origin root, so no `base`.
- `trailingSlash: 'always'` only affects canonical URL emission +
  sitemap. It does **not** redirect users from `/foo` to `/foo/`. If
  Netlify (or any static host) serves bare paths as 200 OK and you
  care about consistent analytics, you need a client-side normalizer
  (see §9 "URL normalizer" pattern).
- For mounted sites, every internal href must include `base`.
  Centralize with `const base = import.meta.env.BASE_URL || '/your-mount';`.

---

## 3. Content collections backed by a Strapi GraphQL loader

i2i loads everything from a Strapi GraphQL endpoint at build time,
validated with Zod, then imported via `getCollection()` / `getEntry()`
like any Astro content collection.

```ts
// src/content.config.ts
import { defineCollection, z } from 'astro/zod';

const news = defineCollection({
  loader: async () => {
    const res = await fetch(import.meta.env.PUBLIC_API_BASE_URL + '/graphql', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query: NEWS_QUERY }),
    });
    const { data } = await res.json();
    return data.newsArticles.data.map((entry) => ({
      id: entry.attributes.slug,  // collection loader requires id
      ...entry.attributes,
    }));
  },
  schema: z.object({
    slug: z.string(),
    title: z.string(),
    publicationDate: z.string().nullable().optional(),
    // ... permissive shapes for nullable CMS fields
  }),
});

export const collections = { news, /* ... */ };
```

**Patterns that paid off:**

- **One query, many collections.** Fetching everything in one GraphQL
  request is faster than per-collection round trips.
- **Permissive Zod schemas.** Use `.nullable().optional()` liberally
  on CMS fields. Strict schemas break the build the moment an editor
  saves an empty string in the CMS.
- **Build-time content rewriting.** After fetch, rewrite known CMS
  authoring errors (wrong slugs in markdown bodies, dead URLs) in
  the loaded data. The site ships canonical URLs and you don't need
  runtime redirects.
- **Astro 6 note:** `import { z } from 'astro/zod'` — the
  `astro:content` re-export was deprecated. Use the direct import.

---

## 4. Markdown rendering — markdown-it + xss + post-process

> **v3 update.** The pattern below describes the markdown-it path used
> when the project does its own server-side markdown render of CMS
> bodies (i2i, adultredeploy). If the project instead uses **Astro's
> built-in remark pipeline** for content collections (SFS, content/*.md),
> two extra lessons apply:
>
> 1. **External links → `rehype-external-links`.** Astro/remark does
>    not parse the markdown-it-attrs syntax `[text](url){target="_blank"}`,
>    so those braces render as literal text on the page. Strip the
>    annotations from markdown source and install
>    [`rehype-external-links`](https://github.com/rehypejs/rehype-external-links)
>    instead. It auto-applies `target="_blank" rel="noopener noreferrer"`
>    to every external `<a>` — no per-link annotation, no CMS-author
>    burden:
>
>    ```ts
>    // astro.config.mjs
>    import rehypeExternalLinks from 'rehype-external-links';
>    export default defineConfig({
>      markdown: {
>        rehypePlugins: [
>          [rehypeExternalLinks, { target: '_blank', rel: ['noopener', 'noreferrer'] }],
>        ],
>      },
>    });
>    ```
>
> 2. **Lists need `list-style-type` restored.** Tailwind preflight
>    strips the default browser styles, so markdown-rendered `<ul>` /
>    `<ol>` render as un-bulleted, un-numbered indented text. The /resources
>    page on SFS shipped this way for 30 seconds before someone noticed.
>    Add to your `.markdown-body` (or equivalent) style block:
>
>    ```css
>    .markdown-body ul { list-style-type: disc; }
>    .markdown-body ol { list-style-type: decimal; }
>    .markdown-body ul ul { list-style-type: circle; }
>    .markdown-body ul ul ul { list-style-type: square; }
>    .markdown-body ol ol { list-style-type: lower-alpha; }
>    .markdown-body ol ol ol { list-style-type: lower-roman; }
>    .markdown-body li > p { margin: 0; }   /* remark wraps li bodies in <p> */
>    ```
>

```ts
// src/lib/markdown.ts
import MarkdownIt from 'markdown-it';
import xss from 'xss';

const md = new MarkdownIt({ html: true, linkify: true, breaks: false });

const imgAllow = ['src', 'alt', 'title', 'width', 'height',
                  'loading', 'decoding', 'fetchpriority', 'sizes', 'srcset'];

export function renderMarkdown(src: string) {
  if (!src) return '';
  const html = md.render(src);
  const safe = xss(html, {
    stripIgnoreTagBody: ['script', 'style'],
    whiteList: { ...xss.getDefaultWhiteList(), img: imgAllow },
  });
  return rewriteImages(safe);
}
```

**Why this combo:**

- **`stripIgnoreTagBody: ['script', 'style']`.** Default xss escapes
  unknown tags' bodies, leaking CMS-authored CSS as visible text.
  Strip the body too.
- **Extend the `img` whitelist** with `loading`, `decoding`, `srcset`,
  `sizes`, `fetchpriority`. xss strips them otherwise and you lose
  every perf attr you tried to add.
- **Post-process the rendered HTML.** Markdown-it's image rule only
  fires for `![]()`, not raw HTML `<img>` tags — many CMS bodies use
  the latter. Do a single regex pass after xss to handle both:

```ts
const IMG_RX = /<img\b((?:[^>"]|"[^"]*")*?)\s*\/?\s*>/gi;
function rewriteImages(html: string) {
  return html.replace(IMG_RX, (_, attrs) => {
    let out = attrs;
    if (!/\bloading\s*=/i.test(out))  out += ' loading="lazy"';
    if (!/\bdecoding\s*=/i.test(out)) out += ' decoding="async"';
    return `<img${out}>`;
  });
}
```

---

## 5. Image optimization — three tiers

> **v3 update — hero quality tuning for the DPR-3 mobile sweet spot.**
> Lighthouse mobile emulates 375 CSS-px × DPR 3 = **1125 device-px**
> for the hero. With `sizes="100vw"`, the browser picks the smallest
> srcset variant ≥ 1125. If your `widths` array is the standard
> `[640, 960, 1280, 1600]`, mobile picks 1280w. Add a **1200w**
> variant (smaller than 1280) and mobile DPR-3 picks that instead,
> shaving ~15-20 KB off the LCP byte:
>
> ```astro
> <Image
>   src={hero}
>   widths={[480, 768, 1024, 1200, 1600]}  /* v3: add 1200w */
>   sizes="100vw"
>   format="webp"
>   quality={45}                           /* v3: 45 is fine for */
>   loading="eager"                        /*       grayscale-overlaid */
>   fetchpriority="high"                   /*       heroes; the dark */
> />                                       /*       gradient hides any */
>                                          /*       compression artifacts */
> ```
>
> SFS hero went from 918 KB source JPEG → **34 KB WebP** at the picked
> 1200w variant after this tuning. Mobile LCP dropped from 2.6s → 2.3s.
> For non-overlaid photographic heroes, stay closer to quality 65-72;
> the grayscale + dark-gradient combo on SFS is the special case.

> **v3 update — `<Image>` always needs explicit `width`/`height` when
> you use a `widths` array.** Sharp edge: passing only `widths={[...]}`
> (no `width`/`height` props) makes Astro emit the **largest** variant's
> dimensions as the rendered `<img>`'s `width`/`height` attrs. On SFS
> the ICJIA logo was meant to render 55x39 in the nav and 150x105 in
> the footer; without explicit `width`/`height` Astro emitted
> `width="165" height="116"` (Nav) and `width="450" height="315"`
> (Footer) — the logo blew through the 64 px header. The browser
> *was* picking the right srcset variant byte-wise; the HTML
> dimensions were just lying.
>
> Always pair `widths={[...]}` with explicit `width={N}` / `height={M}`
> matching the rendered display size:
>
> ```astro
> <!-- Bad: HTML width/height end up as the largest srcset variant -->
> <Image src={logo} widths={[55, 110, 165]} sizes="55px" ... />
>
> <!-- Good: HTML width/height match display; srcset still handles DPR -->
> <Image
>   src={logo}
>   width={55}
>   height={39}
>   widths={[55, 110, 165]}
>   sizes="55px"
>   ...
> />
> ```
>
> Aspect ratio must match the source — Astro errors otherwise. If your
> display ratio differs, crop the source asset first.
>
> Related: Astro clamps `widths` to the source image's intrinsic width.
> If you ask for `widths=[150, 300, 450]` but the source PNG is 250 px
> wide, you get `[150, 250]` (no 300 / 450 variants generated). For
> DPR-3 crispness at a 150 px display, provide a ≥ 450 px source.

### Tier 1: local assets you control

Put them in `src/assets/` and use Astro 6's `<Image>`:

```astro
---
import { Image } from 'astro:assets';
import splash from '~/assets/splash.png';
---
<Image
  src={splash}
  widths={[640, 960, 1280, 1366]}
  sizes="100vw"
  format="webp"
  alt=""
  loading="eager"
  fetchpriority="high"
/>
```

**Astro 6 API gotcha:** `<Image>` takes **`format`** (singular). The
plural `formats` belongs to `<Picture>`. The adultredeploy original
showed `formats={['webp']}` on `<Image>` — that was an Astro 5 docs
example that subtly broke in 6.

i2i result: **688 KB hero PNG → 23 KB WebP** at the 640w variant.
Mobile picks it via `sizes="100vw"`; desktop picks 1280w (~58 KB).

**One change usually moves mobile LCP > 25%.**

### Sharp must be an explicit dependency in Astro 6

The adultredeploy original assumed Sharp came along for free. In
Astro 6 it doesn't — `astro:assets` ships with the Sharp adapter but
not Sharp itself. Without it, the build aborts on the first `<Image>`
with `MissingSharp: Could not find Sharp.`

```sh
pnpm add sharp
```

And — critical for pnpm 10+ — allowlist Sharp's postinstall:

```json
// astro/package.json
{
  "pnpm": {
    "onlyBuiltDependencies": ["esbuild", "sharp"]
  }
}
```

Without this allowlist, pnpm 10 blocks Sharp's postinstall (security
default), Sharp's native binary doesn't download, and the build hits
`MissingSharp` anyway — but with a less-obvious symptom because pnpm
install completed "successfully."

### Tier 2: remote CMS-hosted images (Strapi, etc.)

Build-time download + Sharp → WebP, write to `public/_cms-img/`, build
a manifest keyed by original URL. At render time, look up the manifest
and emit the optimized URL + `srcset` + intrinsic dimensions.

```js
// scripts/fetch-cms-images.mjs (gist)
for (const url of collectUrls(cmsData)) {
  const buffer = await fetch(url).then(r => r.arrayBuffer());
  const meta = await sharp(buffer).metadata();
  for (const w of [640, 960, 1280, meta.width]) {
    await sharp(buffer).resize(w).webp({ quality: 82 })
                       .toFile(`public/_cms-img/${hash}-${w}.webp`);
  }
  manifest[url] = { width: meta.width, height: meta.height, variants };
}
```

**Pitfalls:**

- Cache downloaded buffers in `.cache/cms-img/<hash>` (gitignored) so
  re-builds skip the network.
- **Commit the manifest, gitignore the generated WebPs.** Manifest is
  small and useful diffs; the WebPs are large and regenerable.

### Tier 2 alternative: Netlify Image CDN (only if you're on Netlify)

For Netlify-hosted sites that want to skip the build-time pipeline,
Netlify ships `/.netlify/images?url=…&w=…&fm=webp` as a runtime CDN.
i2i v0.2.3 shipped this alternative; v0.2.4 fixed the regressions
that surfaced. Useful experience, but **for new projects prefer
Tier 2 (Sharp pre-build).** The reasons:

- **Vendor lock-in.** The URL pattern is Netlify-proprietary. Moving
  off Netlify (procurement-driven host changes happen on .gov sites)
  means standing up a replacement service or doing Tier 2 anyway.
- **Cold-start latency.** First request per (url, width, format)
  triggers a real transformation (~200–500 ms vs ~30–50 ms for a
  pre-built static asset). Edge cache hits after, but post-deploy
  the cache is empty.
- **Live dependency on the upstream CMS.** Each cache-miss
  transformation re-fetches the original image from the CMS
  origin. If the CMS is down / slow / suddenly auth-gated, the CDN
  can't refresh — broken images cascade. Pre-built static assets
  are baked into the deploy and survive any CMS outage.
- **No CI-time verification of image bytes.** Lighthouse can verify
  the URL responds; Sharp at build time lets you grep dist/_astro/
  for sizes + run perf budgets against actual emitted bytes.
- **Stable-filename cache invalidation friction.** If the CMS ever
  overwrites an image at the same URL, the CDN may serve stale
  until purged. (i2i is fine here — Strapi's upload filenames
  always include hash suffixes — but worth knowing.)

If you do use Netlify Image CDN anyway, here are the gotchas i2i hit:

1. **`remote_images` allowlist is required for cross-origin sources.**
   By default Netlify Image CDN only transforms same-origin URLs;
   `i2i.icjia-api.cloud` returned 400 on every request until the
   allowlist regex was added:

   ```toml
   # netlify.toml
   [images]
     remote_images = ['^https://i2i\.icjia-api\.cloud/.*']
   ```

2. **Astro's scoped CSS doesn't reach into child components.** When
   `<img class="card-img">` becomes `<CmsImage class="card-img">`,
   the rendered img is outside the parent's scope. Selectors like
   `.card-img[data-astro-cid-…]` stop matching and the img falls
   back to its `width=` HTML attr (rendering narrow, with whitespace
   gutters). Fix: wrap the affected selectors in `:global()` so they
   reach across the boundary.

   ```css
   /* in the page's <style> block */
   :global(.card-img) {
     width: 100%;
     height: 300px;
     object-fit: cover;
   }
   ```

3. **Lighthouse `image-size-responsive` BP expects 3× DPR variants.**
   srcset arrays with just 1× + 2× drop BP to 96 on high-DPR mobile.
   Include a 3× variant for every responsive image:

   ```astro
   <!-- bad: 1x + 2x only -->
   <CmsImage widths={[120, 240]} sizes="120px" ... />
   <!-- good: 1x + 2x + 3x -->
   <CmsImage widths={[120, 240, 360]} sizes="120px" ... />
   ```

4. **Markdown body images need width/height or aspect-ratio.** With
   `loading="lazy"` and no intrinsic dimensions, the late-arriving
   CDN image triggers a layout shift (CLS spike). i2i's
   `rewriteImages` post-processor now injects an `aspect-ratio: 3/2;
   max-width: 100%; height: auto;` style fallback whenever no
   width/height/aspect-ratio is present on a CMS-routed `<img>`. The
   3:2 is a guess; if it's wrong the image fits within the reserved
   box (whitespace, not full reflow). The real fix is to have CMS
   authors include width/height in the body img tags.

5. **Wrapper helper pattern.** A two-file shim is enough — a helper
   that builds the URL + srcset, and an `<CmsImage>` Astro component
   that wraps it as a drop-in `<img>`. Helper sketch:

   ```ts
   // src/lib/cmsImage.ts
   export function getCmsImage(url, { widths, sizes, quality = 82 }) {
     if (!import.meta.env.PROD) return { src: url, srcset: '', sizes };  // dev pass-through
     const enc = encodeURIComponent(url);
     const v = (w) => `/.netlify/images?url=${enc}&w=${w}&fm=webp&q=${quality}`;
     return {
       src: v(widths.at(-1)),
       srcset: widths.map(w => `${v(w)} ${w}w`).join(', '),
       sizes,
     };
   }
   ```

   Note the dev-mode pass-through: Netlify Image CDN is deploy-only,
   so `astro dev` falls back to the original URL. `astro preview`
   shows broken CMS images locally — expected, verify on the branch
   deploy.

i2i v0.2.0 only did Tier 1 — Tier 2 is the biggest remaining mobile
perf lever on the homepage (the four directory-card images come
straight from Strapi). If you start a new ICJIA Astro project with
significant CMS imagery, do Tier 2 (Sharp pre-build) early. Reserve
the Netlify Image CDN alternative for projects where simplicity beats
portability.

### Tier 3: inline base64 data URIs from CMS

(Looking at you, Researchhub.) Same script, separate path: detect
`data:image/...;base64,` strings, hash the payload, decode to buffer,
process through the same Sharp path, **then rewrite the JSON field
in-place** to a stable key like `cms-base64:<hash>` so subsequent
build steps and rendered pages never see the original base64.

On the adultredeploy site that change took `/apps` from 1.56 MB HTML
to 24 KB.

---

## 6. Fonts — self-host always

Google Fonts is the #1 Lighthouse blocker on most sites. Self-host
with `@fontsource`:

```sh
pnpm add @fontsource/roboto
```

```css
/* src/styles/global.css */
@import '@fontsource/roboto/400.css';
@import '@fontsource/roboto/700.css';
@import '@fontsource/roboto/900.css';
```

`@fontsource` ships per-unicode-range subsets (latin, cyrillic, greek,
vietnamese, math, symbols). Browsers download only the subsets that
match characters actually present on the page — an English visitor
pulls just the `latin` WOFF2 (~10-15 KB × N weights).

**Variable fonts** (`@fontsource-variable/...`) are even smaller — one
file covers 100–1000. Use them where available.

**Watch for the inverse trap.** If your CSS declares
`font-family: Roboto, sans-serif` but you never `@import` it,
browsers silently fall back to system sans-serif and the site
*looks correct on Android* (which ships Roboto) but is in
SF Pro / Segoe UI everywhere else. Always grep your CSS for
`font-family:` and confirm every named font is actually loaded.

---

## 7. Interactivity (skip if you can)

i2i ships **zero client-side JS** outside of the URL-normalizer
microscript (§9), Plausible, and a Fuse.js-powered `/search/`. If
you can keep your site pure static, do. Every interactive island
adds a JS budget item.

When you do need Alpine for forms / modals / table sort, follow the
adultredeploy original's §7 patterns — the gotcha there is real:
**CSP requires `'unsafe-eval'`** in `script-src` because Alpine
evaluates `x-*` directives via `new Function()`. There's no way
around it without using a different reactivity lib (Petite-Vue, no;
Stimulus, yes). Most sites don't need this.

---

## 8. SEO — `astro-seo` + per-page descriptions

> **v3 update — canonical URL bug with `format: "file"`.**
> If your `astro.config.mjs` uses `build.format: "file"` +
> `trailingSlash: "never"` (the v2.0.1 perf pattern that emits flat
> `/about.html` so internal nav skips the trailing-slash redirect),
> `Astro.url.pathname` includes the `.html` extension during build:
> `/index.html` for the homepage, `/about.html` for /about, etc.
>
> Passing that raw value to astro-seo's `canonical` prop emits canonical
> URLs like `https://site.example/index.html` and `…/about.html` —
> which is **wrong** (Netlify pretty-URLs serve `/` and `/about` as
> the actual user-facing URLs). Search engines will pick up the
> `.html` form as canonical and your sitemap entries won't match.
>
> Fix in `BaseLayout.astro` (or wherever you build the canonical):
>
> ```ts
> const SITE_ORIGIN = "https://your-site.example";
> // Strip /index.html → / and .html → '' to match the URL the host serves.
> const rawPath = Astro.url.pathname
>   .replace(/\/index\.html$/, "/")
>   .replace(/\.html$/, "");
> const canonical = new URL(rawPath, Astro.site ?? SITE_ORIGIN).toString();
> ```
>

```sh
pnpm add astro-seo
```

```astro
---
// BaseLayout.astro
import { SEO } from 'astro-seo';

const { title, description, ogImage, canonical, publishedAt, updatedAt } = Astro.props;
const meta = truncateDescription(description);
const datePublished = publishedAt ?? updatedAt;
const dateModified  = updatedAt ?? publishedAt;
---
<SEO
  title={title}
  description={meta}
  canonical={canonical}
  openGraph={{
    basic: { title, type: 'website', image: ogImage, url: canonical },
    image: { width: 1200, height: 630, alt: '…' },
    optional: { description: meta, siteName: 'Institute 2 Innovate', locale: 'en_US' },
    article: (datePublished || dateModified)
      ? { publishedTime: datePublished, modifiedTime: dateModified }
      : undefined,
  }}
  twitter={{ card: 'summary_large_image', image: ogImage, imageAlt: '…' }}
  extend={{
    meta: [{ name: 'author', content: '…' }],
    link: [
      { rel: 'alternate', hreflang: 'en', href: canonical },
      { rel: 'alternate', hreflang: 'x-default', href: canonical },
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'preconnect', href: 'https://i2i.icjia-api.cloud' },
    ],
  }}
/>
```

**Two things astro-seo adds that the adultredeploy checklist didn't call out:**

1. `<meta name="robots" content="index, follow">` — emitted by
   default. Functionally a no-op (search engines assume index,follow
   in its absence) but worth knowing if you compare diffs.
2. `<meta property="og:image:url">` as a mirror of `og:image` — some
   crawlers prefer the `:url` form, so it's defensive.

Neither changes how the site is indexed, but if you claim "same
emitted markup" after refactoring to astro-seo, double-check.

**Description-cleaning helper.** CMS summaries come with markdown link
syntax, stray `<span>`, newlines. One pass:

```ts
function truncateDescription(raw: string, max = 160) {
  const c = (raw ?? DEFAULT)
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')   // [text](url) → text
    .replace(/[*_`]/g, '')                     // **bold** etc
    .replace(/<[^>]+>/g, '')                   // any HTML
    .replace(/\s+/g, ' ').trim();
  if (c.length <= max) return c;
  const cut = c.slice(0, max - 3);
  const sp = cut.lastIndexOf(' ');
  return cut.slice(0, sp > max * 0.6 ? sp : max - 3) + '…';
}
```

**Per-page descriptions.** Every page template should pass `description`
to BaseLayout — usually `item.summary ?? item.abstract`. Pages without
descriptions get the site-wide default.

### Title length: ≤ 60 chars total WITH suffix preserved (hard rule, v6)

Google's SERP cap is ~60 chars; titles longer than that get truncated
mid-word with an ellipsis Google chooses for you, which never includes
your brand suffix. MetaPeek scores each over-budget title as one issue
deducted from the page total (-6 points per finding in the title
category).

The canonical pattern in BaseLayout: `fullTitle = "${title} | ${siteShortName}"`.
The brand suffix is the LAST thing you want truncated, so the helper
truncates the *title portion* and keeps the suffix intact.

`astro/src/lib/seo.ts` exports `truncateTitle(title, suffix, max=60)`:

```ts
truncateTitle('Family Violence Coordinating Councils', 'IFVCC', 60)
// → "Family Violence Coordinating Councils | IFVCC" (46 chars)

truncateTitle('How You Can Help with Domestic Violence Cases in the Courthouse', 'IFVCC', 60)
// → "How You Can Help with Domestic Violence Cases in… | IFVCC" (57 chars)
```

**Math:** `room = max - suffix.length - 3 (" | ")`. For IFVCC that's
`60 - 5 - 3 = 52` chars of title room. Anything longer gets
word-boundary-truncated with `…`.

BaseLayout calls `truncateTitle(title, siteConfig.siteShortName, 60)`
unconditionally so any CMS-driven page (news, events, catch-all) with
a long title gets safely truncated. **`siteConfig.siteShortName` must
be short** — IFVCC's 5-char short name leaves 52 chars for the title;
a verbose short name (e.g. "ICJIA-IFVCC", 11 chars) would only leave
46. Pick a `siteShortName` ≤ 8 chars to keep meaningful title room.

### Description length: 80 ≤ len ≤ 160 (hard rule, v6)

Two binding gates the truncate helper alone doesn't enforce:

1. **Floor — 80 chars.** MetaPeek + AI Readiness audits flag anything
   under 80 as "too short for meaningful AI summarization" (score
   deductions; FAIL on AI Readiness). The site-wide
   `siteConfig.defaultDescription` MUST be ≥ 80 chars so any page
   falling back to it still passes. Per-page descriptions sourced from
   short CMS summaries (e.g. ICJIA Strapi `index.summary` is often
   ~20-50 chars) MUST fall back to the site default rather than ship as
   the page's description — see §"SEO + OG image + CSP scope" rule 2.
2. **Ceiling — 160 chars.** Google truncates meta descriptions at
   ~160; Facebook's `og:description` at ~200; Twitter's at ~200. The
   safe target for both `siteConfig.defaultDescription` and any
   page-level description is **≤ 160**. The `truncateDescription`
   helper above defaults to `max = 160` for this reason. **Also bake
   the limit into the config itself** — if the default exceeds 160, the
   helper would silently truncate every page that falls back, hiding
   the over-budget default. v6 adds an inline assertion at the
   bottom of `siteConfig.ts` so the config can't drift:

   ```ts
   if (siteConfig.defaultDescription.length > 160) {
     throw new Error(
       `siteConfig.defaultDescription is ${siteConfig.defaultDescription.length} ` +
       `chars; must be ≤ 160 for og:description / meta description.`,
     );
   }
   ```

   Throwing at module load gives you a build-time error on every
   `astro build` — impossible to ship an over-budget default.

### OG image — build-time SVG → PNG pipeline (canonical for v6)

> Previously a one-liner in the adultredeploy-lessons section; promoted
> to §8 in v6 because every ICJIA site needs a real OG image and the
> librsvg-font-fallback gotcha has bitten enough builds to deserve a
> top-billed warning.

Every page emits `<meta property="og:image" content="…/og-image.png">`
(via the astro-seo block above). The image itself is generated at build
time from an inline SVG via Sharp — no designer involvement, no commit
churn when the site name or URL changes, and the source is just text
diffable in PRs.

**`astro/scripts/build-og-image.mjs`:**

```js
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const DIST_PATH   = path.resolve('dist/og-image.png');
const PUBLIC_PATH = path.resolve('public/og-image.png');

const SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"   stop-color="#15102e"/>
      <stop offset="55%"  stop-color="#3a2778"/>
      <stop offset="100%" stop-color="#6c56bc"/>
    </linearGradient>
    <linearGradient id="rail" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%"   stop-color="#fbbf24"/>
      <stop offset="100%" stop-color="#f59e0b"/>
    </linearGradient>
    <radialGradient id="glow" cx="78%" cy="22%" r="55%">
      <stop offset="0%"   stop-color="#ffffff" stop-opacity="0.10"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <g opacity="0.05" stroke="#ffffff" stroke-width="1" fill="none">
    <line x1="0" y1="80"  x2="1200" y2="-120"/>
    <line x1="0" y1="180" x2="1200" y2="-20"/>
    <line x1="0" y1="280" x2="1200" y2="80"/>
    <line x1="0" y1="380" x2="1200" y2="180"/>
  </g>
  <rect x="80" y="170" width="6" height="300" fill="url(#rail)"/>
  <text x="112" y="200" font-family="sans-serif" font-weight="700" font-size="22" fill="#fbbf24" letter-spacing="6">ILLINOIS</text>
  <text x="112" y="276" font-family="sans-serif" font-weight="800" font-size="68" fill="#ffffff">Family Violence</text>
  <text x="112" y="352" font-family="sans-serif" font-weight="800" font-size="68" fill="#ffffff">Coordinating</text>
  <text x="112" y="428" font-family="sans-serif" font-weight="800" font-size="68" fill="#ffffff">Councils</text>
  <text x="112" y="475" font-family="sans-serif" font-weight="400" font-size="22" fill="#cbd5e1">Statewide network · child, domestic, and elder abuse response</text>
  <rect x="78" y="540" width="180" height="2" fill="#ffffff" opacity="0.25"/>
  <text x="78" y="575" font-family="sans-serif" font-weight="600" font-size="18" fill="#c4b5fd" letter-spacing="3">icjia.illinois.gov/ifvcc</text>
  <g transform="translate(1010 96)">
    <rect x="0" y="0" width="110" height="38" rx="6" fill="none" stroke="#ffffff" stroke-width="1.5" opacity="0.6"/>
    <text x="55" y="25" font-family="sans-serif" font-weight="700" font-size="16" fill="#ffffff" text-anchor="middle" letter-spacing="3" opacity="0.85">ICJIA</text>
  </g>
</svg>`;

async function render(out) {
  await fs.mkdir(path.dirname(out), { recursive: true });
  await sharp(Buffer.from(SVG)).png({ compressionLevel: 9 }).toFile(out);
}

await render(PUBLIC_PATH);             // committed fallback served in dev
try { await render(DIST_PATH); }       // production output
catch (e) { if (e.code !== 'ENOENT') throw e; }
```

Hook it into the build chain so the PNG is regenerated on every deploy:

```json
"scripts": {
  "build":    "astro build && pnpm fetch:cms-images && astro build && pnpm pagefind && pnpm og-image",
  "og-image": "node scripts/build-og-image.mjs"
}
```

**Five build-pipeline rules abstracted from IFVCC v6:**

1. **Use generic CSS font families — NEVER named fonts.** Sharp renders
   SVG via librsvg, which calls fontconfig. On a Netlify Linux build
   agent, fontconfig has no idea what `Raleway` or `Roboto` is — those
   are `@fontsource/*` packages inside `node_modules`, invisible to the
   OS-level font cache. The result is a **silently blank PNG**: the
   gradient still renders, the rects still render, but every `<text>`
   element is dropped. (You only catch it if you actually open the
   generated PNG; the script's exit code is 0.) **Always specify
   `font-family="sans-serif"` or `font-family="serif"`.** librsvg's
   fontconfig fallback resolves these to whatever's on the build agent
   (DejaVu Sans on Netlify Linux, Helvetica on macOS dev) — both look
   modern and bold and ship the text correctly. If you genuinely need
   a custom font in the OG image, embed it as a base64 `@font-face`
   data URI inside a `<style>` block in the SVG; do not assume the
   build agent has Google Fonts installed.
2. **Write to BOTH `public/og-image.png` AND `dist/og-image.png`.**
   Astro copies `public/` → `dist/` early in the build, but the
   og-image script runs LATER (after the second `astro build`). If
   you only write to `dist/`, then `public/` keeps an old/blank
   committed copy that is served in dev — leading to "the dev preview
   shows blank, but the production preview shows the real image"
   confusion. Writing to both gives one source of truth: the committed
   `public/og-image.png` matches the production `dist/og-image.png`
   byte-for-byte after every build. Add `public/og-image.png` to
   `.gitattributes` as `binary` so diffs are clean.
3. **`og-image` is the LAST step in the build chain.** It depends on
   nothing (pure script) but should run after `astro build` so any
   `dist/` cleanup the second `astro build` does has already happened
   — otherwise Astro can clear `dist/og-image.png` and the OG image is
   missing in production.
4. **1200×630 is the canonical size.** Both Facebook and X recommend
   it; LinkedIn accepts it; Slack scales it. Don't ship anything else.
5. **PNG only — never SVG, never JPG, never WebP.** Twitter and
   Facebook prefer PNG/JPG and have historically rejected SVG OG
   images; WebP is sometimes-supported but not universally. PNG with
   `compressionLevel: 9` from Sharp keeps a 1200×630 brand image
   under ~150 KB, well below any platform's size cap.

**Visual design conventions for ICJIA site OG images:**

- Dark gradient background in the site's primary brand color (purple
  for IFVCC, blue for DVFR, etc.) — modern and stays readable behind
  bright social-media UI chrome.
- Large bold display title (≥ 64 px, `font-weight="800"`) — must be
  legible at thumbnail size on a mobile feed.
- One accent color (gold/amber rail or eyebrow) — gives the image
  identity without designer involvement.
- Site URL at the bottom in muted weight — anchors the image to the
  domain for any platform that strips its caption.
- ICJIA mark in a corner — quick visual identifier across the portfolio.

### README convention — OG image at the top + badge row (v6)

The same generated PNG that ships as `og:image` doubles as the README's
hero image at the repo root. GitHub renders it inline; for any human
reviewer (or LLM bootstrap pass via `docs/llm-migration-prompt.md`),
the README's first impression matches the site's social-share preview.

```md
<p align="center">
  <img src="./astro/public/og-image.png" alt="<site name> — <one-line tagline>" width="820" />
</p>

# <Site name>

[![Netlify Status](https://api.netlify.com/api/v1/badges/<id>/deploy-status)](https://app.netlify.com/sites/<slug>/deploys)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Astro 6](https://img.shields.io/badge/Astro-6-FF5D01?logo=astro&logoColor=white)](https://astro.build)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind%20CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Alpine.js 3](https://img.shields.io/badge/Alpine.js-3-77C1D2?logo=alpinedotjs&logoColor=black)](https://alpinejs.dev)
[![Pagefind 1.5](https://img.shields.io/badge/Pagefind-1.5-3FB984)](https://pagefind.app)
[![Node ≥22](https://img.shields.io/badge/Node-%E2%89%A522-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![pnpm 10](https://img.shields.io/badge/pnpm-10-F69220?logo=pnpm&logoColor=white)](https://pnpm.io)
[![Built with Sharp](https://img.shields.io/badge/images-Sharp-99CC00?logo=sharp&logoColor=white)](https://sharp.pixelplumbing.com)
```

**Three rules for the badge row:**

1. Always start with the live status (Netlify deploy-status) and
   license — those two earn the leftmost slots because they're the
   only ones whose state is dynamic.
2. Stack-version badges in the order of architectural weight: framework
   (Astro), styling (Tailwind), interactivity (Alpine), search
   (Pagefind), runtime (Node), package manager (pnpm), build helpers
   (Sharp). Anyone scanning the row reads it as "what is this site
   built on?" top-down.
3. Use `img.shields.io/badge/<label>-<value>-<hex>` for static
   shields — fast, no rate limit, deterministic colors per stack.

### v6 — JSON-LD WebPage + freshness dates + `/llms.txt` for AI Readiness

> Pattern from IFVCC commit a494ced (2026-05-26). MetaPeek's "AI
> Readiness Assessment" flags three things the astro-seo block alone
> doesn't ship: JSON-LD structured data, article freshness dates
> (`datePublished`/`dateModified`), and `/llms.txt`. All three are
> straightforward to add and each one is one missed crawler away from
> a real SEO/AI-discovery deficit.

**1. JSON-LD WebPage block emitted by BaseLayout.** Schema.org
`WebPage` markup, populated with the canonical URL, og:image,
publisher (Organization), `isPartOf` (the site as a WebSite),
`inLanguage`, and the two dates. Add to `astro/src/lib/seo.ts`:

```ts
export function buildWebPageJsonLd({
  title, description, url, image, publishedAt, updatedAt,
}: JsonLdArgs) {
  const buildTime = new Date().toISOString();
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description,
    url, image,
    inLanguage: 'en-US',
    datePublished: publishedAt ?? buildTime,
    dateModified:  updatedAt   ?? buildTime,
    isPartOf: { '@type': 'WebSite', name: siteConfig.siteName,
                url: `${siteConfig.siteOrigin}${siteConfig.publicPath}/` },
    publisher: { '@type': 'Organization',
                 name: 'Illinois Criminal Justice Information Authority',
                 url: 'https://icjia.illinois.gov',
                 logo: { '@type': 'ImageObject',
                         url: `${siteConfig.siteOrigin}${siteConfig.publicPath}/og-image.png` } },
  };
}
```

In `BaseLayout.astro`:

```astro
<script type="application/ld+json" set:html={JSON.stringify(jsonLd)} />
```

**JSON-LD doesn't consume a CSP `script-src` hash** — `type="application/ld+json"`
is a non-executable data block (v6 §11). Don't try to hash it.

**2. Freshness dates flow through from CMS.** Add optional
`publishedAt` / `updatedAt` props to BaseLayout; pages with real
dates pass them, pages without fall back to build time. For IFVCC:
news/events/`[slug]` catch-all all pass `d.created_at` / `d.updated_at`
from Strapi. The home page passes `home.home?.created_at` /
`home.home?.updated_at`. Pages with no meaningful date (404, search)
ship build time — acceptable for AI freshness signals.

Also emit standalone meta tags for crawlers that don't parse JSON-LD:

```ts
extend={{
  meta: [
    { name: 'author', content: 'ICJIA' },
    ...(publishedAt ? [{ property: 'article:published_time', content: publishedAt }] : []),
    ...(updatedAt   ? [{ property: 'article:modified_time',  content: updatedAt   }] : []),
  ],
}}
```

When dates are present, switch `openGraph.basic.type` from `'website'`
to `'article'` — Facebook/LinkedIn render the date when type=article.

**3. Add `astro/public/llms.txt` per [llmstxt.org](https://llmstxt.org).**
Short site description, primary URL index, topic taxonomy, citation
guidance. The format is loosely-structured markdown; AI consumers
(ChatGPT/Claude/Perplexity/Bing Copilot) treat it as the canonical
machine-friendly summary. Roughly:

```md
# <Site name>

> One-paragraph site description (≥ 80 chars; full sentences).

Two-paragraph context — history, scope, organizational structure.

## Primary site
- [Home](https://...): summary
- [About](https://...): summary
- ...

## Reference documents
- [Sitemap](https://.../sitemap-index.xml)
- [OG image](https://.../og-image.png)

## Topics covered
- Topic 1
- Topic 2

## Authoritative organization
- Publisher: <org>
- Compliance: WCAG 2.1 AA, ADA Title II, IITAA 2.1

## Citation guidance
- Prefer canonical URL ending in trailing slash
- JSON-LD has datePublished / dateModified for freshness
```

**4. Description-band defensive truncation in BaseLayout.** Pages
can pass the FULL CMS body as a `longDescription` prop. BaseLayout
auto-truncates the short `description` to ≤ 160 (the meta description
/ og:description ceiling) and ships the uncapped `longDescription`
into the JSON-LD `description` field where AI consumers benefit from
the long-form version. This split prevents the failure mode that bit
IFVCC (homepage shipping a 1802-char meta description). See
"Description length" sub-section above.

### v6 — Smooth in-page scrolling with navbar offset (CSS-only, JS-free)

> Pattern from IFVCC commit dc96e0c (2026-05-26). Long-form CMS pages
> with a built-in TOC (e.g. `/resources/`) had two issues: anchor jumps
> were abrupt (no smooth scroll) AND the target heading landed
> underneath the fixed 70 px AppNav.

Two CSS rules in `global.css` fix both, JS-free, at specificity zero:

```css
:root { --nav-height: 70px; }

html { scroll-behavior: smooth; }
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }  /* respect user OS preference */
}

:where(h1, h2, h3, h4, h5, h6)[id] {
  scroll-margin-top: calc(var(--nav-height) + 16px);
}
```

Three details that matter:

1. **`:where()` keeps specificity at 0** so existing heading rules win
   in the cascade. Without it, `:is()` or a plain selector would beat
   per-template heading styles. `:where()` is the right primitive.
2. **`prefers-reduced-motion: reduce` gating** is non-negotiable per
   the project's reduced-motion rule (`llm-migration-prompt.md` rule
   #9). Smooth-scroll triggers vestibular issues for some users;
   instant jump is the appropriate fallback.
3. **`--nav-height` CSS variable** centralizes the magic number.
   AppNav's `height: 70px` and BaseLayout's `mainTopPad = 70` both
   should reference it long-term; for now they're hardcoded but the
   scroll-margin-top is the most-likely future-edit site so the
   variable lives there.

Applies to TOC links, skip-link targets, and any `<a href="#id">`
anywhere on the site. No per-page wiring needed.

---

## 9. Analytics — Plausible (self-hosted) snippet

> **v3 update — two things v2 didn't call out loudly enough.**
>
> 1. **`connect-src` in the CSP must include the Plausible host.**
>    `script-src` lets the script *load*; `connect-src` lets it *POST*
>    the `/api/event` pageview. Forgetting `connect-src` produces the
>    silent-failure mode where the dashboard sits at zero pageviews
>    while the deploy looks fine — there's no console error visible
>    without DevTools open. Always:
>
>    ```
>    connect-src 'self' https://plausible.icjia.cloud;
>    ```
>
>    **If Netlify RUM is enabled** (Netlify auto-injects
>    `/.netlify/scripts/rum` on sites with Analytics or RUM toggled
>    on), the RUM script POSTs collected metrics to
>    `https://ingesteer.services-prod.nsvcs.net/rum_collection`. Add
>    that origin to `connect-src` too, or disable RUM in the Netlify
>    dashboard:
>
>    ```
>    connect-src 'self'
>      https://plausible.icjia.cloud
>      https://ingesteer.services-prod.nsvcs.net;
>    ```
>
> 2. **Verification recipe.** After deploying, open the live site in
>    DevTools, paste this into Console, and look for `202`:
>
>    ```js
>    fetch('https://plausible.icjia.cloud/api/event', {
>      method: 'POST',
>      headers: { 'Content-Type': 'text/plain' },
>      body: JSON.stringify({
>        n: 'pageview',
>        u: location.href,
>        d: 'your-domain.example',
>        w: innerWidth,
>      }),
>    }).then(r => console.log('plausible:', r.status));
>    ```
>
>    202 Accepted = Plausible received the event end-to-end. The final
>    truth is the Plausible dashboard showing the row for your domain
>    — don't rely solely on the Network panel for the auto-fired
>    pageview; some script variants use `navigator.sendBeacon` which
>    DevTools doesn't always surface.

**Use this exact snippet across every ICJIA site.** Only the
`data-domain` value changes per site.

```astro
<!-- BaseLayout.astro head -->
<script
  is:inline
  defer
  data-domain="i2i.illinois.gov"
  src="https://plausible.icjia.cloud/js/script.file-downloads.outbound-links.js"
></script>
```

### Why this script variant

`.file-downloads.outbound-links.js` bundles two Plausible extensions
into a single ~2.5 KB request:

| Event name (in Plausible) | Triggered by |
|---|---|
| `Outbound Link: Click` | any `<a>` click where the hostname differs from the page hostname |
| `File Download`         | any `<a>` whose href ends in a downloadable extension (`.pdf`, `.zip`, `.docx`, `.xlsx`, `.csv`, `.dmg`, etc.) |

Both fire automatically — no per-link instrumentation required.

Other Plausible script variants (use **only** if a site genuinely
doesn't need the bundled features — the size delta is trivial):

- `script.js` — base only
- `script.outbound-links.js` — outbound only
- `script.file-downloads.js` — file downloads only

### URL normalizer (the inline script that needs the CSP hash)

If your site uses `trailingSlash: 'always'` (or 'never') but the host
serves bare paths as 200 OK, Plausible will log the same page under
two rows (`/foo` and `/foo/`). i2i normalizes client-side via a tiny
inline script that runs **before** the deferred Plausible script:

```astro
<script is:inline>
  if (
    location.pathname !== '/' &&
    !location.pathname.endsWith('/')
  ) {
    history.replaceState(
      null,
      '',
      location.pathname + '/' + location.search + location.hash,
    );
  }
</script>
```

`history.replaceState` updates `location.pathname` (which Plausible
reads) without triggering a navigation or extra request. Catches every
bare-path arrival — internal click, typed URL, external referrer — in
one place. **This is the script that needs to be CSP-hashed** (§11).

### Don't preconnect to Plausible

The script is `defer`'d, so a preconnect just costs you a critical-path
connection slot you could give to the LCP image instead. Drop any
`<link rel="preconnect" href="https://plausible.icjia.cloud">` from
your `<head>`.

### Mounted sites — `data-domain` format

For path-mounted deployments, set `data-domain` to the **full path
identifier** (host + mount), not just the host:

```
✓ icjia.illinois.gov/adultredeploy
✓ icjia.illinois.gov/researchhub
✗ icjia.illinois.gov   ← rolls events up into the parent site
```

i2i is at the origin root, so just `i2i.illinois.gov`.

---

## 10. Sitemap

```sh
pnpm add @astrojs/sitemap
```

```js
// astro.config.ts (excerpted)
integrations: [sitemap({
  filter: (page) => !/\/404\/?$/.test(page),
  changefreq: 'weekly',
  priority: 0.5,
})],
```

Then point `public/robots.txt` at the index file:

```
User-agent: *
Allow: /

Sitemap: https://i2i.illinois.gov/sitemap-index.xml
```

`@astrojs/sitemap` emits **`sitemap-index.xml`** (a `<sitemapindex>`
wrapper) plus `sitemap-0.xml` (the per-URL entries). The adultredeploy
checklist showed the right URL but it's worth calling out: if you
hand-port a robots.txt from an old Nuxt site, it probably says
`/sitemap.xml` and that path doesn't exist by default.

---

## 10a. SiteImprove + trailing-slash: avoiding the 301 ding

> **v5 addition.** SiteImprove (DCI score + accessibility scoring)
> flags HTTP 301 redirects as findings and deducts points — including
> the **trivial trailing-slash 301** Netlify emits by default for any
> Astro `trailingSlash: 'always'` build. Hit `/news` (no slash), get
> a 301 to `/news/` — SiteImprove counts it. Five-layer fix below
> ensures no 301 anywhere AND no duplicate-content flag AND no
> Plausible double-counting.

**The problem.** Astro static with `trailingSlash: 'always'` emits
`dist/news/index.html` (no flat `dist/news.html`). When a user requests
`/news`, Netlify's default behavior is:

1. Look for `dist/news.html` — not found.
2. Find `dist/news/index.html` exists at `dist/news/`.
3. **301 redirect to `/news/`** so the URL matches the canonical form.

That 301 is the SiteImprove penalty.

**The fix — five layers, all required.**

### Layer 1: `trailingSlash: 'always'` in `astro.config.ts`

Already documented in §1/§2. Every Astro-generated link uses the
trailing-slash form.

### Layer 2: Sitemap entries always use `/path/`

`@astrojs/sitemap` honors the `trailingSlash` config; no extra work.
Verify post-build: `grep '<loc>' dist/sitemap-0.xml` — every URL
should end in `/`.

### Layer 3: HTML `<link rel="canonical" href=".../path/">` on every page

Set via `astro-seo`'s `canonical` prop in `BaseLayout.astro`. Already
documented in §8.

### Layer 4: `netlify.toml` 200-rewrites for every non-slash variant

The key piece. A Netlify `[[redirects]]` rule with `status = 200`
is a **rewrite**, not a redirect — the URL in the browser stays as
requested, but the content comes from a different file. No HTTP 301
is emitted.

```toml
# netlify.toml — every route's no-slash form rewrites (200) to its
# slash form, eliminating Netlify's default trailing-slash 301.

[[redirects]]
  from = "/news"
  to = "/news/"
  status = 200
  force = true

[[redirects]]
  from = "/news/:slug"
  to = "/news/:slug/"
  status = 200
  force = true

# ... one rule per top-level route + one per dynamic-segment route.
# For IFVCC (12 rules total): /news, /news/:slug, /events,
# /events/:slug, /councils, /counties, /counties/:slug, /circuits,
# /circuits/all, /circuits/:slug, /search, /:slug.

# Catch-all for first-level CMS pages handled by the [...slug] template:
[[redirects]]
  from = "/:slug"
  to = "/:slug/"
  status = 200
  force = true
```

`force = true` is mandatory — it tells Netlify to apply this rule
**before** the default static-file resolution that would otherwise
emit the 301.

### Layer 5: Client-side URL normalizer for Plausible

Per §9 §"URL normalizer" pattern. `history.replaceState` adds the
trailing slash to `location.pathname` so Plausible's deferred script
logs `/news/` (not `/news`) even when the user originally hit `/news`.

This script runs AFTER Layer 4's rewrite has already served the
content; both layers are needed because Layer 4 only changes the
served bytes, not `location.pathname` (which is what Plausible reads).

### Verification recipe (post-deploy)

```sh
# Every no-slash URL should return 200, NOT 301:
for url in /news /events /councils /counties /circuits /search /about; do
  echo "GET $url:"
  curl -fsSI "https://icjia.illinois.gov/ifvcc$url" | head -1
done
# Expect: HTTP/2 200 for every line.

# Cross-check: the slash form also returns 200:
for url in /news/ /events/ /councils/ /counties/ /circuits/ /search/ /about/; do
  echo "GET $url:"
  curl -fsSI "https://icjia.illinois.gov/ifvcc$url" | head -1
done

# Plausible: hit /news (no slash) in browser; in Plausible dashboard,
# verify it logs as /news/ (not /news). May take a few minutes to
# propagate.
```

### When NOT to use this pattern

- If the site has `trailingSlash: 'never'` (Astro emits `dist/news.html`
  instead of `dist/news/index.html`), the default Netlify behavior is
  the OPPOSITE 301 (`/news/` → `/news`) and you'd flip the rewrite
  direction. Same five-layer principle.
- If you don't care about SiteImprove scoring (e.g. internal-only
  tools), the Netlify-default 301 is fine — skip Layer 4.

### Why this matters for ICJIA

SiteImprove DCI is part of how ADA Title II + IITAA 2.1 compliance is
sometimes assessed for ICJIA sites. Even when not the primary
compliance gate, a clean SiteImprove score signals "we did this
right." A site running Astro static with 301s for every trailing-slash
variant can lose ~5 SiteImprove points across the audit and look
worse than a site that just enabled this five-layer pattern in one
PR.

---

## 11. Security headers (Netlify) — the modern pattern

> **v3 update — hash EVERY inline `<script>`, not just the URL normalizer.**
> v2 showed the SHA-256 hash for the one inline executable script (the
> URL normalizer) and said "drop `'unsafe-inline'` entirely." That part
> is right. The trap: **Astro auto-inlines small `<script>` blocks**
> even when you didn't write `is:inline`. On SFS that produced four
> additional inline scripts beyond the normalizer:
>
> | # | Script | Where |
> |---|---|---|
> | 1 | URL normalizer | `Layout.astro` — every page |
> | 2 | Nav active-link marker | `Nav.astro` — every page |
> | 3 | Sidebar focus management | `Sidebar.astro` — every page |
> | 4 | JSDoc theme switcher | `public/docs/jsdoc/*` (auto-gen) |
> | 5 | Sites page deferred-iframe + tooltip | `/sites` only |
>
> All five need their own sha256 in `script-src`, or the missed ones
> are CSP-blocked at runtime. Symptoms: the navy hamburger active-state
> doesn't highlight; the sidebar doesn't focus its first link when
> opened; the ArcGIS iframe never lazy-loads. Each shows up as one
> CSP violation in the browser console — and the violation message
> conveniently includes the correct hash to add.
>
> **Ship a `scripts/csp-hashes.mjs` helper** that walks `dist/`, finds
> every inline `<script>`, prints each unique sha256 plus a
> ready-to-paste `script-src` snippet. Workflow when something gets
> blocked:
>
> ```sh
> pnpm build && node scripts/csp-hashes.mjs
> # → copy the printed "CSP script-src snippet" line
> # → paste into BOTH netlify.toml AND public/_headers
> ```
>
> The helper (~40 lines, see SFS repo `scripts/csp-hashes.mjs`):
>
> ```js
> import fs from 'node:fs';
> import path from 'node:path';
> import c from 'node:crypto';
> const hashes = new Map();
> (function walk(d) {
>   for (const e of fs.readdirSync(d, { withFileTypes: true })) {
>     const p = path.join(d, e.name);
>     if (e.isDirectory()) walk(p);
>     else if (p.endsWith('.html')) {
>       const html = fs.readFileSync(p, 'utf8');
>       const rx = /<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g;
>       let m;
>       while ((m = rx.exec(html)) !== null) {
>         hashes.set('sha256-' + c.createHash('sha256').update(m[1], 'utf8').digest('base64'), true);
>       }
>     }
>   }
> })('dist');
> console.log([...hashes.keys()].map(h => `'${h}'`).join(' '));
> ```
>
> Also: **keep `netlify.toml` and `public/_headers` in sync.** Both
> declare the CSP; updating one and forgetting the other trips
> non-Netlify mirrors (and Netlify's own deploy-preview overlay reads
> different sources in different contexts).

The most-evolved area since the adultredeploy original. Full
`netlify.toml` pattern below.

```toml
[build]
  base = "astro"
  command = "pnpm build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "22.22.2"
  # Belt-and-suspenders pin alongside the `packageManager` field in
  # astro/package.json. Guards against an older corepack on Netlify's
  # image silently falling back to npm.
  PNPM_VERSION = "10.33.0"

# --- Production / default headers ---
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options          = "SAMEORIGIN"
    X-Content-Type-Options   = "nosniff"
    # Explicit disable of the legacy XSS filter (modern guidance:
    # the filter itself has had CVEs; explicit 0 beats unset).
    X-XSS-Protection         = "0"
    Referrer-Policy          = "strict-origin-when-cross-origin"
    Permissions-Policy       = "camera=(), microphone=(), geolocation=(), interest-cohort=()"
    Strict-Transport-Security = "max-age=31536000"
    # Process isolation — blocks cross-origin windows from accessing
    # this origin via window.opener. Safe if you don't window.open
    # anything cross-origin.
    Cross-Origin-Opener-Policy   = "same-origin"
    # Blocks third-party origins from embedding our responses
    # cross-origin (defense against Spectre-style reads).
    Cross-Origin-Resource-Policy = "same-origin"
    Content-Security-Policy = """\
      default-src 'self'; \
      script-src 'self' 'sha256-OAUMRtE6/94YmcopyWQy0TaRJhMI77SVcMnS6tBi8FU=' https://plausible.icjia.cloud; \
      style-src 'self' 'unsafe-inline'; \
      img-src 'self' data: https://i2i.icjia-api.cloud; \
      font-src 'self' data:; \
      connect-src 'self' https://plausible.icjia.cloud https://i2i.icjia-api.cloud; \
      frame-src 'self'; \
      frame-ancestors 'self'; \
      base-uri 'self'; \
      form-action 'self'; \
      object-src 'none'\
    """

# --- Deploy-preview overrides ---
# Adds https://app.netlify.com to frame-src so Netlify's branch-deploy
# admin overlay (iframes back to itself) can load. Override applies
# only on *.netlify.app subdomains; production uses the strict CSP
# above.
[[context.deploy-preview.headers]]
  for = "/*"
  [context.deploy-preview.headers.values]
    Content-Security-Policy = """\
      … same as above but with: \
      frame-src 'self' https://app.netlify.com; \
      …\
    """

[[context.branch-deploy.headers]]
  for = "/*"
  [context.branch-deploy.headers.values]
    Content-Security-Policy = """\
      … same override …\
    """
```

### Why the SHA-256 hash on `script-src`

The single biggest XSS-defense loss a CSP can have is
`'unsafe-inline'` on `script-src`. The hash-source replaces it for
sites that have exactly one or two inline scripts whose content is
stable.

i2i ships exactly one inline executable script: the URL normalizer
in `BaseLayout.astro` (§9). Hash that script's content, allow it via
`'sha256-...'`, drop `'unsafe-inline'`.

**Recipe** (run from `astro/` after `pnpm build`):

```sh
node --input-type=module -e "
  import fs from 'node:fs';
  import c from 'node:crypto';
  const m = fs.readFileSync('dist/index.html', 'utf8')
    .match(/<script>([^<]*history\\.replaceState[^<]*)<\\/script>/);
  console.log('sha256-' + c.createHash('sha256')
    .update(m[1], 'utf8').digest('base64'));
"
```

**Important:** if you change the inline script even by one whitespace
character, the hash invalidates and the script gets CSP-blocked. Add
a comment in `netlify.toml` (next to the hash) explaining how to
regenerate.

### Why JSON-LD doesn't need a hash

`<script type="application/ld+json">` is a non-executable data block.
Modern Chrome / Firefox / Safari do NOT enforce `script-src` against
it. i2i has verified this empirically: hash-locked CSP, JSON-LD in
the head, zero console violations on prod.

If you ever see a CSP report for a `type="application/ld+json"`
script, the simplest fix is to add `'unsafe-hashes'` or move the
JSON-LD to an external file. So far no browser has done this.

### Why `style-src` keeps `'unsafe-inline'` (for now)

Ported Vue/Vuetify components leave ~80 inline `style="…"` attributes
across `src/**/*.astro` (`grep -rEho 'style="' src/ | wc -l`). Inline
style **attributes** require `'unsafe-inline'` on `style-src` — they
can't be hashed individually.

Astro's scoped `<style>` blocks emit external CSS files and don't need
the exception. The long-term fix is to migrate inline `style="…"` to
either scoped `<style>` blocks or CSS custom properties, then drop
`'unsafe-inline'` from `style-src` too.

### Why context-scoped headers matter

Netlify's deploy-preview admin overlay iframes back to
`https://app.netlify.com`. Without `app.netlify.com` in `frame-src`,
the overlay's service worker (`cnm-sw.js`) throws a `TypeError:
Failed to construct 'Response'` chain in DevTools — confusing for
reviewers, harmless for end users.

Adding `app.netlify.com` to the global `frame-src` works but
unnecessarily relaxes production's CSP. Netlify supports
context-specific header overrides via `[[context.deploy-preview.headers]]`
and `[[context.branch-deploy.headers]]` — use those to scope the
allowance to preview contexts only.

### Other headers worth knowing about but not yet adopted

- **Reporting-Endpoints + NEL** — useful for monitoring CSP /
  network failures in prod. Add when you have somewhere to report
  *to*. Without a collector, they're just header bloat.
- **Cross-Origin-Embedder-Policy** — would break our cross-origin
  Strapi `<img>` embeds unless the API serves CORP and we add
  `crossorigin` attributes. Skip until that pipeline change.

### v6 — Origin-layer `_headers` as defense in depth

> Pattern from IFVCC post-cutover red/blue audit (commit 447fcf8,
> 2026-05-26). The ICJIA reverse proxy in front of `ifvcc.icjia.cloud`
> is the canonical security layer. Audit revealed that the proxy CSP
> was in **Report-Only mode with no `report-to` endpoint** — effectively
> a no-op. Plus the proxy's `permissions-policy` denied only three
> features when it could deny sixteen.

Add `astro/public/_headers` (Netlify reads it from `dist/_headers`)
to ship a **second** set of security headers from the Netlify edge.
Browsers apply BOTH headers (the proxy's AND the origin's); for CSP
the most-restrictive enforcing wins. Three reasons this is worth
doing even when the proxy is "supposed to handle it":

1. **Direct-origin access** (`*.netlify.app`, branch deploys, raw
   origin probes from monitoring) bypasses the proxy entirely. Without
   `_headers` the origin is naked.
2. **Reference implementation for the proxy team.** When the proxy
   coordination conversation finally happens, hand them the `_headers`
   verbatim — "this is the strict CSP that we've shipped in production
   without breaking anything; copy these directives."
3. **Per-deploy soak.** Strict CSP at origin acts as a canary —
   Netlify deploy previews exercise the strict CSP before the proxy
   ever ships it. If a CMS-driven page would have broken under the
   strict CSP, you find out before changing proxy config.

IFVCC's `astro/public/_headers` shape (production-tested):

```
/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: SAMEORIGIN
  Referrer-Policy: strict-origin-when-cross-origin
  Cross-Origin-Resource-Policy: cross-origin   # needed for OG-image scrapers
  Cross-Origin-Opener-Policy: same-origin
  Permissions-Policy: accelerometer=(), camera=(), display-capture=(), fullscreen=(self), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), midi=(), payment=(), picture-in-picture=(), publickey-credentials-get=(), screen-wake-lock=(), usb=(), web-share=(), xr-spatial-tracking=()
  X-XSS-Protection: 0
  Content-Security-Policy: <strict CSP — see recipe below>
```

### v6 — TRAP: Astro inlines small bundled `<script>` blocks

> Hard-learned lesson from IFVCC commit ee4bf49 (2026-05-26). Mobile
> Lighthouse BP score dropped 100 → 92 immediately after shipping a
> strict CSP. Chrome console showed `Executing inline script violates
> the following Content Security Policy directive…` even though every
> `<script>` block in BaseLayout was the **bundled** form (no
> `is:inline`).

Astro 6 has an optimization: small bundled scripts (~< 250 bytes after
Vite/Rollup processing) get **inlined directly into the HTML** as
`<script type="module">…compiled body…</script>` rather than emitted
as a separate `_astro/X.js` file. This saves a round-trip but also
means:

- Every "bundled" `<script>` you write in `.astro` frontmatter could
  become an inline script in production.
- Each unique inline body needs its own `'sha256-...'` in `script-src`.
- The Vite/Rollup output is sensitive to source whitespace AND to
  upstream dependency changes (a minor in `vite` or `astro` can shift
  bytes). **The hash WILL drift across Astro version bumps**, not just
  when you edit the source.

**Detection recipe — always sweep production HTML after every commit
that touches an inline-eligible script body OR after every Astro
version bump:**

```sh
curl -fsS https://<prod-url>/ | python3 -c "
import sys, re, hashlib, base64
html = sys.stdin.read()
pat = re.compile(r'<script\b([^>]*)>([\s\S]*?)</script>', re.IGNORECASE)
for m in pat.finditer(html):
    attrs, body = m.group(1), m.group(2)
    if 'src=' in attrs or 'application/ld+json' in attrs or not body.strip():
        continue
    h = base64.b64encode(hashlib.sha256(body.encode('utf-8')).digest()).decode()
    print(f'sha256-{h}  ({len(body)} bytes) attrs={attrs.strip()[:40]!r}')
"
```

Sweep multiple templates (home, list, detail, search). The /search/
page typically has an extra Pagefind-loader inline script the other
templates don't ship.

**Why csp-hashes.mjs alone isn't enough:** the script walks
`dist/**/*.html` AFTER a local build. The local build's output bytes
can differ from the Netlify build's output bytes (different Node minor,
different Sharp version, etc.). Verifying against actual production
HTML closes the gap.

### v6 — Strict CSP recipe (drop `'unsafe-inline'`, KEEP `'unsafe-eval'`)

The v3 §11 recipe said "drop `'unsafe-inline'` AND `'unsafe-eval'`."
**That second claim is wrong** for any site that ships Alpine.js or
Pagefind. v6 correction:

| Source | Needs |
|---|---|
| Alpine 3 `x-data`/`x-show`/`x-if`/etc. evaluation | `'unsafe-eval'` (Alpine uses `new Function()` for expression eval — v5 §7) |
| Pagefind UI bundle | `'unsafe-eval'` (WebAssembly compilation; though `'wasm-unsafe-eval'` is more precise, `'unsafe-eval'` is a superset) |
| Inline scripts (URL normalizer, Pagefind loader, Astro-inlined modules) | `'sha256-...'` per unique body |
| Bundled scripts above the inlining threshold | `'self'` |
| Plausible loader (external) | `https://plausible.icjia.cloud` (or self-host) |
| JSON-LD `<script type="application/ld+json">` | nothing — CSP doesn't enforce on data blocks |
| Inline `style="…"` attributes | `'unsafe-inline'` on `style-src` (no hash form exists for inline style attributes) |

If you drop `'unsafe-eval'`, Alpine throws `EvalError: Refused to
evaluate a string as JavaScript because 'unsafe-eval' is not an
allowed source` on first interaction. Pagefind throws `RangeError`
when WebAssembly.instantiate() fails. Both errors are silent in
production unless you're watching the console.

IFVCC's strict origin CSP (production-tested, deployed):

```
Content-Security-Policy: default-src 'self';
  script-src 'self' 'unsafe-eval'
    'sha256-<URL normalizer hash>'
    'sha256-<Pagefind loader hash>'
    'sha256-<rel-swap module hash>'
    https://plausible.icjia.cloud;
  style-src 'self' 'unsafe-inline';
  font-src 'self' data:;
  img-src 'self' data: blob: https:;
  connect-src 'self' https://plausible.icjia.cloud;
  worker-src 'self';
  frame-src 'self' https://www.youtube.com https://player.vimeo.com
    https://public.tableau.com https://docs.google.com
    https://forms.office.com;
  frame-ancestors 'self';
  base-uri 'self';
  form-action 'self';
  object-src 'none';
  upgrade-insecure-requests
```

The `img-src https:` is intentionally generous — CMS markdown
authors paste external image URLs and tightening to specific hosts
breaks links. The `object-src 'none'` is a freebie (no Flash/PDF
embeds anywhere in this lineage). `upgrade-insecure-requests` covers
the case where a CMS author pastes an `http://` URL.

### v6 — Always audit `set:html=` usages periodically

> Stored-XSS finding from IFVCC red/blue audit (commit 841400c,
> 2026-05-26). The site's markdown pipeline (`xss.FilterXSS` on
> rendered HTML) is correct — but **not every `set:html=` consumes
> markdown-pipeline output**. One component (HomeFeatureBoxes)
> shipped CMS `summary` directly via `set:html=` with no sanitizer.

Periodic audit recipe (~ once per release cycle):

```sh
# Find every set:html= that does NOT obviously consume a renderMarkdown() result.
grep -rn "set:html" astro/src/{components,pages} \
  | grep -v "renderMarkdown\|markdownToHtml\|bodyHtml\|detailsHtml\|JSON\.stringify"
```

Each match needs explicit defense:
- **CMS short-string fields** (title, summary, kicker): the
  `xss.FilterXSS({ whiteList: {}, stripIgnoreTag: true,
  stripIgnoreTagBody: ['script', 'style'] })` empty-whitelist filter
  is right. Strip all tags; keep text. Marketing blurbs don't need
  inline emphasis.
- **JSON-LD `<script type="application/ld+json" set:html={JSON.stringify(…)} />`**:
  fine — non-executable, CSP-exempt.
- **Anything else** — review case by case. A compromised CMS editor
  can ship arbitrary HTML+JS through any unsanitized `set:html=`.

Add this audit to the per-release checklist (§14 audit & ship loop).

---

## 12. Accessibility — patterns that earn 100/100

- **Skip-link**: see §12a below for the full pattern and the
  `clip-path` gotcha that bit the adultredeploy site.
- **Tab a real browser** before declaring an a11y feature working.
  Most rules check structural shape, not visual outcome.
- **Markdown image post-process** (§4) also dedupes alt-text gaps:
  any rendered `<img>` without `loading`/`decoding` gets both
  injected. Pair with an alt-text linter on the CMS side.
- **Interactive table rows**: keep the real `<a>` on the title cell
  for keyboard + SR, then add a row-level click handler that
  suppresses itself when the click target is already a
  link/button/input or when text is selected.

i2i achieves Lighthouse Accessibility 100 on prod by default. The
patterns above are what kept it there through 0.2.0's refactors.

### v6 — CLS stopping rule: 0.02 is the floor; don't chase below it

> Pattern from IFVCC commit 50b2b1c (2026-05-26). After the
> lazy-load-CSS revert (1.0.11), direct-origin Lighthouse on 5
> templates showed CLS values clustering at 0 or 0.014-0.015 —
> the residual is exclusively **web-font swap-in** (Roboto/Raleway
> arriving from `@fontsource` after first paint and replacing the
> system-font fallback). Two pages literally at 0; three at
> 0.014-0.015 (TOC + breadcrumb regions, where the most text
> reflows on swap).

CLS optimization has a hard floor where the cost of removing the
last sliver exceeds the user-perceived benefit. The IFVCC data point:

| CLS value | Lighthouse band | User perception | Action |
|---|---|---|---|
| > 0.25 | "Poor" | Disorienting; reads as a bug | **Must fix** |
| 0.1 – 0.25 | "Needs improvement" | Noticeable nudge | **Should fix** |
| 0.05 – 0.1 | "Good" | Sometimes detectable as flicker | **Worth fixing** |
| 0.02 – 0.05 | "Good" | Sub-perceptual; visible only to A/B-comparing developers | **Optional** |
| ≤ 0.02 | "Good" | Below human perception threshold | **STOP — this is the floor** |

The web-font-swap residual is the dominant CLS source on a well-built
Astro static site. Eliminating it requires one of:

1. **Font-metrics override** — `@font-face { font-family: 'Roboto Fallback';
   src: local('Arial'); size-adjust: 100.06%; ascent-override: 92.97%;
   descent-override: 24.47%; line-gap-override: 0%; }` then use as the
   first fallback in the family stack. Generated via [capsize](https://github.com/seek-oss/capsize)
   or `@fontsource/utils`. **Cleanest**: dimensionless swap, true zero CLS.
   **Cost**: one-time generation + verification per font family;
   ongoing maintenance when @fontsource adds new weights or the upstream
   font ships a new metrics set.
2. **`font-display: optional`** — text renders in the fallback if
   the font isn't already cached and never swaps mid-session. CLS = 0.
   **Trade-off**: first-visit users never see the brand font;
   typography varies per-session. **Wrong for any branded site.**
3. **Preload critical weights** — `<link rel="preload" as="font" type="font/woff2"
   crossorigin>` for the above-the-fold weights. Shrinks but doesn't
   eliminate the swap window. CLS drops ~4× (0.014 → ~0.003) but stays
   nonzero.

**v6 default for ICJIA migrations: don't chase below 0.02.** Option 1
is the right answer if a project mandates true zero CLS (state RFP
language, specific compliance audit), but for the default WCAG 2.1 AA
+ ADA Title II + IITAA 2.1 posture, the 0.02 floor is well inside
"Good" by every measure and below the human-perception threshold.
Stop here; spend the engineering budget on something more impactful.

**Detection** — direct-origin Lighthouse on the worst-case content
page (per §14's "Audit BOTH through-proxy AND direct-origin"). If
CLS > 0.02 and the culprits are NOT web-font loads (e.g., an
async stylesheet, an unsized image, a late-loading iframe), fix the
real cause. If the culprits ARE web-font loads and CLS ≤ 0.02, log
and move on.

## 12a. Skip-links — the pattern, the gotcha, the verification

### The pattern (i2i version: off-screen positioning, not clip-path)

```astro
<!-- BaseLayout.astro, first child of <body> -->
<nav class="skip-links" aria-label="Skip links">
  <a href="#main-content" class="skip-link">Skip to main content</a>
  <a href="#main-navigation" class="skip-link">Skip to navigation</a>
</nav>

<style>
  .skip-link,
  .skip-links {
    position: absolute;
    top: -100px;            /* off-screen until focused */
  }
  .skip-link {
    background: #000; color: #fff;
    padding: 8px 16px; left: 8px;
    border: 2px solid #fff; border-radius: 4px;
    z-index: 10001;
  }
  @media (prefers-reduced-motion: no-preference) {
    .skip-link { transition: top 0.3s ease; }
  }
  .skip-link:focus, .skip-link:active {
    position: fixed; top: 8px; left: 8px;
  }
</style>
```

Two valid skip-link patterns:

1. **Off-screen positioning** (i2i): start at `top: -100px`, on
   `:focus` move to `top: 8px`. Always works.
2. **Tailwind's `sr-only` / `focus:not-sr-only`**: relies on the
   legacy `clip` property. Works *if* you don't accidentally reach
   for the more-modern `clip-path` (see gotcha below).

### v6.3 — TRAP: multiple stacked skip-links overlap

> Hard-learned lesson from DVFR `ceff4f8` (2026-05-27). Mobile
> Lighthouse audit of `/resources/#additional-resources` flagged
> `target-size`: *"Target has insufficient size because it is
> partially obscured (smallest space is 9.6px by 48px, should be at
> least 24px by 24px). Safe clickable space has a diameter of 0px
> instead of at least 24px."* A11y dropped 100 → 96 on the route.

**The trap.** Pattern 1 (off-screen positioning) works fine for a
**single** skip-link — but most sites ship **two**: "Skip to main
content" + "Skip to navigation". If both share the same hidden
position (`position: fixed; top: -100px; left: 50%`), they stack
on top of each other in the hidden state. Lighthouse 13 / axe-core
4.10 `target-size` measures the bounding rects and reports zero
safe clickable space between them. The audit fails even though the
on-focus styling correctly places them at different top positions
(`top: 0` and `top: 60`) for visible use.

**The fix.** Switch to Pattern 2 (sr-only-focusable). Each skip-link
in its hidden state is a `width: 1px; height: 1px; clip: rect(0,0,0,0);
overflow: hidden;` clipped point — axe-core exempts this canonical
sr-only pattern from `target-size` measurement, so two stacked
clipped points produce no violation. On focus, override every
sr-only property:

```css
.skip-link {
  /* Hidden — 1×1 clipped point, exempt from target-size */
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.skip-link:focus,
.skip-link:focus-visible,
.skip-link:active {
  /* Reset every sr-only property to make visible */
  position: fixed !important;
  top: 0 !important;
  left: 50% !important;
  transform: translateX(-50%) !important;
  width: auto !important;
  height: auto !important;
  padding: 12px 20px !important;
  margin: 0 !important;
  overflow: visible !important;
  clip: auto !important;
  /* ...visual styling: background, color, z-index, outline, etc. */
}

.skip-link--second:focus,
.skip-link--second:active {
  top: 60px !important;  /* offset so both can be visible if user Tabs through */
}
```

**Per v6.3's existing gotcha:** the property is `clip: rect(0,0,0,0)`
(legacy), NOT `clip-path: inset(50%)`. The focus override needs to
reset cleanly via `clip: auto`; the modern `clip-path` doesn't get
reset by that and the link stays invisible on focus.

**Decision rule.** If you have **one** skip-link, Pattern 1 (off-
screen positioning) works fine. If you have **two or more**, use
Pattern 2 (sr-only-focusable) to avoid the stacking-overlap
`target-size` violation. Multiple skip-links are common enough
(every site that has both "main content" + "navigation" skip
targets) that the sr-only pattern is the safer default.

**Detection recipe** (production): `curl https://<site>/ | head -200 |
grep skip-link` to count them. If ≥ 2 AND they share the same
hidden-state positioning, Pattern 2 is required.

### The gotcha — don't reinvent `sr-only`

```css
/* DON'T DO THIS */
.visually-hidden {
  position: absolute !important;
  width: 1px; height: 1px;
  padding: 0; margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);   /* <-- the problem */
  white-space: nowrap;
}
```

Tailwind's `focus:not-sr-only` only resets the *legacy* `clip`
property. It does **not** reset `clip-path`. So:

- Page loads → `.visually-hidden` clips skip-link to 0×0.
- Tab pressed → `focus:not-sr-only` adds `width: auto; height: auto;
  clip: auto;`…
- …but `clip-path: inset(50%)` is still active, **so the skip-link
  stays clipped to 0×0 and never appears.**

**Both Lighthouse and axe-core score this 100 / 0-violations.** They
verify the element exists with a valid `href` target; they do **not**
verify it's visible when focused.

### Visual verification (mandatory)

Open the deployed page and press Tab. The skip-link should appear in
the top-left corner. Screenshot it. Add the check to your release
checklist — it's the single a11y feature audits don't catch.

If the focused element you see is the first nav link instead, the
skip-link is broken even if your audits are clean.

### v6.3 — Full-portfolio a11y sweep (post-deploy verification)

> Pattern from DVFR post-cutover audit (2026-05-27): after every
> significant a11y fix, run `lightcap run_a11y` on **every single
> sitemap URL** — not just template representatives. Catches the
> content-specific issues template-rep audits miss (a CMS author
> uploaded an image without alt text, a blog post pasted in a
> contrast-failing brand color, a specific publication has a
> table without headers, etc.).

**The recipe:**

```sh
# 1. Pull the full URL list from the production sitemap shard.
curl -fsS https://<site>/sitemap-0.xml | \
  grep -oE '<loc>[^<]*</loc>' | sed 's|<loc>||; s|</loc>||' > urls.txt

# 2. Loop through every URL with lightcap. Each a11y-only audit is
#    ~5s; ~10 in parallel keeps total wall time under ~2 min for
#    a typical ICJIA site (44 routes for DVFR; 12 for IFVCC; etc.).
#    The MCP tool's `mcp__lightcap__run_a11y` does this in batches.

# 3. Verify every line shows "100/100 — 0 issues".
```

**Acceptance criterion**: every URL reports `A11y: <url> [mobile]
100/100 — 0 issues`. If even one URL drops to 96 or 99, it's almost
always a content issue (the templates themselves earned 100 in
testing) — open the failing page in DevTools, run axe-core, and
fix the specific node.

**Why mobile, not desktop**: WCAG 2.5.8 (Target Size Minimum,
weight 7 in Lighthouse 13) is mobile-only-strict. If the audit
passes mobile, it passes desktop. Mobile-first verification
catches more.

**Why every URL, not template-rep**: template-rep coverage (15
URLs covering all 6 templates) is the right *development*
discipline — you can't audit 1000 pages while iterating. Full-
portfolio sweep is the right *acceptance* discipline — it's the
single check that converts "the templates pass" into "every page
passes." DVFR's 44/44 sweep (2026-05-27) caught zero new content
issues; the value was the *confidence* that the v3.1.4 skip-link
fix landed everywhere.

**Confirmed on:** DVFR (44/44 routes, 2026-05-27). Apply ahead of
any compliance audit or external review where "every page passes"
needs to be a defensible claim.

---

## 13. Broken-link / link-check scanner

i2i ships a ~280-line scanner at `astro/scripts/check-links.mjs`. It
walks every `dist/**/index.html` after build, classifies hrefs, and
reports anything that doesn't resolve.

```sh
pnpm check:links             # internal + external
pnpm check:links:internal    # filesystem-only (fast, CI-friendly)
```

Adapted from the adultredeploy original with these notable changes:

- **`decodeURIComponent` on the path** before filesystem lookup.
  Latent bug in the original — current slugs are slugify-d ASCII so
  it never triggered, but cost is trivial.
- **`canonical` and `alternate` added to `HINT_RELS`**. The 404 page
  emits `<link rel="canonical" href="/404/">` which doesn't resolve to
  a directory (Netlify serves `/404.html` for unmatched routes).
  Those `<link rel>` values are metadata, not navigable URLs.
- **Image references intentionally NOT scanned**. Astro fails the
  build on a missing `import x from '~/assets/missing.png'`, so a
  stale image reference can't reach `dist/`. Adding a srcset parser
  would just duplicate the build-time check.
- **Internal breakage fails the run; external breakage warns but
  exits 0**. Third-party rot is real and usually out of your control.

If the script is going to be useful in CI, the internal-only run is
the one to wire up — external HEAD checks are slow and flaky.

i2i v0.2.0 launch: **0 broken internal links across 36 pages.**

---

## 14. Audit & ship loop

> **v3 update — local-preview vs deployed scoring gap.**
> v2 says "Deploy to a real URL before trusting numbers" in passing.
> Worth restating loudly: **`pnpm preview` does NOT serve gzip/brotli**,
> so Lighthouse on the local preview measures uncompressed transfer
> times. The Netlify production deploy compresses, which typically
> adds **2-3 mobile Perf points** on text-heavy routes.
>
> Concretely on SFS:
>
> | Route | Local `pnpm preview` Perf | Production (compressed) Perf |
> |---|---|---|
> | `/about` | 100 | 100 |
> | `/research` | 98 | 100 |
> | `/` (home) | 96 | 98-99 |
> | `/resources` | 96 | 98-99 |
> | `/sites` | 93 (ArcGIS iframe cap) | 94-96 |
>
> Don't chase the last 2-3 points locally — deploy to a Netlify branch
> preview and re-audit there. If the local number is 96+ on the
> bottleneck routes, the production number will almost certainly hit
> the 98-100 ICJIA bar.

After each meaningful change:

```sh
pnpm build              # full pipeline
pnpm check:links        # link sweep (§13)
pnpm audit:lh           # Lighthouse mobile (homepage by default)
pnpm audit:axe          # axe-core
pnpm test               # unit + integration (vitest)
```

The `audit:lh` and `audit:axe` scripts are at `astro/scripts/audit-lh.mjs`
and `astro/scripts/audit-axe.mjs`. They each:

1. Probe the target port (4322 / 4323) for free-ness; bail with a
   clear error if busy.
2. Spawn `pnpm preview` with `detached: true` (own process group).
3. Wait up to 15s for the preview server to respond.
4. Run `lighthouse` or `@axe-core/cli` via `npx --yes` against either
   `/` (default), specific paths passed as args, or every page in
   `dist/` when `--all` is set.
5. Parse the JSON report and print a per-route summary.
6. **Clean up via SIGTERM → SIGKILL on the whole process group**
   (single `process.kill(-pid, ...)`). SIGINT and SIGTERM handlers
   on the parent ensure Ctrl-C doesn't orphan the `astro preview`
   grandchild holding the port.

Reports land in `astro/reports/` (gitignored).

```sh
pnpm audit:lh                  # homepage
pnpm audit:lh -- /cohorts/     # specific route
pnpm audit:lh -- --all         # every page (slow)
pnpm audit:axe                 # same arg pattern
```

**For ad-hoc interactive audits, the `lightcap` / `axecap` MCP
servers are faster.** The scripts are for batch / CI runs.

**Deploy to a real URL before trusting numbers.** Local Lighthouse
and prod-deployed Lighthouse can differ by 10+ Perf points because of
caching and network behavior. Netlify deploy previews live on shared
infra and run slower than prod; an i2i preview that scored Perf 75
deployed to prod at Perf 100 unchanged.

### v6 — Audit BOTH through-proxy AND direct-origin; pick worst-case content

> Pattern from IFVCC commit 4231fb7 (2026-05-26). The lazy-load
> github-markdown.css regression scored Perf 100 in through-proxy
> lightcap runs on the homepage + resources, but Perf **81-86** in
> direct-origin Lighthouse on two long-content CMS catch-all pages.
> The same site, the same code, the same day — different number by
> 15 points. Through-proxy alone would have shipped a CLS 0.266-0.409
> regression invisible to the per-release audit.

ICJIA's through-proxy URL (`icjia.illinois.gov/ifvcc/...`) and the
Netlify origin (`ifvcc.icjia.cloud/ifvcc/...`) are not the same audit
surface. Differences that materially affect Lighthouse scoring:

1. **Edge caching at the proxy** changes timing. A pageview through
   the proxy that's cached scores differently than a cold direct-origin
   fetch. Lighthouse's mobile throttle adds load-time noise on top of
   that — over multiple runs the variance can be ±5-10 Perf points
   just from caching.
2. **CLS is measured per-page-load and is content-dependent.** The
   home + resources pages have short markdown bodies; layout shifts
   from late-arriving CSS are sub-threshold. CMS catch-all pages
   (`/<slug>/` with `body` rich text from Strapi) can have 50+ row
   `<ul>` lists, multiple `<h2>` sections, blockquotes, tables — any
   of which can shift the page meaningfully when prose CSS arrives.
3. **The proxy may inject headers or compression** that change byte
   counts (e.g. brotli encoding from a CDN layer the origin doesn't
   do). Lighthouse's "render-blocking" report reads transfer size to
   compute wasted-ms estimates.

**Per-release audit rule — sample BOTH dimensions:**

| Axis | What to sample | Why |
|---|---|---|
| **Origin** | Through-proxy (`icjia.illinois.gov/ifvcc/`) AND direct-origin (`ifvcc.icjia.cloud/ifvcc/`) — at least one URL of each | Catches proxy-layer caching effects + serves as a baseline if the proxy is later misconfigured |
| **Content shape** | Home, listing pages (news, events), AND **worst-case content** (longest markdown body, most rows in a listing, most CMS-rich catch-all page) | CLS regressions on short-content pages are sub-threshold and invisible; the regression always appears first on content-heavy pages |
| **Template type** | At least one URL per route shape (home, listing, detail, catch-all, search, 404) | Templates differ in what they render; perf can vary per template |

**How to find the worst-case content page programmatically:**

```sh
# Crawl the sitemap, fetch each URL, find the one with the largest
# .markdown-body innerHTML. That's the canary.
curl -fsS https://<site>/sitemap-0.xml \
  | grep -oE '<loc>[^<]+</loc>' \
  | sed 's/<loc>//;s/<\/loc>//' \
  | while read u; do
      size=$(curl -fsS "$u" | grep -oE '<div class="markdown-body[^>]*>[\s\S]*</div>' | wc -c)
      printf '%9s  %s\n' "$size" "$u"
    done | sort -rn | head -5
```

Run Lighthouse on the top 2 results. If you don't have a "worst-case
content" sample in every audit run, you don't actually know the floor.

**Detection workflow when the through-proxy and direct-origin numbers
diverge by more than ~5 Perf points:**

1. Look at CLS first. The two largest sources of late-CLS are
   web-font loading (mitigation: `font-display: swap` + `<link
   rel="preload" as="font" crossorigin>`) and async CSS application
   (mitigation: don't lazy-load layout-affecting stylesheets — see
   §16 v6 "Lazy-load CSS — when NOT to").
2. If CLS is the gap, the through-proxy run is the **lying** number.
   Direct-origin tells the truth. Cache invalidation at the proxy
   plus content-aware sampling closes the loop.
3. If FCP / LCP is the gap (direct-origin slower), it's usually
   first-byte time from the origin's geographic distance to the test
   region. Through-proxy benefits from the proxy's CDN.

The cheapest insurance: **always include `pnpm audit:perf:mobile`
against the direct-origin URL of the longest-content page** in the
per-release per-phase audit. If `lightcap` shows Perf 100 on the home
but direct-origin shows < 95 on a content page, the home result is
not the floor.

### v6 — Build-time guards that fail the deploy on regression

> Three guard scripts from IFVCC commit 1.0.10 (2026-05-26). Each
> catches a specific regression class that previously could only be
> detected post-hoc via lightcap / red-blue audit. Together they make
> CI fail fast instead of silently shipping bad state.

| Script | When | What it catches |
|---|---|---|
| `pnpm verify-headers` | Final step of `pnpm build` (root `package.json`); non-zero exit fails the Netlify deploy | Inline-script hash in `dist/` not covered by `astro/public/_headers` CSP. Catches the "Astro inlined a small bundled `<script>`; strict CSP started blocking it" regression — Lighthouse BP 100 → 92 on commit `447fcf8` |
| `pnpm audit:xss-surface` | Ad-hoc — pre-release, quarterly | `set:html=` usages that don't visibly consume `renderMarkdown()`, `bodyHtml`, `detailsHtml`, `JSON.stringify`, or a `safe*` wrapper. Catches finding #4 of the red/blue audit (HomeFeatureBoxes was shipping CMS `summary` via `set:html=` with no sanitizer) |
| `.githooks/pre-commit` | Opt-in: `git config core.hooksPath .githooks` once per clone | Soft warning (no block) when staged `.astro` files contain `<script>` but `astro/public/_headers` is unstaged — reminds committer that Astro inlines small bundled scripts, hash set may need updating |

**Both `.mjs` scripts use `import.meta.url`-relative paths** so they
work from any cwd. The hashing logic in `verify-headers.mjs` matches
`csp-hashes.mjs` exactly (same regex, same skip rules); they're a
matched pair. The XSS auditor recognizes safety via a curated allow-list
of identifier patterns:

```js
const SAFE_MARKERS = [
  /\brenderMarkdown\b/,
  /\bmarkdownToHtml\b/,
  /\bbodyHtml\b/,
  /\bdetailsHtml\b/,
  /\bJSON\.stringify\b/,
  /\bsafe[A-Z]\w*\b/,    // `safeMarkup`, `safeSummary`, etc.
  /\b\w+\.process\b/,    // direct `FilterXSS#process()` call
];
```

**Naming hygiene rule** (from the audit auditor itself): any local
variable that holds sanitized HTML should be named `safe<Something>`
so the safety is visible at the `set:html={…}` use site, not hidden
behind a derivation chain. The auditor reports the local expression,
not the upstream definition; safety must be inspectable in one line.

---

## 15. Mobile-specific optimization

Most Lighthouse scoring lives on mobile (throttled CPU, 4G network).
This is where the wins are.

### Mobile-first asset selection

- **Set `widths` on `<Image>` from smallest to largest** —
  `[640, 960, 1280, 1366]`. The smallest is what mobile picks via
  `sizes="100vw"`. Don't include only 1920w "to be safe": mobile
  pays for that decision in LCP.
- **Test the actual variant chosen.** Open the deployed page in
  Chrome with device emulation, watch the Network tab, confirm the
  640w (or whichever) variant is what loaded. If it's the 1920w,
  your `sizes` attribute is wrong.
- **`sizes="100vw"`** is correct for full-width hero/banner images.
  For content images sharing the viewport with other layout, match
  your actual grid: `sizes="(min-width: 768px) 33vw, 100vw"` for a
  3-up grid, etc.

### Hero / LCP image

- **The single biggest mobile perf lever.** Optimize it before
  anything else. i2i hero: 688 KB PNG → 23 KB WebP at 640w cut
  branch-preview mobile LCP from 5.6s → 1.0s and Perf 75 → 100 on
  prod.
- Keep `loading="eager"` and `fetchpriority="high"` on the LCP image
  only. Everywhere else: `loading="lazy"`.
- **Don't preload responsive images with a static `<link rel="preload">`**
  — it pins one URL and bypasses `srcset` selection. The browser's
  preloader handles `<img srcset>` aggressively; trust it.

### Mobile viewport reality

- Real iPhones render at 320–428 CSS px wide. Test with the smallest
  width you support; Lighthouse defaults to ~375.
- **Above-the-fold = anything in the first ~600 CSS px.** That's
  roughly one hero or two stacked card heights on mobile.
- Hamburger / drawer nav: use `role="dialog"`, `aria-modal="true"`,
  trap focus, lock scroll. **Don't use a hover-driven dropdown** —
  mobile has no hover.

### Touch targets

- **Minimum tap target: 44×44 CSS px** (WCAG 2.5.5). Tailwind `p-2`
  (16px padding around a 16px icon = 32px total) is too small. Use
  `p-3` or larger, or wrap in `min-h-[44px] min-w-[44px]`.
- Use `whitespace-nowrap` on date columns / labels with a known
  expected width. Otherwise the browser sometimes wraps "November 17,
  2025" onto two lines on narrow screens.
- Honor `prefers-reduced-motion` on any CSS animation longer than
  ~150 ms.

---

## 16. Performance strategies — what to chase, in order

When Lighthouse mobile Perf is < 90, the lever you pull depends on
the *specific* metric failing. Don't optimize blindly.

### Lighthouse "insights" decoded

| Insight | What it means | Fix |
|---|---|---|
| `image-delivery-insight` | Largest images too big / wrong format | WebP, `srcset`, build-time Sharp |
| `unsized-images` | `<img>` missing `width`/`height` | Set intrinsic dimensions (CLS killer) |
| `render-blocking-insight` | CSS / font CSS blocks first paint | Self-host fonts; inline critical CSS |
| `network-dependency-tree-insight` | Cross-origin requests blocking | Drop / preconnect external origins |
| `lcp-discovery-insight` | LCP element discovered too late | LCP in initial HTML; `fetchpriority="high"` |
| `cls-culprits-insight` | Layout shifts | Intrinsic image dims; reserve space for async content |
| `cache-insight` | Static assets have short cache headers | Netlify long-cache `_astro/` (already default) |

### Mobile-perf decision tree

1. Is the LCP image > 50 KB? → §5 image optimization.
2. Are fonts loading from a CDN? → §6 self-host fonts.
3. Are images missing `width`/`height`? → §5 + intrinsic dims.
4. Are images eager-loading off-screen? → `loading="lazy"`.
5. Is there `<picture>` / multiple `<img>` competing for LCP? →
   Simplify, mark only one LCP-eligible.
6. Anything left? → It's probably the third-party script you forgot
   about. Defer it or drop it.

### v6 — Lazy-load below-the-fold stylesheets (CSP-clean pattern)

> Pattern from IFVCC commit 447fcf8 (2026-05-26). Mobile Lighthouse
> Perf regressed from the v6 ≥ 98 gate to 94-96 across templates after
> the post-cutover lessons accumulated CSS. Root cause: `github-markdown.css`
> (~18 KB) was render-blocking on every page that rendered CMS body
> markdown — even though `.markdown-body` content is typically
> below-the-fold. Lightcap reported ~900-1180 ms of LCP savings.

**The conventional `media="print" onload="this.media='all'"` trick
DOES NOT WORK under strict CSP** because the `onload="…"` attribute
is an inline event handler, which `script-src 'self'` (no
`'unsafe-inline'`, no `'unsafe-hashes'`) blocks. The CSP-clean pattern
is preload + bundled rel-swap script + `<noscript>` fallback.

**Setup** — move the CSS out of `src/styles/` to `public/css/` so it's
served as a static asset (not bundled-hashed by Astro; URL is stable):

```sh
git mv astro/src/styles/github-markdown.css astro/public/css/github-markdown.css
```

Strip the per-page `import '~/styles/github-markdown.css'` from every
page that had it — one canonical lazy-load in `BaseLayout.astro`
serves the whole site:

```sh
find astro/src/pages -name '*.astro' -exec grep -l 'github-markdown.css' {} \; | \
  xargs perl -i -ne 'print unless /^import\s+.*github-markdown\.css/'
```

**BaseLayout** — preload + noscript fallback in `<head>`:

```astro
<link
  id="markdown-css"
  rel="preload"
  as="style"
  href={`${siteConfig.publicPath}/css/github-markdown.css`}
/>
<noscript>
  <link rel="stylesheet" href={`${siteConfig.publicPath}/css/github-markdown.css`} />
</noscript>
```

Bundled `<script>` at end of body that flips `rel`:

```astro
<script>
  const mdLink = document.getElementById('markdown-css');
  if (mdLink) mdLink.setAttribute('rel', 'stylesheet');
</script>
```

The `<link rel="preload" as="style">` starts the download in parallel
with HTML parse without blocking render. The bundled script runs
after parsing (Astro bundles every `<script>` as a deferred ES module);
it flips `rel` to `'stylesheet'`, which immediately applies the cached
bytes — no second download.

**Three traps to avoid:**

1. **Don't use `onload="…"` attribute.** Strict CSP blocks it. The
   rel-swap script tag must be bundled (no `is:inline`), which Astro
   then converts to either `<script src="_astro/X.js">` or an inline
   `<script type="module">` block (depending on size). The inline
   form needs a `script-src 'sha256-...'` entry — see §11 v6
   "Astro inlines small bundled scripts" trap.
2. **Don't forget the `<noscript>` fallback.** JS-disabled users would
   otherwise never see the CSS. For state-government accessibility,
   that's not acceptable. Synchronous `<link rel="stylesheet">` inside
   `<noscript>` is the right escape hatch.
3. **Don't lose cache-busting** by using a public/ static asset
   path. The hash filename Astro normally generates for imported CSS
   provides cache-busting. Static `public/` assets don't get hashed —
   the URL stays `/<base>/css/github-markdown.css` forever, so future
   edits to the CSS won't bust the browser cache. Workaround: rename
   the file with a version suffix (`github-markdown.v2.css`) on any
   actual content change. github-markdown.css is a vendored copy
   from sindresorhus/github-markdown-css and rarely changes; this is
   acceptable in practice.

**Result on IFVCC:** mobile Lighthouse Perf 94-96 → **100** across
home, resources, news. FCP dropped 2.0-2.2 s → 1.1-1.4 s.
Render-blocking savings dropped 900-1180 ms → 150-270 ms.

### v6 — Lazy-load CSS — when NOT to (the IFVCC CLS reversion)

> Hard correction to the previous sub-section. Pattern above works
> beautifully on short-content pages BUT fails badly on long
> markdown bodies. IFVCC commit 1.0.11 (2026-05-26) reverted the
> github-markdown.css lazy-load after direct-origin Lighthouse audits
> showed CLS 0.266-0.409 on long CMS catch-all pages, dragging
> Lighthouse mobile Perf to 81-86.

**The asymmetry:** Lighthouse weighs CLS heavily (~15% of Perf score
in v10+). CLS > 0.25 is "poor"; CLS > 0.1 is "needs improvement".
Lazy-loading a stylesheet that changes element dimensions —
`list-style-position` shifts, `padding-left` on `<ul>`/`<ol>`,
`line-height` adjustments, heading margins — causes the affected
elements to re-flow when the CSS arrives. The bigger the affected
content, the bigger the shift. Long `.markdown-body` lists shifted
0.265 in IFVCC's case; the prose CSS landing produced 184 px of
displacement on a 50+ row `<ul>`.

**Counter-intuitive result:**

| Strategy | FCP | LCP | CLS | Perf |
|---|---|---|---|---|
| Render-blocking link in `<head>` | 1.4-2.0 s | 2.5-2.6 s | ~0 | 94-96 |
| Lazy-load preload + rel-swap | 1.1-1.4 s | 1.7 s | **0.27-0.41** | **81-86** |

The "faster" lazy strategy scored 10-15 points LOWER on Perf because
CLS dominates above the 0.25 threshold.

**Rule:** lazy-load a stylesheet ONLY when you can guarantee that
applying it changes no element's dimensions. Practical heuristic:

- ✅ Safe to lazy-load: pure cosmetic CSS that changes only color,
  background-color, border-color, box-shadow, transition, transform
  (after first paint), filter, opacity.
- ❌ Unsafe to lazy-load: anything affecting layout — `font-size`,
  `font-family` (different fonts have different metrics), `line-height`,
  `padding`, `margin`, `display`, `position`, `width`, `height`,
  `list-style-position`, `text-indent`, table layout, flex/grid
  geometry.

Typographic libraries like `github-markdown-css` and
`@tailwindcss/typography` mostly do (❌) — line-height + margin
adjustments are their core job. Don't lazy-load them. Same applies
to grid frameworks, button libraries with custom padding, and any
"reset" or "preflight" CSS.

**Detection recipe** — run Lighthouse against your worst-case
content page (the longest markdown body, the most populated table,
etc.), look at the "Avoid large layout shifts" insight. Each shifted
element points to the CSS that arrived too late. If you see web fonts
listed as the cause, that's a different fix (font-display: swap +
preload the font). If you see your own stylesheet as the cause, stop
lazy-loading it.

**Right pattern for typography CSS** (the revert):

```astro
<head>
  <!-- Render-blocking. Costs FCP but keeps CLS at 0. -->
  <link rel="stylesheet" href={`${siteConfig.publicPath}/css/github-markdown.css`} />
</head>
```

If the FCP cost is unacceptable, the next optimization isn't
lazy-loading — it's **inlining the critical-CSS subset** (the
dimensional rules: font-size, line-height, margin/padding for
headings/lists/paragraphs/blockquotes) into a small `<style>` block
in the head, with the cosmetic remainder (colors, borders, code-block
backgrounds) lazy-loaded. That preserves dimensions from first paint
AND defers the cosmetics. Maintaining the split is ongoing work; only
take it on if FCP regression matters at the user level.

### v6 — Trim `@fontsource` to actually-used weights

> Same audit pass. Lightcap's "unused-css-rules" report flagged
> 18-19 KiB of unused CSS per page. Most of it was Tailwind preflight
> + unused utility classes (fundamental — leave alone). But one easy
> win: `@fontsource/roboto/100` (Thin weight) was imported in
> `global.css` but never referenced in any CSS rule across the
> codebase.

Audit recipe (run from repo root):

```sh
# Numeric font-weights actually used in CSS rules + .astro inline styles
grep -rohE 'font-weight:\s*[0-9]+' astro/src --include='*.astro' --include='*.css' --include='*.ts' \
  | grep -oE '[0-9]+' | sort -u

# Currently imported @fontsource weights
grep -oE '@fontsource/[a-z]+/[0-9]+' astro/src/styles/global.css | sort -u
```

Any imported weight that doesn't appear in the used-weights set is
dead weight. Drop the `@import '@fontsource/<family>/<weight>.css'`
line. Saves ~3 KB of render-blocking CSS per dropped weight, per
page. Note: `font-weight: bold` maps to 700 and `normal` to 400; treat
those as already-covered if 400/700 are imported.

---

## 17. Cutover checklist (Vue/Nuxt → Astro)

When you're ready to flip the merge / domain:

1. Tag the last legacy commit (`git tag v1-final`).
2. Verify CSP allows everything actually used in the new build
   (open the deployed page, watch console for blocks).
3. `pnpm check:links` — fix the broken internal links first; add
   Netlify redirects for legacy URLs you can't fix at the source.
4. Run `pnpm audit:lh` against the deployed build, **mobile**.
5. Verify analytics is registering (real network request to your
   Plausible endpoint).
6. **Verify skip-link visually (Tab on the homepage).** Audits won't
   catch this.
7. Smoke-test forms, dropdowns, drawers, search.
8. Merge. Don't delete the legacy branch immediately — keep it
   around for a week in case of rollback.

---

## 18. Package manager: pnpm only (never yarn, never npm)

**This is the hard rule. v1 used yarn / npm interchangeably; v2 does
not.** Every new ICJIA Astro project uses pnpm 10.x, and every
migration from a yarn / npm repo deletes the old lockfile and
regenerates with `pnpm install`. Reasons:

- **Content-addressed store** = faster Netlify cold-cache installs
  and smaller `node_modules`.
- **`packageManager` field** in `package.json` + Netlify corepack
  support = one source of truth for which pnpm runs in CI.
- **Strict postinstall blocking by default** = clear allowlist
  visible in `package.json` (which packages can run native install
  scripts).

### Required `package.json` fields

```json
{
  "packageManager": "pnpm@10.33.0",
  "engines": {
    "node": ">=22.0.0",
    "pnpm": ">=10.0.0"
  },
  "pnpm": {
    "onlyBuiltDependencies": [
      "esbuild",
      "sharp"
    ]
  }
}
```

### Required `netlify.toml` fields

```toml
[build]
  command = "pnpm build"

[build.environment]
  PNPM_VERSION = "10.33.0"   # belt-and-suspenders next to packageManager
```

### Why Sharp specifically

Astro 6's `astro:assets` doesn't bundle Sharp — it ships an adapter
that *uses* Sharp if present. You must `pnpm add sharp` explicitly,
AND list `"sharp"` under `pnpm.onlyBuiltDependencies` so Sharp's
postinstall step (which downloads the native binary) is allowed to run.

Without the allowlist, you'll see:

- `pnpm install` succeeds with a warning about ignored build scripts.
- `pnpm build` fails on the first `<Image>` with `MissingSharp: Could
  not find Sharp.`

The fix is one config line; the symptom is opaque if you don't know
to look.

### Migrating an existing project from yarn / npm

```sh
rm yarn.lock                              # or package-lock.json
# Add the four package.json fields above
pnpm install                              # generates pnpm-lock.yaml
pnpm build                                # confirm Sharp works
```

Then update:

- `netlify.toml`: `command = "pnpm build"`, drop `YARN_VERSION`,
  add `PNPM_VERSION`.
- Any `npm run ...` or `yarn ...` invocations in shell scripts,
  README, CI workflows, etc.
- The dev-server wrapper (§19).

### v6 — `pnpm.overrides` requires a lockfile regen + commit

> Footgun from IFVCC commit 4c58f0d (2026-05-26). Added
> `pnpm.overrides: { "yaml": ">=2.8.3" }` to `astro/package.json`,
> committed and pushed. Netlify's build failed during dependency
> installation with `ERR_PNPM_LOCKFILE_CONFIG_MISMATCH` — pnpm's
> `--frozen-lockfile` (the default install mode on CI) detected that
> the new `overrides` block didn't match what was recorded in
> `pnpm-lock.yaml`.

The fix is documented exactly in pnpm's error message, but it's worth
repeating in the workflow because the failure shape is non-obvious
(it looks like a config error, not a missing-lockfile-update):

```sh
cd astro
pnpm install --no-frozen-lockfile   # regenerate lockfile
git add pnpm-lock.yaml
git commit -m "chore(deps): regen lockfile for <override>"
git push
```

**Rule for any future `pnpm.overrides` / `resolutions` / `peerDependencyRules`
change**: regenerate `pnpm-lock.yaml` LOCALLY in the SAME commit as the
`package.json` change. Otherwise the next CI build (Netlify, GitHub
Actions, anywhere using `--frozen-lockfile`) will fail. Add to the
pre-push mental checklist.

---

## 19. Dev-server wrapper script

> **v5 update — bake every behavior into the canonical script body.**
> v3 split the kill-port logic into a callout snippet separate from
> the §19 script body, and v4 split off the `--port` forwarding fix.
> v5 consolidates: one canonical script with kill-port + cache-clear
> + `--port` forwarding all in the body. **One source of truth, no
> "see the callout above for the missing 20 lines."** Also: the
> script lives at the **repo root**, not under `astro/`, so it can
> be invoked from any working directory without remembering the
> mount point. Cache clear is mandatory on every start — stale
> `.astro/` (Vite cache) and stale `.cache/strapi/` (CMS cache)
> are the top two causes of "why is dev rendering yesterday's
> content?"

Adds a canonical `./start-dev-server` at the repo root so contributors
can launch the dev server from any working directory without
remembering to `cd astro/ && pnpm dev`.

```sh
#!/usr/bin/env bash
# start-dev-server — launch the Astro dev server from the repo root.
#
# What it does:
#   1. Parses --port / --port= (defaults to Astro's standard 4321) and
#      strips those flags from forwarded args (otherwise pnpm exec astro
#      dev would get --port supplied twice).
#   2. SIGTERMs any process already listening on $PORT, waits up to 3s
#      for it to release, SIGKILLs if it didn't. macOS + Linux via lsof.
#   3. Clears stale caches: astro/.astro/ and astro/.cache/strapi/ —
#      stale Strapi cache + Vite cache are the top two causes of "why
#      is dev rendering yesterday's content?"
#   4. Runs `pnpm install` in astro/ if node_modules is missing.
#   5. `exec pnpm exec astro dev --port "$PORT"` (bypasses `pnpm dev`
#      so a hardcoded --port in package.json doesn't conflict).

set -euo pipefail

PORT=4321
ASTRO_DIR="$(cd "$(dirname "$0")" && pwd)/astro"

ARGS=()
while [ $# -gt 0 ]; do
  case "$1" in
    --port)       PORT="$2"; shift 2 ;;
    --port=*)     PORT="${1#--port=}"; shift ;;
    *)            ARGS+=("$1"); shift ;;
  esac
done

if [ ! -d "$ASTRO_DIR" ]; then
  echo "start-dev-server: $ASTRO_DIR not found." >&2
  echo "  The astro/ subfolder doesn't exist yet — has Phase 1 scaffolded it?" >&2
  exit 1
fi

if ! command -v pnpm >/dev/null 2>&1; then
  echo "start-dev-server: pnpm not found." >&2
  echo "  Install via: corepack enable" >&2
  exit 1
fi

if command -v lsof >/dev/null 2>&1; then
  pids=$(lsof -iTCP:"$PORT" -sTCP:LISTEN -nP -t 2>/dev/null || true)
  if [ -n "$pids" ]; then
    echo "start-dev-server: port $PORT busy — SIGTERM to: $pids"
    kill -TERM $pids 2>/dev/null || true
    still=""
    for _ in 1 2 3; do
      sleep 1
      still=$(lsof -iTCP:"$PORT" -sTCP:LISTEN -nP -t 2>/dev/null || true)
      [ -z "$still" ] && break
    done
    if [ -n "$still" ]; then
      echo "start-dev-server: SIGKILL to: $still"
      kill -KILL $still 2>/dev/null || true
      sleep 1
    fi
  fi
fi

echo "start-dev-server: clearing astro/.astro/ and astro/.cache/strapi/"
rm -rf "$ASTRO_DIR/.astro" "$ASTRO_DIR/.cache/strapi" 2>/dev/null || true

cd "$ASTRO_DIR"

if [ ! -d node_modules ]; then
  echo "start-dev-server: running 'pnpm install' first…"
  pnpm install
fi

echo "start-dev-server: launching astro dev on port $PORT"
exec pnpm exec astro dev --port "$PORT" "${ARGS[@]}"
```

Plus a one-line `dev.sh` shim for backward compat:

```sh
#!/usr/bin/env bash
exec "$(dirname "$0")/start-dev-server" "$@"
```

Both `chmod +x`. Flags pass through:

```sh
./start-dev-server --host             # bind to LAN
./start-dev-server --port 5000        # change port
```

---

## 20. Migration deltas — v2 → v3 worklist

If you maintained an Astro project against v2 (the i2i checklist) and
want to bring it forward to v3, the diff-only worklist:

1. **Add `scripts/csp-hashes.mjs`** and run it after every build. Add
   every printed hash to `script-src` in both `netlify.toml` AND
   `public/_headers`. Astro auto-inlines small scripts (Nav, Sidebar,
   etc.) that v2's recipe missed (see §11).
2. **Add `connect-src 'self' https://your-plausible-host` to the CSP.**
   Otherwise Plausible loads but never POSTs an event. Verify with
   the 202-recipe in §9.
3. **If you use `build.format: "file"` (Astro emits flat `.html`),
   strip `.html` from `Astro.url.pathname`** before passing to
   astro-seo's `canonical` prop. Otherwise canonical URLs are
   `…/index.html` and `…/about.html` (see §8).
4. **Switch to `rehype-external-links`** for `target="_blank"` on
   external markdown links. Strip any literal `{target="_blank"}`
   annotations from markdown source — Astro/remark renders them as
   visible text (see §4).
5. **Restore `list-style-type`** on your markdown body — Tailwind
   preflight strips it (see §4).
6. **Add the 1200w intermediate variant** + drop quality to 45-55 on
   grayscale-overlaid heroes (see §5). Mobile DPR-3 picks 1200w
   instead of 1280w, shaving 15-20 KB off the LCP byte.
7. **Make `start-dev-server` auto-kill the port** instead of bailing
   (see §19).
8. **Add `"sharp"` to `pnpm.onlyBuiltDependencies` unconditionally**,
   even if the project uses no `<Image>` directly. Astro 6 pulls it
   transitively and pnpm 10 blocks its postinstall otherwise (see §18).
9. **Document the local-preview vs deployed gap in your perf notes.**
   `pnpm preview` doesn't gzip; Netlify deploy adds 2-3 Perf points.
   A local 96 ≈ a deployed 98 (see §14).
10. **Audit every `<Image widths={[...]}>` for explicit `width`/`height`.**
    Without them, Astro emits the largest srcset variant's dimensions
    to HTML and breaks the layout. Grep your repo for `widths={` and
    confirm each tag pairs it with `width=` + `height=` matching the
    display size (see §5).
11. **Run `pnpm outdated` and bump anything that drifts.** v3 policy is
    "always latest stable" for astro / sitemap / sharp / astro-seo /
    tailwind / rehype-external-links. Major bumps (Astro 6 → 7,
    Tailwind 4 → 5) get a dedicated PR with a fresh audit run.

If you adopt all eleven, you're at the SFS v0.3.x baseline — and at v3
of this checklist.

---

## 21. Migration deltas — v1 → v2 worklist

(Kept for projects still on v1. New projects should jump straight to
v3.)

1. **Astro 5 → 6.** Mostly transparent. Watch for `<Image format=>`
   (singular, was `formats=` plural in the adultredeploy docs).
2. **yarn/npm → pnpm.** See §18. Adds `packageManager` field,
   `engines.pnpm`, `pnpm.onlyBuiltDependencies`. Update
   `netlify.toml` and any wrapper scripts.
3. **Sharp as explicit dep.** `pnpm add sharp` + add to
   `onlyBuiltDependencies` list.
4. **CSP `'unsafe-inline'` → SHA-256 hash.** If you have exactly one
   stable inline executable script (e.g. the URL normalizer in §9),
   hash it. JSON-LD doesn't need a hash. Style-src can keep
   `'unsafe-inline'` if you have many inline `style="…"` attributes;
   move them to scoped `<style>` blocks long-term and drop it.
5. **Add COOP / CORP / X-XSS-Protection: 0** to your security
   headers (§11).
6. **Context-scope any preview-only CSP relaxations** via
   `[[context.deploy-preview.headers]]` instead of putting them in
   the global block.
7. **`PNPM_VERSION` env in `netlify.toml`** as a belt-and-suspenders
   pin (§18).
8. **Port `check-links.mjs`** with the `decodeURIComponent` fix and
   the `canonical`/`alternate` skip-rels (§13). The i2i version is
   ready to copy.
9. **Add `audit-lh.mjs` + `audit-axe.mjs`** if you want one-command
   audits. Process-group cleanup + port probe are the patterns to
   carry forward (§14).
10. **Drop `<link rel="preconnect">` for Plausible** if you have one
    — it's actively harmful for a `defer`'d script (§9).
11. **Upgrade Plausible script** to
    `script.file-downloads.outbound-links.js` for free bundled
    outbound + download tracking (§9).
12. **Add `./start-dev-server`** at the repo root for a friendlier
    contributor entry point (§19).

If you adopt all twelve, you're at the i2i v0.2.0 baseline — and at
v2 of this checklist.

---

## v5 update / deprecation check (last reviewed 2026-05-25, post-DVFR cutover + IFVCC kickoff)

This checklist has grown to ~2600 lines. A periodic check confirms
nothing is stale relative to current Astro + ICJIA practice:

### Still accurate ✓ (carrying forward from v1 through v4)

- **v1 (adultredeploy) patterns still load-bearing:** Alpine.js 3 + `@alpinejs/focus` for Vue 2 SPA reactivity replacement; DrawerNav / DropdownMenu / ListingTable component patterns; multi-stage build script pipeline; OG image generator; `scripts/check-links.mjs` link sweep.
- **v2 (i2i) patterns still load-bearing:** pnpm 10 only — never yarn, never npm; Sharp as explicit dep + `onlyBuiltDependencies` allowlist; SHA-256 hash in `script-src` (drops `'unsafe-inline'`); COOP / CORP / X-XSS-Protection: 0; context-scoped Netlify headers; `@astrojs/sitemap` over hand-rolled.
- **v3 (SFS) patterns still load-bearing:** §5 image-pipeline tiers + DPR-3 sweet-spot widths; §11 CSP hash-every-inline-script + `scripts/csp-hashes.mjs` helper; §8 canonical-URL `format: "file"` bug guard; §9 Plausible `connect-src` requirement; `rehype-external-links` for Astro/remark sites; `list-style-type` restore in `.markdown-body`.
- **v4 (DVFR) patterns still load-bearing:** dev port 4321 (Astro standard); ARIA landmark hygiene; `<details>` for nav dropdowns; xss CommonJS import shape; CSS whitelist for `float`/`clear` (bio image wrap); MDC component detection for Nuxt-sourced sites; Strapi entity-name traps (posts → news, FAQ field renames); cookie banner CLS-safe transform; conditional `<main>` padding (64 home / 96 elsewhere); homepage description min-length 80 chars; OG image build-time pipeline.
- Astro 6.3+, Tailwind 4.3+, pnpm 10, Node 22 LTS — all current.

### Updated by IFVCC (now in "What changed v4 → v5" table)

- **Pagefind replaces Fuse.js** as the recommended static-search library — scales to large sites, PDF-content compatible via [ICJIA/pdf-search-index](https://github.com/ICJIA/pdf-search-index), zero hand-rolled UI plumbing, CSP-friendly. Fuse.js patterns from v3/v4 remain valid for sub-100-page corpora but Pagefind is the default for new migrations.
- **`start-dev-server` canonical body** — bake kill-port + clear-caches + `--port` forwarding into the script itself, not a callout snippet. One source of truth.
- **Strapi v3 schema detection** — older ICJIA Strapi installs (IFVCC) return `{ entity: [...] }` directly (no `data.attributes` wrapper); v3 loader unwraps directly. Detect-and-branch pattern documented.
- **Vue 2 SPA → Astro second confirmation** — IFVCC validates the adultredeploy pattern at smaller scale. Pattern is now battle-tested on two data points; the flagship `icjia.illinois.gov` migration can rely on it without a Vue-2-specific spike.
- **Build-time-embedded password gate (`VUE_APP_GATE`)** — common Vue 2 ICJIA pattern; not real auth. Three handling options documented (drop, port-as-Alpine-island, upgrade-to-real-auth); default is drop.
- **GA + Plausible coexistence in legacy source** — common in older Vue 2 sites. Drop GA on migration; keep Plausible. Zero visual impact.
- **Strapi `home` singleton entity** — older Strapi installs use a `home` singleton instead of a `pages` entry with `slug: "index"`. Loader pattern handles both.
- **Image proxy (`image.icjia.cloud`) removal** — Vue 2 sites often reference a second image proxy beyond the Nuxt-era `NUXT_THUMBOR_KEY`. Drop entirely; Astro `<Image>` + build-time Sharp covers everything.
- **Pixel-perfect fidelity overrides v4 perf optimizations** — when fidelity is the mandate, respect it over the v4 perf-by-default recommendations (MDI font, niceBytes bug, Vuetify spacing nudges). Document each preserved bug in CHANGELOG.
- **Per-phase audit gates (state-gov compliance)** — explicit numeric thresholds: Mobile Lighthouse Perf ≥ 98 on every route, A11y = 100 on every route, axe-core 0 violations, `contrastcap-mcp` on color changes. Capture in `docs/perf/phase<N>-<sha>.md`.
- **`@theme` token calibration to legacy Vuetify** — for Vue 2 + Vuetify 2 → Astro/Tailwind 4 migrations, calibrate `@theme` to Vuetify defaults at Phase 1 (purple darken-1 primary, Vuetify breakpoints overriding Tailwind defaults, Material elevation shadows).
- **Never use `@astrojs/vue` for Vue 2 → Astro** — hard rule. `@astrojs/vue` ships Vue 3 anyway, Vuetify 2 is Vue-2-only, JS budget doubles, pixel-perfect doesn't need Vue, lineage stays consistent. **Functional parity is the must; performance is the goal.**
- **SiteImprove trailing-slash 301 avoidance** — five-layer pattern (trailingSlash: 'always' + sitemap + canonical + **netlify.toml 200-rewrites** + client-side URL normalizer). Eliminates the default Netlify 301 from `/news` → `/news/` that SiteImprove flags. Full pattern in §10a.

### ⚠️ CRITICAL: NO THUMBOR INTEGRATION IN ANY ASTRO MIGRATION

**Hard rule for every ICJIA Astro migration in this lineage:**

**Zero Thumbor references in the deployed Astro site.** No `image.icjia.cloud/<sig>/...` URLs in HTML, CSS, JS, or any runtime path. No `thumbor-url-builder` npm dependency. No `getImageURL()` helper function calls. No `$myApp.config.image.server` / `image.server` siteConfig keys.

**Use Astro's own image algorithms** (Sharp via `astro:assets` `<Image>` for local Tier 1 assets; Sharp via `scripts/fetch-cms-images.mjs` for CMS-hosted Tier 2 images). The pipeline downloads source bytes ONCE from Strapi (or from Thumbor cache when Strapi 404s — a documented edge case), then optimizes locally to WebP variants stored in `public/_cms-img/` keyed by sha256 of the relative path.

**Why this rule:** Thumbor is a separate, ICJIA-internal proxy service with signed URL requirements + cache invalidation semantics that no longer fit the Astro static-deploy model. Astro's Sharp pipeline produces equivalent or better output (WebP vs Thumbor's JPEG/PNG defaults), runs at build time (zero runtime cost), and ships responsive `srcset` variants that Thumbor doesn't generate by itself.

**Verify before every commit / cutover:**
```sh
grep -rn -E "thumbor|image\.icjia\.cloud|getImageURL" astro/src/ astro/public/ astro/scripts/
# Expect: only matches in comments documenting the removal. Zero active code refs.
```

If any active Thumbor reference appears in `astro/src/`, FIX before merging. This is a Phase-1-onwards rule for all future ICJIA migrations (next: infonet, then icjia.illinois.gov flagship).

**Side note on splash_logo.png style assets:** Legacy ICJIA chrome images (e.g., the IFVCC splash logo at `/uploads/splash_logo_e5546dd6c2.png`) often 404 on the raw Strapi URL — Thumbor has the only working cached copy. The migration pattern is **one-time fetch via Thumbor URL, save to `astro/public/<asset>.png`, reference via `${siteConfig.publicPath}/<asset>.png`**. No runtime Thumbor dependency; the asset becomes a static file in the build output.

---

### Updated by IFVCC mid-migration (Phase 1 + Phase 2 + Phase 3 + Phase 4 + Phase 5a + Phase 5b + Phase 6 + Phase 7 audit lessons)

These were caught while running the per-phase audit gates, not from the design spec. Each is a hard lesson for the next migration.

- **`astro/public/_redirects` `/ifvcc/* /:splat 200!`** is REQUIRED for direct-Netlify URL access on path-mounted sites (Phase 1 Wave E). The legacy Vue 2 SPA's `_redirects` `/* /index.html 200` SPA-fallback masked this for the legacy build (any URL returned index.html). Astro static has no SPA fallback — `/ifvcc/foo` 404s without the rewrite. Production via `icjia.illinois.gov/ifvcc/` proxy strips the prefix and never sees this issue; ONLY direct Netlify URLs and the `ifvcc.icjia.cloud` custom domain need it.

- **Skip-link target needs `tabindex="-1"`** for Lighthouse a11y 100 (Phase 1 audit). v3 §12a implied it but didn't make it explicit. Without it: skip-link "works" structurally (target exists), but focus is lost when activated because `<main>` isn't focusable by default. Lighthouse correctly flags this as "Skip links are not focusable." Fix: `<main id="main-content" tabindex="-1">`.

- **Emit skip-link source + target atomically per phase** (Phase 1 audit, Phase 2 fix). Dangling a `<a href="#main-navigation">` skip-link before the target `<nav id="main-navigation">` exists fails the Lighthouse skip-link audit. Either ship both or neither.

- **`@theme` palette MUST be extracted from legacy `src/assets/app.css`, not guessed from Vuetify defaults** (Phase 2 Task 1). DVFR's `@theme` used Vuetify's `#673ab7` as primary. IFVCC's actual primary is `#6c56bc` per `.ifvcc-primary` in `src/assets/app.css`. Pattern: `grep -E "color:|background:|#[0-9a-fA-F]{6}" src/components/App*.vue src/assets/app.css` before writing the `@theme` block. Catch this BEFORE Phase 2 chrome ports so component CSS uses the right tokens first try. Otherwise you ship the chrome, run contrastcap, see no failures (because all-purple still passes), then notice colors are wrong visually only via human review.

- **Icon-font CDN dependency does NOT survive when mobile Perf gate is binding** (Phase 2 Wave C audit, recovery). v5 previously said "MDI font kept per pixel-perfect mandate" — but the gate priority order is: A11y 100 > Perf 98 > pixel-perfect. When `@mdi/font/css/materialdesignicons.css` (~200 KB of icon-font CSS for ~7000 icons) dropped mobile Perf from 99 (Phase 1) to 76 (Phase 2 Wave C), the right answer was: drop `@mdi/font`, replace each used icon (~3 for IFVCC) with inline SVG using the same MDI path data. Pixel-identical rendering, ~200 KB CSS savings, mobile Perf 76 → 97. **Apply this rule going forward.** Typography fonts (Roboto + Raleway) DO survive the Perf gate — those rendering identically truly requires the font file. Icon fonts don't — SVG paths are equivalent.

- **`github-markdown.css` (or any prose stylesheet) belongs in per-page imports, NOT global.css** (Phase 2 audit, recovery). It's ~30 KB of styling that only applies inside `<div class="markdown-body">`. Pages without markdown content pay the render-blocking cost for nothing. Pattern: keep the file at `astro/src/styles/github-markdown.css`, but import it from the frontmatter of pages that actually render CMS bodies (`import '~/styles/github-markdown.css';`). Mobile Perf 97 → 98 on the Phase 2 home (no markdown).

- **Alpine directives REQUIRE `x-data` somewhere on or above the element** (Phase 2 Wave B code review). `@click="$store.something = true"` and `x-bind:aria-expanded` alone do NOT activate Alpine — even when the expression only references `$store`. Add `x-data` to the outer component element (e.g., `<nav id="main-navigation" x-data>` for AppNav). Without `x-data`, the directives render as static HTML attributes and never wire up. Documented in v3 docs at /alpinejs/alpine: "It's important to have a parent element with x-data defined for this to work."

- **Don't bundle the bundle marker** — bundled `<script>import '~/scripts/alpine';</script>` in BaseLayout serves Alpine via `/_astro/<hash>.js`, covered by `script-src 'self'`. Inline `<script is:inline>` would require a sha256 hash per build. Always prefer bundled for Alpine + similar mid-size islands; reserve `is:inline` for the genuine inline-only patterns (URL normalizer, viewport-size detection, etc.).

- **TS strict + un-typed npm packages** — `@alpinejs/focus@3.15.x` ships no `.d.ts`. With Astro 6's strict tsconfig, the bare `import focus from '@alpinejs/focus'` produces TS7016. Don't litter `// @ts-expect-error`; add `astro/src/types/<pkg>.d.ts` with a narrow ambient `declare module` block. Same pattern for any future un-typed deps. Type augmentations (e.g., `Alpine.Stores.drawer`) belong in a separate module-mode `.d.ts` (`export {}` at the end) so they're globally visible without requiring side-effect imports.

- **Permissive Zod schemas (`.nullable().optional()` on every CMS field) held up on FIRST build** against live Strapi v3 — no iterative loosening required across 6 collections + 237 total entries (Phase 3 Wave B). Validates v5 §3's discipline. The cost is a slightly less precise type surface for consumers, but the gain is a build that doesn't break on the first editor's empty-string field. Worth the trade.

- **`pnpm fetch` script naming collides with pnpm's built-in `pnpm fetch` subcommand** (Phase 3 Wave D). `pnpm fetch` (without `run`) invokes pnpm's "fetch packages into virtual store" command, NOT a user script named "fetch". Either name custom scripts `fetch:content` / `fetch:cms` / similar, OR document that users must invoke as `pnpm run fetch`. v5 lesson: avoid bare `fetch`, `install`, `add`, `remove`, `update`, `outdated`, `audit`, `publish` — all pnpm built-ins.

- **Empty-string CMS fields are NOT caught by `??`** (Phase 3 Wave C). The `entry.menuTitle ?? entry.title ?? entry.slug` chain falls through ONLY for `null`/`undefined`. When Strapi's `news` page has `menuTitle: ""` (empty-string saved by an editor), `??` returns the empty string and the link renders with no visible text. Fix: `entry.menuTitle?.trim() || entry.title?.trim() || entry.slug` (uses `||` to treat empty/whitespace as falsy). v5 lesson: every "fall through to next field" chain in CMS-data consumers must use `trim() ||` not `??` semantics. Apply to nav title resolution, page title resolution, alt-text resolution, etc.

- **xss CJS-from-ESM cast pattern (`as unknown as { FilterXSS, getDefaultWhiteList }`)** — validates as documented at runtime under TS strict. Compiles cleanly, runs cleanly. v5 §4 reference example is correct. Pin `xss` at `^1.0.x` in `package.json` — newer majors may break the shape.

- **`github-markdown.css` per-page import gives a 1-2 point mobile Perf cost on pages that render CMS bodies** (Phase 3 audit, vs Phase 2 empty-shell baseline). The architecture is correct (don't load globally; load only where used), but on a content page Astro emits the styles as a separate ~15 KB stylesheet bundle alongside the global one. Cost: render-blocking 2nd CSS request. Phase 7 audit-and-trim should address via subset-and-inline OR concatenation; don't pre-emptively optimize during Phases 3-6. Document as known regression and proceed.

- **Strapi v3 `metaData.menuRank` uniformity bug** — most pages share `menuRank: 100` (Strapi default). Sort tie-breaks fall back to Strapi's natural order, which may not be deterministic across CMS edits. v5 lesson: when nav items need strict ordering, either ensure unique `menuRank` values per item in CMS, or add a deterministic secondary sort key in the loader (e.g., `(a.menuRank ?? 9999) - (b.menuRank ?? 9999) || a.slug.localeCompare(b.slug)`). The latter is safer for sites where editor coordination is loose.

- **Strapi v3 `home` singleton response shape** — `query { home { ... } }` returns the home object directly (NOT in an array). Loader must NOT use the `.data.pages.map()` pattern; just `return data.home;` and pass it to a non-collection consumer. The cheatsheet's coverage of singletons is accurate.

- **Astro `inlineStylesheets: 'auto'` threshold** — inlines stylesheets <4 KB into the HTML; larger ones become separate requests. Useful baseline. Don't try `'always'` (doubles HTML payload + kills cross-page CSS cache). Phase 7 cleanup might add a manual stylesheet-concat post-build step for the global + per-page CSS pair to reclaim the 1-2 perf points lost to two render-blocking files.

- **Zod `.passthrough()` is deprecated in newer Zod versions** — `astro check` emits `ts(6385)` hint. Migration target is `.loose()` in Zod 4+. Non-blocking today; revisit when Astro 7 / newer Zod lands.

- **`BaseLayout` needs a `canonicalOverride?: string` prop for any duplicate-content mirror page** (Phase 4 Wave E). The plan's first attempt used Astro's `slot="head"` injection from the mirror page to inject a competing `<link rel="canonical">`; BaseLayout had no `<slot name="head">`, AND even if it did, two canonical tags is ambiguous to crawlers. The right pattern is a typed prop on BaseLayout that **replaces** (not appends) the auto-derived canonical that astro-seo emits from `Astro.url.pathname`. As a bonus, OG image URL + Twitter card URL that reference the same `canonical` const inherit the override automatically — single source of truth for all outbound canonical references. v5 lesson: any BaseLayout that wraps astro-seo should expose `canonicalOverride?: string` as an optional prop from day 1; cheap insurance against the SiteImprove 301-avoidance pattern needing a mirror page.

- **Sitemap exclusion filters must use exact-suffix regex, NOT substring `includes()`** (Phase 4 Wave E). Phase 1's filter `filter: (page) => !page.includes('/counties/')` silently excluded all 100 `/counties/<slug>/` detail pages too. The trailing-slash-precise form `filter: (page) => !/\/counties\/?$/.test(page)` excludes only the root. v5 lesson: any sitemap exclusion that targets a "root only" path needs a regex anchor — substring matches are too aggressive and the failure mode (silently dropping pages from sitemap) is invisible until SEO traffic data shows the gap. Generalizes to any other "exclude this specific path but keep its children" requirement.

- **`zsh` glob-expands `[slug]` in `git add` paths** (Phase 4 Waves B/C/D, every dynamic-route commit). `git add astro/src/pages/news/[slug]/index.astro` fails on macOS/zsh with `zsh: no matches found`. Required form: single-quoted `git add 'astro/src/pages/news/[slug]/index.astro'`. v5 lesson: any plan that scripts `git add` against an Astro `[slug]` dynamic-route file must quote the path. Document this once in the plan template's "commit recipe" section so future migrations don't trip on the first dynamic-route commit. Affects: news/[slug], events/[slug], circuits/[slug], counties/[slug], publications/[slug], anywhere else `[bracketed-segments]` show up.

- **HTML entities like `&nbsp;` don't decode inside JSX expressions** (Phase 4 Wave D, multiple files). Pattern that breaks: `{`&nbsp;— <time>...`}` renders the literal seven characters `&nbsp;` to the page (the JSX template-literal preserves the raw text). Pattern that works: `{' '}— <time>...` (regular space) or `{' '}— <time>...` (non-breaking space via Unicode escape). v5 lesson: in date-suffix / separator / inline-whitespace patterns inside JSX expressions, prefer Unicode escapes over HTML entities. Or move the entity outside the JSX expression: `&nbsp;<time datetime={...}>{date}</time>` works because raw text is parsed as HTML.

- **`<slot>` fallback content is the right pattern for "callable but optional content"** (Phase 4 Wave A code review). When porting a self-contained Vue SFC like `Banner.vue` (which hardcoded the FVCC mission blurb in its template), the temptation is to make the Astro port a generic `<slot />` wrapper. But top-level pages can't pass slot content — calling `<Banner><slot /></Banner>` from a page renders an empty `<div>`. Fix: write the component as `<div class="banner"><slot>{{default content here}}</slot></div>` so callers can override via slot but absence falls back to a sensible default. v5 lesson: any component port from a "self-contained" Vue SFC should default-fill its slots; reserve empty `<slot />` for components used inside other components (where the caller WILL pass content).

- **Listing-card heading is `h2`, no `aria-label` override on the link wrap** (Phase 4 Wave G audit, recovery). Listing pages typically have only an `<h1>` page title above the card grid. SimpleCard's initial `<h3>` was an h1→h3 skip flagged by Lighthouse `heading-order` (A11y 98 not 100). Fix: card title becomes `<h2>` — the page's h1 → card h2 sequence is correct. Separately: the initial `<a href={href} aria-label="${title} — Read more">` overrode the link's accessible name, hiding the visible text inside (kicker, summary, "Read more →") from screen readers. Lighthouse `label-content-name-mismatch` flagged it (WCAG 2.5.3). Fix: remove the `aria-label` entirely; the accessible name is correctly computed from the link's child text. **Both issues are subtle — axe-core's defaults did NOT flag them** (Lighthouse's a11y audits are stricter than axe-core AA by default). v5 lesson: for any "whole card is a link" listing pattern (the canonical ICJIA card style), the card title must be h2 (not h3, not h4) AND the link wrap must NOT have an `aria-label` override.

- **Per-phase audit reveals deductions the plan didn't predict — record both prediction AND actual** (Phase 4 audit log). Phase 4's plan estimated "Perf ≥ 97 on 8 routes". Actual: 95–97 (range). The Phase 3 audit log had already predicted the Phase 7 cleanup work would be needed, but the Phase 4 plan repeated the optimistic gate. v5 lesson: per-phase audit baselines should record both the prediction the plan made and the actual measured number — discrepancies are the most valuable signal for the v5 lessons log (they identify which gates need recalibration vs which need active cleanup).

- **Single news detail page deducted SEO 92 from CMS-authored generic link text** (Phase 4 audit). The Lighthouse `link-text` audit flags anchors with non-descriptive text ("click here", "read more", single-word descriptive text). On a Phase 4 ported CMS body, this surfaced on exactly one news post out of 100. **Not addressable in Phases 4-6** — it's CMS content, not template code. v5 lesson for Phase 7 cleanup: add a `link-text` audit pass to `markdown.ts` post-process. Either rewrite generic anchor text algorithmically using the surrounding sentence context, OR emit a build-time warning so the CMS editor can fix it. Same surface area where Phase 5's image rewriting and Phase 6's Pagefind metadata already touch — natural place to land.

- **Wave-based subagent dispatch scaled validated at Phase 4** (12 task plan, 5 implementer waves, 5 spec reviews, 5 quality reviews, 1 controller audit wave). 22 subagent invocations + controller-driven verifications = the entire Phase 4 from blank slate to 238-page audit-passing build in one session. v5 confirms: 4-5 logical waves is the right granularity (vs the v4 lesson's "group related single-file creates"). Grouping criteria: same-subdirectory creates, same data shape (e.g., listing + detail per collection), same code-review focus. Wave A → B → C → D → E → F as 6 waves was an alternative — collapsing to 5 (or even 4) waves would have worked too. **Don't dispatch more than 1 implementer wave at a time** — file conflicts are the only failure mode that's hard to recover from. Spec + quality reviews per wave CAN run in parallel (both read the same files; no writes); save ~30s per wave.

- **`pnpm fetch:cms-images` and Astro's content-collection cache have a chicken-and-egg problem on cold deploys** (Phase 5a). The Sharp pipeline reads `.cache/strapi/*.json`, but that's populated as a side effect of `astro build`'s loaders, not by a separate pre-build step. The `pnpm fetch` script in v3 was a stub. Solution: chain the build twice in `netlify.toml` — `pnpm build && pnpm fetch:cms-images && pnpm build`. The first build warms the cache; the second picks up the manifest. Total build time ~2× single-pass (~4s for IFVCC). The alternative — writing a standalone `pnpm fetch` that duplicates the Strapi queries + cache logic into a `.mjs` script — is a bigger upfront commit and accepts code duplication between the script and `~/lib/strapi.ts`. The chained build is YAGNI for small sites; cross over to the duplicated script when build time becomes painful. v5 lesson: every Astro+Strapi+Sharp migration needs to plan for this dance from day 1.

- **Vite/Rollup resolves dynamic `await import('./manifest.json')` STATICALLY at bundle time, NOT at runtime** (Phase 5a Wave D). A missing manifest file crashes the build even when the import is wrapped in try/catch — the catch only handles runtime errors, not bundle-time resolution failures. Fix: ship a `prebuild` lifecycle script that writes `{}` if the file is absent. Wired via `package.json` `"prebuild": "node scripts/ensure-manifest.mjs"`; pnpm honors `pre<script>` for `pnpm build` automatically. v5 lesson: any runtime-generated JSON file imported by a TS component needs a prebuild guard, OR the component should switch to `fs.readFileSync` (which Vite doesn't try to bundle).

- **Mobile Perf gate via image optimization assumes the LCP element is image-shaped** (Phase 5a audit). If the LCP is CSS-blocked text (as IFVCC's is — render-blocking CSS dominates the critical path), Sharp-optimizing images doesn't lift Perf. Phase 5a shipped 95 WebP variants + manifest + responsive `<img srcset>`, but mobile Perf stayed at 93-96 (Phase 4 baseline 95-97). The Lighthouse `image-delivery-insight` flagged 65 KiB savings on body images even after WebP rewrite — root cause is `sizes="(min-width: 960px) 800px, 100vw"` on body images, which at DPR-3 mobile (375 CSS × 3 = 1125 device px) drives the browser to pick the 1280w variant when 640w would visually suffice. v5 lesson: **before promising a Perf number from image optimization, confirm via Lighthouse that LCP is image-shaped on your dominant route**. If LCP is text-shaped, image work doesn't move the gate — the win is in render-blocking CSS work (defer to Phase 7 audit-and-trim per Phase 3 audit).

- **Default Sharp variant set `[640, 960, 1280]` undershoots DPR-3 mobile** (Phase 5a). Adding a `480w` variant for the mobile sweet spot + reducing default `sizes` to the actual rendered width are both candidates if the body-image regression matters. v5 lesson: for body markdown images (constrained to ~800px max-width inside an article), use `sizes="(min-width: 600px) 800px, 100vw"` and consider variant widths `[480, 640, 800, 1280]` to bracket common viewports more honestly. Per-tier Sharp quality (82 for hero splashes, 70-75 for body inline) is also a viable refinement.

- **Verify `splash` field population in `.cache/strapi/*.json` before promising splash-driven Perf wins** (Phase 5a). IFVCC's 100 news posts have 0 splash entries populated despite the schema supporting it. The InfoCard `splash` slot is wired correctly but never fires for current data. v5 lesson: `grep -c '"splash":[^n]' .cache/strapi/*.json` to count posts with non-null splash before predicting splash-driven listing improvements. If the count is 0, defer the splash visual to a CMS-content-cleanup phase.

- **Strapi `/uploads/*` URL extraction needs to match BOTH JSON-string-quoted fields AND markdown-link-embedded URLs** (Phase 5a Wave A regex touch-up). Initial regex required `"..."` boundaries and caught only 4 of 45 URLs. The remaining 41 are embedded inside markdown body strings as `(https://api.cloud/uploads/Foo.png)` link syntax. Fix: `/\/uploads\/[A-Za-z0-9_./-]+\.(?:jpg|jpeg|png|gif|webp)/gi` (no boundaries, case-insensitive). v5 lesson: any Strapi-URL extraction regex must work against the raw JSON text without assumed boundaries — ICJIA content commonly mixes both shapes.

- **Vuetify "card has its own button" port → single `<a>` wrap** (Phase 5a card primitives). Legacy InfoCard.vue had BOTH `@click="$router.push(...)"` on the card AND a `<v-btn :to="...">` inside the card body. The Astro port collapses to a single `<a>` wrap (whole-card link, no aria-label override per Wave G a11y pattern). Same navigation behavior, no nested-interactive a11y violation, simpler markup. v5 lesson: when porting Vuetify cards, default to single-`<a>` wrap; reject the "card + button" duo unless the button does something semantically distinct (e.g., download vs view).

- **CmsImage.astro contract: fallback to raw Strapi URL when manifest is missing or entry not found** (Phase 5a). Critical for dev builds (developer hasn't run `pnpm fetch:cms-images` yet) AND for cold cloud builds where the manifest might exist but be empty (`{}`). Both paths emit a working `<img src=...>`. Trade-off: dev builds and the first Netlify build pass serve unoptimized images (raw Strapi URLs), but the build doesn't break. v5 lesson: any manifest-dependent component should ship with a runtime fallback so the component contract works in the absence of the build artifact.

- **Per-phase audit honesty: record the plan's prediction AND the actual measurement** (Phase 5a). Phase 5a plan promised "Mobile Perf ≥ 98 (closing the Phase 4 95-97 gap via WebP splash optimization)". Actual: Perf 93-96, no lift. The prediction was wrong on three counts (no splash data populated, gap was CSS-shaped not image-shaped, body image rewrite caused -4 regression via sizes-vs-DPR math). The audit log captures both numbers. v5 lesson: per-phase audit baselines should record "predicted X / actual Y / delta Z" — discrepancies are where the lessons live; they recalibrate the next phase's gates.

- **Alpine `x-data` with embedded JS template literals compiles cleanly in Astro** (Phase 5b). EventCalendar's `${'\`${this.year}-${month}\`'}` pattern interpolates a JS template literal containing inner backticks into the outer Astro template; Astro emits the literal text as an HTML attribute and Alpine evaluates it at runtime. `astro check` validates the outer syntax. v5 lesson: for complex Alpine state expressions, write the JS as if it were a `.js` file, wrap in `x-data={\`...\`}`, and let Astro emit verbatim. The escape-quoting (`${'\`...\`'}`) is the standard pattern for inner backticks.

- **Astro `<template x-for>` is the right shape for Alpine-dynamic lists inside `.astro`** (Phase 5b EventCalendar day grid). Static-at-build-time lists DON'T need `<template x-for>` — they render as plain Astro JSX. Lists that need to update when Alpine state changes (e.g., calendar month switching) MUST use `<template x-for="item in arr" :key="item.id">`. v5 lesson: pick `<template x-for>` vs static JSX based on "does Alpine state drive the list contents?" — if yes, x-for; if no, JSX.

- **`role="grid"` is overkill for visual CSS grids with focusable button children** (Phase 5b EventCalendar). axe-core `aria-required-children` violation when a `role="grid"` div has direct cell children (no `role="row"` wrappers). For a calendar where users click days, dropping the role is cleaner than restructuring; buttons inside are independently focusable and announce correctly. v5 lesson: only use `role="grid"` when WAI-ARIA grid keyboard nav (arrow keys cross rows + cells, headers, etc.) is genuinely needed. For "click a thing to do a thing" UIs, plain `<button>` inside a `display: grid` div is correct.

- **Heading-id auto-injection in markdown post-process is essential for TOC consumers** (Phase 5b). Without it, build-time TOC extraction silently returns 0 items and the component renders nothing. Inject ids in the markdown pipeline alongside the existing image rewrite + lazy/decoding pass. `slugify`: lowercase, strip non-alphanum (except spaces/hyphens), trim, spaces→hyphens, collapse repeated hyphens, cap 80 chars. Skip headings that already have ids (CMS-authored ids win). v5 lesson: any TOC consumer needs upstream heading-id injection; ship them together or the TOC silently fails.

- **`.markdown-body a` needs `text-decoration: underline` by default** (Phase 5b audit fix). WCAG 1.4.1 requires non-color distinguishability for inline links. github-markdown.css baseline had `text-decoration: none` (hover-only underline) which axe-core flagged as link-in-text-block. v5 lesson: for any CMS-body styling, the LINK BASELINE must include underline; hover can change color or add a darker tint, but the underline must already be present. Same rule for any `.prose`-like wrapper.

- **Vuetify color palettes don't all pass WCAG AA contrast verbatim** (Phase 5b audit fix). HomeBoxes shipped `#9274F7` from legacy `src/config.json` — on white text gives 3.92:1, failing AA normal (4.5:1). axe-core flagged immediately. Darken to `#7E5EEB` (4.55:1) — same hue family, AA-compliant. v5 lesson: when porting Vuetify color palettes per pixel-perfect mandate, **verify each palette color's contrast against the default text color BEFORE shipping**. Document any pre-existing legacy a11y issues in the spec; don't silently inherit them.

- **Per-phase audit is a discovery tool, not just a gate** (Phase 5b). Three real findings in one wave (HomeBoxes contrast, EventCalendar grid role, markdown link underline) — all surfaced by axe-core, none predicted by the plan. v5 lesson: bake the audit pass into every phase, not just the final cutover. The cost is ~10 minutes per phase; the value is catching genuine a11y regressions before they compound.

- **Conservative Perf predictions in per-phase plans are a feature, not a hedge** (Phase 5b). Plan said "Phase 5b will not lift Perf — Alpine bundle adds JS". Actual home Perf 92 vs Phase 5a's 96 = -4. Consistent with prediction. v5 lesson: predicting "lift" when the gate is binding-CSS-shaped just sets up later surprise. Phase plans should honestly frame perf trajectory; deferring perf wins to dedicated phases (Phase 7 audit-and-trim) keeps the gate calibrated.

- **Pagefind UI is an IIFE bundle, NOT an ESM module** (Phase 6 audit catch). Dynamic `await import('/pagefind/pagefind-ui.js')` doesn't expose `mod.PagefindUI` — Pagefind UI side-effect-registers `window.PagefindUI` at the end of its IIFE. Load via programmatic `<script src>` + `onload` callback, then construct off the global. v5 lesson: before integrating a 3rd-party JS UI library, check the export shape (read the bundle's last 100 bytes or look at docs). ESM named exports → use `import`; IIFE/UMD → use `<script src>` + window global.

- **`?q=` deep-link with PagefindUI 1.5.x via input event dispatch** (Phase 6). PagefindUI's public `triggerSearch()` method may fire before its internal Svelte mount completes, dropping the request. Reliable pattern: set the visible input's `value`, dispatch `new Event('input', { bubbles: true })`, focus the input — Pagefind UI observes its own input via the same path as user typing. 100ms `setTimeout` gives the mount time to settle first. v5 lesson: for any "set state on page load" integration with a 3rd-party UI lib, prefer driving the visible DOM over calling the lib's programmatic API; the lib may not be ready to receive the call.

- **`data-pagefind-body` on `<main>` is essential** (Phase 6). Without it, Pagefind indexes the entire `<body>` including nav/footer/breadcrumb chrome — every page's index gets polluted with nav-link text and "this nav link matches every page" noise dominates search results. v5 lesson: every Pagefind-integrated Astro site must add `data-pagefind-body` to BaseLayout's content container during initial scaffolding.

- **Pagefind's default ranking is the right "conservative fuzzy"** (Phase 6). Prefix + word-boundary matching: type "council" → matches "councils", "Council's", "Council." — but NOT typos like "councl" (no Levenshtein/trigram expansion). For ICJIA-style content (formal language, no user-input typos to recover from), this is the right default. v5 lesson: don't pre-tune Pagefind's `ranking.*` options; the defaults work. Add explicit tuning only if a documented user complaint surfaces.

- **Pagefind UI `<mark>` excerpt highlighting is built-in** (Phase 6). No config needed. CSS via `.search-ui mark { background: #fff3a3; ... }` is enough to style it. v5 lesson: don't reinvent search highlighting — Pagefind ships it; just style the `<mark>` element to match the site's visual identity.

- **`define:vars={{ base }}` injects Astro frontmatter constants into `is:inline` scripts** (Phase 6). Clean and CSP-safe — the resulting script body is hashed by Phase 7's `csp-hashes` sweep. v5 lesson: prefer `define:vars` over inline `<script>document.querySelector('meta[name="base"]').content</script>` patterns for passing build-time values to runtime scripts. The script stays inline + hashable, but the value is build-time interpolated.

- **Pixel-perfect across N routes is multi-iteration work** (Phase 7 visual diff). Phase 5b ports built the COMPONENTS to match legacy source code; Phase 7 visual diff caught that home page ASSEMBLY (`pages/index.astro`) didn't match legacy `Home.vue`'s rendered structure (HomeBoxes commented out, no separate HomeEvents, 2-column bottom). Took 6 commits to converge. v5 lesson: spec must require a "rendered-DOM inspection vs source code" task in Phase 5/6, not just Phase 7. Each non-trivial route needs DOM-inspection-then-restructure. Plan ~2-4 hrs per route for legacy parity, not "just port the component."

- **Legacy CMS-driven content can vary from CMS source code** (Phase 7). `HomeBoxes.vue` has full source code in the repo but the legacy site comments out `<HomeBoxes />` in `Home.vue` line 33 → the rendered boxes user sees are HomeFeatureBoxes, NOT HomeBoxes. v5 lesson: port what's RENDERED on the live legacy site, not what's WRITTEN in component source. Verify with deploy DOM inspection (Chrome DevTools `evaluate_script` works on legacy SPAs; raw `curl` only returns the SPA shell).

- **Thumbor proxy can mask Strapi URL rot** (Phase 7 splash logo fix). The `splash_logo_e5546dd6c2.png` returns 404 on Strapi but legacy renders fine because Thumbor (`image.icjia.cloud/<sig>/...`) has the cached copy. Astro migration drops Thumbor per spec, so the asset was missing. v5 lesson: when an image URL works on legacy but the raw Strapi URL 404s, the source is Thumbor cache — DOWNLOAD ONCE via the Thumbor URL and self-host in `astro/public/<asset>.png` rather than continuing to depend on Thumbor. Reference via `${siteConfig.publicPath}/<asset>.png`.

- **Vuetify color-cycling pattern via `colors[i % length]`** (Phase 7 HomeFeatureBoxes). Legacy uses `<v-col :md="getBoxSize">` + `<v-card :color="getFeatureBoxColor(index)">` where `colors` is a fixed array. Port: encode the palette as a const array, modulo-index it in JSX (`colors[i % colors.length]`). The legacy 3-shade purple cycle (`#442B99 / #533AAD / #5E42B8`) gives visual rhythm — keep it.

- **`position: absolute` for full-width hero overlay beats flexbox centering** (Phase 7 HomeSlider overlay fix). `max-width: 900px` centered via flex caused the brand text to wrap to 5 lines. Switching to `position: absolute; top:80px; left:20px; right:20px` made it span the slide and rendered on a single line matching legacy. v5 lesson: for "full-width banner above background image" overlays, use absolute positioning with left/right insets, NOT flexbox max-width centering.

- **`hideHeading` prop on listing components** (Phase 7 HomePosts refactor). Useful Astro pattern when the parent provides surrounding context (e.g., home 2-column section provides "Latest News" h2; HomePosts renders just the post list). Default `false` keeps backward compatibility for other consumers. v5 lesson: any listing component used in multiple contexts should expose a `hideHeading` (or similar) bare-mode prop so parent contexts can wrap with their own heading.

- **Chrome DevTools `evaluate_script` for legacy DOM inspection** (Phase 7). Legacy Vue 2 SPA renders client-side; `curl https://legacy/page` returns the SPA shell with no rendered content. Chrome DevTools MCP `evaluate_script(() => document.querySelectorAll('img').filter(...))` returns actual rendered DOM. v5 lesson: for legacy SPA inspection during migration, the Chrome DevTools MCP `evaluate_script` is the right tool; raw HTTP fetch is the wrong tool.

### Final pixel-perfect convergence + cutover lessons (post-IFVCC v5.1)

Lessons from the final pixel-perfect stretch + the cutover commit. These were paid for in 8+ iterative commits on the home page alone; capture them so the next migration converges faster.

- **Hero sliders: use CSS `background-image`, NOT `<img>`** (final pixel-perfect home). Vuetify `<v-img>` internally renders as a `<div class="v-image__image v-image__image--cover" style="background-image: url(...)">`. Porting to an `<img width=960 height=374>` with `width:100%` + `object-fit:cover` rendered the image at natural 960px width left-aligned on wide viewports (cover didn't apply reliably across all viewport widths). Switching to inline `style="background-image: url(...)"` + CSS `background-size: cover; background-position: center` gave reliable full-bleed fill on every viewport. v5.1 lesson: any hero / splash banner where you need full-bleed fill regardless of source dimensions, **use background-image not `<img>`**. `<img>` is for content images where intrinsic dimensions matter.

- **Render-time DOM beats source-code reading** (final pixel-perfect home, validating Phase 7 lesson). Legacy `Home.vue` source had `<HomeBoxes>` commented out + no `<HomeEvents>` rendered + a 2-column "Latest News + About" bottom that was easy to miss in the source code. Chrome DevTools `evaluate_script` against the live legacy site surfaced the actual rendered structure in seconds. v5.1 reinforcement: **inspect the rendered DOM before writing any port code**. Write your port to match the rendered shape, not the source code shape.

- **Iterative viewcap diff is the gate** (final stretch). Home page took **8 commits** to converge on pixel-perfect: HomeSlider overlay text, FeatureBoxes cycling colors, drop HomeBoxes + HomeEvents, 2-column bottom layout, splash logo addition, splash logo self-hosting, background-image refactor, sticky footer + breadcrumb flush. None of this was predictable from spec or legacy source alone. v5.1 lesson: budget 6-10 iteration commits for the home page alone; viewcap diff against legacy at every commit; don't claim "home is done" without a side-by-side diff against the production legacy URL.

- **Self-host orphan Strapi assets via one-time Thumbor download** (final stretch). The IFVCC splash logo at `/uploads/splash_logo_e5546dd6c2.png` returns 404 on raw Strapi but Thumbor (`image.icjia.cloud/<sig>/...`) has the only cached copy. Astro migration drops Thumbor per `### ⚠️ CRITICAL: NO THUMBOR INTEGRATION`. The pattern: `curl <Thumbor URL> -o astro/public/<asset>.png`, reference as `${siteConfig.publicPath}/<asset>.png`. Zero runtime Thumbor dependency, asset becomes a static file in the build output. Apply this to logos, splash images, ICJIA chrome assets — anything hardcoded in legacy components that Strapi has lost.

- **Sticky footer pattern via flex column** (final stretch). Short pages (e.g., `/counties/<empty>/`) showed the footer in the middle of the viewport. Fix: `html, body { height: 100% } body { display: flex; flex-direction: column; min-height: 100vh } body > main { flex: 1 1 auto }`. Footer now sticks to viewport bottom on short pages. v5.1 lesson: scaffold this in BaseLayout at the start of Phase 1, not later — debugging mid-migration is harder.

- **`<main>` padding-top = AppNav height only** (final stretch). Earlier IFVCC pattern: `padding-top: 102px` (AppNav 70 + 32 breathing room). User flagged it: "breadcrumb bar is always stuck to bottom of top nav." Changed to `padding-top: 70px` universally — Breadcrumb purple bar now sits flush against AppNav with no gap. Pages without Breadcrumb (e.g., home with HomeSlider) handle their own top-spacing. v5.1 lesson: **70px (AppNav height) only**. Let the Breadcrumb component or page hero provide its own visual separator below.

- **Native `<select>` + Alpine for legacy `v-select` ports** (final pixel-perfect councils). Legacy `Councils.vue` used `<v-select :items="counties" v-model="selectedCounty" item-text="name" item-value="slug">` for the county picker. Native `<select x-model="selected">` with `<option value={slug}>{name}</option>` JSX in Astro frontmatter produces identical behavior + better a11y + zero JS budget beyond Alpine. **Don't reach for a custom Combobox / Listbox unless the legacy explicitly had filtered-autocomplete behavior.** v5.1 lesson: for any legacy `<v-select>` port, native `<select>` + Alpine x-model is the default. Combobox patterns are a Phase 8+ enhancement, not a Phase 4 default.

- **CMS-driven pages with `metaData.showBanner=true`** (final pixel-perfect councils). The `councils` CMS page has empty body but `metaData.showBanner: true`. Legacy `Councils.vue` renders `<Banner v-if="page.metaData.showBanner" />` and `Banner.vue` hardcodes the FVCC mission paragraph. Wave A's `Banner.astro` matches that — default slot content = the FVCC mission blurb. **Render `<Banner />` (not a custom lede paragraph) on any page with `metaData.showBanner=true`.** v5.1 lesson: when the CMS page has `showBanner` flag, the body is intentionally empty + the Banner component owns the intro copy.

- **Legacy CountySingle renders council body markdown inline** (final pixel-perfect counties/<slug>). Legacy CountySingle uses `<CouncilCardByCounty :items="county.councils" :showLink="false" :showNews="true">` — renders each council's full markdown body inline (NOT a list of links). My Phase 4 implementation showed a "Councils serving this county" link list; legacy showed the council body content directly. Fix: fetch full council entries via `getCollection('councils')`, render each with title + "Last updated X ago" + markdown body inside a `<section class="county-article__card">` with a purple chip badge top-right. v5.1 lesson: **county-detail pages render full council content inline, NOT a navigation list**. Same for any "this entity has these child entities" relationship in legacy — port the full inline rendering, not the link list shortcut.

- **Cutover commit shape + tag-before-cutover safety** (v1-final). Per spec §13, the cutover is a single atomic commit on feat/astro-migration that: (1) deletes legacy files, (2) flips netlify.toml `[build]` block, (3) replaces root package.json with a tombstone, (4) updates CHANGELOG. **Before the cutover commit, tag the current master HEAD as `v1-final`** (`git tag v1-final $(git log master -1 --format=%H)`). This gives a one-shot rollback path: `git revert <cutover-sha>` on master OR Netlify dashboard "rollback to deploy" returns production to the v1-final state. IFVCC cutover: 115 files changed, 79,570 lines removed, fast-forward merge to master, push + push tags. v5.1 lesson: **tag legacy master as v1-final BEFORE any cutover work**. The tag is cheap, the safety is enormous.

- **Tombstone root package.json proxies to astro/** (cutover step). Legacy root package.json has Vue 2 deps + Vue CLI build scripts. After cutover, replace with a thin tombstone:
  ```json
  {
    "name": "<repo-name>",
    "version": "1.0.0",
    "private": true,
    "description": "Source lives in astro/. Run dev/build from astro/.",
    "scripts": {
      "dev": "cd astro && pnpm dev",
      "build": "cd astro && pnpm build && pnpm fetch:cms-images && pnpm build && pnpm pagefind && pnpm og-image",
      "preview": "cd astro && pnpm preview",
      "check": "cd astro && pnpm check"
    },
    "engines": { "node": ">=22.0.0", "pnpm": ">=10.0.0" },
    "packageManager": "pnpm@10.33.0"
  }
  ```
  Devs who type `npm run build` from repo root still get a working build via the proxy. v5.1 lesson: this is the canonical tombstone shape; copy verbatim.

- **Drop `[context.branch-deploy]` + `[context.deploy-preview]` blocks at cutover** (netlify.toml). Pre-cutover, those blocks were the only place Astro was being built. Post-cutover, the production `[build]` block builds Astro for BOTH master AND branch deploys, so the per-context blocks are redundant. Drop them. v5.1 lesson: minimize netlify.toml surface area after cutover.

- **`gh repo rename` preserves redirects** (final stretch). User asked to rename `icjia-ifvcc-2021` → `icjia-ifvcc-2026` post-cutover (the legacy name had a year suffix that no longer matched). `gh repo rename <new-name> --repo ICJIA/<old-name> --yes` does it; old URL keeps redirecting (`gh repo view ICJIA/<old-name>` returns the new repo's data); external links don't break. Update the local remote URL afterwards: `git remote set-url origin https://github.com/<org>/<new-name>.git`. v5.1 lesson: don't avoid a needed repo rename for fear of broken links — GitHub handles redirects automatically.

- **Fast-forward merge for cutover when feat fully includes master** (final stretch). IFVCC's feat/astro-migration was based on master and accumulated 43 commits on top, with no parallel master commits during the migration. `git checkout master && git merge --ff-only feat/astro-migration` worked cleanly with no merge commit. v5.1 lesson: keep migration branches strictly ahead of master (no parallel work on master during migration) so the cutover merge is a fast-forward, not a 3-way merge with conflict potential.

- **Per-phase audit log accumulates organically — IS the source of truth** (final stretch retrospective). Plans documented predictions; audit logs documented actuals. When predictions and actuals diverged (Phase 4 promised Perf ≥ 97, hit 95-97; Phase 5a promised Perf ≥ 98, hit 93-96; home page took 6+ commits to converge vs 1 in the plan), the audit log captured the truth + the lesson. v5.1 lesson: when the spec says one thing and the audit log says another, **the audit log is right**. Specs are predictions; audit logs are evidence.

- **The LLM-migration-prompt is the canonical bootstrap artifact for next migration** (post-IFVCC). `docs/llm-migration-prompt.md` was created as a self-contained prompt for kicking off the next ICJIA migration (infonet, then flagship). It references v5 + Strapi cheatsheet + reference migration repos + 10 hard rules + 7-phase plan + 12 anti-patterns. v5.1 lesson: at the end of every major migration, harvest the bootstrap prompt for the next one. The prompt is more useful than a generic "best practices" doc because it's directly executable.

### Deprecated (nothing — all entries still load-bearing; one row 245 updated above to reconcile with the icon-font perf-override exception)

- The v1 → v2 + v2 → v3 + v3 → v4 + v4 → v5 + v5 → v6 changelog sections document the *why* behind every current rule. The "always pnpm, never yarn" rule (v1 → v2), "Pagefind for static search" (v4 → v5), and "OG image SVG → PNG with `font-family='sans-serif'` only" (v5 → v6) are all still load-bearing in their original form.
- The "Why migrate (two-part case)" framing at the top remains current and worth keeping.

### Companion docs (current as of v6.3.0)

- `docs/astro-conversion-checklist-v6.3.md` — this file. The canonical checklist. **Use for any new ICJIA migration (next: infonet).**
- `docs/icjia-strapi-cheatsheet.md` — Strapi-specific reference. **Read first** when starting a new ICJIA migration. Update with the v3 unwrap lane when migrating each site.
- `docs/superpowers/specs/<date>-astro-migration-design.md` — per-site spec template. IFVCC's lives at `docs/superpowers/specs/2026-05-25-astro-migration-design.md`.
- `docs/superpowers/plans/<date>-astro-migration-phase{1..7}.md` — phase-by-phase implementation plans (Phase 1-3 explicit; Phase 4-7 dispatched inline once patterns are established).
- `docs/perf/phase<N>-<sha>.md` — per-phase Lighthouse + axe-core baselines. Useful as the next migration's "am I on track?" check.

---

## SEO + OG image + CSP scope — common confusions

Three issues that surfaced from MetaPeek + AI Readiness audits during DVFR's post-cutover review. Each is a teaching point worth surfacing here.

### 1. OG image URL verification after a public/ path change

When the OG image moves between locations (e.g., from `/og-image.png` in Phase 1-2 to `/img/og-image.png` in Phase 7's build pipeline), **verify the `og:image` meta tag in the rendered HTML actually contains the new path**. Otherwise:

- External crawlers (Facebook, Slack, X/Twitter, LinkedIn) fetch the URL in the meta tag.
- If the URL is wrong (still pointing at the deleted path), they get a 404.
- The OG preview shows "no image" even though the new image is reachable at the correct URL.

DVFR shipped this exact bug on first cutover: the Phase 7 cleanup deleted the old `public/og-image.png` BUT `siteConfig.ts` still pointed at it (a silent Edit-drop during the merge sequence). Caught by a third-party OG-checker tool ("can't find the OG image").

**Verification recipe:**
```sh
curl -fsS https://<prod-url>/ | grep -oE '<meta[^>]*og:image[^>]*>'
# expect: <meta property="og:image" content="https://<prod-url>/img/og-image.png">

curl -fsSI https://<prod-url>/img/og-image.png | head -2
# expect: HTTP/2 200
```

If the URL is wrong in the meta tag, fix `siteConfig.ts` and redeploy. After the redeploy, **external crawlers cache aggressively** (Facebook for hours; Slack ~30 min). Force a re-scrape via:

- Facebook: [Sharing Debugger](https://developers.facebook.com/tools/debug/) → "Scrape Again"
- LinkedIn: [Post Inspector](https://www.linkedin.com/post-inspector/)
- Twitter/X: [Card Validator](https://cards-dev.twitter.com/validator) (rarely needed now)
- Slack: no debugger; cache TTL is shorter (~30 min)
- iMessage: caches at the OS level; clear with `defaults delete com.apple.MobileSMS`

### 2. Homepage meta description minimum 80 characters

MetaPeek + AI Readiness checks flag descriptions under 80 characters as **"too short for meaningful AI summarization."** Score deductions on MetaPeek (94/100 → A grade); FAIL on AI Readiness.

ICJIA's Strapi `index` page summary tends to be a short label like "Illinois DVFR Home" (~20-50 chars) — useful as an internal CMS label, useless for OG / SEO. The longer `siteConfig.description` (~150+ chars) is what should ship.

Fix in `src/pages/index.astro`:

```ts
// Fall back to siteConfig.description when the CMS summary is too
// short for SEO/AI summarization.
const description =
  entry?.data.summary && entry.data.summary.length >= 80
    ? entry.data.summary
    : undefined;
// `undefined` lets HeadMeta use its default = siteConfig.description.
```

Other pages (`/about/`, `/contact/`, etc.) typically have CMS summaries ≥80 chars and don't need this guard — only the homepage is the outlier. But if you have other pages with short summaries, apply the same `length >= 80` guard in the catch-all template.

### 3. CSP scope: it applies to the user's browser, NOT to external scrapers

A common question during cutover review: **"the OG image isn't showing in Slack previews — is CSP blocking it?"**

**Answer: no.** CSP `img-src` restricts what THIS PAGE can render IN A USER'S BROWSER. External crawlers (Facebook, LinkedIn, Slack, Twitter, Google, AI bots) fetch the OG image URL via direct HTTP request — they don't visit your page in a browser, so your CSP doesn't apply to them.

If a scraper "can't find" the OG image, the cause is almost always one of:

1. **Wrong URL in the og:image meta tag** (see "OG image URL verification" above).
2. **The URL 404s** when fetched directly (`curl -fsSI <url>`).
3. **The scraper's cache is stale** — force a re-scrape via the platform's debug tool.
4. **The image is too large** — some scrapers reject images >5 MB. DVFR's PNG is 99 KB, well under any limit.
5. **The image is the wrong format** — Twitter/Facebook prefer PNG/JPG over SVG. Always ship a PNG.

**CSP is a red herring 99% of the time for OG-image issues.** Don't relax `img-src` thinking it'll fix social previews — verify the meta-tag URL and the file's HTTP status first.

CSP IS relevant when:
- A user opens your page in a browser and your CSP-blocked external image fails to render. Check DevTools Console for `Refused to load the image because it violates the following Content Security Policy directive`.
- Your CMS embeds images from a third-party host not in `img-src` (Strapi's `<cms>.icjia-api.cloud` IS allowed; anything else may not be). The fix is to add the third-party host to `img-src` OR to download the image at build time via the Tier 2 pipeline.

CSP is NOT relevant for:
- Social-media OG previews
- Google Search image indexing
- AI-bot scraping (ChatGPT, Claude, Perplexity)
- Any external HTTP fetch of your assets

Document this distinction loudly in any team-facing notes; "is it CSP?" gets asked at every cutover.

### 4. `Cross-Origin-Resource-Policy: cross-origin` for public sites (NOT same-origin)

**The v3 §11 example uses `Cross-Origin-Resource-Policy: same-origin`** which is wrong for public-facing ICJIA sites. CORP `same-origin` tells modern browsers to refuse embedding our resources from any other origin — which **blocks external OG / SEO scrapers from loading the image**, even though the URL is reachable via direct HTTP.

DVFR caught this immediately post-cutover when MetaPeek (`metapeek.icjia.app`) reported "Could not load image" for `/img/og-image.png`. The image was 200 OK on curl. The header `Cross-Origin-Resource-Policy: same-origin` was the cause — MetaPeek's browser-based scraper respects CORP.

**Use `Cross-Origin-Resource-Policy: cross-origin` for any public ICJIA site whose assets need to be embedded by other origins.** That includes:

- OG / Twitter card images (scraped by Facebook, LinkedIn, X, Slack, iMessage, MetaPeek, GoogleBot)
- Any logo / branding image hotlinked from another ICJIA site
- Public PDFs linked from email or third-party docs

```toml
# netlify.toml
[[headers]]
  for = "/*"
  [headers.values]
    Cross-Origin-Opener-Policy   = "same-origin"      # keeps window isolation
    Cross-Origin-Resource-Policy = "cross-origin"     # ← allow external embeds
```

COOP (`Cross-Origin-Opener-Policy`) is fine to keep at `same-origin` — it only affects window/iframe isolation between your own pages, not external scrapers. The two headers are orthogonal.

**Sites where `same-origin` CORP is appropriate:** internal dashboards, authenticated SPAs, sites with sensitive user data. None of the public ICJIA `.illinois.gov` sites fall into this category — they're all designed for maximum shareability.

After fixing CORP, **force a re-scrape** on each platform that previously failed:
- MetaPeek: just re-check the URL (no cache to clear)
- Facebook: [Sharing Debugger](https://developers.facebook.com/tools/debug/) → "Scrape Again"
- LinkedIn: [Post Inspector](https://www.linkedin.com/post-inspector/)
- Slack: re-share the link (cache TTL ~30 min)
- iMessage: clear via `defaults delete com.apple.MobileSMS`

---

## Infonet (2026-05-26) — Phase 1 lessons (v6.1 increment)

### Skip-link forward-reference rule

A skip-link's `href` must point to an element that EXISTS in the DOM in the phase the skip-link ships. Phase 1 only emits the `<main id="main-content">` landmark — the `<nav id="main-navigation">` element doesn't land until Phase 2 ships AppNav.

If BaseLayout Phase 1 includes `<a href="#main-navigation" class="skip-link">Skip to navigation</a>`, Lighthouse's `skip-link` best-practice audit fails with "No skip link target" and mobile A11y drops from 100 to 97 — exit-gate fail.

**Fix:** ship Phase 1 BaseLayout with ONE skip-link (`#main-content`). Add the `#main-navigation` skip-link in Phase 2 when the nav lands. Document this with a comment in the BaseLayout so the Phase 2 implementer remembers to reintroduce it.

axe-core AA does NOT catch this (it's a best-practice rule, not an A/AA rule). Lighthouse does. Both gates must pass.

### Astro 6 emits flat `dist/404.html` (NOT `dist/404/index.html`)

With `trailingSlash: 'always'` in `astro.config.ts`, intuition says 404 should emit as `dist/404/index.html`. It does not — Astro 6 always emits 404 as a flat file. Netlify still serves it for unmatched routes. No remediation needed; just don't reference `dist/404/index.html` in audit logs or build verification scripts.

### Netlify GitHub App not always installed

If a repo wired to Netlify hasn't had the Netlify GitHub App explicitly installed, branch deploys still run, but no commit-status updates are posted to GitHub. `gh api repos/<org>/<repo>/commits/<sha>/statuses` returns `[]` indefinitely.

**Fallback:** run per-phase audits against `astro preview` on `http://localhost:4322/` — it serves the actual `dist/` build artifact (identical to what Netlify deploys). The Lighthouse/axe/viewcap results are unaffected by where the build is served from.

**Long-term:** request the user install the Netlify GitHub App so per-phase audits can hit the branch preview URL directly (matches production network conditions more closely than local preview).

### Infonet Phase 2 lessons (v6.1 increment)

#### CSS class responsive-visibility + inline display = specificity collision

**Symptom:** `.md-show { display: none }` (intended to hide an element on mobile) doesn't work when the same element also has inline `style="display: inline-flex"`. Inline styles beat external CSS — the element renders on mobile despite the class.

**Pattern that breaks:**
```html
<a class="md-show" style="display: inline-flex; align-items: center;">...</a>
<style>
  .md-show { display: none; }                                       /* loses to inline */
  @media (min-width: 960px) { .md-show { display: inline-flex; } }
</style>
```

**Fix:** never mix inline `display:` with a CSS class that controls visibility. Either:
- (a) Use `!important` on the base hidden state: `.md-show { display: none !important; }` (matched by the media query rule using `!important` too)
- (b) Drop the inline `display:` entirely; let the CSS class handle both `display: inline-flex` (when shown) and `display: none` (when hidden)

Option (a) is what Infonet's AppNav uses. Easy to spot when reviewing a responsive component — search inline styles for `display:` and confirm no class is fighting it.

#### `position: fixed` chrome needs body padding-top

When AppNav is `position: fixed; top: 0; height: 150px`, the body content overlaps behind it (the nav is removed from flow). Fix: add `body { padding-top: 150px }` so subsequent flow elements (Breadcrumb, `<main>`, AppFooter) start below the nav. Tagging the body via BaseLayout's `<style is:global>` block keeps the rule scoped to every page that uses BaseLayout.

#### Responsive nav-item visibility may vary by viewport range

Legacy Vuetify navigation may show inline nav items only at width thresholds wider than the framework's `md` breakpoint (e.g., legacy at 1072px width hides items that appear at 1280px+). When porting, inspect the legacy rendered DOM at MULTIPLE viewport widths (375 / 768 / 1024 / 1280 / 1440 / 1920) to identify all the breakpoints where the responsive layout changes. The Vue/Vuetify port often "always-visible from 960" while legacy was "always-visible from 1280" — a subtle but visible diff.


### Infonet Phase 4 lessons (v6.1 increment)

#### `@mdi/font` CSS is render-blocking dead weight if you use inline SVG

`@mdi/font/css/materialdesignicons.css` ships **88 KiB unused CSS** when components use inline SVG icons (the norm in v6+ ports). Importing the font CSS just for visual fallback OR a few decorative classes is wasteful — Lighthouse counts every byte against render-blocking.

**Rule:** if no component uses `<i class="mdi mdi-foo">`, do NOT import the MDI font CSS in `global.css`. Leave it as a commented `@import` so future phases can re-enable if needed.

**Impact (measured on Infonet home, mobile):** render-blocking 1,650 ms → 300 ms, mobile Perf 92 → 100.

#### Listings need `<h2>` cards under the page `<h1>`

`SimpleCard` (or any list-card component) should use `<h2>` not `<h3>`. Listing pages have `<h1>page title</h1>` and each card title is one level below. Skipping h2 → h3 fails Lighthouse `heading-order` audit (A11y drops to 98 from 100).

#### Short pages cause footer CLS unless `<main>` reserves min-height

When a page's content is shorter than the viewport, the AppFooter renders above the fold. Below-fold elements (markdown images, dynamic widgets) loading later push the document height up, sliding the visible footer down — a measurable Cumulative Layout Shift.

**Fix:** `<main style="min-height: 70vh">` in BaseLayout (or wherever the page outer wrapper lives). Reserves viewport-height so the footer always sits below the fold during initial paint.

**Impact (Infonet news detail, mobile):** CLS 0.17 → 0.00, Perf 85 → 100.

#### Strapi `pages` may include reserved-slug collisions

Strapi sites that store the home page body content as a `page` entity often use `slug: "index"` for that storage. A `[...slug]` catch-all without this slug in `reservedSlugs` will emit `/index/index.html` redundantly alongside the actual home.

**Fix:** add `'index'` to `siteConfig.reservedSlugs`. Same applies to any other slug that mirrors a static route (`'home'`, `'404'`, etc.). Verify via `ls dist/` after first catch-all build.


### Infonet Phase 5a lessons (v6.1 increment)

#### Font-weight tax in `@fontsource/*` imports

Each `@fontsource/<family>/<weight>.css` import ships ~5–10 KB of CSS into the bundle. Default-installing 5+ weights per family is wasteful when only 3-4 are used in the actual UI.

**Audit step at end of Phase 5a (or Phase 7):** open the CSS bundle (`dist/_astro/*.css`), grep `font-weight:` and verify each weight present is genuinely used. Drop unused weights from `global.css` `@import` statements.

**Impact (Infonet):** dropping Lato 100/300, Raleway 100/300, Roboto 100 shrank the CSS bundle from 112 KB → 85 KB. Home mobile Perf 97 → 99.

#### Astro bundles all CSS into one shared route bundle

Astro (with `inlineStylesheets: 'auto'` and a large total CSS surface) emits ONE `_astro/<hash>.css` linked from every HTML page — even component CSS that only one route uses ends up in the shared bundle.

Per-route CSS splitting requires:
- Manual `<link rel="stylesheet">` in component frontmatter (Astro emits it scoped to the route), OR
- Defer non-critical CSS via `<link rel="stylesheet" media="print" onload="this.media='all'">` hack

For v6 sites, the right inflection point to optimize this is Phase 7 (post-Pagefind, last perf push). Earlier phases can accept ~3-5 mobile Perf points spent on shared-bundle bloat.

#### Strapi image fields may be empty

Many Strapi sites have fields like `splash.data` or `featuredImage.data` defined in the schema but unpopulated by editors. CmsImage / SplashNews / InfoCard must render gracefully without images (text-only). Don't assume every post has a splash; design the card with a no-image fallback.


### Infonet (2026-05-27) — post-cutover Lighthouse polish (v6.2 increment)

Lessons captured after Infonet landed in `main`, during the post-deploy audit + iteration cycle (releases 3.0.0 → 3.2.2).

#### **HARD RULE — Tailwind utility classes for ALL responsive layout (especially flex/grid)**

Every layout that mirrors a legacy Vuetify `<v-row><v-col>`, `<v-container>`, or `d-flex`/`d-grid` pattern **must** be ported to Tailwind utility classes — NOT to handwritten scoped CSS grids or hardcoded media queries. Reasons, in priority order:

1. **Responsivity is non-negotiable.** The flagship + every ICJIA site is consumed on mobile (320–414 px), tablet (768–960 px), small desktop (960–1280 px), and ultrawide (1280–1920+ px). Tailwind's responsive prefixes (`sm:` 640, `md:` 768, `lg:` 1024, `xl:` 1280, `2xl:` 1536) make the breakpoint chain visible at the markup level. Scoped CSS hides breakpoints inside `<style>` blocks where they get out of sync as layouts evolve.
2. **Pixel-perfect parity is the cutover gate.** The pixel-perfect mandate (Hard Rule #4) means every layout must match legacy at every breakpoint. Tailwind utilities make the breakpoint declarations explicit and auditable — a single grep finds every place a column count changes.
3. **`min-[960px]:` arbitrary breakpoint matches Vuetify md.** Vuetify's `md` breakpoint is **960 px**, not Tailwind's default 768 px. Use the arbitrary-value syntax for any layout that has to switch at the same threshold legacy used. This is the single most common pixel-perfect drift source if missed.
4. **Migration velocity.** When the next dev (or LLM) reads `grid grid-cols-1 min-[960px]:grid-cols-2 gap-5 items-start`, they read the entire responsive contract in one line. Scoped CSS requires reading a `<style>` block + matching the class name + reading media queries. Multi-step parsing slows every future edit.

**Canonical patterns to memorize:**

```html
<!-- v-row + v-col cols=12 md=6 → 1 col below 960px, 2 cols at/above -->
<div class="grid grid-cols-1 min-[960px]:grid-cols-2 gap-5">
  <div>left col</div>
  <div>right col</div>
</div>

<!-- v-row + v-col cols=12 md=6 lg=4 → 1/2/3 cols at breakpoints -->
<div class="grid grid-cols-1 min-[960px]:grid-cols-2 min-[1264px]:grid-cols-3 gap-6">
  <div>card</div><div>card</div><div>card</div>
</div>

<!-- v-row align="center" justify="space-between" → flex with responsive stack -->
<div class="flex flex-col min-[960px]:flex-row items-start min-[960px]:items-center justify-between gap-4">
  <h2>title left</h2>
  <a class="btn">cta right</a>
</div>

<!-- v-container fluid → no max-width constraint (legacy default for ICJIA) -->
<section class="w-full px-4 min-[960px]:px-8 py-8">…</section>

<!-- v-container (constrained) → 1200 px cap, centered, padded -->
<section class="mx-auto max-w-[1200px] px-4 min-[960px]:px-8 py-8">…</section>

<!-- Span all columns inside a multi-col grid (for page h2 above a 2-col body) -->
<div class="grid grid-cols-1 min-[960px]:grid-cols-2">
  <h2 class="col-span-full">spans both columns</h2>
  <div>left</div>
  <div>right</div>
</div>
```

**What stays in scoped `<style>`:** per-component typography (font-size, line-height, color when it deviates from `@theme`), hover/focus states unique to one component, background colors / borders unique to one card variant. *Structure* → utilities. *Expression* → scoped CSS.

**Verification gate:** after porting each component, do a viewcap diff at **five viewport widths** (375, 768, 1024, 1280, 1920) against the legacy URL. If any breakpoint differs by more than 1–2 px in layout, the utility classes are wrong. Common fixes:
- Used `md:` (768) where you should have used `min-[960px]:` (matches legacy Vuetify md)
- Forgot `gap-N` (Vuetify v-row default gutter is 12 px = `gap-3`)
- Used `flex` for what should be `grid` (or vice versa); Vuetify v-row → grid when cols are equal-width, flex when content-driven
- Missed `items-start` (Vuetify defaults to top-aligned, Tailwind grid stretches by default)

**Anti-pattern (do not ship):**

```astro
<!-- BAD: hidden breakpoints, hidden gutter, will drift -->
<div class="home-grid">
  <div>left</div>
  <div>right</div>
</div>
<style>
  .home-grid { display: grid; grid-template-columns: 1fr; gap: 20px; }
  @media (min-width: 960px) {
    .home-grid { grid-template-columns: 1fr 1fr; }
  }
</style>
```

```astro
<!-- GOOD: every responsive decision visible in markup -->
<div class="grid grid-cols-1 min-[960px]:grid-cols-2 gap-5 items-start">
  <div>left</div>
  <div>right</div>
</div>
```

If a layout genuinely cannot be expressed in Tailwind utilities (rare — usually only true for `position: sticky` interactions with z-index layering or complex `grid-template-areas`), document the exception inline with a comment explaining WHY utilities don't fit.

#### `inlineStylesheets: 'always'` is a text-LCP vs image-LCP trade-off

Astro's `build.inlineStylesheets` default `'auto'` inlines stylesheets under ~4 KiB and externalizes everything bigger. Flipping to `'always'` inlines the entire bundled CSS (~35 KiB for Infonet) into every page's `<head>`, eliminating the render-blocking `<link rel="stylesheet">` request.

**This is a per-page win or loss depending on the LCP candidate.**

| LCP shape | Effect of `'always'` |
|---|---|
| **Text** (markdown body, h1, paragraph) | **+5 to +10 perf** — text can't paint until CSS applies, so eliminating the CSS round-trip moves LCP closer to FCP. /about/ desktop went 89 → 99. |
| **Image** (splash, hero img, photo gallery) | **−3 to −5 perf on mobile, neutral on desktop** — the image fetch races CSS in parallel, so render-blocking CSS isn't on the critical path. Inlining 35 KiB of CSS grows the HTML, pushing it past a single TCP slow-start window on throttled mobile, which delays the byte at which the browser discovers the `<img>` tag. /screenshots/ mobile went 97 → 94; / mobile FCP regressed 1.4 s → 2.0 s. |

**Default: `'auto'`.** It's the right call for browse traffic — the bundle is cached once across navigations, and warm-cache hits cost zero bytes. Only flip to `'always'` if EVERY major route is text-LCP and you've measured a net gain.

If a single text-LCP page (e.g. /about/) is the only laggard, the right scoped fix is per-page critical CSS extraction, not a global inline flip. Treat critical CSS as a Phase 7 polish task — don't chase it earlier.

#### Preload critical `@fontsource` woff2 to eliminate font-swap CLS on text-heavy pages

`@fontsource/*` packages are imported via `@import '@fontsource/<family>/<weight>.css'` in `src/styles/global.css`. Each of those CSS files defines a `@font-face` rule whose `url(./files/...woff2)` is rewritten by Vite to a hashed `/_astro/<family>-latin-<weight>-normal.<hash>.woff2`. The catch: the browser doesn't discover these URLs until it parses the bundled `global.css`. Result: on text-heavy pages, web fonts arrive well after FCP, swap in via `font-display: swap`, and reflow the body — CLS lands around **0.12–0.13** (above the "good" threshold of 0.1) and costs ~4–5 mobile perf points.

The fix is three `<link rel="preload">` tags in `BaseLayout.astro` using Vite `?url` imports of the same woff2 files the `@font-face` rules reference:

```astro
---
import latoRegularUrl from '@fontsource/lato/files/lato-latin-400-normal.woff2?url';
import latoBoldUrl from '@fontsource/lato/files/lato-latin-700-normal.woff2?url';
import robotoRegularUrl from '@fontsource/roboto/files/roboto-latin-400-normal.woff2?url';
---
<link rel="preload" as="font" type="font/woff2" href={latoRegularUrl} crossorigin="anonymous" />
<link rel="preload" as="font" type="font/woff2" href={latoBoldUrl} crossorigin="anonymous" />
<link rel="preload" as="font" type="font/woff2" href={robotoRegularUrl} crossorigin="anonymous" />
```

**Why this dedupes with the @fontsource @import chain:** Vite content-hashes assets by file content, so `?url` resolves to the byte-identical `/_astro/lato-latin-400-normal.<hash>.woff2` the CSS rule later requests. The `crossorigin="anonymous"` attribute matches the request mode the CSS-driven font fetch uses (fonts always go anonymous CORS). Browser sees the preload link in `<head>`, starts fetching in parallel with CSS, then when the `@font-face` rule resolves it finds the response already cached — one fetch, no duplicate, font available before/at FCP.

**Pick the highest-impact 2–3 weights only.** Preloading every weight steals bandwidth from CSS/HTML and regresses FCP. The heuristic: read Lighthouse's "Avoid large layout shifts" trace — every `cause: "Web font loaded"` URL is a candidate. Preload the 2–3 most cited, leave the rest to fall back gracefully. For Infonet that was Lato 400 (UI body), Lato 700 (heading), Roboto 400 (markdown body). Lato 900 (h1 only) and Roboto 700 (markdown bold) shifted less and weren't worth the bandwidth.

**Impact (Infonet `/partners/` 2026-05-27):** mobile Perf **95 → 100**, CLS dropped off the failure list entirely. `/news/` mobile 100, `/data-and-publications/` 99 (image-LCP issue, unrelated), `/` mobile 98 (render-blocking + unused JS, unrelated). No regression on any audited route.

**When NOT to also add `size-adjust` / `ascent-override` fallback `@font-face`:** the original plan was to follow this with Capsize-tuned fallback fonts. Skipped after measuring — preload alone got CLS into the green band, so the size-adjust work would yield zero measurable Lighthouse improvement while introducing visual-drift risk (slightly off size-adjust values cause subtle text reflow on edge cases: long unbroken words, italic runs, narrow viewports). **Reach for size-adjust fallback only if preload doesn't get you to CLS ≤ 0.1.** Order is: preload first → measure → size-adjust only if still failing.

#### `@fontsource` subset-only imports cut the render-blocking CSS bundle in half

`@fontsource/<family>/<weight>.css` ships SIX-to-SEVEN Unicode subsets (latin, latin-ext, cyrillic, cyrillic-ext, greek, greek-ext, vietnamese). Each subset is an independent `@font-face` rule with its own `unicode-range`. For an English-only site, only `latin` is exercised — the rest is dead weight that bloats the render-blocking CSS bundle without ever being requested by the browser (unmatched `unicode-range` rules don't trigger font downloads, but the CSS bytes still ship and parse).

The `latin` subset's `unicode-range` already covers em-dashes, smart quotes (U+2000-206F: General Punctuation), euro sign, trademark, basic Latin-1 Supplement — everything a US-English gov site needs.

**Switch:** `@import '@fontsource/<fam>/<weight>.css'` → `@import '@fontsource/<fam>/latin-<weight>.css'`.

**Infonet measured impact (2026-05-27, 3.2.7):**

| File | Before | After | Δ |
|---|---:|---:|---:|
| `@fontsource/lato/400.css` (single weight raw) | 882 B | 250 B | -71% |
| `@fontsource/raleway/400.css` (single weight raw) | 2,055 B | 262 B | -87% |
| `@fontsource/roboto/400.css` (single weight raw) | 5,431 B | 258 B | -95% |
| **`BaseLayout.css` bundle (9 weights × 3 families)** | **90.7 KB** | **34.5 KB** | **-62%** |

Roboto in particular ships a massive cyrillic+greek+vietnamese surface — cutting it back is the biggest single byte win.

**Score impact:** desktop home Perf **96 → 100** (the CSS download was the binding constraint at low-latency desktop bandwidth). Mobile home stayed at 97-98 — the binding constraint on slow-4G is the TCP/RTT-driven render-blocking floor, not bytes. **The lesson: subsetting helps desktop scores meaningfully; mobile scores are gated by network RTT, not bundle size.** Both still benefit from a smaller parse cost.

**Compatibility note:** if a CMS author pastes Czech/Polish/Vietnamese/Cyrillic content into Strapi after the switch, those glyphs fall back to the system font. Document this in the project's content-author guide if multi-language content is planned; otherwise ship.

#### Diminishing returns at mobile 97-98 — stop before critical-CSS extraction

When the home page sits at mobile Perf 97-98 with: FCP ~1.6s, LCP ~2.1s (under Google's 2.5s "good" threshold), CLS 0, TBT 0ms, and the only Lighthouse-flagged issues are `render-blocking-insight` (~440 ms estimated savings) + `unused-javascript` (~35 KiB), **stop**. The remaining gap is the Lighthouse mobile scoring band's natural floor, not a fixable byte/JS problem. Three reasons:

1. **Render-blocking is RTT-bound, not byte-bound.** The 56 KB CSS shrink from latin-subsetting moved the "render-blocking savings" estimate from 430 ms → 440 ms — i.e. it didn't move. Slow-4G simulation gives ~1.6 Mbps + ~750 ms RTT, and the bulk of the "blocking" time is the TCP+TLS handshake to the CSS origin, not transfer. You can't optimize away an RTT.
2. **Unused JS is Alpine core.** The 35 KiB figure stays constant whether you `latin-`-subset CSS or not because it's the Alpine.js bundle that every page ships. Splitting the `@alpinejs/focus` plugin out gains ~5 KiB and breaks the mobile sidebar focus trap on first open (race between plugin load and click handler).
3. **Critical-CSS extraction is fragile.** Extracting above-fold CSS for inlining is the textbook next step but adds a per-route critical bundle that drifts whenever any above-fold component changes (a new HomeBox row, an additional HomeBarGraph header, a Breadcrumb tweak). The win is 1-2 points; the breakage shows up as FOUC. Treat critical-CSS as a Phase 7-or-later polish task and only if the user-research case for "mobile home perf 100" outweighs the maintenance cost.

**Stopping criteria checklist** for mobile home perf optimization:
- [x] Perf ≥ 97 (in scoring band's natural variance for image-light pages)
- [x] LCP < 2.5s (Google "good")
- [x] CLS < 0.1 (Google "good")
- [x] TBT < 200ms (Google "good")
- [x] A11y 100, BP 100, SEO 100

If all five are checked, ship and stop. Further work crosses the line from "engineering" to "metric chasing."

#### `/sitemap.xml` routing — rewrite to the flat shard, not the index

`@astrojs/sitemap` always emits **two files**: `dist/sitemap-index.xml` (a one-entry meta-file pointing at the shards) + one or more `dist/sitemap-N.xml` shards (the actual `<urlset>` with all the URLs). The index/shard split is sitemaps.org's recommended layout for sites that may exceed Google's 50,000-URL-per-file limit. The package has **no configuration flag** to skip the index when only one shard exists — it ships both regardless of site size.

This creates two distinct breakage modes that aren't obvious until someone (a user, an SEO scanner, an AI crawler) tries to fetch the conventional `/sitemap.xml`:

1. **`/sitemap.xml` returns 404.** Astro doesn't emit a file at that path — only `sitemap-index.xml` and `sitemap-0.xml`. `robots.txt` (which `@astrojs/sitemap` does NOT auto-update; you must hand-edit it) gives the long name, but tools that probe the conventional URL without reading robots.txt first get a 404.
2. **`/sitemap.xml` (via a naive rewrite) shows what looks like an empty sitemap.** If you rewrite `/sitemap.xml → /sitemap-index.xml`, the response is a one-entry XML file pointing at `sitemap-0.xml`. Crawlers handle the indirection silently, but humans/tools see a confusing near-empty document. The user-visible effect is "the sitemap is broken" even though it's not.

The **fix** is two Netlify `status = 200` rewrites in `netlify.toml` that point at the flat shard:

```toml
[[redirects]]
  from = "/sitemap.xml"
  to = "/sitemap-0.xml"
  status = 200

[[redirects]]
  from = "/sitemap.xml/"
  to = "/sitemap-0.xml"
  status = 200
```

The trailing-slash variant covers tools that auto-append `/` to URLs (some link checkers do this). HTTP 200 (NOT 301) is mandatory — per the SiteImprove pattern in §10a, 301s cost DCI points. The rewrite is invisible to scanners that count redirects.

Then update `public/robots.txt` to point at the conventional URL:

```
Sitemap: https://<site>/sitemap.xml
```

…and any AI-readiness files (`llms.txt`, etc.) similarly. Crawlers follow the rewrite transparently, humans see the URL list directly, and the canonical sitemap URL is the conventional one.

**Verification post-deploy:**

```bash
# /sitemap.xml should return 200 with a <urlset> directly (not <sitemapindex>)
curl -sS https://<site>/sitemap.xml | head -5
# expect: <?xml version="1.0" encoding="UTF-8"?>
#         <urlset xmlns="...">
#           <url><loc>https://<site>/</loc>...
```

The original literal paths (`/sitemap-index.xml` and `/sitemap-0.xml`) remain reachable for any tool hard-wired to them. No redirects, no breakage — just two surfacing rewrites.

**At flagship scale (icjia.illinois.gov, 2000+ pages):** the index/shard split becomes meaningful — `entryLimit: 45000` in `astro.config.ts`'s sitemap integration keeps everything in `sitemap-0.xml`, but if you bump above 45k (or split intentionally for crawler-budget reasons), you'd have `sitemap-0.xml`, `sitemap-1.xml`, … and `sitemap-index.xml` is the canonical entry point. **At that scale, point `/sitemap.xml` → `/sitemap-index.xml`** (and let crawlers follow the indirection); the index becomes useful again. Decision rubric: **flat shard if one file fits, index if multiple shards are emitted.**

#### Standard 404 page — stylish, on-brand, content centered in the main column

> **Promoted to canonical in v6.3.** This pattern shipped on Infonet (v6.2 authoring) and DVFR (v6.3 confirmation) without site-specific carve-outs — same component shape, same a11y rules, same search hand-off. Brand tokens (color, font family) and `navMenu` are the only per-site parameters. **Confirmed on:** Infonet (Raleway + `#0d4270` navy + `.not-found-*` prefix), DVFR (Oswald + `#391856` purple + `.dvfr-nf-*` prefix). Treat as a template; copy-paste-rename for the next ICJIA site.

The default Astro `src/pages/404.astro` is three lines of unstyled text inside `<main>`. On a polished gov site that becomes a UX cliff the moment any link rots — visitors land on what looks like a broken page. Replace with a designed, helpful 404 in the same visual language as the rest of the site.

**Required ingredients** (canonical, two-site-confirmed):

1. **`BaseLayout` wrap with `noindex={true}` + `title="Page Not Found"`.** The layout's existing JSON-LD default (`WebPage` with `noindex` honored via the SEO component) is fine — a 404 doesn't need a custom schema. `noindex` keeps the page out of crawler indexes; some scanners flag indexed 404s as soft-404s.
2. **Hero band matching the home** (`bg-[#f2f2f2]` + navy `#0d4270` Raleway 900 type). The big `404` numeral as the visual anchor, `aria-hidden="true"` (decorative; the `<h1>` carries the announcement). `background-clip: text` with a navy-to-blue gradient gives depth without an image asset.
3. **Pagefind deep-link search form** submitting to `/search/?q=…` via `method="get"`. The existing `/search/` page already reads `?q=` from `URLSearchParams` and pre-fills the Pagefind input, so the hand-off is seamless. Joined input+button at ≥480 px, stacked on narrow phones. Navy focus ring, 48 px target height (touch-friendly). `role="search"` + `aria-label="Search InfoNet"`.
4. **Quick-link grid** with 4–6 cards covering the top sections (Home, About, News, Data & Publications, Partners, Contact). **Cards: 1-col mobile → 2-col at `min-[960px]:`** (Vuetify md parity per the Hard Rule). Each card is a single `<a>` wrap with `<h3>` + blurb + arrow icon — no `aria-label` override (per the v6.2 `label-content-name-mismatch` lesson).
5. **Fallback help line** below the grid: "Still can't find what you're looking for? Contact the InfoNet team." Anchored to `/contact/`.

**Content centered in the main column.** Default Astro `<main>` has no horizontal centering — content butts up against the left edge. For the 404, **explicitly center every text-bearing element** so the page reads as a deliberate composition rather than a default-stylesheet leftover:

```css
.not-found-hero            { text-align: center; }   /* cascades to children */
.not-found-number          { text-align: center; }   /* explicit, in case of override */
.not-found-title           { text-align: center; }
.not-found-lede            { margin: 0 auto 1.75rem; text-align: center; }   /* + max-width centers the box */
.not-found-search          { margin-left: auto; margin-right: auto; }        /* form is a flex box */
.not-found-links__heading  { text-align: center; }
.not-found-help            { text-align: center; }
```

The cards themselves keep their **internal flex** layout (text left, arrow right) — that's natural reading order; centering card content makes it feel uncertain. The card *grid* is already centered via the outer `mx-auto max-w-[1100px]` container.

**Why explicit `text-align: center` on every leaf rule (vs only on `.not-found-hero`):** the hero section inherits, but as soon as a Tailwind utility or component-scoped reset clobbers `text-align` (e.g. a future `prose` class addition), only the leaf rules survive. Belt + suspenders for a page that should remain centered forever.

**A11y + motion:**
- All decorative SVGs (`aria-hidden="true"`).
- `prefers-reduced-motion: reduce` opt-out on every transition AND the 404-fade keyframe (reduced-motion users get the same layout with no animation).
- `:focus-visible` outline (3 px navy halo) on every interactive element.
- The big `404` numeral is `aria-hidden`; the `<h1>` ("We couldn't find that page") is what assistive tech announces.

**Verification post-deploy:**
- viewcap diff at 5 widths (375, 768, 1024, 1280, 1920) vs the design intent — content stays centered at every width.
- Click an intentionally-broken URL → 404 renders with the new design (Netlify serves `dist/404.html` automatically for unmatched paths).
- Search form: typing "InfoNet" + Enter lands on `/search/?q=InfoNet` with the Pagefind input pre-filled and results visible.
- Lighthouse mobile audit on the 404 itself: A11y 100, BP 100, SEO 100 (Perf is irrelevant — it's a 404).

**Reusability:** the same pattern (`BaseLayout` + hero band + Pagefind form + curated grid + help line) is the right shape for `/search-no-results/` pages, maintenance pages, and any other "this isn't the content you wanted" exit point. Treat the 404 as a template; copy-paste-rename for the next dead-end.

#### Build chain: two-pass `astro build` for any CMS image manifest

For Tier 2 image manifests (Sharp-resampled CMS images written to `public/_cms-img/`), the page templates import the manifest JSON. **Vite resolves these imports at bundle time — the file must EXIST as a committed JSON file before the first `astro build` runs**, or the build fails with `Could not resolve "~/data/<name>.json"`.

The fix: commit a manifest stub (or last good manifest), let the build chain regenerate it between two `astro build` passes, then dual-write to `dist/` at the end.

```jsonc
// package.json scripts.build
"build": "astro build && node scripts/fetch-cms-images.mjs && node scripts/fetch-<custom>.mjs && astro build && pnpm pagefind && pnpm og:image && pnpm <custom>:dist"
```

The fetch script writes both `public/_cms-img/...` (for next dev `pnpm build`) and `dist/_cms-img/...` (for current deploy) when `dist/` already exists. The `og:image` + `pagefind` final passes piggyback on the same pattern. Add a `# Note: <manifest>.json IS committed` block to `.gitignore` so the next dev knows why a "generated" file is in the repo.

#### Eager + `fetchpriority="high"` on the first card image in any above-fold listing

Lighthouse's `lcp-discovery-insight` flags listing pages where the LCP candidate image has `loading="lazy"`. Default-lazy is correct for cards below the fold, but the first card (often the LCP candidate on mobile single-column layouts) needs explicit eager loading.

```astro
{articles.map((article, idx) => {
  const isLcp = idx === 0;
  return (
    <img
      src={...}
      loading={isLcp ? 'eager' : 'lazy'}
      fetchpriority={isLcp ? 'high' : 'auto'}
      decoding="async"
    />
  );
})}
```

**Verify in production HTML, not source.** Use `curl https://<site>/<page>/ | grep -oE '<img[^>]*loading[^>]*>'` to confirm the eager attribute survived bundling.

#### YouTube facade pattern — Best-Practices 100 + zero third-party cookies on initial load

A real `<iframe src="https://www.youtube.com/embed/<id>">` ships YouTube's cookie set immediately on page load and Lighthouse Best Practices drops to 96. Replace with a clickable thumbnail facade that swaps in the real iframe on first click. Pattern: `markdown.ts` rewrites every YouTube iframe to a `<div class="yt-facade" data-yt-id="...">` containing the `i.ytimg.com` thumbnail; `alpine-entry.ts` attaches a click handler that replaces the facade with a fresh `<iframe>` pointing at `youtube-nocookie.com`.

**CSP requirements:** add `https://i.ytimg.com` to `img-src` (thumbnails). The on-demand iframe load needs `frame-src https://www.youtube-nocookie.com` (already in v6 §11 baseline).

**Impact (Infonet /about/):** Best Practices 96 → 100, zero third-party cookies on initial page load.

#### `label-content-name-mismatch` is the most common axe-AA failure on chrome anchors

axe-core rule `label-content-name-mismatch` fails when an element has BOTH visible text AND an `aria-label`, and the visible text isn't contained in the aria-label as a substring. The accessible name (aria-label) "wins" over visible text, leaving screen-reader users hearing something different from sighted users.

**Common offenders found during Infonet audit:**

| Element | Visible | aria-label (bad) | Fix |
|---|---|---|---|
| `.home-box` cards | "Interested in using InfoNet?" | "Request information about using InfoNet" | Remove aria-label; h3 + p compute the accessible name from visible content |
| "All News »" button | "All News »" | "All News & Updates" | Remove aria-label |
| Desktop nav title | "INFONET ∣ DATA COLLECTION & REPORTING SYSTEM" | "INFONET — go to homepage" | Remove aria-label; three inline spans compute the accessible name |

**Rule:** if the visible text is descriptive (the h3 inside an anchor, the button text), DO NOT add aria-label. Only add aria-label when:
1. The element has no visible text (icon-only buttons), OR
2. The visible text is ambiguous out of context ("Click here", "Read more →") AND the aria-label INCLUDES the visible text as a prefix.

#### axe-core `nonBmp` ("needs review") on Unicode glyphs in cards

Unicode characters outside the Basic Multilingual Plane (or non-text glyphs like `▾` U+25BE, `›` U+203A) can't be color-contrast-checked by axe. Result: a `nonBmp` *needs-review* entry on every page that uses them as visual decoration (FAQ chevrons, news "Read more →" arrows).

**Fix:** swap the glyph for an inline SVG with `currentColor` fill. axe excludes SVG from color-contrast entirely.

```html
<button>Toggle
  <svg aria-hidden="true" focusable="false" viewBox="0 0 16 16" width="16" height="16">
    <path fill="currentColor" d="M2 4l6 7 6-7z"/>
  </svg>
</button>
```

#### `sr-only-table` with `white-space: nowrap` can blow `scrollWidth`

A screen-reader-accessible data table for a chart is typically `position: absolute; clip: rect(0,0,0,0)`. **But absolute-positioned children with `white-space: nowrap` still contribute to `document.scrollWidth`** even when clipped — causing a phantom horizontal scrollbar on viewports under ~520 px.

**Fix:** add `left: -10000px` so the natural-width content sits fully off-canvas.

```css
.sr-only-table {
  position: absolute;
  left: -10000px;   /* push off-canvas — clip alone isn't enough */
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  clip-path: inset(50%);
  white-space: nowrap;
}
```

Verify in DevTools at 320 / 375 / 414 / 480 / 520 px: `document.documentElement.scrollWidth` must equal `clientWidth`.

#### Chart.js lazy-load via IntersectionObserver

Chart.js is ~67 KiB gzipped — bundling it eagerly costs ~200 ms of mobile parse time on every page that imports it, even if the chart is below the fold. Lazy-load via dynamic `import()` triggered by IntersectionObserver with `rootMargin: '200px'`. **Impact (Infonet home, mobile):** Perf 96 → 99. JS bundle shrunk ~50 KiB on first load.

#### MDC components: sentinel placeholder pattern for inline rendering

When Strapi markdown bodies embed MDC components (e.g., `::TabsScreenshots`, `::Carousel`), the simplest port — strip MDC blocks and render at end of article — visually works only if there's one MDC tag at the bottom. If the editor placed the tag mid-article, the rendered position is wrong.

**Fix:** insert a sentinel token at the original position during stripping (e.g., `MDCREFPLACEHOLDER_0_MDCREFEND`), then split the rendered HTML on the sentinel and interleave the MDC component back inline in the page template. The token survives markdown-it + xss filtering intact because it's plain alphanumeric text. Test with `console.log(stripped)` mid-pipeline to verify the placeholder didn't get HTML-escaped.

#### Sharp-resampled card splash images via Strapi v3 base64 GraphQL field

Strapi v3 sites (e.g., ICJIA Research Hub) sometimes store splash thumbnails as base64 data URLs inside a `splash` field on the entity. Don't render the base64 inline (huge HTML, no responsive variants) — pipe through Sharp to responsive WebP at build time.

Pattern: GraphQL query fetches `{ _id slug splash }`, the script matches the base64 data URL (`/^data:image\/(\w+);base64,(.+)$/`), decodes to a Buffer, resamples via Sharp at multiple widths, writes `<id>-<width>.webp` files plus a manifest keyed by entity id. The page template imports the manifest and renders `<img src srcset sizes>` keyed off `String(article._id)`.

**Manifest write order matters:** this script runs BETWEEN the two `astro build` passes. The first pass needs a committed stub manifest to resolve the import; this script overwrites it; the second pass bundles the real content. See `scripts/fetch-dap-splash.mjs` for the production reference (Strapi v3 / researchhub.icjia-api.cloud).

#### Sitemap canonical-link mitigation against SiteImprove 301 dings

Default Astro `trailingSlash: 'always'` + Netlify default behavior produces a 301 from `/about` → `/about/`. Stack the four layers in v6 §10a to push all variants to status=200 rewrites instead.

For Infonet at scale (45 routes): 12 explicit redirect rules in `netlify.toml` + 1 catch-all for CMS pages. Verify via curl loop that every no-slash URL returns 200, not 301.

#### Centered page headers + content offset standard

Ship a single `<PageHeader>` component used by every catch-all CMS page + listings. Standard:

```css
.page-h1 {
  font-size: clamp(1.5rem, 3vw, 2.25rem);
  text-align: center;
  margin-top: 1rem;
  margin-bottom: 2.5rem;
}
```

Prevents random offset drift between pages — the `1rem` top + `2.5rem` bottom rhythm is uniform across every CMS-driven route.


---

## Flagship (`icjia.illinois.gov`) — scale-specific guidance (v6.2+)

> **Scale jump:** Infonet shipped ~45 pages on Vue 2 + Strapi v4 (technically Nuxt 4 + Strapi v4 for Infonet). The flagship is **2000+ pages on Vue 2 / Vuetify 2 + Strapi v3**. The categorical concerns below come from scaling the patterns in this checklist; they are not validated yet — they are predictions to test in the spike pass (see "Before tackling `icjia.illinois.gov`" earlier in this doc).

### Tailwind utility classes are MORE critical at scale, not less

The "use Tailwind for flex/grid layouts" rule from the v6.2 Infonet increment compounds in importance at flagship scale. With 2000+ pages drawing from a handful of shared layout components, a single mistuned breakpoint creates 2000+ broken pages. Implications:

1. **Audit every Vuetify class in the legacy source before Phase 1.** `grep -rohE 'v-(row|col|container)\s*[^>]*' legacy/src/**/*.vue | sort | uniq -c | sort -rn` — gives you the top 50 layout patterns. Each maps to one canonical Tailwind utility string (catalog in your team's `docs/layout-patterns.md`).
2. **Build a `<LayoutGrid>` Astro component** that encapsulates the common Vuetify v-row → grid translation. Take `cols`, `mdCols`, `lgCols`, `gap` props. Renders the Tailwind class string. Avoids 2000 pages each open-coding `grid grid-cols-1 min-[960px]:grid-cols-2 gap-6`.
3. **viewcap diff at five viewport widths** (375/768/1024/1280/1920) for at least three representative templates per route type before opening Phase 4. Catch pixel-perfect drift before it propagates across 2000 pages.

### Spike-pass priorities (extends the existing 7-item spike at line 471)

#### 1. Build-time budget — page count × Sharp time × Strapi fetch time

Wall-clock estimate for 2000+ pages on a clean cache:

| Stage | Time |
|---|---|
| Strapi v3 GraphQL fetch (cold) | 60–180 s |
| Astro page render (first pass) | 4–8 min |
| Sharp image resampling (2000 splashes × multiple widths) | 8–15 min |
| Astro page render (second pass for manifest) | 4–8 min |
| Pagefind indexing (2000 pages) | 30–90 s |
| **Total cold build** | **~20–40 min** |

**Netlify free tier hard-caps builds at 15 minutes.** Decide one of:
1. **Upgrade Netlify tier** (Pro = 25 min builds; Business = unlimited).
2. **Warm-cache builds**: commit `.cache/strapi/*.json` snapshots (already pattern in v6), warm Sharp + Astro caches between builds via Netlify's `NETLIFY_CACHE_DIR`.
3. **Incremental Strapi fetch**: cache by entity `updated_at`; only re-fetch changed entities.
4. **Sharp concurrency pool**: 4–8 workers via `Promise.all(chunk.map(processOne))` cuts the image phase ~50%.

**Validate early in the spike pass:** scaffold a minimal Astro repo, generate 2000 dummy pages, time `pnpm build`. Decide tier + caching strategy BEFORE Phase 1.

#### 2. Strapi v3 GraphQL response shape (different from v4)

ICJIA Research Hub and the flagship use Strapi **v3**. v3 responses are flat:

```js
// Strapi v3
{ data: { articles: [ { id, slug, title, body, splash } ] } }

// Strapi v4 (Infonet, IFVCC)
{ data: { articles: { data: [ { id, attributes: { slug, title, body, splash } } ] } } }
```

**Implications:**
- Zod schemas must be v3-shaped: `articles: z.array(z.object({ id, slug, ... }))`.
- Image fields: v3 returns the asset URL directly (`splash: "https://..."`); v4 wraps it in `splash.data.attributes.url`. The `fetch-cms-images.mjs` URL-extraction logic must probe both shapes.

**Existing reference:** `scripts/fetch-dap-splash.mjs` in this repo talks to a Strapi **v3** instance and is the closest live example.

#### 3. Listings pagination strategy

Infonet has ~30 news posts (no pagination). The flagship has 500–1500 news posts plus similar counts for publications, events, datasets. Use Astro's `paginate()` helper:

```astro
---
// pages/news/[...page].astro
export async function getStaticPaths({ paginate }) {
  const posts = await fetchAllPosts();
  return paginate(posts, { pageSize: 20 });
}
const { page } = Astro.props;
---
```

Emits `/news/`, `/news/2/`, `/news/3/`, etc. Set `<link rel="canonical">` on each paginated page to ITSELF (not page 1). Modern Google treats paginated series as separate URLs since 2019; `rel=prev/next` is deprecated.

**Avoid infinite scroll for SEO-relevant lists.** Googlebot doesn't fire scroll events on most pages; static pagination indexes cleanly.

#### 4. Sitemap chunking + sitemap index

`@astrojs/sitemap` auto-chunks at 45000 URLs (Google's 50k limit with margin). For 2000+ pages this isn't strictly needed, but worth knowing the config:

```ts
sitemap({
  entryLimit: 45000,  // default — fine for the flagship
})
```

Submit `sitemap-index.xml` (not individual `sitemap-N.xml`) to Search Console.

#### 5. Vue 2 SPA → Astro: `vue-router` route inventory before Phase 1

Dump every legacy route:

```sh
grep -oE "path: ['\"]([^'\"]+)['\"]" legacy/src/router/**/*.{js,ts} | sort -u
```

Categorize each route:

| Route type | Astro target |
|---|---|
| Static (`/about`, `/contact`) | `.astro` file in `src/pages/` |
| Dynamic by slug (`/news/:slug`) | `[slug].astro` + `getStaticPaths` |
| Catch-all CMS (`/:slug`) | `[...slug].astro` + RESERVED_SLUGS filter (v6 §4) |
| Hash-routed (`/#/foo`) | `_redirects` rewrite `/#/foo /foo 301!` |
| Authenticated dashboard | Hybrid output OR exclude from migration |

The flagship probably has ~100 unique route patterns. Build the inventory once, treat it as source of truth.

#### 6. Vuex state — what's truly client state vs what's actually CMS content

Many Vuex stores in legacy Vue 2 SPAs hold "client state for content that's actually static." Audit each store namespace:

| Vuex state | Reality | Migration target |
|---|---|---|
| `newsList: []` | CMS content | Build-time Strapi fetch |
| `filterOpen: false` | UI state | Alpine `$store.ui` |
| `formStep: 1` | UI state | Alpine `x-data` (per-form) |
| `searchResults: []` | Search index | Drop entirely; Pagefind handles it |
| `userPrefs: {}` | Personalization | Alpine `$store.userPrefs` + localStorage |

The Vuex-replacement Alpine `$store` pattern (Adultredeploy, IFVCC):

```js
document.addEventListener('alpine:init', () => {
  Alpine.store('ui', {
    drawerOpen: false,
    toggle() { this.drawerOpen = !this.drawerOpen; },
  });
});
```

```html
<button x-on:click="$store.ui.toggle()">Menu</button>
<aside x-show="$store.ui.drawerOpen">...</aside>
```

**Rule:** any Vuex state that doesn't change after the build is content, not state. Port it to Strapi + build-time fetch.

#### 7. PDF + document URL stability

The flagship hosts hundreds of PDFs (publications, reports, forms). PDF URLs are linked from external sites + Google Scholar + government registries — **breaking them is a permanent SEO + accessibility cost**.

**Mitigation:**
1. Mirror every PDF path 1:1 from legacy `public/` → Astro `public/`. URL stays `https://icjia.illinois.gov/<path>/<file>.pdf`.
2. If Strapi serves PDFs from `https://strapi-host/uploads/<file>.pdf`, write a `scripts/mirror-strapi-pdfs.mjs` that downloads each linked PDF into `public/uploads/` and rewrites markdown body links accordingly. Same pattern as `fetch-cms-images.mjs`.
3. Lighthouse + axe both ignore PDFs; the failure mode is silent. Audit post-build by diffing legacy sitemap PDFs vs `find dist -name '*.pdf'`.

#### 8. Third-party integrations — catalog every external script BEFORE Phase 1

The flagship likely loads more than Plausible. Likely offenders:

| Script | Likely purpose | Migration target |
|---|---|---|
| Google Analytics / GTM | Analytics | Drop → Plausible (already in v6) |
| Google Translate widget | i18n | Either drop (use Astro i18n) or whitelist its iframe domains |
| Hotjar / FullStory | Session replay | Drop or self-host |
| ChatBot / Drift | Live chat | Whitelist + lazy load on click |
| Twitter / X embeds | Inline tweets in CMS body | Replace with facade pattern |
| Mapbox / Leaflet | Maps | Keep, lazy-load via IntersectionObserver |
| `dap.digitalgov.gov` | Federal compliance? | Verify legally required; if yes, whitelist in CSP |

**Spike output:** a predicted CSP allow-list. Each origin must be justified by a real, current need. Anything in the legacy CSP that no current page consumes is dropped.

#### 9. i18n / Spanish content

If the flagship has Spanish-language pages, plan Astro's i18n config from Phase 1:

```ts
i18n: {
  defaultLocale: 'en',
  locales: ['en', 'es'],
  routing: { prefixDefaultLocale: false },  // emits /, /es/, /about/, /es/about/
}
```

**Strapi v3 i18n shape:** typically a `lang` enum on each entity, or duplicate entries keyed by locale. Build a `loadEntityByLocale(slug, locale)` helper.

**SEO:** every page needs `<link rel="alternate" hreflang="<lang>" href="<URL>">` pointing to its translation siblings. `astro-seo` doesn't emit hreflang automatically — write a `<HreflangAlternates>` helper component.

#### 10. Real User Monitoring (RUM) at flagship scale

Lighthouse is synthetic — it doesn't tell you what users at slow connections in central Illinois actually experience. Add web-vitals to Plausible custom events:

```js
import { onCLS, onINP, onLCP } from 'web-vitals';
function send(metric) {
  if (typeof window.plausible !== 'function') return;
  window.plausible('Web Vitals', {
    props: { name: metric.name, value: Math.round(metric.value), rating: metric.rating },
  });
}
onCLS(send); onINP(send); onLCP(send);
```

Plausible's "Custom Events" feature then exposes CLS / INP / LCP percentiles by page over time — what users actually feel. Worth adding to Infonet too as a v6.2.1 increment if scope allows.

#### 11. Build artifact size — `dist/` at 2000+ pages

Each `.html` page at ~30 KiB plus per-route Astro shell produces a `dist/` directory in the 200–400 MB range. Implications:

- **Netlify deploy upload time**: 5–15 min for fresh deploys. Use `[build] ignore = "git diff --quiet HEAD^ HEAD ./astro/src ./astro/scripts"` to skip rebuilds when only docs change.
- **CDN propagation**: 60–120 s edge propagation for 2000+ files. Plan deploys outside peak traffic windows.
- **Local `astro dev` cold-start**: 30–60 s to compile the first page request at full scale. Use a stub dataset of 200 pages for dev iteration speed; full dataset for CI builds.

#### 12. Cutover risk mitigation at scale

Per v6 §13, the cutover is a single atomic commit. At 2000+ pages the blast radius of a bad cutover is high. Layer safety:

1. **Deploy preview must be live 48–72 hours** before cutover. Catches CDN-region-specific issues a local audit misses.
2. **Run a full SiteImprove crawl on the preview URL** before cutover. SiteImprove finds dead links + a11y issues across all 2000 pages in a way no single Lighthouse audit can.
3. **DNS rollback plan**: legacy hosting stays warm for 2–4 weeks post-cutover. Netlify DNS for the apex has a 60 s TTL, so a bad cutover can be reverted in <2 min via the Netlify dashboard.
4. **301 audit**: diff legacy sitemap vs new sitemap before cutover; every URL in the legacy sitemap not present in the new sitemap needs a 301 in `netlify.toml` or `_redirects`. Run via `comm -23` on sorted URL lists.

#### 13. Search index size at scale

Pagefind for 2000+ pages produces an index in the 5–20 MB range, chunked into ~50 KB files loaded on demand. Risks:

1. **First-load latency**: Pagefind UI's IIFE bundle is ~30 KB but the initial keyword query fetches 200–500 KB of index chunks. On 3G this is 2–5 s before first result. Pre-warm via `<link rel="prefetch" href="/pagefind/pagefind.js">` on the search page.
2. **Stale index after content edits**: Pagefind rebuilds with every `pnpm build`. For high-edit-volume sites, schedule a nightly Netlify build webhook OR a Strapi → Netlify build trigger.
3. **Result-quality tuning**: with 2000+ pages, default scoring may surface tangentially relevant pages. Use `data-pagefind-meta` aggressively to boost important fields (title, summary, tags). Use `data-pagefind-weight="10"` on the H1 to make title matches dominate.

#### 14. Content audit — "what to NOT migrate"

At 2000+ pages, some pages are dead weight. Before Phase 4: cross-reference legacy URLs against Plausible page-view counts for the last 90 days. **Decision rubric:**
- If page receives organic traffic (any inbound from Google) → migrate
- If page is linked from current navigation or footer → migrate
- If page has 0 inbound links AND 0 visits in 90 days → archive (move to `/archive/<year>/` with `<meta name="robots" content="noindex">`)

A 2000-page site often reduces to 1200–1500 actively-maintained pages after this audit. The trimmed scope makes every subsequent decision easier.

#### 15. Print stylesheets

Government users print pages (regulators, archivists, FOIA responders). Verify `@media print` rules are ported from legacy:

```css
@media print {
  .skip-links, nav, footer, .sidebar { display: none !important; }
  .markdown-body { font-size: 12pt; line-height: 1.4; }
  a[href]::after { content: " (" attr(href) ")"; font-size: 9pt; color: #666; }
  h1, h2, h3 { page-break-after: avoid; }
  table { page-break-inside: avoid; }
}
```

Test by `Cmd-P` on three representative pages before cutover.

#### 16. Compliance pages — verbatim copy + stable anchor IDs

State agencies have specific copy that legally must remain verbatim — accessibility statements, ADA compliance pages, privacy policies, terms of use, Section 508 declarations. These often have specific anchor IDs that external auditors link to.

**Workflow:**
1. Inventory pages under `/accessibility/`, `/compliance/`, `/privacy/`, `/terms/`, `/section508/`.
2. Copy source markdown verbatim from Strapi (or HTML if non-CMS).
3. Verify every anchor link still resolves: `curl -sL https://icjia.illinois.gov/accessibility/ | grep 'id="statement"'`.
4. Match URL slugs EXACTLY — do not "improve" naming.

These pages are usually 5–10 routes max, but breaking them is higher-severity than breaking a news post.

