# Accessibility Audit Prompt (axe-core + HTML Report under `/docs/accessibility/`)

**Last Updated**: January 4, 2026

## How to use this prompt

Copy/paste **this entire file** into an LLM and provide your repo. The LLM must implement an automated accessibility audit pipeline that:

- Runs **axe-core** in a real browser (Puppeteer or Playwright)
- Audits all public pages discovered from your **`public/sitemap.xml`**
- Writes an **HTML report** to `public/docs/accessibility/index.html`
- Writes structured JSON outputs (e.g., `errors.json`, `violations.json`) to `public/docs/accessibility/`
- Ensures `/docs/accessibility/` **never 404s** (placeholder strategy)

### Reference implementation (ICJIA)

- Audit script: [`audit-accessibility.js`](https://github.com/ICJIA/icjia-accessibility-portal/blob/main/audit-accessibility.js)
- Placeholder creator: [`scripts/ensure-accessibility-report.js`](https://github.com/ICJIA/icjia-accessibility-portal/blob/main/scripts/ensure-accessibility-report.js)
- Optional Nuxt hardening plugin: [`app/plugins/ensure-accessibility-report.server.ts`](https://github.com/ICJIA/icjia-accessibility-portal/blob/main/app/plugins/ensure-accessibility-report.server.ts)
- Sitemap generator (docs excluded): [`scripts/generate-sitemap.js`](https://github.com/ICJIA/icjia-accessibility-portal/blob/main/scripts/generate-sitemap.js)

---

## Instructions to the LLM (do these steps)

### 1) Add dependencies

Add dev dependencies:

- `axe-core`
- `puppeteer` (or `playwright`)

### 2) Create the audit script

Create `audit-accessibility.js` at repo root with these requirements:

- Reads URLs from `public/sitemap.xml`
- Launches a headless browser
- For each URL:
  - navigates to the page
  - injects axe-core
  - runs axe with WCAG tags: `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`
- Generates:
  - `public/docs/accessibility/index.html` (human report)
  - `public/docs/accessibility/violations.json`
  - `public/docs/accessibility/errors.json`

Use the ICJIA script as the baseline pattern:

- [`audit-accessibility.js`](https://github.com/ICJIA/icjia-accessibility-portal/blob/main/audit-accessibility.js)

### 3) Implement “never 404” placeholder behavior

Create `scripts/ensure-accessibility-report.js` that:

- Ensures `public/docs/accessibility/` exists
- Ensures `public/docs/accessibility/index.html` exists
- If missing, writes a styled HTML placeholder that instructs how to generate the real report

Reference:

- [`scripts/ensure-accessibility-report.js`](https://github.com/ICJIA/icjia-accessibility-portal/blob/main/scripts/ensure-accessibility-report.js)

Optional hardening for Nuxt projects:

- Add `app/plugins/ensure-accessibility-report.server.ts` that attempts the same write on server start
- Reference: [`app/plugins/ensure-accessibility-report.server.ts`](https://github.com/ICJIA/icjia-accessibility-portal/blob/main/app/plugins/ensure-accessibility-report.server.ts)

### 4) Add scripts to `package.json`

Add:

- `"ensure:accessibility-report": "node scripts/ensure-accessibility-report.js"`
- `"audit:a11y": "node audit-accessibility.js"`

And ensure placeholder runs before dev/build/generate (for example via `predev`, `prebuild`, `pregenerate`).

Reference:

- [`package.json`](https://github.com/ICJIA/icjia-accessibility-portal/blob/main/package.json)

### 5) Ensure `/docs/*` is excluded from sitemap

Update sitemap generation to exclude `/docs` and `/docs/*`.

Reference:

- [`scripts/generate-sitemap.js`](https://github.com/ICJIA/icjia-accessibility-portal/blob/main/scripts/generate-sitemap.js)

### 6) Verify (must pass checklist)

Run:

```bash
node scripts/ensure-accessibility-report.js
```

Verify:

- `public/docs/accessibility/index.html` exists

Then run (requires a running server):

```bash
yarn dev
# in another terminal:
yarn audit:a11y
```

Verify:

- `public/docs/accessibility/index.html` updated
- `public/docs/accessibility/violations.json` exists
- `public/docs/accessibility/errors.json` exists
