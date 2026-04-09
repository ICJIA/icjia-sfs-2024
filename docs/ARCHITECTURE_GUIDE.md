# Vuetify 3 + Nuxt 4: Complete Architecture & Implementation Guide

**Last Updated**: January 4, 2026  
**For**: Developers and LLMs building Vuetify 3 + Nuxt 4 applications  
**Purpose**: Comprehensive guide to building, maintaining, and troubleshooting Vuetify 3 + Nuxt 4 applications

> 📌 **Note**: This guide is based on the ICJIA Accessibility Portal implementation, but the patterns, solutions, and best practices apply to **any Vuetify 3 + Nuxt 4 application**. Code snippets include direct links to the source files in the [GitHub repository](https://github.com/ICJIA/icjia-accessibility-portal). Click the file path links to view the complete code.

> 🌟 **For General Vuetify 3/Nuxt 4 Development**: While this guide uses an accessibility portal as an example, the architecture decisions, challenges, and solutions (especially **Challenge 6: Vuetify Console Logging**, **Challenge 7: Chrome DevTools 404**, and **Challenge 8: Prerender 404 Errors**) apply to any Vuetify 3 + Nuxt 4 project.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture Decisions](#architecture-decisions)
3. [Application Structure](#application-structure)
4. [Content Management Strategy](#content-management-strategy)
5. [Accessibility Implementation](#accessibility-implementation)
6. [Build & Deployment Process](#build--deployment-process)
7. [Challenges & Solutions](#challenges--solutions)
8. [Vuetify 3 + Nuxt 4 Compatibility Guide](#vuetify-3--nuxt-4-compatibility-guide) ⭐ **Universal Solutions**
9. [Best Practices & Patterns](#best-practices--patterns)
10. [Testing & Validation](#testing--validation)
11. [Search Functionality](#search-functionality) ⭐ **NEW**
12. [API Documentation (JSDoc)](#api-documentation-jsdoc) ⭐ **NEW**
13. [Future Considerations](#future-considerations)
14. [Replicating Vuetify 3 + Nuxt 4 Applications](#replicating-vuetify-3--nuxt-4-applications)

---

## Project Overview

### Purpose

This guide documents the architecture and implementation of a **Vuetify 3 + Nuxt 4** application. While the example project is an accessibility portal, the patterns, solutions, and best practices documented here apply to **any Vuetify 3 + Nuxt 4 application**.

**Example Project**: The ICJIA Accessibility Portal is a **fully accessible**, **static-generated** web application designed to provide comprehensive accessibility guidance for Illinois state agency employees ahead of the **ADA Title II April 24, 2026 compliance deadline**.

### Key Requirements

1. **100% WCAG 2.1 AA Compliance** - Zero accessibility violations
2. **Static Site Generation** - Fast, cacheable, CDN-friendly
3. **Content-First** - Easy markdown-based content management
4. **Performance** - Optimized for fast loading and Core Web Vitals
5. **Maintainability** - Clear patterns, good documentation
6. **Flexibility** - Support for dynamic content (countdown timer, "new" badges)

### Tech Stack Rationale

| Technology         | Why Chosen                                                     |
| ------------------ | -------------------------------------------------------------- |
| **Nuxt 4**         | Static generation, Vue 3 support, excellent DX, auto-imports   |
| **Vue 3**          | Modern reactive framework, composition API, TypeScript support |
| **Vuetify 3**      | Accessible Material Design components out of the box           |
| **Nuxt Content 3** | File-based CMS, markdown support, powerful query API           |
| **TypeScript**     | Type safety, better IDE support, catches errors early          |
| **Netlify**        | Simple deployment, CDN, custom headers support                 |
| **axe-core**       | Industry-standard accessibility testing engine                 |
| **Playwright**     | Reliable browser automation for testing                        |

---

## Architecture Decisions

### 1. Static Site Generation vs. SSR

**Decision**: Static Site Generation (SSG)

**Reasoning**:

- Content rarely changes (FAQ updates are infrequent)
- No user authentication or dynamic data
- Better performance (pre-rendered HTML)
- Lower hosting costs (just static files)
- CDN-friendly for fast global delivery
- Better SEO (fully rendered pages)

**Implementation**:

**File**: [`nuxt.config.ts`](https://github.com/ICJIA/icjia-accessibility-portal/blob/main/nuxt.config.ts)

```typescript
// nuxt.config.ts
nitro: {
  preset: 'static',
  prerender: {
    crawlLinks: true,
    ignore: ['/docs/accessibility', '/docs/architecture']
  }
}
```

**Note**: Both `/docs/accessibility` and `/docs/architecture` are static HTML files in the `public/` directory, not Nuxt routes. They must be ignored during prerendering to prevent Nitro from attempting to prerender them as routes (which would cause 404 errors during build).

### 2. Content Strategy: Markdown vs. Database

**Decision**: Markdown files with Nuxt Content

**Reasoning**:

- Content is primarily text with minimal structure
- Git-based workflow (version control, pull requests)
- No need for database infrastructure
- Easy for non-developers to edit
- Supports front matter for metadata
- Can be edited in any text editor

**Trade-offs**:

- Less flexible than database for complex queries
- Requires rebuild for content changes
- Not suitable for user-generated content

### 3. Component Library: Vuetify vs. Headless

**Decision**: Vuetify 3

**Reasoning**:

- Built-in accessibility features (ARIA, keyboard nav)
- Material Design = familiar UX patterns
- Dark theme support out of the box
- Reduces custom CSS/component development time
- Grid system and responsive utilities
- Icon library included (MDI)

**Challenges**:

- Larger bundle size (mitigated with tree-shaking)
- Some styling overrides needed for custom design
- Framework-specific patterns

### 4. Layouts: Multiple Layouts Strategy

**Decision**: Separate layouts for different page types

**Implementation**:

```
app/layouts/
  default.vue    # Standard pages (navbar + footer)
  print.vue      # Printer-friendly pages (no navigation)
```

**Reasoning**:

- Clean separation of concerns
- Printer layout removes navigation clutter
- Each layout can have specific components
- Easy to add new layout types (e.g., error pages)

---

## Application Structure

### Directory Organization

```
/
├── app/                          # Nuxt application code
│   ├── components/              # Reusable Vue components
│   │   ├── AppFooter.vue       # Footer with links
│   │   ├── AppNavbar.vue       # Navigation bar
│   │   ├── CountdownTimer.vue  # Deadline countdown
│   │   ├── DownloadDialog.vue  # Accessible download format selection
│   │   ├── FaqAccordion.vue    # FAQ display component
│   │   └── SkipLink.vue        # Accessibility skip link
│   ├── composables/            # Vue composables (reusable logic)
│   │   ├── useDeadlineCountdown.ts
│   │   ├── useFaqCollapse.ts
│   │   ├── usePrintLinks.ts
│   │   ├── useSeo.ts
│   │   ├── useSlugify.ts
│   │   └── useStructuredData.ts
│   ├── layouts/                # Page layouts
│   │   ├── default.vue         # Standard layout
│   │   └── print.vue           # Printer-friendly layout
│   ├── pages/                  # Route pages (file-based routing)
│   │   ├── index.vue           # Home page (FAQs)
│   │   ├── faqs.vue            # Dedicated FAQs page
│   │   ├── faqs-print.vue      # Printer-friendly FAQs
│   │   ├── links.vue           # Resources page
│   │   └── search.vue          # Fuzzy search page (Fuse.js)
│   ├── plugins/                # Nuxt plugins
│   │   ├── content-links.client.ts
│   │   ├── ensure-accessibility-report.server.ts
│   │   ├── optimize-css.client.ts
│   │   ├── optimize-fonts.client.ts
│   │   ├── resource-hints.server.ts
│   │   ├── suppress-vuetify-logs.client.ts
│   │   └── suppress-vuetify-logs.server.ts
│   ├── utils/                  # Utility functions
│   │   └── faqTransform.ts     # FAQ parsing and transformation
│   ├── app.vue                 # Root app component
│   └── router.options.ts       # Router configuration
├── content/                     # Markdown content files
│   ├── faqs.md                 # FAQ content (3000+ lines)
│   └── links.md                # Resource links
├── public/                      # Static assets
│   ├── docs/                   # Generated documentation
│   │   ├── accessibility/     # Accessibility audit reports
│   │   ├── architecture/      # Architecture documentation
│   │   ├── jsdoc/             # API documentation (TypeDoc)
│   │   └── tests/             # Test reports (HTML)
│   ├── .well-known/           # Chrome DevTools config
│   ├── favicon.svg             # Site icon
│   ├── icjia-logo-*.png        # Logo images
│   ├── robots.txt              # Search engine directives
│   └── sitemap.xml             # Auto-generated sitemap
├── scripts/                     # Build and utility scripts
│   ├── ensure-accessibility-report.js
│   ├── extract-vue-scripts.js   # Vue SFC script extractor for TypeDoc
│   ├── generate-architecture-docs.js
│   ├── generate-faq-docx.js     # Generate accessible Word document
│   ├── generate-faq-md.js       # Generate Markdown with metadata
│   ├── generate-faq-txt.js      # Generate plain text version
│   ├── generate-routes.js
│   └── generate-sitemap.js
├── test/                        # Test suites
│   ├── unit/                   # Unit tests (pure functions)
│   │   ├── faqTransform.test.ts
│   │   ├── searchConfig.test.ts
│   │   └── useSlugify.test.ts
│   ├── nuxt/                   # Nuxt environment tests
│   │   ├── FaqAccordion.test.ts
│   │   ├── search.test.ts
│   │   ├── useDeadlineCountdown.test.ts
│   │   ├── useFaqCollapse.test.ts
│   │   ├── usePrintLinks.test.ts
│   │   ├── useSeo.test.ts
│   │   └── useStructuredData.test.ts
│   ├── e2e/                    # End-to-end tests (disabled)
│   ├── run-all-tests.js        # Comprehensive test runner
│   └── README.md               # Test documentation
├── markdown-documentation/      # Project documentation
│   ├── ARCHITECTURE_GUIDE.md   # This file
│   ├── ACCESSIBILITY_GUIDE.md
│   ├── PRINTER_FRIENDLY_GUIDE.md
│   └── [other docs]
├── audit-accessibility.js       # Custom axe-core audit script
├── nuxt.config.ts              # Nuxt configuration
├── content.config.ts           # Nuxt Content configuration
├── search.config.json          # Fuse.js search configuration
├── typedoc.json                # TypeDoc/JSDoc configuration
├── tsconfig.typedoc.json       # TypeScript config for TypeDoc (separate from Nuxt)
├── vitest.config.ts            # Vitest test configuration
├── tsconfig.json               # TypeScript configuration (extends Nuxt)
└── package.json                # Dependencies and scripts
```

### File-Based Routing

Nuxt automatically creates routes from files in `app/pages/`:

```
app/pages/index.vue       →  /
app/pages/faqs.vue        →  /faqs
app/pages/faqs-print.vue  →  /faqs-print
app/pages/links.vue       →  /links
app/pages/search.vue      →  /search
```

**Benefits**:

- No manual route configuration
- Easy to understand URL structure
- Automatic code splitting per route

---

## Content Management Strategy

### Markdown Structure

**File**: `content/faqs.md` (3000+ lines) - [View on GitHub](https://github.com/ICJIA/icjia-accessibility-portal/blob/main/content/faqs.md)

**Structure**:

```markdown
---
title: Frequently Asked Questions
description: Common questions about accessibility
---

# Main Title

Intro content...

---

## Section 1 (H2)

### Question 1 (H3)

{new:2026-01-01}

Answer content...

### Question 2 (H3)

Answer content...

## Section 2 (H2)

### Question 3 (H3)

Answer content...
```

### Content Parsing Logic

**File**: [`app/utils/faqTransform.ts`](https://github.com/ICJIA/icjia-accessibility-portal/blob/main/app/utils/faqTransform.ts)

**Key Functions**:

1. **`extractNewDate()`** - Detects `{new:YYYY-MM-DD}` tags
2. **`filterNewComments()`** - Removes tags from display
3. **`isWithinNewWindow()`** - Checks if date is within 10 days
4. **`replaceDynamicPlaceholders()`** - Replaces `{days_until_deadline}`

**How it Works**:

**File**: [`app/utils/faqTransform.ts`](https://github.com/ICJIA/icjia-accessibility-portal/blob/main/app/utils/faqTransform.ts)

```typescript
// 1. Parse markdown into MiniMark AST
const body = page.value.body; // type: minimark

// 2. Iterate through nodes
for (const node of body.value) {
  if (isH2(node)) {
    // Start new section
  } else if (isH3(node)) {
    // Start new question
    // Collect answer nodes until next H2/H3
  }
}

// 3. Check for "new" tag
const newDate = extractNewDate(answerNodes);
const isNew = newDate !== null;

// 4. Filter out tag from display
const cleanAnswer = filterNewComments(answerNodes);
```

### Responsive Markdown Tables (Mobile-Friendly)

Markdown tables often overflow narrow viewports. The most reliable, framework-agnostic solution is to **wrap each rendered table in a horizontally scrollable container** (instead of trying to shrink columns until they become unreadable).

**Recommended pattern (Nuxt/Vue/Nuxt Content or any markdown-to-HTML renderer):**

- **Transform at render time**: When you have access to the markdown AST (or render pipeline), wrap `table` nodes in a `div` wrapper.
- **Scrollable wrapper**: `overflow-x: auto` + `-webkit-overflow-scrolling: touch` for smooth iOS scrolling.
- **Keyboard support**: Add `tabindex="0"` to the wrapper so keyboard users can scroll horizontally (trackpad/Shift+wheel/arrow keys depending on device).
- **Accessible labeling**: If you use `role="region"`, add an accessible name via `aria-label` (e.g., `"Scrollable table"`).
- **Visual cue (mobile-only)**: Add a small, `aria-hidden` hint like “Scroll horizontally to see more →” plus a subtle right-edge gradient.
- **Print behavior**: In `@media print`, remove scroll behavior and hide the hint/gradient.

**AST pseudo-example** (works with any renderer that can manipulate AST nodes):

```text
div.table-scroll-wrapper[tabindex=0 role=region aria-label="Scrollable table"]
  div.table-scroll-hint[aria-hidden=true] "Scroll horizontally to see more →"
  table[data-responsive-table=true]
    ...
```

This approach avoids brittle DOM mutation observers, keeps the solution centralized, and ensures consistent behavior anywhere markdown tables appear (FAQs, “intro” content, printer-friendly pages, etc.).

### "New" Badge System

**Purpose**: Highlight recently added questions automatically

**Implementation**:

**File**: [`content/faqs.md`](https://github.com/ICJIA/icjia-accessibility-portal/blob/main/content/faqs.md)

```markdown
### What is digital accessibility?

{new:2026-01-01}

Answer content...
```

**Features**:

- Badge shows for 10 days (configurable via `NEW_QUESTION_DAYS`)
- Auto-expires (no manual cleanup needed)
- Supports both `{new:DATE}` and `<!-- new:DATE -->` formats
- Curly braces survive markdown parsing better

**Display**:

- Green chip in FaqAccordion component
- "NEW" text badge in printer-friendly version
- Accessible (doesn't rely only on color)

---

## Accessibility Implementation

### Skip Links

**Critical Component for Keyboard Navigation**

**Challenge**: Users with keyboards need to skip repetitive navigation

**Solution**: Reusable SkipLink component used in all layouts

**Implementation**:

**File**: [`app/components/SkipLink.vue`](https://github.com/ICJIA/icjia-accessibility-portal/blob/main/app/components/SkipLink.vue)

```vue
<!-- app/components/SkipLink.vue -->
<template>
  <a
    href="#main-content"
    class="skip-link"
    @click="handleClick"
    @keydown.enter="handleClick"
  >
    Skip to main content
  </a>
</template>

<style scoped>
.skip-link {
  position: absolute;
  top: -100px; /* Off-screen until focused */
  left: 0;
  z-index: 10000; /* Above all content */
  background: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary));
  /* ... more styles ... */
}

.skip-link:focus {
  top: 0; /* Visible when focused */
}
</style>
```

**Key Details**:

- `top: -100px` (not `left: -9999px`) - audit script checks for this
- `z-index: 10000` - ensures it appears above everything
- Event handlers for smooth scroll to main content
- Respects `prefers-reduced-motion`

**Layout Integration**:

**File**: [`app/layouts/default.vue`](https://github.com/ICJIA/icjia-accessibility-portal/blob/main/app/layouts/default.vue)

```vue
<!-- app/layouts/default.vue -->
<template>
  <div class="app-wrapper">
    <SkipLink />
    <AppNavbar />
    <v-main id="main-content" tabindex="-1">
      <slot />
    </v-main>
    <AppFooter />
  </div>
</template>
```

**File**: [`app/layouts/print.vue`](https://github.com/ICJIA/icjia-accessibility-portal/blob/main/app/layouts/print.vue)

```vue
<!-- app/layouts/print.vue -->
<template>
  <div class="print-layout-wrapper">
    <SkipLink />
    <v-main id="main-content" tabindex="-1">
      <slot />
    </v-main>
  </div>
</template>
```

**Critical**:

- Main content MUST have `id="main-content"`
- Main content MUST have `tabindex="-1"` for programmatic focus
- Use the SAME component in all layouts for consistency

### ARIA Landmarks & Labels

**Navbar**:

**File**: [`app/components/AppNavbar.vue`](https://github.com/ICJIA/icjia-accessibility-portal/blob/main/app/components/AppNavbar.vue)

```vue
<v-btn
  :aria-label="`Navigate to ${item.title}`"
  :aria-current="route.path === item.to ? 'page' : undefined"
></v-btn>
```

**Countdown Timer**:

**File**: [`app/components/CountdownTimer.vue`](https://github.com/ICJIA/icjia-accessibility-portal/blob/main/app/components/CountdownTimer.vue)

```vue
<div role="status" aria-live="polite" aria-atomic="false">
  <span class="sr-only">{{ countdownAriaLabel }}</span>
</div>
```

**FAQ Accordion**:

**File**: [`app/components/FaqAccordion.vue`](https://github.com/ICJIA/icjia-accessibility-portal/blob/main/app/components/FaqAccordion.vue)

```vue
<v-expansion-panel :aria-describedby="`answer-${item.id}`">
  <v-expansion-panel-title :id="`question-${item.id}`">
    {{ item.question }}
  </v-expansion-panel-title>
  <v-expansion-panel-text :id="`answer-${item.id}`">
    <!-- Answer content -->
  </v-expansion-panel-text>
</v-expansion-panel>
```

### Focus Management

**Visible Focus Indicators**:

**File**: [`app/layouts/default.vue`](https://github.com/ICJIA/icjia-accessibility-portal/blob/main/app/layouts/default.vue)

```css
*:focus-visible {
  outline: 3px solid rgb(var(--v-theme-primary));
  outline-offset: 2px;
}
```

**Keyboard Navigation**:

- All interactive elements reachable via Tab
- Logical tab order (source order)
- No keyboard traps
- Enter/Space activate buttons

### Color Contrast

**Requirements**: WCAG 2.1 AA = 4.5:1 for normal text, 3:1 for large text

**Implementation**:

- Dark theme with carefully chosen colors
- Primary: `#60A5FA` (blue) on dark backgrounds
- Tested with browser devtools color contrast checker
- Links underlined (don't rely on color alone)

---

## Build & Deployment Process

### Build Pipeline

```bash
# 1. Install dependencies
yarn install

# 2. Pre-build steps (automatic)
- Generate routes.json (scan pages directory)
- Generate sitemap.xml (from routes.json)
- Ensure accessibility report exists

# 3. Generate static site
yarn generate

# 4. Output to .output/public/
- HTML files for each route
- JavaScript chunks (code-split)
- CSS files (optimized)
- Assets (images, fonts)
- sitemap.xml
- robots.txt
```

### Route Generation

**Challenge**: Need to know all routes for sitemap and static generation

**Solution**: Automatic route discovery

**Script**: `scripts/generate-routes.js` - [View on GitHub](https://github.com/ICJIA/icjia-accessibility-portal/blob/main/scripts/generate-routes.js)

```javascript
// 1. Scan app/pages for .vue files
const pageFiles = findVueFiles("app/pages");

// 2. Convert to routes
const routes = pageFiles.map((file) => filePathToRoute(file));

// 3. Scan content/ for .md files (potential routes)
const mdFiles = findMarkdownFiles("content");
const contentRoutes = mdFiles.map((file) => markdownFileToRoute(file));

// 4. Combine and deduplicate
const allRoutes = [...new Set([...routes, ...contentRoutes])];

// 5. Write to routes.json
writeFileSync(
  "routes.json",
  JSON.stringify({
    generated: new Date().toISOString(),
    routes: allRoutes,
  })
);
```

### Sitemap Generation

**Script**: `scripts/generate-sitemap.js` - [View on GitHub](https://github.com/ICJIA/icjia-accessibility-portal/blob/main/scripts/generate-sitemap.js)

```javascript
// 1. Read routes from routes.json
const routesData = JSON.parse(readFileSync("routes.json"));

// 2. Filter out excluded routes (/docs/*)
const publicRoutes = routesData.routes.filter(
  (route) => !route.startsWith("/docs")
);

// 3. Generate XML
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${publicRoutes
    .map(
      (route) => `
    <url>
      <loc>${baseUrl}${route}</loc>
      <lastmod>${currentDate}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>${route === "/" ? "1.0" : "0.8"}</priority>
    </url>
  `
    )
    .join("")}
</urlset>`;

// 4. Write to public/sitemap.xml
writeFileSync("public/sitemap.xml", xml);
```

### Deployment to Netlify

**⚠️ This configuration applies to ALL Vuetify 3 + Nuxt 4 static-generated applications**

**Overview**: Netlify is an excellent platform for deploying static-generated Nuxt applications. This section provides a complete, production-ready configuration that works for any Vuetify 3 + Nuxt 4 application using `nuxt generate`.

#### Build Configuration

**File**: [`netlify.toml`](https://github.com/ICJIA/icjia-accessibility-portal/blob/main/netlify.toml)  
**Related Files**: [`.nvmrc`](https://github.com/ICJIA/icjia-accessibility-portal/blob/main/.nvmrc), [`package.json`](https://github.com/ICJIA/icjia-accessibility-portal/blob/main/package.json)  
**Netlify Docs**: [Configuration file](https://docs.netlify.com/configure-builds/file-based-configuration/), [Build settings](https://docs.netlify.com/configure-builds/get-started/)

**Key Points**:

1. **Build Command**: `yarn generate` (or `npm run generate`)
   - This runs Nuxt's static site generation
   - Outputs to `.output/public/` directory

   **If you generate a PDF at build time (common for “Download as PDF”):**
   - Install the Playwright browser binary first, then run `generate`.
   - On Netlify, **do not use** `--with-deps` (it attempts `su` to root and will fail).
   - Recommended Netlify command pattern:

   ```toml
   [build]
     command = "npx playwright install chromium && yarn generate"
     publish = ".output/public"
   ```

2. **Publish Directory**: `.output/public`
   - This is where Nuxt 4 outputs static files after `nuxt generate`
   - Netlify serves files from this directory

3. **Node Version**: Specify in `netlify.toml` or use `.nvmrc`
   - Ensures consistent builds across environments
   - Node 22.14.0+ recommended for Nuxt 4

**Complete Configuration**:

```toml
[build]
  # Build command - generates static site
  # If you generate PDFs at build time (Playwright), install Chromium first (no --with-deps on Netlify)
  command = "npx playwright install chromium && yarn generate"

  # Publish directory - where Nuxt outputs static files
  publish = ".output/public"

[build.environment]
  # Node version - must match your local development
  # Check your .nvmrc or package.json engines field
  NODE_VERSION = "22.14.0"

  # Yarn version (optional, but recommended for consistency)
  YARN_VERSION = "1.22.22"

  # NPM flags (optional)
  NPM_FLAGS = "--version"

# SPA fallback - redirects all routes to index.html
# Required for client-side routing in static-generated Nuxt apps
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

# Security headers for all pages
[[headers]]
  for = "/*"
  [headers.values]
    # Prevent clickjacking
    X-Frame-Options = "DENY"

    # XSS protection
    X-XSS-Protection = "1; mode=block"

    # Prevent MIME type sniffing
    X-Content-Type-Options = "nosniff"

    # Referrer policy
    Referrer-Policy = "strict-origin-when-cross-origin"

    # Permissions policy (restrict features)
    Permissions-Policy = "geolocation=(), microphone=(), camera=()"

# Cache static assets aggressively
[[headers]]
  for = "/_nuxt/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.css"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.woff2"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

#### Node Version Management

**Option 1: Using `.nvmrc` (Recommended)**

**File**: [`.nvmrc`](https://github.com/ICJIA/icjia-accessibility-portal/blob/main/.nvmrc)  
**Netlify Docs**: [Node.js version](https://docs.netlify.com/configure-builds/manage-dependencies/#node-js-and-javascript)

Create a `.nvmrc` file in your project root:

```
22.14.0
```

Netlify will automatically detect and use this version.

**Option 2: Using `netlify.toml`**

**File**: [`netlify.toml`](https://github.com/ICJIA/icjia-accessibility-portal/blob/main/netlify.toml)  
**Netlify Docs**: [Build environment variables](https://docs.netlify.com/configure-builds/environment-variables/#netlify-configuration-file)

Specify in `[build.environment]`:

```toml
[build.environment]
  NODE_VERSION = "22.14.0"
```

**Option 3: Using `package.json` engines**

**File**: [`package.json`](https://github.com/ICJIA/icjia-accessibility-portal/blob/main/package.json)  
**Netlify Docs**: [Node.js version](https://docs.netlify.com/configure-builds/manage-dependencies/#node-js-and-javascript)

```json
{
  "engines": {
    "node": ">=22.14.0",
    "npm": ">=10.0.0"
  }
}
```

**Why Node 22.14.0+?**

- Nuxt 4 requires Node 18.18.0 or higher
- Node 22.x provides better performance and latest features
- Ensures compatibility with Vuetify 3 and all dependencies

#### Build Process

**Netlify Docs**: [Build process](https://docs.netlify.com/configure-builds/get-started/), [Build lifecycle](https://docs.netlify.com/configure-builds/build-lifecycle/)

**What Happens During Deployment**:

1. **Netlify clones your repository**
2. **Installs dependencies**: `yarn install` (or `npm install`)
3. **Runs build command**: `yarn generate`
   - This executes your `pregenerate` script (if defined)
   - Runs `nuxt generate` to create static files
   - Executes your `postgenerate` script (if defined)
4. **Publishes**: Serves files from `.output/public/`
5. **Applies configuration**: Redirects, headers, etc.

**Nuxt Deployment Guide**: [Deploy Nuxt to Netlify](https://nuxt.com/docs/getting-started/deployment#netlify)

**Pre/Post Build Scripts** (Optional):

If your `package.json` has pre/post hooks, they run automatically:

```json
{
  "scripts": {
    "pregenerate": "node scripts/generate-routes.js",
    "generate": "nuxt generate",
    "postgenerate": "node scripts/generate-sitemap.js"
  }
}
```

#### Build-Time “Download PDF” (from a Print Route)

Many sites want:

- A **printer-friendly HTML route** (e.g. `/print`) that is always up to date
- A **downloadable PDF** (e.g. `/faqs.pdf`) generated from that route at build time

**Recommended pattern (Nuxt + Vuetify + Netlify):**

- Create a print-friendly route (e.g. `/faqs-print`) that is included in prerender.
- Add a post-generate step that:
  - serves `.output/public` locally
  - loads `/faqs-print/` in headless Chromium
  - prints to a PDF in `.output/public/faqs.pdf`
- Link to `/faqs.pdf` from your navbar/footer with a `download` filename.

**Why `postgenerate` (not `pregenerate`)**:

- The PDF step needs the generated HTML in `.output/public`, so it must run _after_ `nuxt generate`.

**Netlify gotcha**:

- `npx playwright install chromium --with-deps` fails on Netlify (root escalation blocked).
- Use: `npx playwright install chromium`

**Static docs portal gotcha** (if you host docs under `public/docs/`):

- Nitro’s prerender crawler can treat `/docs/` like an app route and 404.
- Prefer linking to `/docs/index.html` (file path) from app content, or ensure your hosting serves `/docs/` as an index.

#### SPA Fallback Configuration

**Netlify Docs**: [Redirects and rewrites](https://docs.netlify.com/routing/redirects/), [Redirect rules](https://docs.netlify.com/routing/redirects/redirect-options/)

**Why the redirect is needed**:

Static-generated Nuxt apps use client-side routing. When users navigate to routes like `/faqs` or `/links`, Netlify needs to serve `index.html` so Vue Router can handle the route.

**File**: [`netlify.toml`](https://github.com/ICJIA/icjia-accessibility-portal/blob/main/netlify.toml) (redirects section)

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**Important**: This redirect must come **after** any specific route redirects you might have.

#### Security Headers

**Netlify Docs**: [Headers](https://docs.netlify.com/routing/headers/), [Custom headers](https://docs.netlify.com/routing/headers/#syntax)

**File**: [`netlify.toml`](https://github.com/ICJIA/icjia-accessibility-portal/blob/main/netlify.toml) (headers section)

**Why these headers matter**:

- **X-Frame-Options**: Prevents your site from being embedded in iframes (prevents clickjacking)
- **X-XSS-Protection**: Enables browser XSS filtering
- **X-Content-Type-Options**: Prevents MIME type sniffing attacks
- **Referrer-Policy**: Controls referrer information sent with requests
- **Permissions-Policy**: Restricts browser features (geolocation, camera, etc.)

**Customization**: Adjust these headers based on your application's needs.

#### Cache Control

**Netlify Docs**: [Headers](https://docs.netlify.com/routing/headers/), [Caching](https://docs.netlify.com/edge-functions/overview/#caching)

**File**: [`netlify.toml`](https://github.com/ICJIA/icjia-accessibility-portal/blob/main/netlify.toml) (cache headers section)

**Strategy**: Aggressive caching for static assets, no cache for HTML

- **Static assets** (`/_nuxt/*`, `*.js`, `*.css`, `*.woff2`): Cache for 1 year (immutable)
- **HTML files**: No cache headers (default), so updates are immediate
- **Images**: Consider adding cache headers if you have many images

**Why immutable?**

- Nuxt generates assets with content hashes in filenames
- If content changes, filename changes, so cache invalidation is automatic
- Safe to cache aggressively

#### Deployment Triggers

**Netlify Docs**: [Continuous deployment](https://docs.netlify.com/site-deploys/create-deploys/), [Deploy contexts](https://docs.netlify.com/site-deploys/overview/#deploy-contexts), [Branch deploys](https://docs.netlify.com/site-deploys/overview/#branch-deploys)

**Automatic Deployments**:

- **Production**: Push to `main` (or configured branch) → Deploys to production
- **Preview**: Open pull request → Creates preview deployment
- **Branch**: Push to any branch → Creates branch deployment

**Manual Deployments**:

- Use Netlify CLI: `netlify deploy --prod`
- Or trigger from Netlify dashboard
- **Netlify CLI Docs**: [Deploy command](https://cli.netlify.com/commands/deploy)

#### Environment Variables

**Netlify Docs**: [Environment variables](https://docs.netlify.com/environment-variables/overview/), [Build environment variables](https://docs.netlify.com/configure-builds/environment-variables/)

**Setting in Netlify**:

1. Go to Site settings → Environment variables
2. Add variables needed for build/runtime
3. They're available as `process.env.VARIABLE_NAME`

**File**: [`nuxt.config.ts`](https://github.com/ICJIA/icjia-accessibility-portal/blob/main/nuxt.config.ts) (runtimeConfig section)

**Common Variables for Nuxt/Vuetify Apps**:

```bash
# Site URL (for SEO, canonical URLs)
NUXT_PUBLIC_SITE_URL=https://your-site.netlify.app

# Analytics (if using)
NUXT_PUBLIC_ANALYTICS_ID=your-id

# API endpoints (if any)
NUXT_PUBLIC_API_URL=https://api.example.com
```

**Access in Nuxt**:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      siteUrl:
        process.env.NUXT_PUBLIC_SITE_URL || "https://your-site.netlify.app",
    },
  },
});
```

#### Troubleshooting

**Netlify Docs**: [Troubleshooting builds](https://docs.netlify.com/configure-builds/troubleshooting-tips/), [Build logs](https://docs.netlify.com/configure-builds/get-started/#build-logs)

**Common Issues**:

1. **Build fails with "Command not found"**
   - Ensure `yarn` or `npm` is available
   - Check Node version matches `.nvmrc`
   - **File**: [`.nvmrc`](https://github.com/ICJIA/icjia-accessibility-portal/blob/main/.nvmrc)

2. **Routes return 404**
   - Verify SPA fallback redirect is configured
   - Check that `publish` directory is `.output/public`
   - **File**: [`netlify.toml`](https://github.com/ICJIA/icjia-accessibility-portal/blob/main/netlify.toml) (redirects section)
   - **Netlify Docs**: [Redirects](https://docs.netlify.com/routing/redirects/)

3. **Assets not loading**
   - Verify cache headers are set correctly
   - Check that assets are in `.output/public/_nuxt/`
   - **File**: [`netlify.toml`](https://github.com/ICJIA/icjia-accessibility-portal/blob/main/netlify.toml) (headers section)

4. **Build timeout**
   - Large sites may need longer build time
   - Check Netlify build logs for specific errors
   - **Netlify Docs**: [Build settings](https://docs.netlify.com/configure-builds/get-started/#build-settings)

**Quick Checklist**:

- ✅ `netlify.toml` exists in project root
- ✅ Build command is `yarn generate` (or `npm run generate`)
- ✅ Publish directory is `.output/public`
- ✅ Node version specified (`.nvmrc` or `netlify.toml`)
- ✅ SPA fallback redirect configured
- ✅ Security headers configured
- ✅ Cache headers for static assets configured

#### For Any Vuetify 3 + Nuxt 4 Project

**Minimal Configuration** (copy and customize):

```toml
[build]
  command = "yarn generate"
  publish = ".output/public"

[build.environment]
  NODE_VERSION = "22.14.0"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

**This minimal config works for any static-generated Nuxt 4 app**, whether it uses Vuetify or not. Add security headers and cache control as needed for your specific requirements.

#### Additional Resources

**Netlify Documentation**:

- [File-based configuration](https://docs.netlify.com/configure-builds/file-based-configuration/) - Complete guide to `netlify.toml`
- [Deploy Nuxt to Netlify](https://nuxt.com/docs/getting-started/deployment#netlify) - Official Nuxt deployment guide
- [Static site deployment](https://docs.netlify.com/site-deploys/overview/) - How Netlify handles static sites
- [Build optimization](https://docs.netlify.com/configure-builds/optimize-your-build/) - Tips for faster builds

**Project Files**:

- [`netlify.toml`](https://github.com/ICJIA/icjia-accessibility-portal/blob/main/netlify.toml) - Complete Netlify configuration
- [`.nvmrc`](https://github.com/ICJIA/icjia-accessibility-portal/blob/main/.nvmrc) - Node version specification
- [`package.json`](https://github.com/ICJIA/icjia-accessibility-portal/blob/main/package.json) - Build scripts and dependencies

---

## Challenges & Solutions

### Challenge 1: Parsing 3000+ Line Markdown File

**Problem**: Single FAQ file with complex structure (H2 sections, H3 questions, mixed content)

**Initial Approach**: Try to use Nuxt Content's built-in features

**Issues**:

- Content renderer shows everything at once (no accordion)
- Need to extract structure for table of contents
- Need to support "new" badges and dynamic content

**Solution**: Custom parser using MiniMark AST

**File**: [`app/utils/faqTransform.ts`](https://github.com/ICJIA/icjia-accessibility-portal/blob/main/app/utils/faqTransform.ts)

```typescript
// Parse markdown into AST
const body = page.value.body; // MiniMark format

// Manually walk the AST
function extractFaqStructure(nodes) {
  const sections = [];
  let currentSection = null;

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];

    if (isH2(node)) {
      // New section
      currentSection = {
        heading: extractText(node),
        items: [],
      };
      sections.push(currentSection);
    } else if (isH3(node)) {
      // New question
      const question = extractText(node);
      const answer = collectAnswerNodes(nodes, i);
      currentSection.items.push({ question, answer });
    }
  }

  return sections;
}
```

**Key Learnings**:

- MiniMark is Nuxt Content's internal AST format
- Nodes are arrays: `['tagName', attributes, ...children]`
- Text nodes are strings
- Need to recursively extract text from nested structures

### Challenge 2: "New" Badge System

**Problem**: Want to mark questions as new, but don't want manual cleanup

**Requirements**:

- Automatic expiration after N days
- Easy to add (just add a date in markdown)
- Must not show the tag text in rendered output

**Solution 1 (Failed)**: HTML comments

```markdown
### Question?

<!-- new:2026-01-01 -->
```

**Issue**: Markdown parser sometimes strips HTML comments

**Solution 2 (Success)**: Curly brace syntax

```markdown
### Question?

{new:2026-01-01}
```

**Why it works**:

- Curly braces are treated as text in markdown
- Easy to detect with regex: `/\{new:(\d{4}-\d{2}-\d{2})\}/`
- Can be removed before display
- Survives markdown parsing reliably

**Implementation**:

**File**: [`app/utils/faqTransform.ts`](https://github.com/ICJIA/icjia-accessibility-portal/blob/main/app/utils/faqTransform.ts)

```typescript
const NEW_TAG_PATTERN = /\{new:\s*(\d{4}-\d{2}-\d{2})\}/;

function extractNewDate(answerNodes) {
  for (const node of answerNodes) {
    const text = extractText(node);
    const match = text.match(NEW_TAG_PATTERN);
    if (match) {
      const dateStr = match[1];
      if (isWithinWindow(dateStr, 10)) {
        // 10 days
        return dateStr;
      }
    }
  }
  return null;
}

function filterNewComments(answerNodes) {
  return answerNodes
    .map((node) => {
      if (typeof node === "string") {
        return node.replace(/\{new:.*?\}/g, "").trim();
      }
      return node;
    })
    .filter((node) => node !== "");
}
```

### Challenge 3: Printer-Friendly Version

**Problem**: Users want to print all FAQs, but online version uses interactive accordion

**Requirements**:

- All content visible (no collapsed panels)
- Clean layout (no navigation)
- Professional appearance when printed
- Still accessible on screen

**Solution**: Separate route with custom layout

**Approach**:

1. Create `/faqs-print` route - [`app/pages/faqs-print.vue`](https://github.com/ICJIA/icjia-accessibility-portal/blob/main/app/pages/faqs-print.vue)
2. Use same content source (`content/faqs.md`)
3. Create `print.vue` layout (no navbar/footer) - [`app/layouts/print.vue`](https://github.com/ICJIA/icjia-accessibility-portal/blob/main/app/layouts/print.vue)
4. Style for both screen preview and print output

**CSS Strategy**:

**File**: [`app/pages/faqs-print.vue`](https://github.com/ICJIA/icjia-accessibility-portal/blob/main/app/pages/faqs-print.vue)

```css
/* Screen view - simulate printed document */
@media screen {
  .print-container {
    max-width: 8.5in;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
    background: #fff;
  }

  .print-url {
    color: #0066cc; /* Blue, clickable */
    text-decoration: underline;
  }
}

/* Print view - clean output */
@media print {
  .print-container {
    padding: 0;
  }

  .print-url {
    color: #000; /* Black for cost-effective printing */
    text-decoration: none;
  }

  .skip-link {
    display: none; /* No skip link needed in print */
  }

  .print-faq-item {
    page-break-inside: avoid; /* Don't split Q&A */
  }
}
```

**Key Decisions**:

- Use serif fonts (Georgia) for print
- Black and white (except section headers)
- Include table of contents for navigation (non-clickable, bold text)
- Internal links styled as bold text (non-clickable) - section references don't work when printed
- External links remain functional with URLs appended for print accessibility
- Show URLs as text for reference
- Add last-updated date for context

**Link Handling**:

The printer-friendly page uses the [`usePrintLinks` composable`](https://github.com/ICJIA/icjia-accessibility-portal/blob/main/app/composables/usePrintLinks.ts) to automatically process links:

- **Internal links** (href starting with `#`): Converted to bold text, non-clickable (href removed). These indicate section names or question references.
- **External links** (http/https): Remain functional with URLs appended in parentheses for print accessibility.

This ensures internal section references don't appear as broken links when printed, while external resources remain accessible.

### Challenge 4: Skip Link Audit Validation

**Problem**: Custom skip link in printer page failed audit (9/12 passing)

**Initial Approach**: Custom implementation in printer page

**Issues**:

- Audit script looks for specific CSS patterns
- `left: -9999px` vs `top: -100px` matters
- z-index must be high enough (10000+)
- CSS must match expectations exactly

**Failed Attempt**:

**Note**: This is an example of what NOT to do. See [`app/components/SkipLink.vue`](https://github.com/ICJIA/icjia-accessibility-portal/blob/main/app/components/SkipLink.vue) for the correct implementation.

```css
.skip-link {
  left: -9999px; /* ❌ Audit expects top: -100px */
  z-index: 999; /* ❌ Too low */
}
```

**Successful Solution**: Reuse existing SkipLink component

**File**: [`app/layouts/print.vue`](https://github.com/ICJIA/icjia-accessibility-portal/blob/main/app/layouts/print.vue)

```vue
<!-- app/layouts/print.vue -->
<template>
  <div class="print-layout-wrapper">
    <SkipLink />
    <!-- ✅ Proven component -->
    <v-main id="main-content" tabindex="-1">
      <slot />
    </v-main>
  </div>
</template>
```

**Why it works**:

- Component already tested and validated
- Consistent CSS across all pages
- DRY principle (don't repeat yourself)
- Single source of truth for skip link behavior

**Lesson Learned**: When you have a working, tested component, use it. Don't reinvent the wheel.

### Challenge 5: Countdown Timer State Management

**Problem**: Countdown needs to update every second without causing full page re-renders

**Solution**: Composable with reactive state

**File**: [`app/composables/useDeadlineCountdown.ts`](https://github.com/ICJIA/icjia-accessibility-portal/blob/main/app/composables/useDeadlineCountdown.ts)

```typescript
// composables/useDeadlineCountdown.ts

// Chicago timezone (CDT = UTC-5 in April when deadline occurs)
const CHICAGO_TZ_OFFSET = "-05:00";
const DEADLINE_DATE = new Date(
  `2026-04-24T00:00:00${CHICAGO_TZ_OFFSET}`
).getTime();

export function useDeadlineCountdown() {
  const now = ref(Date.now());

  const daysRemaining = computed(() => {
    const distance = DEADLINE_DATE - now.value;
    return Math.floor(distance / (1000 * 60 * 60 * 24));
  });

  onMounted(() => {
    // Update every minute (not second - saves CPU)
    intervalId = setInterval(() => {
      now.value = Date.now();
    }, 60000);
  });

  onUnmounted(() => {
    clearInterval(intervalId);
  });

  return { daysRemaining, deadlinePassed, urgencyText };
}
```

**Optimizations**:

- Update every minute (not every second for days counter)
- Use computed for derived values
- Clean up interval on unmount

**Timezone Handling** (Best Practice):

All date calculations in this project use explicit timezone offsets to ensure consistency across environments:

- **Chicago timezone (America/Chicago)** is used for Illinois state agencies
- **CDT (Central Daylight Time) = UTC-5** applies March through November
- **CST (Central Standard Time) = UTC-6** applies November through March
- April 24, 2026 (the deadline) falls in CDT, so `-05:00` is used

This ensures that the countdown displays the same value regardless of whether the code runs on a server in UTC, a developer's local machine, or a user's browser in a different timezone

### Challenge 6: Vuetify Console Logging in Development

**⚠️ This issue affects ALL Vuetify 3 + Nuxt 4 applications**

**Problem**: Vuetify instance objects are logged to console (both command line and browser) during development, build, and generate processes, creating noise and warnings.

**Symptoms**:

- Large Vuetify object dumps in command line console (during `yarn dev`, `yarn build`, `yarn generate`)
- Vuetify object dumps in browser DevTools console
- Warning: "Failed to stringify dev server logs. Received DevalueError: Cannot stringify a function."

**Root Cause**:

**Universal Vuetify 3 + Nuxt 4 compatibility issue** where Vuetify exposes functions in its configuration that can't be serialized by Nuxt's dev server logging system. This affects:

- All Vuetify 3 applications using `vuetify-nuxt-module`
- All Nuxt 4 applications with Vuetify integration
- The Vuetify instance object contains:
  - `install` and `unmount` functions
  - Reactive properties (RefImpl, ComputedRefImpl)
  - Theme, icons, locale, display, and other configuration objects
  - Functions that can't be JSON.stringify'd

**Solution**: Client-side and server-side plugins to suppress Vuetify logs

**Applicability**: This solution works for **any Vuetify 3 + Nuxt 4 application**. Simply copy the plugins to your project.

**Implementation**:

**File**: [`app/plugins/suppress-vuetify-logs.client.ts`](https://github.com/ICJIA/icjia-accessibility-portal/blob/main/app/plugins/suppress-vuetify-logs.client.ts)

```typescript
// Client-side plugin (browser console)
export default defineNuxtPlugin(() => {
  if (process.server || !import.meta.dev) return;

  const originalLog = console.log;
  const originalInfo = console.info;
  const originalDebug = console.debug;

  const filteredLog = (...args: any[]) => {
    if (!containsVuetifyInstanceOrConfig(args)) {
      originalLog.apply(console, args);
    }
  };

  console.log = filteredLog;
  console.info = filteredInfo;
  console.debug = filteredDebug;
});
```

**File**: [`app/plugins/suppress-vuetify-logs.server.ts`](https://github.com/ICJIA/icjia-accessibility-portal/blob/main/app/plugins/suppress-vuetify-logs.server.ts)

```typescript
// Server-side plugin (command line console)
// Works in dev, build, and generate modes
export default defineNuxtPlugin(() => {
  if (!process.server) return;

  // Suppress in development, build, and generate modes
  // Check if we're NOT in production (production shouldn't have these logs anyway)
  const isProduction =
    process.env.NODE_ENV === "production" && import.meta.prod;
  if (isProduction) return;

  const originalLog = console.log;
  const originalWarn = console.warn;

  const filteredLog = (...args: any[]) => {
    // NEVER filter errors, warnings, or important messages
    if (isErrorOrWarning(args)) {
      originalLog.apply(console, args);
      return;
    }

    // Suppress Vuetify instance objects
    if (containsVuetifyInstanceOrConfig(args)) return;

    // Suppress stringification warnings related to Vuetify
    const message = args[0]?.toString() || "";
    if (message.includes("Failed to stringify dev server logs")) return;

    originalLog.apply(console, args);
  };

  const filteredWarn = (...args: any[]) => {
    // NEVER filter actual errors or important warnings
    // Only suppress the specific harmless stringification warning
    const message = args[0]?.toString() || "";
    if (
      message.includes("DevalueError") ||
      message.includes("Cannot stringify a function")
    ) {
      return; // Suppress harmless Vuetify serialization warnings
    }
    originalWarn.apply(console, args);
  };

  console.log = filteredLog;
  console.warn = filteredWarn;
});
```

**Detection Logic**:

The plugins detect Vuetify instances by checking for:

- `install` and `unmount` functions (key indicators)
- Instance properties: `theme`, `icons`, `locale`, `defaults`, `display`, `date`, `goTo`
- Function properties (common in Vuetify objects)
- Constructor names containing "vuetify"

**Error Preservation**:

The plugins **NEVER** filter:

- `console.error()` calls (never intercepted)
- Error objects (always preserved)
- Messages containing error/warning keywords (hydration, component errors, etc.)
- Vue component instances (have `$el`, `$props`, etc.)
- All other important console output

**Important**: The plugins specifically preserve:

- All Vuetify component errors and warnings
- Hydration errors
- Render errors
- Component errors
- All `console.error()` output

**Key Details**:

- **Client-side plugin** (`.client.ts`): Only runs in browser, filters browser console, development mode only
- **Server-side plugin** (`.server.ts`): Runs on server in dev, build, and generate modes, filters command line output
- **Error preservation**: `console.error()` is never intercepted, all errors always pass through
- **Non-invasive**: Doesn't modify Vuetify's functionality, only filters console output
- **Vuetify MCP compatible**: Doesn't interfere with Vuetify MCP server operations

**Configuration Note**:

**File**: [`nuxt.config.ts`](https://github.com/ICJIA/icjia-accessibility-portal/blob/main/nuxt.config.ts)

```typescript
// Note: Vuetify configuration objects may appear in console logs (both command line and browser)
// due to Vuetify + Nuxt 4 compatibility where Vuetify exposes functions in its configuration
// that can't be serialized. This is a known harmless issue that doesn't affect functionality.
// Client-side console logs are suppressed by app/plugins/suppress-vuetify-logs.client.ts
// Server-side logs (command line) are from Nuxt's dev server and are harmless.
vuetify: {
  moduleOptions: {
    styles: true
  },
  vuetifyOptions: {
    // ... configuration
  }
}
```

**Verification**:

After implementing the plugins:

- ✅ No Vuetify object dumps in command line (dev, build, generate)
- ✅ No Vuetify object dumps in browser console
- ✅ No "Failed to stringify dev server logs" warnings
- ✅ All Vuetify errors still visible (hydration, component errors, etc.)
- ✅ All `console.error()` calls preserved
- ✅ All other console output preserved (errors, warnings, etc.)
- ✅ Vuetify functionality unaffected

**Best Practices Compliance**:

- Follows Vuetify best practices (non-invasive, doesn't modify Vuetify)
- Compatible with Vuetify MCP server
- Preserves important debugging information
- Only suppresses configuration/instance object noise
- Properly documented with JSDoc comments

**Lesson Learned**: When working with frameworks that expose complex objects with functions, console logging can create noise. Intercepting console methods is a valid approach to clean up development output without affecting functionality.

### Challenge 7: Chrome DevTools 404 Error in Generated Site

**⚠️ This issue affects ALL static-generated Nuxt applications**

**Problem**: 404 error for `/.well-known/appspecific/com.chrome.devtools.json` appears when serving generated static sites.

**Symptoms**:

- 404 error in server logs: `GET /.well-known/appspecific/com.chrome.devtools.json`
- Only appears when running `yarn generate` and serving the static site
- Does not appear in `yarn dev` (development mode)
- Appears in any static file server (serve, nginx, Netlify, etc.)

**Root Cause**:

**Universal Chrome DevTools behavior**: Chrome DevTools automatically requests this file when DevTools is open. This is a harmless Chrome DevTools feature that checks for custom DevTools configurations. The request is:

- **Not related to favicons** - Favicons are separate
- **Not related to Nuxt DevTools** - Works regardless of Nuxt DevTools settings
- **Not an application error** - Just Chrome checking for optional configuration
- **Affects all static sites** - Not specific to Vuetify or Nuxt

**Why it only appears in generated sites**:

- **Development mode** (`yarn dev`): Nuxt handles all routes dynamically, so the 404 may not be visible or is handled differently
- **Generated site** (`yarn generate`): Static files are served directly, so missing files return explicit 404 errors
- **Any static server**: This affects any static file server serving a Nuxt-generated site

**Solution**: Create empty JSON file to satisfy Chrome's request

**Applicability**: This solution works for **any static-generated Nuxt application** (with or without Vuetify). Simply create the file in your `public/` directory.

**Implementation**:

**File**: [`public/.well-known/appspecific/com.chrome.devtools.json`](https://github.com/ICJIA/icjia-accessibility-portal/blob/main/public/.well-known/appspecific/com.chrome.devtools.json)

```json
{}
```

**How it works**:

1. File is placed in `public/.well-known/appspecific/com.chrome.devtools.json`
2. Nuxt automatically copies all files from `public/` to `.output/public/` during generation
3. Chrome's request is satisfied with an empty JSON object
4. 404 error is eliminated

**Key Details**:

- **Harmless request**: Chrome DevTools checks for this file automatically
- **Optional file**: The file is not required for functionality
- **Empty JSON**: `{}` is sufficient to satisfy Chrome's request
- **Automatic copying**: Nuxt handles the file copy during generation

**Verification**:

After implementing the fix:

- ✅ No 404 error in server logs
- ✅ Chrome DevTools works normally
- ✅ No impact on application functionality
- ✅ File is automatically included in generated site

**Alternative Approaches Considered**:

1. **Ignore the 404**: Could be ignored as harmless, but creates noise in logs
2. **Server redirect**: Could redirect, but creating the file is simpler
3. **Nuxt route**: Could create a route, but static file is more appropriate

**Best Practice**: When Chrome or other tools make standard requests for optional configuration files, providing an empty/default file is better than returning 404 errors, even if harmless.

**Lesson Learned**: Some 404 errors are harmless browser/tool requests. Providing minimal files to satisfy these requests keeps logs clean and follows web standards for `.well-known` paths.

### Challenge 8: Prerender 404 Errors for Static Documentation Routes

**⚠️ This issue affects ALL static-generated Nuxt applications with static HTML files in `public/`**

**Problem**: During static site generation (`yarn generate`), Nitro attempts to prerender routes that are linked from pages, but if those routes are static HTML files in the `public/` directory (not Nuxt routes), Nitro will fail with 404 errors and abort the build.

**Symptoms**:

- Build fails with error: `[404] Page not found: /docs/architecture`
- Error message: `Exiting due to prerender errors`
- Build exits with code 1
- Routes are linked from multiple pages (e.g., `/`, `/links`, `/faqs`)

**Root Cause**:

When Nitro's `crawlLinks: true` is enabled, it automatically discovers links from prerendered pages and attempts to prerender them. However, if a linked route points to a static HTML file in `public/` (like `/docs/architecture/index.html`), Nitro tries to prerender it as a Nuxt route, which doesn't exist, causing a 404.

**Why it happens**:

- **Static files in `public/`**: Files in `public/` are copied to the output directory but are not Nuxt routes
- **Link crawling**: Nitro discovers links during prerendering and tries to prerender them
- **Route vs. static file**: Nitro expects a route handler (page component), but finds only a static file
- **Default behavior**: Nitro's `failOnError: true` (default) causes the build to abort on 404s

**Solution**: Add static documentation routes to the prerender ignore list

**Applicability**: This solution works for **any static-generated Nuxt application** that has static HTML files in `public/` that are linked from pages.

**Implementation**:

**File**: [`nuxt.config.ts`](https://github.com/ICJIA/icjia-accessibility-portal/blob/main/nuxt.config.ts)

```typescript
// nuxt.config.ts
nitro: import.meta.dev
  ? {}
  : {
      preset: "static",
      prerender: {
        crawlLinks: true,
        ignore: ["/docs/accessibility", "/docs/architecture"],
      },
    };
```

**How it works**:

1. Static files in `public/` are automatically copied to `.output/public/` during generation
2. The `ignore` array tells Nitro to skip prerendering these routes
3. Links to these routes still work because the static files are served directly
4. Build completes successfully without 404 errors

**Key Details**:

- **Static files are copied automatically**: Files in `public/` are always copied to the output directory
- **Ignore prevents prerendering**: Nitro skips trying to prerender ignored routes
- **Links still work**: Static files are served directly, so links function correctly
- **Both routes needed**: Any static documentation route that's linked must be in the ignore list

**Verification**:

After implementing the fix:

- ✅ Build completes successfully
- ✅ No 404 errors during prerendering
- ✅ Static documentation routes are accessible
- ✅ Links to documentation routes work correctly

**Alternative Approaches Considered**:

1. **Remove links**: Could remove links, but documentation should be accessible
2. **Create Nuxt routes**: Could create page components, but static files are more appropriate for documentation
3. **Disable link crawling**: Could set `crawlLinks: false`, but this prevents automatic route discovery

**Best Practice**: When you have static HTML files in `public/` that are linked from pages, always add them to the prerender ignore list to prevent build failures.

**Lesson Learned**: Static files in `public/` are not Nuxt routes. If they're linked from pages and Nitro is crawling links, they must be explicitly ignored during prerendering to prevent build failures.

### Challenge 10: Accessible Document Downloads (Replacing Inaccessible PDFs)

**Problem**: Playwright's `page.pdf()` generates visually-accurate PDFs that lack PDF/UA accessibility features (tagged structure, reading order, proper headings). This makes PDFs inaccessible to screen reader users.

**Initial Approach**: Generate PDF using Playwright print-to-PDF

**Issues**:

- PDFs generated by Playwright lack tagged structure
- No proper heading hierarchy for navigation
- No reading order defined
- Links not properly tagged
- PDF/UA compliance not achievable with this method

**Solution**: Replace PDF with multiple accessible formats

**File**: [`app/components/DownloadDialog.vue`](https://github.com/ICJIA/icjia-accessibility-portal/blob/main/app/components/DownloadDialog.vue)

**Formats Provided**:

| Format                | File                            | Accessibility                                | Best Use Case            |
| --------------------- | ------------------------------- | -------------------------------------------- | ------------------------ |
| **Word (.docx)**      | `ICJIA-Accessibility-FAQs.docx` | Heading hierarchy, hyperlinks, tables        | Screen reader users      |
| **Markdown (.md)**    | `ICJIA-Accessibility-FAQs.md`   | Plain text readable, renders with formatting | Developers, AI/LLM input |
| **Plain Text (.txt)** | `ICJIA-Accessibility-FAQs.txt`  | Universal, works everywhere                  | Maximum compatibility    |

**Implementation**:

1. **Generator Scripts** (in `scripts/`):
   - `generate-faq-docx.js` - Creates Word document with proper structure
   - `generate-faq-md.js` - Creates Markdown with metadata
   - `generate-faq-txt.js` - Creates plain text with ASCII separators

2. **Server Routes** (in `server/routes/` for `yarn dev`):
   - `ICJIA-Accessibility-FAQs.docx.ts`
   - `ICJIA-Accessibility-FAQs.md.ts`
   - `ICJIA-Accessibility-FAQs.txt.ts`

3. **Build Time Generation** (`postgenerate` script):
   - Files generated to `.output/public/` during `yarn generate`

**Key Learnings**:

- Playwright/Puppeteer print-to-PDF is not accessible
- True PDF accessibility requires tools like Adobe Acrobat, iText, or specialized libraries
- Multiple formats give users choice based on their needs
- Word documents with proper headings are excellent for screen readers

### Challenge 11: Responsive Dialog Design

**Problem**: Download dialog needs to work across all viewport sizes, from small phones to large desktops

**Solution**: Vuetify's responsive utilities combined with comprehensive CSS media queries

**File**: [`app/components/DownloadDialog.vue`](https://github.com/ICJIA/icjia-accessibility-portal/blob/main/app/components/DownloadDialog.vue)

```typescript
// Responsive breakpoint detection with fallback for test environments
import { useDisplay } from "vuetify";

let smAndDown = ref(false);
try {
  const display = useDisplay();
  smAndDown = display.smAndDown;
} catch {
  // Fallback for test environments where Vuetify context may not be available
  smAndDown = ref(false);
}

const isMobile = computed(() => smAndDown.value);
```

```vue
<v-dialog v-model="isOpen" max-width="550" :fullscreen="isMobile"></v-dialog>
```

**Responsive Breakpoints**:

| Breakpoint                   | Behavior                                                   |
| ---------------------------- | ---------------------------------------------------------- |
| Desktop (> 960px)            | Modal dialog, max-width 550px                              |
| Tablet (768px - 959px)       | Modal dialog, slightly smaller padding                     |
| Small tablet (600px - 767px) | Modal dialog, condensed layout                             |
| Mobile (< 600px)             | **Fullscreen dialog**, touch-friendly                      |
| Very small (< 360px)         | Fullscreen, minimal padding, hidden non-essential elements |
| Landscape mobile             | Condensed, hidden descriptions                             |

**Accessibility Considerations**:

- **Touch targets**: Minimum 60px height on mobile for WCAG compliance
- **High contrast mode**: Explicit borders and outlines for forced-colors
- **Reduced motion**: Respects `prefers-reduced-motion` preference
- **Print mode**: Dialog hidden when printing

**Test Environment Handling**:

The component gracefully handles missing Vuetify context (common in unit tests) by wrapping `useDisplay()` in a try/catch and falling back to non-fullscreen mode.

### Challenge 9: Netlify Deployment Failure After Dependency Updates

**Problem**: Netlify builds failing with platform incompatibility errors after updating dependencies

**Symptoms**:

- Build fails during `yarn install` on Netlify
- Error: `@oxc-minify/binding-darwin-arm64@0.106.0: The platform "linux" is incompatible with this module`
- Error: `The CPU architecture "x64" is incompatible with this module`
- Similar errors for `@oxc-parser/binding-darwin-arm64`, `@oxc-transform /binding-darwin-arm64`, `@rollup/rollup-darwin-arm64`

**Root Cause**:

During dependency update troubleshooting, platform-specific native bindings were added as direct dependencies in `package.json`. These packages are macOS ARM64-specific (`darwin-arm64`) and should not be hard dependencies because:

1. **Netlify builds on Linux x64** - The build environment is incompatible with macOS-specific packages
2. **Parent packages handle platform selection** - Packages like `rollup`, `oxc-parser`, etc. automatically pull in the correct platform-specific bindings as optional dependencies
3. **Cross-platform projects need flexibility** - Direct platform-specific dependencies break builds on different platforms

**Error Context**:

```
error @oxc-minify/binding-darwin-arm64@0.106.0: The platform "linux" is incompatible with this module.
error @oxc-minify/binding-darwin-arm64@0.106.0: The CPU architecture "x64" is incompatible with this module.
error Found incompatible module.
```

**Solution**: Remove platform-specific native bindings from `package.json`

**What to Remove**:

- `@oxc-minify/binding-darwin-arm64`
- `@oxc-parser/binding-darwin-arm64`
- `@oxc-transform/binding-darwin-arm64`
- `@rollup/rollup-darwin-arm64`

**Why This Works**:

- Parent packages (`rollup`, `oxc-parser`, etc.) automatically install the correct platform-specific bindings
- On macOS: darwin-arm64 bindings are installed
- On Linux (Netlify): linux-x64 bindings are installed
- On Windows: windows-x64 bindings are installed

**Implementation**:

**File**: [`package.json`](https://github.com/ICJIA/icjia-accessibility-portal/blob/main/package.json)

Remove these lines from `dependencies`:

```json
// ❌ DON'T include these
"@oxc-minify/binding-darwin-arm64": "^0.106.0",
"@oxc-parser/binding-darwin-arm64": "^0.106.0",
"@oxc-transform/binding-darwin-arm64": "^0.106.0",
"@rollup/rollup-darwin-arm64": "^4.54.0",
```

After removal, regenerate the lockfile:

```bash
yarn install  # or npm install
```

**Prevention**:

- Never add platform-specific native bindings as direct dependencies
- If troubleshooting requires installing them, remove them before committing
- Let parent packages handle platform-specific bindings automatically
- Test builds on the target platform (Netlify uses Linux x64)

**Lesson Learned**: Platform-specific native bindings should always be optional dependencies handled by parent packages, never direct dependencies in cross-platform projects.

---

## Vuetify 3 + Nuxt 4 Compatibility Guide

### Common Issues and Solutions

This section documents **universal issues** that affect all Vuetify 3 + Nuxt 4 applications and their solutions. These are not specific to this project but apply to any application using this stack.

#### Issue 1: Vuetify Console Logging

**Affects**: All Vuetify 3 + Nuxt 4 applications

**Problem**: Vuetify instance objects are logged to console during development, build, and generate.

**Solution**: Use the plugins from Challenge 6:

**Solution**: Use the plugins from Challenge 6:

- Copy `app/plugins/suppress-vuetify-logs.client.ts` to your project
- Copy `app/plugins/suppress-vuetify-logs.server.ts` to your project
- No configuration needed - works automatically

**Quick Fix for Any Project**:

1. Create `app/plugins/suppress-vuetify-logs.client.ts` (copy from this project)
2. Create `app/plugins/suppress-vuetify-logs.server.ts` (copy from this project)
3. Restart your dev server - Vuetify logs will be suppressed

**Important**: The plugins preserve all errors, warnings, and hydration messages. Only the Vuetify instance object dumps are filtered.

#### Issue 2: Chrome DevTools 404

**Affects**: All static-generated Nuxt applications

**Problem**: 404 error for `/.well-known/appspecific/com.chrome.devtools.json`

**Solution**: Create the file in your `public/` directory:

```bash
mkdir -p public/.well-known/appspecific
echo '{}' > public/.well-known/appspecific/com.chrome.devtools.json
```

**Quick Fix for Any Project**:

1. Create `public/.well-known/appspecific/com.chrome.devtools.json`
2. Add content: `{}`
3. File will be automatically copied during generation

#### Issue 3: Vuetify Configuration Serialization

**Affects**: All Vuetify 3 + Nuxt 4 applications using `vuetify-nuxt-module`

**Problem**: "Failed to stringify dev server logs" warning

**Solution**: This is handled by the suppress-vuetify-logs plugins (see Issue 1). The warning is harmless but can be suppressed.

**Note**: This is a known compatibility issue between Vuetify 3 and Nuxt 4. It doesn't affect functionality, only console output.

### Vuetify 3 + Nuxt 4 Best Practices

#### 1. Module Configuration

**Recommended Setup**:

**File**: [`nuxt.config.ts`](https://github.com/ICJIA/icjia-accessibility-portal/blob/main/nuxt.config.ts)

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: [
    "vuetify-nuxt-module",
    // ... other modules
  ],

  vuetify: {
    moduleOptions: {
      styles: true, // Include Vuetify styles
    },
    vuetifyOptions: {
      theme: {
        defaultTheme: "dark", // or 'light'
        themes: {
          // Your theme configuration
        },
      },
      icons: {
        defaultSet: "mdi", // Material Design Icons
      },
    },
  },

  build: {
    transpile: ["vuetify"], // Required for Vuetify
  },
});
```

#### 2. Suppressing Console Logs

**For Any Vuetify 3 + Nuxt 4 Project**:

1. Copy the suppress-vuetify-logs plugins from this project
2. Place them in `app/plugins/`
3. They automatically work in dev, build, and generate modes
4. All errors and warnings are preserved

#### 3. Handling .well-known Requests

**For Any Static-Generated Nuxt Project**:

1. Create `public/.well-known/appspecific/com.chrome.devtools.json`
2. Add empty JSON: `{}`
3. File is automatically included in generated output

#### 4. TypeScript Configuration

**Recommended**:

**File**: [`tsconfig.json`](https://github.com/ICJIA/icjia-accessibility-portal/blob/main/tsconfig.json)

```json
// tsconfig.json
{
  "compilerOptions": {
    "types": ["vuetify"]
  }
}
```

#### 5. Vuetify Component Usage

**Best Practices**:

- Use Vuetify components directly: `<v-btn>`, `<v-card>`, etc.
- Wrap app in `<v-app>` component (required)
- Use Vuetify's grid system: `<v-row>`, `<v-col>`
- Leverage Vuetify's theme system for consistent styling

---

## Best Practices & Patterns

### 1. Component Composition

**Pattern**: Small, focused components

```
CountdownTimer.vue       - Display only
  ↓ uses
useDeadlineCountdown.ts  - Logic and state
```

**Benefits**:

- Logic can be reused without UI
- Components stay simple and testable
- Easy to swap UI without changing logic

### 2. Composables for Shared Logic

**Examples**:

- `useSeo()` - Manage meta tags - [`app/composables/useSeo.ts`](https://github.com/ICJIA/icjia-accessibility-portal/blob/main/app/composables/useSeo.ts)
- `useSlugify()` - Generate URL slugs - [`app/composables/useSlugify.ts`](https://github.com/ICJIA/icjia-accessibility-portal/blob/main/app/composables/useSlugify.ts)
- `useFaqCollapse()` - Manage accordion state - [`app/composables/useFaqCollapse.ts`](https://github.com/ICJIA/icjia-accessibility-portal/blob/main/app/composables/useFaqCollapse.ts)
- `useDeadlineCountdown()` - Countdown logic - [`app/composables/useDeadlineCountdown.ts`](https://github.com/ICJIA/icjia-accessibility-portal/blob/main/app/composables/useDeadlineCountdown.ts)

**Pattern**:

**Example**: [`app/composables/useDeadlineCountdown.ts`](https://github.com/ICJIA/icjia-accessibility-portal/blob/main/app/composables/useDeadlineCountdown.ts)

```typescript
export function useComposableName() {
  // State
  const state = ref(initialValue);

  // Computed
  const derived = computed(() => transform(state.value));

  // Methods
  function doSomething() {
    state.value = newValue;
  }

  // Lifecycle
  onMounted(() => {
    /* setup */
  });
  onUnmounted(() => {
    /* cleanup */
  });

  // Return public API
  return { state, derived, doSomething };
}
```

### 3. Type Safety with TypeScript

**Benefits**:

- Catch errors at compile time
- Better IDE autocomplete
- Self-documenting code
- Refactoring confidence

**Example**:

**File**: [`app/utils/faqTransform.ts`](https://github.com/ICJIA/icjia-accessibility-portal/blob/main/app/utils/faqTransform.ts)

```typescript
interface FaqItem {
  question: string;
  answer: MiniMarkNode[];
  isNew?: boolean;
  newDate?: string;
}

interface FaqSection {
  heading: string | null;
  items: FaqItem[];
}

const faqSections = computed<FaqSection[]>(() => {
  // TypeScript ensures return type matches
  return parseFaqs(page.value);
});
```

### 4. SEO with Composable

**Pattern**: Centralized SEO management

**File**: [`app/composables/useSeo.ts`](https://github.com/ICJIA/icjia-accessibility-portal/blob/main/app/composables/useSeo.ts)

```typescript
// composables/useSeo.ts
export function useSeo(options: SeoOptions) {
  useHead({
    title: options.title,
    meta: [
      { name: "description", content: options.description },
      { property: "og:title", content: options.title },
      { property: "og:description", content: options.description },
      { property: "og:url", content: `${baseUrl}${options.url}` },
      { property: "og:type", content: options.type || "website" },
      { name: "twitter:card", content: "summary_large_image" },
      // ... more tags
    ],
    link: [{ rel: "canonical", href: `${baseUrl}${options.url}` }],
  });
}

// Usage in page
useSeo({
  title: "FAQs - Accessibility Portal",
  description: "Comprehensive FAQ about web accessibility...",
  url: "/faqs",
  keywords: ["accessibility", "WCAG", "ADA"],
});
```

### 5. Error Handling

**Strategy**: Graceful degradation

**Example**: [`app/pages/faqs.vue`](https://github.com/ICJIA/icjia-accessibility-portal/blob/main/app/pages/faqs.vue)

```vue
<template>
  <div v-if="page">
    <!-- Content -->
  </div>
  <div v-else-if="error">
    <h1>Error Loading Content</h1>
    <p>{{ error.message }}</p>
  </div>
  <div v-else>
    <v-progress-circular indeterminate />
    <p>Loading...</p>
  </div>
</template>
```

### 6. Responsive Design

**Strategy**: Mobile-first with breakpoints

**Example Pattern**: Used throughout the application (e.g., [`app/pages/index.vue`](https://github.com/ICJIA/icjia-accessibility-portal/blob/main/app/pages/index.vue))

```css
/* Mobile first (default) */
.element {
  font-size: 0.875rem;
  padding: 0.5rem;
}

/* Tablet and up */
@media (min-width: 768px) {
  .element {
    font-size: 1rem;
    padding: 1rem;
  }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .element {
    font-size: 1.125rem;
    padding: 1.5rem;
  }
}
```

---

## Testing & Validation

### Accessibility Testing with axe-core

**Script**: `audit-accessibility.js` - [View on GitHub](https://github.com/ICJIA/icjia-accessibility-portal/blob/main/audit-accessibility.js)

**Features**:

- Tests all routes automatically (from sitemap.xml)
- Tests multiple viewports (desktop, tablet, mobile)
- Generates HTML report with detailed results
- Validates skip links specifically
- Zero tolerance for violations

**Configuration**:

**File**: [`audit-accessibility.js`](https://github.com/ICJIA/icjia-accessibility-portal/blob/main/audit-accessibility.js)

```javascript
const VIEWPORTS = [
  { name: "desktop", width: 1920, height: 1080 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 375, height: 667 },
];

const THEME = { name: "dark" };

const AXE_CONFIG = {
  runOnly: {
    type: "tag",
    values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"],
  },
};
```

**Custom Rules**:

**File**: [`audit-accessibility.js`](https://github.com/ICJIA/icjia-accessibility-portal/blob/main/audit-accessibility.js)

```javascript
// Enabled rules
axe.configure({
  rules: [
    { id: "aria-allowed-role", enabled: true },
    { id: "scrollable-region-focusable", enabled: true },
    { id: "landmark-banner-is-top-level", enabled: true },
    // ... more rules
  ],
});
```

**Skip Link Validation**:

**File**: [`audit-accessibility.js`](https://github.com/ICJIA/icjia-accessibility-portal/blob/main/audit-accessibility.js)

```javascript
async function verifySkipLink(page) {
  return await page.evaluate((config) => {
    const skipLink = document.querySelector(config.selector);
    if (!skipLink) return { exists: false, issues: ["Not found"] };

    const target = document.getElementById(config.targetId);
    if (!target)
      return {
        exists: true,
        issues: ["Target not found"],
      };

    // Check if target is focusable
    const tabindex = target.getAttribute("tabindex");
    if (tabindex !== "-1" && tabindex !== "0") {
      return {
        exists: true,
        issues: ["Target not focusable"],
      };
    }

    // Check positioning
    const style = window.getComputedStyle(skipLink);
    if (style.position !== "absolute" || !style.top.includes("-100")) {
      return {
        exists: true,
        issues: ["Not properly positioned off-screen"],
      };
    }

    return { exists: true, working: true, issues: [] };
  }, SKIP_LINK_CONFIG);
}
```

**Running Tests**:

```bash
# Quick audit (console output)
yarn audit:a11y
```

### Performance Testing

**Performance Monitoring**:

- Monitor Core Web Vitals (LCP, FID, CLS)
- Track bundle size
- Check loading performance
- Use browser DevTools for performance analysis

### Test Documentation Best Practices

**Problem**: Tests serve as documentation, but often their purpose is unclear

**Solution**: Comprehensive test descriptions in HTML reports with expandable dropdowns

**Reference Implementation**: [https://accessibility.icjia.app/docs/tests/](https://accessibility.icjia.app/docs/tests/)

**File**: [`test/run-all-tests.js`](https://github.com/ICJIA/icjia-accessibility-portal/blob/main/test/run-all-tests.js)

#### Project Categorization

Tests are automatically categorized by their directory structure for organized reporting:

```javascript
// Track stats by project/category
const fileName = testFile.name || "";
let project = "other";
if (fileName.includes("/test/utils/")) project = "utils";
else if (fileName.includes("/test/composables/")) project = "composables";
else if (fileName.includes("/test/components/")) project = "components";
else if (fileName.includes("/test/plugins/")) project = "plugins";
else if (fileName.includes("/test/unit/")) project = "unit";
else if (fileName.includes("/test/nuxt/")) project = "nuxt";
else if (fileName.includes("/test/e2e/")) project = "e2e";
```

#### Test Description Object

```javascript
/**
 * Test Descriptions
 * Maps test name patterns to human-readable descriptions explaining what each test verifies.
 * Used to generate expandable documentation in the HTML test report.
 *
 * IMPORTANT: Add a description for EVERY test in your project.
 * The description appears in a <details> dropdown under each test result.
 */
const TEST_DESCRIPTIONS = {
  // Sanitize Utility Tests
  "should escape < character":
    "Verifies the sanitizeString function converts '<' to '&lt;' HTML entity. This prevents XSS attacks by ensuring user input containing HTML tags cannot be interpreted as actual HTML when rendered in the browser.",

  // Config Loader Tests
  "should load configuration from file":
    "Verifies the config loader can read JSON configuration files from the config/ directory. Configuration is loaded synchronously at startup for immediate availability.",

  // Composable Tests
  "should return a composable object":
    "Verifies the composable returns an object with expected properties. This confirms the composable's public API is correct.",

  // Add descriptions for each test in your project...
  // The key must match the test title exactly (from the `it()` or `test()` call)
};
```

#### HTML Dropdown Generation

Each test case generates an expandable description using the `<details>` element:

```javascript
const statusIcon =
  caseStatus === "passed" ? "✅" : caseStatus === "failed" ? "❌" : "⚠️";

// Look up description for this test
const description = TEST_DESCRIPTIONS[title] || null;
const descriptionHTML = description
  ? `<details class="test-case-description">
      <summary>What does this test verify?</summary>
      <div class="description-content">
        <p>${description}</p>
      </div>
    </details>`
  : "";

return `
  <div class="test-case ${caseClass}">
    <div class="test-case-title">${statusIcon} ${title}</div>
    <div class="test-case-duration">Duration: ${duration}</div>
    ${descriptionHTML}
    ${failureHTML}
  </div>`;
```

#### Dropdown CSS Styling

```css
.test-case-description {
  margin-top: 0.5rem;
}

.test-case-description summary {
  font-size: 0.8rem;
  color: #0d6efd;
  cursor: pointer;
  user-select: none;
}

.test-case-description summary:hover {
  text-decoration: underline;
}

.test-case-description summary::before {
  content: "▶";
  font-size: 0.6rem;
  transition: transform 0.2s ease;
}

.test-case-description[open] summary::before {
  transform: rotate(90deg);
}

.test-case-description .description-content {
  margin-top: 0.5rem;
  padding: 0.75rem;
  background: #e7f1ff;
  border-left: 3px solid #0d6efd;
  border-radius: 4px;
  font-size: 0.85rem;
  color: #0a58ca;
  line-height: 1.5;
}
```

**Best Practices for Test Descriptions**:

1. **What**: Explain what the test verifies
2. **Why**: Explain why this matters (accessibility, compliance, UX)
3. **How**: Include technical implementation details when relevant
4. **Expected outcome**: Clarify what success looks like

**Example of a Good Description**:

> "Verifies the sanitizeString function converts '<' to '&lt;' HTML entity. This prevents XSS attacks by ensuring user input containing HTML tags cannot be interpreted as actual HTML when rendered in the browser."

**Benefits**:

- Tests serve as living documentation
- New developers understand test purpose
- AI/LLM can understand testing requirements
- Non-technical stakeholders can review test coverage
- HTML reports are self-explanatory
- Debugging is faster with context

---

## Search Functionality

### Overview

The portal includes a powerful fuzzy search feature powered by **Fuse.js** that allows users to instantly search across all FAQs with relevance-based ranking.

**Route**: `/search` - [`app/pages/search.vue`](https://github.com/ICJIA/icjia-accessibility-portal/blob/main/app/pages/search.vue)

### Search Configuration

All search parameters are externalized to a JSON configuration file for easy tuning without code changes.

**File**: [`search.config.json`](https://github.com/ICJIA/icjia-accessibility-portal/blob/main/search.config.json)

```json
{
  "keys": [
    { "name": "question", "weight": 0.7 },
    { "name": "answer", "weight": 0.3 }
  ],
  "includeScore": true,
  "includeMatches": true,
  "threshold": 0.25,
  "distance": 100,
  "minMatchCharLength": 3,
  "ignoreLocation": true,
  "shouldSort": true,
  "relevanceLabels": {
    "excellent": { "maxScore": 0.05, "color": "success" },
    "good": { "maxScore": 0.15, "color": "info" },
    "fair": { "maxScore": 0.25, "color": "warning" },
    "partial": { "maxScore": 1.0, "color": "grey" }
  },
  "display": {
    "minSearchLength": 2,
    "answerPreviewLength": 200,
    "contextBefore": 50,
    "contextAfter": 100
  }
}
```

### Key Configuration Options

| Option           | Value                      | Description                                                        |
| ---------------- | -------------------------- | ------------------------------------------------------------------ |
| `threshold`      | 0.25                       | Controls fuzzy matching strictness (0 = exact, 1 = match anything) |
| `keys.weight`    | question: 0.7, answer: 0.3 | Prioritizes matches in questions over answers                      |
| `shouldSort`     | true                       | Ensures results are ranked by relevance (best first)               |
| `ignoreLocation` | true                       | Matches can be anywhere in the text                                |
| `includeScore`   | true                       | Includes score for relevance labeling                              |
| `includeMatches` | true                       | Includes match positions for highlighting                          |

### Relevance Ranking

Results are sorted by Fuse.js score in **ascending order** (lower score = better match):

| Label         | Score Range | Color            | Description        |
| ------------- | ----------- | ---------------- | ------------------ |
| **Excellent** | < 0.05      | Green (success)  | Near-perfect match |
| **Good**      | < 0.15      | Blue (info)      | Strong match       |
| **Fair**      | < 0.25      | Orange (warning) | Moderate match     |
| **Partial**   | ≥ 0.25      | Grey             | Weak/fuzzy match   |

### Search Features

**Implemented Features**:

- **Fuzzy Matching** - Handles typos and partial matches
- **Weighted Search** - Question matches rank higher than answer matches
- **Match Highlighting** - Matched text is highlighted in results
- **Relevance Badges** - Visual indicator of match quality
- **Result Numbering** - Shows position in ranked results
- **Section Badges** - Shows which FAQ section the result belongs to
- **"New" Badges** - Indicates recently added questions
- **Answer Preview** - Shows context around matches in answers
- **Click to Open** - Opens FAQ in new tab with scroll-to and highlight

### Search Testing

Comprehensive tests ensure search functionality works correctly:

**Unit Tests**: [`test/unit/searchConfig.test.ts`](https://github.com/ICJIA/icjia-accessibility-portal/blob/main/test/unit/searchConfig.test.ts)

- Validates configuration structure
- Ensures proper threshold ranges
- Verifies key weights and relevance labels

**Nuxt Tests**: [`test/nuxt/search.test.ts`](https://github.com/ICJIA/icjia-accessibility-portal/blob/main/test/nuxt/search.test.ts)

- Tests Fuse.js behavior with realistic FAQ data
- Verifies ranking order (best matches first)
- Tests fuzzy matching, highlighting, and edge cases

### Accessibility Considerations

The search page maintains full WCAG 2.1 AA compliance:

- **Keyboard Navigation** - Full keyboard support for search and results
- **Screen Reader Support** - Proper ARIA labels and live regions
- **Focus Management** - Results are focusable with clear indicators
- **Color Independence** - Relevance indicated by text labels, not just colors

---

## API Documentation (JSDoc)

Comprehensive API documentation is generated from JSDoc comments using TypeDoc.

### Overview

All composables, utilities, and plugins include detailed JSDoc comments that are compiled into a browsable HTML documentation site.

### Configuration

**File**: [`typedoc.json`](https://github.com/ICJIA/icjia-accessibility-portal/blob/main/typedoc.json)

```json
{
  "tsconfig": "./tsconfig.typedoc.json",
  "entryPoints": [
    "app/composables/*.ts",
    "app/utils/*.ts",
    "app/plugins/*.ts",
    "docs-temp/components/*.ts",
    "docs-temp/pages/*.ts"
  ],
  "out": "public/docs/jsdoc",
  "name": "ICJIA Accessibility Portal - API Documentation",
  "sourceLinkTemplate": "https://github.com/ICJIA/icjia-accessibility-portal/blob/main/{path}#L{line}"
}
```

### Vue SFC Script Extraction

Since TypeDoc doesn't natively support Vue Single File Components, a custom extraction script (`scripts/extract-vue-scripts.js`) processes all Vue files:

1. Extracts `<script setup>` content from `.vue` files
2. Preserves JSDoc comments
3. Creates clean TypeScript files in `docs-temp/`
4. TypeDoc processes these extracted files

### Generation

```bash
# Generate API documentation (includes Vue script extraction)
yarn generate:jsdoc

# Also runs automatically during static site generation
yarn generate
```

### Documentation Coverage

| Category           | Files | Description                                                                                            |
| ------------------ | ----- | ------------------------------------------------------------------------------------------------------ |
| **Composables**    | 6     | `useDeadlineCountdown`, `useFaqCollapse`, `usePrintLinks`, `useSeo`, `useSlugify`, `useStructuredData` |
| **Utilities**      | 1     | `faqTransform.ts` with 15+ functions                                                                   |
| **Plugins**        | 7     | Client and server plugins                                                                              |
| **Vue Components** | 5     | `AppFooter`, `AppNavbar`, `CountdownTimer`, `FaqAccordion`, `SkipLink`                                 |
| **Vue Pages**      | 5     | `index`, `faqs`, `faqs-print`, `links`, `search`                                                       |

### Output Location

- **Directory**: `public/docs/jsdoc/`
- **URL**: `/docs/jsdoc/`
- **Portal Link**: Added to documentation portal (`/docs/`)

### JSDoc Best Practices Used

````typescript
/**
 * @fileoverview Module description at top of file
 * @description Detailed description of the module's purpose
 * @module moduleName
 */

/**
 * Function description explaining what it does.
 *
 * @param {string} paramName - Description of the parameter
 * @returns {ReturnType} Description of return value
 *
 * @example
 * ```ts
 * const result = functionName('value')
 * // Returns: expected result
 * ```
 */
export function functionName(paramName: string): ReturnType {
  // implementation
}
````

---

## Future Considerations

### Potential Enhancements

1. **Analytics**
   - Already has Plausible Analytics
   - Could add event tracking (FAQ opens, link clicks)
   - Privacy-friendly (no cookies)

2. **Internationalization (i18n)**
   - Multi-language support
   - Would need translated content files
   - Nuxt i18n module available

3. **CMS Integration**
   - Could integrate with Netlify CMS or Strapi
   - Would allow non-technical content updates
   - Trade-off: added complexity

4. **Progressive Web App (PWA)**
   - Offline support
   - Install to home screen
   - Would need service worker

### Scalability Considerations

**Current Scale**:

- 4 routes
- 1 large markdown file (3000 lines)
- ~50 FAQ questions
- Static generation works perfectly

**If Scaling to 100+ Routes**:

- Consider on-demand ISR (Incremental Static Regeneration)
- Split large markdown files into smaller ones
- Use database for dynamic content
- Implement caching strategy

**If Adding User Accounts**:

- Switch to SSR or hybrid rendering
- Add authentication (Auth0, Supabase, etc.)
- Consider edge functions for auth

### Maintenance Tips

1. **Content Updates**
   - Edit markdown files directly
   - Add `{new:YYYY-MM-DD}` for new questions
   - Badge expires automatically after 10 days

2. **Accessibility Audits**
   - Run `yarn audit:a11y` before each release
   - Must show 0 violations
   - Must show 12/12 skip links working

3. **Dependencies**
   - Update regularly: `yarn upgrade-interactive`
   - Test after updates
   - Check for breaking changes in major versions

4. **Performance Monitoring**
   - Monitor bundle size
   - Check Core Web Vitals using browser DevTools
   - Use production site for accurate performance metrics

---

## Replicating Vuetify 3 + Nuxt 4 Applications

### For Any Vuetify 3 + Nuxt 4 Project

If you want to build a Vuetify 3 + Nuxt 4 application (not just accessibility portals):

**Start With**:

1. **Nuxt 4** - Latest version with Vue 3 support
2. **Vuetify 3** - Material Design component library
3. **vuetify-nuxt-module** - Official Nuxt module for Vuetify
4. **TypeScript** - Type safety and better IDE support
5. **(Optional) Nuxt Content 3** - For markdown-based content management
6. **(Optional) axe-core** - For accessibility testing

**Universal Vuetify 3 + Nuxt 4 Checklist**:

- ✅ **Vuetify configuration** - Properly configured in `nuxt.config.ts`
- ✅ **Console log suppression** - Use suppress-vuetify-logs plugins (Challenge 6)
- ✅ **Chrome DevTools fix** - Create `.well-known/appspecific/com.chrome.devtools.json` (Challenge 7)
- ✅ **Prerender 404 fix** - Add static documentation routes to prerender ignore list (Challenge 8)
- ✅ **TypeScript setup** - Proper types for Vuetify components
- ✅ **Composables for shared logic** - Reusable Vue composables
- ✅ **Multiple layouts** - Different layouts for different page types
- ✅ **Responsive design** - Mobile-first approach with Vuetify's grid system
- ✅ **Theme configuration** - Proper light/dark theme setup

**Project-Specific Checklist** (for accessibility portals):

- ✅ Static generation for performance
- ✅ Skip links in layouts (not pages)
- ✅ Reusable SkipLink component
- ✅ Custom accessibility audit script
- ✅ Automated route and sitemap generation
- ✅ Markdown-based content with custom parsing
- ✅ SEO optimization with structured data
- ✅ Dark theme with proper contrast

**Critical Success Factors for Vuetify 3 + Nuxt 4**:

1. **Handle Console Logging** - Use suppress-vuetify-logs plugins (Challenge 6)
2. **Handle Chrome DevTools 404** - Create `.well-known` file (Challenge 7)
3. **Handle Prerender 404 Errors** - Add static documentation routes to prerender ignore list (Challenge 8)
4. **Keep It Simple** - Don't over-engineer
5. **Document Everything** - Future you will thank you
6. **Use Composables** - Share logic across components
7. **Leverage Vuetify's Features** - Theme system, grid, components
8. **TypeScript First** - Catch errors early

**For Accessibility-Focused Projects**:

1. **Accessibility First** - Test early and often
2. **Test Real Users** - Especially with assistive tech
3. **Performance Matters** - Static generation helps
4. **Content is King** - Make it easy to update

### For LLMs Working on Vuetify 3 + Nuxt 4 Projects

**Universal Files to Understand** (apply to any Vuetify 3 + Nuxt 4 project):

1. [`nuxt.config.ts`](https://github.com/ICJIA/icjia-accessibility-portal/blob/main/nuxt.config.ts) - Vuetify configuration and Nuxt setup
2. [`app/plugins/suppress-vuetify-logs.client.ts`](https://github.com/ICJIA/icjia-accessibility-portal/blob/main/app/plugins/suppress-vuetify-logs.client.ts) - **Universal solution for Vuetify console logging**
3. [`app/plugins/suppress-vuetify-logs.server.ts`](https://github.com/ICJIA/icjia-accessibility-portal/blob/main/app/plugins/suppress-vuetify-logs.server.ts) - **Universal solution for Vuetify console logging**
4. [`public/.well-known/appspecific/com.chrome.devtools.json`](https://github.com/ICJIA/icjia-accessibility-portal/blob/main/public/.well-known/appspecific/com.chrome.devtools.json) - **Universal solution for Chrome DevTools 404**

**Project-Specific Files** (for this accessibility portal):

1. [`app/utils/faqTransform.ts`](https://github.com/ICJIA/icjia-accessibility-portal/blob/main/app/utils/faqTransform.ts) - Content parsing logic
2. [`app/components/SkipLink.vue`](https://github.com/ICJIA/icjia-accessibility-portal/blob/main/app/components/SkipLink.vue) - Accessibility component
3. [`audit-accessibility.js`](https://github.com/ICJIA/icjia-accessibility-portal/blob/main/audit-accessibility.js) - Testing implementation
4. [`content/faqs.md`](https://github.com/ICJIA/icjia-accessibility-portal/blob/main/content/faqs.md) - Content structure example

**Common Tasks for Any Vuetify 3 + Nuxt 4 Project**:

**Fixing Vuetify Console Logging**:

1. Copy `app/plugins/suppress-vuetify-logs.client.ts` to your project
2. Copy `app/plugins/suppress-vuetify-logs.server.ts` to your project
3. Restart dev server - logs will be suppressed
4. Works automatically in dev, build, and generate modes

**Fixing Chrome DevTools 404**:

1. Create `public/.well-known/appspecific/com.chrome.devtools.json`
2. Add content: `{}`
3. File is automatically copied during generation

**Adding a New Route**:

1. Create `app/pages/your-route.vue`
2. Nuxt automatically creates the route
3. Use Vuetify components: `<v-app>`, `<v-main>`, etc.

**Using Vuetify Components**:

**Example**: [`app/pages/index.vue`](https://github.com/ICJIA/icjia-accessibility-portal/blob/main/app/pages/index.vue)

```vue
<template>
  <v-app>
    <v-main>
      <v-container>
        <v-row>
          <v-col cols="12" md="6">
            <v-card>
              <v-card-title>Title</v-card-title>
              <v-card-text>Content</v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>
```

**Project-Specific Tasks** (for this accessibility portal):

**Adding a New FAQ**:

**File**: [`content/faqs.md`](https://github.com/ICJIA/icjia-accessibility-portal/blob/main/content/faqs.md)

```markdown
### Your Question Here?

{new:2026-01-15}

**Quick answer:** Brief answer.

**Full explanation:** Detailed answer...
```

**Modifying Accessibility**:

- ALWAYS run `yarn audit:a11y` after changes
- Must show 0 violations and 12/12 skip links
- Test with keyboard navigation
- Test with screen reader if possible

**Debugging Tips**:

- Use Vue DevTools browser extension
- Check `routes.json` for route issues
- Look at `public/docs/accessibility/index.html` for audit details
- Check browser console for errors

---

## Conclusion

### For All Vuetify 3 + Nuxt 4 Developers

This guide provides **universal solutions** for common Vuetify 3 + Nuxt 4 issues:

1. **Vuetify Console Logging** (Challenge 6) - Affects all Vuetify 3 + Nuxt 4 apps
   - Solution: Copy the suppress-vuetify-logs plugins
   - Works in dev, build, and generate modes
   - Preserves all errors and warnings

2. **Chrome DevTools 404** (Challenge 7) - Affects all static-generated Nuxt apps
   - Solution: Create `.well-known/appspecific/com.chrome.devtools.json`
   - Simple one-file fix

3. **Prerender 404 Errors** (Challenge 8) - Affects all static-generated Nuxt apps with static HTML files in `public/`
   - Solution: Add static documentation routes to prerender ignore list in `nuxt.config.ts`
   - Prevents build failures when static files are linked from pages

4. **Architecture Patterns** - Apply to any Vuetify 3 + Nuxt 4 project
   - Composables for shared logic
   - Multiple layouts strategy
   - TypeScript best practices
   - Component composition patterns

### For Accessibility-Focused Projects

This application demonstrates that building a fully accessible, performant web application is achievable with modern tools and careful attention to detail. The key is:

1. **Choose the right tools** - Nuxt + Vuetify + axe-core
2. **Build accessibility in from the start** - Not an afterthought
3. **Test continuously** - Automated testing catches issues early
4. **Keep it simple** - Static generation over complex architectures
5. **Document everything** - Makes maintenance possible

### Universal Applicability

The patterns and solutions in this guide can be applied to **any Vuetify 3 + Nuxt 4 application**, not just accessibility portals:

- **E-commerce sites** - Use Vuetify components, suppress console logs
- **Dashboards** - Use Vuetify layouts, handle Chrome DevTools 404
- **Content sites** - Use Nuxt Content, apply Vuetify theming
- **Admin panels** - Use Vuetify forms, leverage composables
- **Any Vuetify 3 + Nuxt 4 project** - All compatibility solutions apply

The principles of good component design, Vuetify integration, and Nuxt architecture are universal.

---

**Questions or Issues?**

If you're working on this codebase and have questions:

1. Read this guide thoroughly
2. Check the other markdown documentation files
3. Look at the code comments (they're extensive)
4. Run the accessibility audit to validate changes
5. Test with real assistive technologies when possible

**Remember**: Accessibility is not optional. It's a legal requirement and the right thing to do.

---

_This guide was created January 1, 2026, for the ICJIA Accessibility Portal project._
