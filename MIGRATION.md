# Nuxt 3 to Nuxt 4 Migration Guide with `/app` Directory Structure

**Project Type:** Nuxt + Nuxt Content + Vuetify + Static Site Generation  
**Migration Date:** October 2024  
**Nuxt Version:** 3.15.4 → 4.1.3  
**Node.js Version:** 18.20.6 → 20.x

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Prerequisites](#prerequisites)
3. [Preparation and Backup](#preparation-and-backup)
4. [Phase 1: Nuxt 4 Upgrade](#phase-1-nuxt-4-upgrade)
5. [Phase 2: /app Directory Migration](#phase-2-app-directory-migration)
6. [Common Issues and Solutions](#common-issues-and-solutions)
7. [Testing and Verification](#testing-and-verification)
8. [Rollback Procedures](#rollback-procedures)
9. [Post-Migration Considerations](#post-migration-considerations)
10. [Quick Reference](#quick-reference)

---

## Executive Summary

This guide documents the complete migration process from Nuxt 3 to Nuxt 4, including the adoption of Nuxt 4's recommended `/app` directory structure. The migration involves:

- **Package Updates:** Upgrading Nuxt and related packages
- **Configuration Changes:** Updating `nuxt.config.js` for Nuxt 4 compatibility
- **Directory Restructuring:** Moving application code to `/app` directory
- **Path Resolution Updates:** Adjusting import paths and aliases
- **Node.js Version Update:** Upgrading to Node.js 20.x

**Total Migration Time:** ~2-3 hours (including testing)  
**Complexity Level:** Medium  
**Risk Level:** Low (with proper backups)

---

## Prerequisites

### Required Knowledge

- Git version control
- Nuxt.js fundamentals
- Node.js and npm/yarn package management
- Basic understanding of module resolution and path aliases

### Required Tools

- Git (for version control and rollback)
- Node.js 20.x or higher
- Yarn or npm package manager
- Code editor with TypeScript support (recommended)

### Project Assumptions

This guide assumes your project has:

- Nuxt 3.x with static site generation (`nuxt generate`)
- Nuxt Content for markdown content management
- Vuetify 3 for UI components
- Custom SCSS variables
- Build scripts in `/creators` directory
- Deployment to Netlify or similar static hosting

---

## Preparation and Backup

### Step 1: Create Git Backup Tags

Before making any changes, create backup points for easy rollback:

```bash
# Create backup tag before Nuxt 4 upgrade
git tag -a pre-nuxt-4-migration -m "Backup before Nuxt 4 upgrade - $(date '+%Y-%m-%d %H:%M:%S')"

# Verify tag was created
git tag -l | grep migration
```

### Step 2: Document Current State

```bash
# Document current package versions
cat package.json | grep -A 20 '"devDependencies"'

# Document current directory structure
tree -L 2 -I 'node_modules|.nuxt|.output'

# Document current Node.js version
node --version
cat .nvmrc
```

### Step 3: Ensure Clean Working Directory

```bash
# Commit any pending changes
git status
git add -A
git commit -m "Prepare for Nuxt 4 migration"
```

---

## Phase 1: Nuxt 4 Upgrade

### Step 1.1: Update Package Versions

**File:** `package.json`

Update the following packages:

```json
{
  "devDependencies": {
    "nuxt": "^4.0.0", // Was: "^3.15.4"
    "@nuxt/content": "^2.13.4", // Keep at v2 (see note below)
    "@nuxt/image": "^1.11.0" // Was: "^1.8.1"
  },
  "dependencies": {
    "jsonfile": "^6.2.0" // Add if not present
  }
}
```

**Important Notes:**

- **@nuxt/content v2 vs v3:** We kept `@nuxt/content` at v2.13.4 instead of upgrading to v3 because v3 has breaking API changes:

  - v3 changes `queryContent()` to `queryCollection()`
  - v3 requires significant code refactoring
  - v2.13.4 is fully compatible with Nuxt 4

- **jsonfile dependency:** Required by some Nuxt 4 internal dependencies

### Step 1.2: Update Node.js Version

**File:** `.nvmrc`

```diff
- v18.20.6
+ 20
```

**Why:** Nuxt 4 requires Node.js >= 20.19.0 due to dependencies like `unplugin-utils@0.3.1`

**For Netlify:** This file is automatically detected and used during deployment

### Step 1.3: Update nuxt.config.js

**File:** `nuxt.config.js`

#### Remove Deprecated Options

```diff
export default defineNuxtConfig({
-  future: {
-    compatibilityVersion: 4,
-  },
-  experimental: {
-    appManifest: false,
-  },
```

**Why:** These options are no longer needed in Nuxt 4 (they were Nuxt 3 forward-compatibility flags)

#### Fix Configuration Typos

```diff
-  compabilityDate: "2024-10-10",
+  compatibilityDate: "2024-10-10",
```

#### Migrate generate.routes to nitro.prerender.routes

```diff
-  generate: {
-    routes: async () => {
-      const routes = await getAppRoutes();
-      return routes;
-    },
-  },
+  nitro: {
+    prerender: {
+      routes: async () => {
+        const routes = await getAppRoutes();
+        return routes;
+      },
+    },
+  },
```

**Why:** Nuxt 4 uses Nitro's prerender configuration instead of the old `generate` option

### Step 1.4: Fix Plugin Syntax

**File:** `plugins/vuetify.js`

```diff
export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    ssr: true,
    components,
-   ...labsComponents,
+   components: {
+     ...labsComponents,
+   },
  });
});
```

**Why:** `labsComponents` must be nested under the `components` object, not spread at the root level

### Step 1.5: Install Dependencies

```bash
# Remove old dependencies
rm -rf node_modules yarn.lock

# Install new dependencies
yarn install
```

**Expected Output:**

- Peer dependency warnings (safe to ignore)
- Installation time: ~30-60 seconds

### Step 1.6: Test Nuxt 4 Upgrade

```bash
# Test development server
yarn dev
```

**Expected Output:**

```
[nuxi] Nuxt 4.1.3 (with Nitro 2.12.7, Vite 7.1.10 and Vue 3.5.22)
  ➜ Local:    http://localhost:8000/
```

**If successful:** Press Ctrl+C and proceed to test build

```bash
# Test static generation
yarn generate
```

**Expected Output:**

```
[nitro] ℹ Prerendering X routes with crawler
[nitro] ✔ Generated public .output/public
```

### Step 1.7: Commit Nuxt 4 Upgrade

```bash
git add -A
git commit -m "Upgrade to Nuxt 4.1.3

- Update nuxt from 3.15.4 to 4.1.3
- Keep @nuxt/content at v2.13.4 for compatibility
- Update @nuxt/image to 1.11.0
- Update Node.js version to 20 in .nvmrc
- Fix nuxt.config.js: remove deprecated options, fix typos
- Migrate generate.routes to nitro.prerender.routes
- Fix Vuetify plugin labsComponents syntax

All tests passing:
- ✅ yarn dev works
- ✅ yarn generate works
- ✅ All routes prerender successfully"
```

---

## Phase 2: /app Directory Migration

### Step 2.1: Create Second Backup Tag

```bash
git tag -a pre-app-directory-migration -m "Backup before /app directory migration - $(date '+%Y-%m-%d %H:%M:%S')"
```

### Step 2.2: Understand the /app Directory Structure

**Nuxt 4 Recommended Structure:**

```
/
├── app/                    ← NEW: All application code
│   ├── app.vue            ← Root component
│   ├── app.config.js      ← App configuration
│   ├── assets/            ← CSS, images, fonts
│   ├── components/        ← Vue components
│   ├── composables/       ← Composable functions
│   ├── layouts/           ← Layout components (if any)
│   ├── middleware/        ← Route middleware (if any)
│   ├── pages/             ← Page components
│   ├── plugins/           ← Nuxt plugins
│   └── utils/             ← Utility functions
├── content/               ← Stays in root (Nuxt Content)
├── public/                ← Stays in root (static files)
├── server/                ← Stays in root (server routes/middleware)
├── nuxt.config.js         ← Stays in root
└── package.json           ← Stays in root
```

**Key Principle:** Application code goes in `/app`, configuration and content stay in root

### Step 2.3: Move Files to /app Directory

```bash
# Create /app directory
mkdir -p app

# Move application files
mv app.vue app/
mv app.config.js app/
mv components app/
mv composables app/
mv pages app/
mv plugins app/
mv assets app/

# If you have layouts or middleware:
# mv layouts app/
# mv middleware app/
```

**Verification:**

```bash
# Check that files were moved
ls -la app/

# Expected output:
# app.config.js
# app.vue
# assets/
# components/
# composables/
# pages/
# plugins/
```

### Step 2.4: Update nuxt.config.js CSS Paths

**File:** `nuxt.config.js`

```diff
css: [
  "vuetify/lib/styles/main.sass",
  "@mdi/font/css/materialdesignicons.min.css",
-  "../assets/css/variables.scss",
-  "../assets/css/app.css",
-  "../assets/css/github-markdown.css",
+  "@/assets/css/variables.scss",
+  "@/assets/css/app.css",
+  "@/assets/css/github-markdown.css",
],
```

**Why:** With the `/app` directory, use the `@/` alias instead of relative paths. The `@/` alias now points to `/app`.

### Step 2.5: Commit Initial Migration

```bash
git add -A
git commit -m "Migrate to Nuxt 4 /app directory structure

- Move app.vue to /app/app.vue
- Move app.config.js to /app/app.config.js
- Move components/ to /app/components/
- Move composables/ to /app/composables/
- Move pages/ to /app/pages/
- Move plugins/ to /app/plugins/
- Move assets/ to /app/assets/
- Update nuxt.config.js CSS paths to use @/ alias

This follows Nuxt 4's recommended directory structure where all
application code lives in /app, while configuration files, content,
and server code remain in the root."
```

### Step 2.6: Test and Fix Issues

At this point, you'll likely encounter errors. Let's address them systematically.

#### Test the migration:

```bash
yarn dev
```

---

## Common Issues and Solutions

### Issue 1: SCSS Import Path Broken

**Error Message:**

```
Error: [sass] Can't find stylesheet to import.
  ╷
4 │ @import '../../node_modules/vuetify/_styles.scss';
  │         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  ╵
  app/assets/css/variables.scss 4:9  root stylesheet
```

**Root Cause:**
The file moved from `/assets/css/variables.scss` (2 levels from root) to `/app/assets/css/variables.scss` (3 levels from root). The relative path `../../node_modules` is now incorrect.

**Solution:**

**File:** `app/assets/css/variables.scss`

```diff
$body-font-family: "Lato";
$font-size-root: 18px;
- @import '../../node_modules/vuetify/_styles.scss';
+ @import '../../../node_modules/vuetify/_styles.scss';
```

**Commit:**

```bash
git add app/assets/css/variables.scss
git commit -m "Fix SCSS import path in variables.scss after /app migration

The relative path to node_modules changed from ../../ to ../../../
because the file moved from /assets/css/ to /app/assets/css/"
```

---

### Issue 2: Import Path Resolution Error

**Error Message:**

```
ERROR  Could not load /Users/.../app//src/utils/thumbor.js
(imported by app/pages/privacy/index.vue):
ENOENT: no such file or directory
```

**Root Cause:**
With the `/app` directory structure, Nuxt 4 changes path alias behavior:

| Alias        | Before (No /app) | After (With /app) |
| ------------ | ---------------- | ----------------- |
| `@` or `~`   | Project root     | `/app` directory  |
| `@@` or `~~` | Project root     | Project root      |

Pages are importing `@/src/utils/thumbor.js`, which now resolves to `/app/src/utils/thumbor.js` instead of `/src/utils/thumbor.js`.

**Solution Options:**

**Option A: Move utils to /app (Recommended)**

```bash
# Move utility files to /app/utils
mkdir -p app/utils
mv src/utils/thumbor.js app/utils/

# Update all imports in page files
find app/pages -name "*.vue" -type f -exec sed -i '' 's|@/src/utils/thumbor\.js|@/utils/thumbor.js|g' {} \;
```

**Option B: Use @@ alias to reference project root**

```diff
- import { getThumborUrl } from "@/src/utils/thumbor.js";
+ import { getThumborUrl } from "@@/src/utils/thumbor.js";
```

**Recommendation:** Option A is preferred because it keeps all application code in `/app`, following Nuxt 4 conventions.

**Files to Update:**

- `app/pages/about/index.vue`
- `app/pages/childhood-exposure/index.vue`
- `app/pages/privacy/index.vue`
- `app/pages/program-summary/index.vue`
- `app/pages/research/index.vue`
- `app/pages/resources/index.vue`
- `app/pages/sites/index.vue`

**Verification:**

```bash
# Verify all imports are updated
grep -r "thumbor" app/pages/ --include="*.vue" | grep "import"

# Expected output (all should show @/utils/thumbor.js):
# app/pages/about/index.vue:import { getThumborUrl } from "@/utils/thumbor.js";
# app/pages/privacy/index.vue:import { getThumborUrl } from "@/utils/thumbor.js";
# ... etc
```

**Commit:**

```bash
git add -A
git commit -m "Move utils to /app and update import paths

- Move src/utils/thumbor.js to app/utils/thumbor.js
- Update all page imports from @/src/utils/thumbor.js to @/utils/thumbor.js
- This aligns with Nuxt 4's /app directory structure where @ alias points to /app

With the /app directory, the @ alias now resolves to /app instead of project root.
The ~~ or @@ aliases can be used to reference the project root if needed."
```

---

### Issue 3: @nuxt/content v3 Breaking Changes

**Error Message:**

```
ERROR  queryContent is not defined
```

**Root Cause:**
If you upgraded to `@nuxt/content` v3, the API has breaking changes:

- `queryContent()` → `queryCollection()`
- Different query syntax and return types

**Solution:**
Keep `@nuxt/content` at v2.13.4, which is fully compatible with Nuxt 4:

```json
{
  "devDependencies": {
    "@nuxt/content": "^2.13.4"
  }
}
```

**If you must upgrade to v3:**
You'll need to refactor all content queries. See the [Nuxt Content v3 migration guide](https://content.nuxt.com/migration).

---

### Issue 4: Netlify Build Failure - Node Version

**Error Message:**

```
error unplugin-utils@0.3.1: The engine "node" is incompatible with this module.
Expected version ">=20.19.0". Got "18.20.6"
```

**Root Cause:**
Netlify is using the Node.js version specified in `.nvmrc`, which is too old for Nuxt 4.

**Solution:**
Update `.nvmrc` to Node.js 20:

```diff
- v18.20.6
+ 20
```

**Commit:**

```bash
git add .nvmrc
git commit -m "Update Node.js version to 20 for Nuxt 4 compatibility

Nuxt 4 requires Node.js >= 20.19.0
Previous version (18.20.6) caused Netlify build failure"
```

---

## Testing and Verification

### Development Server Test

```bash
yarn dev
```

**Checklist:**

- [ ] Server starts without errors
- [ ] No "Cannot find module" errors
- [ ] No import resolution errors
- [ ] Homepage loads at http://localhost:8000/
- [ ] All navigation links work
- [ ] Components render correctly
- [ ] No console errors in browser DevTools
- [ ] CSS styles load correctly
- [ ] Images load correctly
- [ ] Fonts load correctly

**Expected Output:**

```
[nuxi] Nuxt 4.1.3 (with Nitro 2.12.7, Vite 7.1.10 and Vue 3.5.22)
  ➜ Local:    http://localhost:8000/
  ➜ Network:  use --host to expose
  ➜ DevTools: press Shift + Option + D in the browser

✔ Vite client built in Xms
✔ Vite server built in Xms
✔ Nuxt Nitro server built in Xms
```

### Static Generation Test

```bash
yarn generate
```

**Checklist:**

- [ ] Build completes without errors
- [ ] All routes prerender successfully
- [ ] No missing module errors
- [ ] Output directory `.output/public` contains all files
- [ ] Check specific routes in output

**Expected Output:**

```
[nuxi] ℹ Building for Nitro preset: static
ℹ Building client...
✔ Client built in Xs
ℹ Building server...
✔ Server built in Xs
[nitro] ℹ Initializing prerenderer
[nitro] ℹ Prerendering X routes with crawler
[nitro]   ├─ / (Xms)
[nitro]   ├─ /about (Xms)
[nitro]   ├─ /privacy (Xms)
[nitro]   ... (all routes)
[nitro] ℹ Prerendered X routes in X seconds
[nitro] ✔ Generated public .output/public
```

**Verify Output:**

```bash
# Check that all expected routes were generated
ls -la .output/public/

# Expected files:
# index.html
# about/index.html
# privacy/index.html
# ... etc
```

### Preview Static Build

```bash
npx serve .output/public
```

**Checklist:**

- [ ] All pages load correctly
- [ ] Navigation works
- [ ] Images load
- [ ] CSS is applied
- [ ] No 404 errors in browser console

---

## Rollback Procedures

### Option 1: Git Reset (Fastest)

```bash
# Rollback to before /app migration
git reset --hard pre-app-directory-migration

# OR rollback to before Nuxt 4 upgrade
git reset --hard pre-nuxt-4-migration

# Reinstall dependencies
rm -rf node_modules yarn.lock
yarn install
```

### Option 2: Git Revert (Preserves History)

```bash
# Find the commits to revert
git log --oneline -10

# Revert specific commits (replace with actual commit hashes)
git revert <commit-hash-3> <commit-hash-2> <commit-hash-1>

# Reinstall dependencies
rm -rf node_modules yarn.lock
yarn install
```

### Option 3: Manual Rollback

```bash
# Move files back from /app to root
mv app/app.vue ./
mv app/app.config.js ./
mv app/components ./
mv app/composables ./
mv app/pages ./
mv app/plugins ./
mv app/assets ./
mv app/utils/thumbor.js src/utils/
rmdir app/utils app

# Restore configuration files
git checkout pre-app-directory-migration -- nuxt.config.js
git checkout pre-app-directory-migration -- app/assets/css/variables.scss
git checkout pre-app-directory-migration -- .nvmrc
git checkout pre-app-directory-migration -- package.json

# Reinstall dependencies
rm -rf node_modules yarn.lock
yarn install
```

---

## Post-Migration Considerations

### Path Alias Reference

Understanding the new path aliases is crucial for future development:

| Alias         | Resolves To    | Use Case                            | Example                   |
| ------------- | -------------- | ----------------------------------- | ------------------------- |
| `@` or `~`    | `/app`         | App code (components, pages, utils) | `@/components/Foo.vue`    |
| `@@` or `~~`  | Project root   | Config, content, server code        | `@@/src/json/config.json` |
| `#app`        | Nuxt runtime   | Nuxt composables and utilities      | `#app/composables/router` |
| `#components` | Auto-generated | Component imports                   | `#components`             |

### Auto-Import Behavior

Nuxt 4 automatically scans `/app` for:

**Components:** `/app/components/**/*.vue`

```vue
<!-- No import needed! -->
<template>
  <TheFooter />
</template>
```

**Composables:** `/app/composables/**/*.{js,ts}`

```vue
<script setup>
// No import needed!
const myState = useMyState();
</script>
```

**Utils:** `/app/utils/**/*.{js,ts}`

```vue
<script setup>
// No import needed if exported as named function!
const url = getThumborUrl(image);
</script>
```

### Future Development Guidelines

#### Adding New Files

| File Type     | Location            | Auto-Imported?                  |
| ------------- | ------------------- | ------------------------------- |
| Components    | `/app/components/`  | ✅ Yes                          |
| Composables   | `/app/composables/` | ✅ Yes                          |
| Utils         | `/app/utils/`       | ✅ Yes (named exports)          |
| Pages         | `/app/pages/`       | ✅ Yes (routes)                 |
| Layouts       | `/app/layouts/`     | ✅ Yes                          |
| Middleware    | `/app/middleware/`  | ✅ Yes                          |
| Plugins       | `/app/plugins/`     | ✅ Yes                          |
| Static Assets | `/public/`          | ❌ No (use `/public/image.png`) |
| Content       | `/content/`         | ❌ No (use `queryContent()`)    |
| Server Routes | `/server/api/`      | ✅ Yes (API routes)             |

#### Import Path Examples

```vue
<script setup>
// ✅ Correct: Import from /app using @/
import { getThumborUrl } from "@/utils/thumbor.js";

// ✅ Correct: Import from project root using @@/
import config from "@@/src/json/config.json";

// ✅ Correct: Import from node_modules (no alias needed)
import { ref } from "vue";

// ❌ Wrong: Don't use relative paths for /app files
import { getThumborUrl } from "../../utils/thumbor.js";

// ❌ Wrong: Don't use @/ for project root files
import config from "@/src/json/config.json"; // This looks in /app/src/
</script>
```

### CSS and SCSS Considerations

When working with SCSS files in `/app/assets/css/`:

**Relative Imports:**

```scss
// In /app/assets/css/variables.scss

// ✅ Correct: Relative path to node_modules (3 levels up)
@import "../../../node_modules/vuetify/_styles.scss";

// ✅ Correct: Relative path to other CSS files
@import "./mixins.scss";

// ❌ Wrong: Old path (only 2 levels up)
@import "../../node_modules/vuetify/_styles.scss";
```

**In nuxt.config.js:**

```javascript
// ✅ Correct: Use @/ alias
css: ["@/assets/css/variables.scss", "@/assets/css/app.css"];

// ❌ Wrong: Relative paths
css: ["../assets/css/variables.scss", "../assets/css/app.css"];
```

### Netlify Deployment

**Build Settings:**

- **Build command:** `yarn generate` or `npm run generate`
- **Publish directory:** `.output/public`
- **Node version:** Automatically detected from `.nvmrc`

**Environment Variables:**
No changes needed for environment variables. They work the same way.

**Build Time:**

- Expected: 1-2 minutes
- Client build: ~5-6 seconds
- Server build: ~5-6 seconds
- Prerendering: ~2 seconds

**Common Netlify Issues:**

1. **Node version mismatch:** Ensure `.nvmrc` contains `20`
2. **Build command not found:** Verify `package.json` has `"generate": "nuxt generate"` script
3. **Missing dependencies:** Clear Netlify cache and rebuild

---

## Quick Reference

### Migration Checklist

**Phase 1: Nuxt 4 Upgrade**

- [ ] Create git backup tag: `pre-nuxt-4-migration`
- [ ] Update `package.json` (nuxt, @nuxt/content, @nuxt/image)
- [ ] Update `.nvmrc` to `20`
- [ ] Update `nuxt.config.js` (remove deprecated options, fix typos)
- [ ] Migrate `generate.routes` to `nitro.prerender.routes`
- [ ] Fix plugin syntax (e.g., Vuetify labsComponents)
- [ ] Run `yarn install`
- [ ] Test with `yarn dev`
- [ ] Test with `yarn generate`
- [ ] Commit changes

**Phase 2: /app Directory Migration**

- [ ] Create git backup tag: `pre-app-directory-migration`
- [ ] Create `/app` directory
- [ ] Move files to `/app` (app.vue, app.config.js, components, composables, pages, plugins, assets)
- [ ] Update `nuxt.config.js` CSS paths to use `@/` alias
- [ ] Commit initial migration
- [ ] Test with `yarn dev` (expect errors)
- [ ] Fix SCSS import paths (add one more `../`)
- [ ] Move utils to `/app/utils` and update imports
- [ ] Commit fixes
- [ ] Test with `yarn dev` (should work)
- [ ] Test with `yarn generate` (should work)
- [ ] Push to repository
- [ ] Deploy to Netlify

### Common Commands

```bash
# Development
yarn dev                    # Start dev server
yarn build                  # Build for production
yarn generate               # Generate static site
yarn preview                # Preview production build

# Testing
npx serve .output/public    # Serve static build locally

# Git
git tag -a <name> -m "msg"  # Create backup tag
git reset --hard <tag>      # Rollback to tag
git log --oneline -10       # View recent commits

# Cleanup
rm -rf node_modules yarn.lock .nuxt .output
yarn install                # Fresh install
```

### File Locations Reference

| File/Directory  | Before Migration  | After Migration               |
| --------------- | ----------------- | ----------------------------- |
| `app.vue`       | `/app.vue`        | `/app/app.vue`                |
| `app.config.js` | `/app.config.js`  | `/app/app.config.js`          |
| Components      | `/components/`    | `/app/components/`            |
| Composables     | `/composables/`   | `/app/composables/`           |
| Pages           | `/pages/`         | `/app/pages/`                 |
| Plugins         | `/plugins/`       | `/app/plugins/`               |
| Assets          | `/assets/`        | `/app/assets/`                |
| Utils           | `/src/utils/`     | `/app/utils/`                 |
| Content         | `/content/`       | `/content/` (unchanged)       |
| Public          | `/public/`        | `/public/` (unchanged)        |
| Server          | `/server/`        | `/server/` (unchanged)        |
| Config          | `/nuxt.config.js` | `/nuxt.config.js` (unchanged) |

### Package Versions

| Package         | Before    | After     | Notes               |
| --------------- | --------- | --------- | ------------------- |
| `nuxt`          | `^3.15.4` | `^4.0.0`  | Major upgrade       |
| `@nuxt/content` | `^2.13.4` | `^2.13.4` | Keep at v2          |
| `@nuxt/image`   | `^1.8.1`  | `^1.11.0` | Minor update        |
| Node.js         | `18.20.6` | `20.x`    | Required for Nuxt 4 |

### Path Alias Quick Reference

```javascript
// In .vue files or .js files in /app:
import Foo from "@/components/Foo.vue"        // → /app/components/Foo.vue
import { bar } from "@/utils/bar.js"          // → /app/utils/bar.js
import config from "@@/src/json/config.json"  // → /src/json/config.json
import data from "~~/content/data.json"       // → /content/data.json

// In nuxt.config.js:
css: ["@/assets/css/app.css"]                 // → /app/assets/css/app.css

// In SCSS files:
@import '../../../node_modules/vuetify/_styles.scss';  // Relative to file location
```

---

## Troubleshooting

### Build Fails with "Cannot find module"

**Symptom:** Build fails with errors like `Cannot find module '@/src/utils/...'`

**Cause:** Path aliases changed with `/app` directory

**Solution:**

1. Check if the file is in `/app` or project root
2. Use `@/` for `/app` files, `@@/` for root files
3. Move utility files to `/app/utils` if they're app-specific

### Dev Server Starts but Pages Don't Load

**Symptom:** Server starts but pages show errors or don't render

**Cause:** Import errors or missing dependencies

**Solution:**

1. Check browser console for errors
2. Check terminal for build errors
3. Verify all imports use correct paths
4. Clear `.nuxt` cache: `rm -rf .nuxt && yarn dev`

### CSS Not Loading

**Symptom:** Pages load but styles are missing

**Cause:** CSS paths in `nuxt.config.js` are incorrect

**Solution:**

1. Update CSS paths to use `@/` alias
2. Check SCSS import paths (should be relative to file location)
3. Verify Vuetify is properly configured in plugins

### Netlify Build Fails

**Symptom:** Local build works but Netlify fails

**Common Causes:**

1. **Node version:** Update `.nvmrc` to `20`
2. **Build command:** Verify it's `yarn generate` or `npm run generate`
3. **Publish directory:** Should be `.output/public`
4. **Environment variables:** Check if any are missing in Netlify dashboard

**Solution:**

```bash
# Test locally with same Node version
nvm use 20
rm -rf node_modules yarn.lock .nuxt .output
yarn install
yarn generate
```

### "queryContent is not defined"

**Symptom:** Build fails with `queryContent is not defined`

**Cause:** Upgraded to `@nuxt/content` v3 which has breaking changes

**Solution:**
Downgrade to v2.13.4:

```json
{
  "devDependencies": {
    "@nuxt/content": "^2.13.4"
  }
}
```

Then run:

```bash
rm -rf node_modules yarn.lock
yarn install
```

---

## Additional Resources

### Official Documentation

- [Nuxt 4 Release Notes](https://nuxt.com/blog/v4)
- [Nuxt 4 Migration Guide](https://nuxt.com/docs/getting-started/upgrade)
- [Nuxt Directory Structure](https://nuxt.com/docs/guide/directory-structure)
- [Nuxt Content v2 Documentation](https://content.nuxt.com/v2)
- [Vuetify 3 Documentation](https://vuetifyjs.com/)

### Community Resources

- [Nuxt Discord](https://discord.com/invite/nuxt)
- [Nuxt GitHub Discussions](https://github.com/nuxt/nuxt/discussions)
- [Stack Overflow - Nuxt Tag](https://stackoverflow.com/questions/tagged/nuxt.js)

### Related Guides

- [Nuxt Content v2 to v3 Migration](https://content.nuxt.com/migration) (if needed)
- [Vuetify 2 to 3 Migration](https://vuetifyjs.com/en/getting-started/upgrade-guide/) (if applicable)

---

## Appendix: Complete nuxt.config.js Example

Here's a complete example of a Nuxt 4 compatible `nuxt.config.js` with `/app` directory:

```javascript
import { getAppRoutes } from "./creators/getAppRoutes.mjs";

export default defineNuxtConfig({
  compatibilityDate: "2024-10-10",

  // App configuration
  app: {
    head: {
      title: "Your App Title",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
      ],
    },
  },

  // CSS files (using @/ alias for /app directory)
  css: [
    "vuetify/lib/styles/main.sass",
    "@mdi/font/css/materialdesignicons.min.css",
    "@/assets/css/variables.scss",
    "@/assets/css/app.css",
    "@/assets/css/github-markdown.css",
  ],

  // Modules
  modules: [
    "@nuxt/content",
    "@nuxt/image",
    "@vueuse/nuxt",
    "@nuxtjs/google-fonts",
    "nuxt-gtag",
  ],

  // Nuxt Content configuration
  content: {
    markdown: {
      anchorLinks: false,
    },
  },

  // Nitro configuration (replaces old 'generate' option)
  nitro: {
    prerender: {
      routes: async () => {
        const routes = await getAppRoutes();
        return routes;
      },
    },
  },

  // Build configuration
  build: {
    transpile: ["vuetify"],
  },

  // Vite configuration
  vite: {
    ssr: {
      noExternal: ["vuetify"],
    },
  },
});
```

---

## Conclusion

This migration guide covers the complete process of upgrading from Nuxt 3 to Nuxt 4 with the `/app` directory structure. The migration is straightforward if you follow the steps systematically and address issues as they arise.

**Key Takeaways:**

1. Always create git backup tags before major changes
2. Understand the new path alias behavior (`@/` → `/app`, `@@/` → root)
3. Keep `@nuxt/content` at v2.13.4 for compatibility
4. Update Node.js to version 20 for Nuxt 4
5. Move all application code to `/app` directory
6. Test thoroughly at each step

**Success Criteria:**

- ✅ `yarn dev` runs without errors
- ✅ `yarn generate` completes successfully
- ✅ All routes prerender correctly
- ✅ Netlify deployment succeeds
- ✅ Site functions identically to before migration

If you encounter issues not covered in this guide, check the [Troubleshooting](#troubleshooting) section or consult the official Nuxt documentation.

---

**Document Version:** 1.0
**Last Updated:** October 2024
**Tested With:** Nuxt 4.1.3, Node.js 20.x, Yarn 1.22.x
