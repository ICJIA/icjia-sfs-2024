# Astro Migration Checklist — v2 (ICJIA i2i, 2026-05 snapshot)

> **Checklist version: v2 (canonical / current).**
> v1 lives at [adult-redeploy-client-next/docs/astro-conversion-checklist.md](https://github.com/ICJIA/adult-redeploy-client-next/blob/master/docs/astro-conversion-checklist.md)
> (Astro 5 + yarn era, mid-2025).
>
> This v2 supersedes v1 with patterns shipped in this repo's v0.2.0 /
> v0.2.1 release (May 2026). Use **v2** for any new ICJIA Astro
> migration. v1 is still valid for projects already on the older
> Astro 5 + yarn stack that don't want to upgrade.

Practical patterns that earned their keep on the Vue 2 / Nuxt → Astro 6
+ Tailwind 4 + pnpm rewrite of <https://i2i.illinois.gov>. Copy what
fits; nothing here is sacred.

**Production reference:** <https://i2i.illinois.gov> (mobile Lighthouse
on launch: A11y 100 / Perf 100 / BP 100 / SEO 100).

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

## How to use this checklist

**Direct URL** (preferred):
<https://github.com/ICJIA/icjia-i2i-v2-2024/blob/main/docs/astro-conversion-checklist.md>

- **In Claude Code (other repos):** point the assistant at the URL —
  e.g. *"apply the patterns from
  github.com/ICJIA/icjia-i2i-v2-2024/blob/main/docs/astro-conversion-checklist.md
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

---

## 9. Analytics — Plausible (self-hosted) snippet

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

## 11. Security headers (Netlify) — the modern pattern

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

---

## 19. Dev-server wrapper script

Adds a canonical `./start-dev-server` at the repo root so contributors
can launch the dev server from any working directory without
remembering to `cd astro/ && pnpm dev`.

```sh
#!/usr/bin/env bash
# start-dev-server — launch the Astro dev server from the repo root.
set -euo pipefail

cd "$(dirname "$0")/astro"

if ! command -v pnpm >/dev/null 2>&1; then
  echo "start-dev-server: pnpm not found." >&2
  echo "  Install via: corepack enable" >&2
  exit 1
fi

if [ ! -d node_modules ]; then
  echo "start-dev-server: running 'pnpm install' first…"
  pnpm install
fi

exec pnpm dev "$@"
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

## 20. Migration deltas — v1 → v2 worklist

If you maintained an Astro project against v1 (the adultredeploy
checklist) and want to bring it forward to v2, the diff-only worklist:

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
