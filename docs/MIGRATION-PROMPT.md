# Universal Nuxt 3 to Nuxt 4 Migration Guide with /app Directory Structure

**Version:** 2.0 (Generalized for any Nuxt 3 project)
**Last Updated:** October 2025
**Audience:** Developers and LLMs assisting with Nuxt 3 → Nuxt 4 migrations

---

## Overview

This is a comprehensive, reusable guide for migrating **any** Nuxt 3 project to Nuxt 4, including adoption of the recommended `/app` directory structure. The guide is designed to be:

- **Project-agnostic**: Works with any Nuxt 3 project regardless of specific features
- **LLM-friendly**: Structured for AI assistants to understand and execute
- **Systematic**: Multi-phase approach with clear success criteria at each step
- **Reversible**: Includes rollback procedures at every phase
- **Comprehensive**: Covers common issues and their solutions

---

## How to Use This Guide

### For Developers

1. **Read the entire guide first** - Understand the full scope before starting
2. **Follow the phases in order** - Don't skip or reorder steps
3. **Use the Quick Reference Checklist** - Track your progress through each phase
4. **Refer to Key Learnings** - Understand why each step matters
5. **Test after each phase** - Don't proceed until tests pass
6. **Use rollback procedures if needed** - Git tags are your safety net

### For LLMs (AI Assistants)

This guide is structured to be used as a prompt or reference for AI-assisted migrations:

1. **Provide context**: Share the project structure and current versions
2. **Reference specific phases**: Ask the LLM to help with a specific phase (e.g., "Help me with Phase 2: Nuxt 4 Upgrade")
3. **Use the checklist**: Ask the LLM to verify each step in the checklist
4. **Reference common issues**: If you encounter an error, search this guide for similar issues
5. **Ask for help with specific files**: Provide file content and ask the LLM to apply the changes

**Example LLM prompts:**

- "I'm migrating a Nuxt 3 project to Nuxt 4. Here's my package.json. What changes do I need to make according to the migration guide?"
- "I'm getting an SCSS import error. According to the migration guide, what should I do?"
- "Help me update my nuxt.config.js for Nuxt 4 migration. Here's my current config."

### For CI/CD Pipelines

This guide can be automated:

1. **Phase 1**: Automated verification of current state
2. **Phase 2**: Automated dependency updates and testing
3. **Phase 3**: Automated file movement and path updates
4. **Phase 4**: Automated issue detection and fixing
5. **Phase 5**: Automated testing and verification

---

## Task Overview

You are tasked with migrating a Nuxt 3 project to Nuxt 4, including adoption of Nuxt 4's recommended `/app` directory structure. This is a systematic, multi-phase migration that requires careful attention to detail, proper backup procedures, and thorough testing at each step.

## Project Context and Assumptions

### Typical Technology Stack

The project likely has:

- **Framework:** Nuxt 3.x (typically 3.13.x - 3.15.x)
- **Content Management:** Nuxt Content v2.x (optional, see caveat below)
- **UI Framework:** Vuetify 3.x, Tailwind CSS, or other (optional)
- **Deployment:** Netlify, Vercel, or similar static hosting (optional)
- **Build Output:** Static site generation (`nuxt generate`) or SSR
- **Node.js:** Currently 18.x (will upgrade to 20.x)
- **Package Manager:** Yarn, npm, or pnpm

### Expected Project Structure (Before Migration)

```
<project-root>/
├── app.vue                 # Root component
├── app.config.js           # App configuration (optional)
├── components/             # Vue components
├── composables/            # Composable functions (optional)
├── pages/                  # Page components
├── plugins/                # Nuxt plugins (optional)
├── assets/                 # CSS, images, fonts
├── content/                # Markdown content (if using Nuxt Content)
├── public/                 # Static files
├── server/                 # Server routes/middleware (optional)
├── nuxt.config.js          # Nuxt configuration
├── package.json            # Dependencies
└── .nvmrc                  # Node version (18.x)
```

### Migration Objectives

1. Upgrade Nuxt from 3.x to 4.x
2. Migrate to `/app` directory structure
3. Update Node.js to 20.x
4. Fix all configuration and import issues
5. Ensure all routes prerender/build successfully
6. Maintain 100% feature parity (site works identically after migration)

## Critical Success Criteria

At the end of the migration:

- ✅ `yarn dev` runs without errors
- ✅ `yarn generate` completes successfully
- ✅ All routes prerender (verify count matches original)
- ✅ No console errors in browser
- ✅ All pages load and function correctly
- ✅ CSS/styles load properly
- ✅ Images load correctly
- ✅ Navigation works

---

## ⚠️ IMPORTANT: Nuxt Content Migration Caveat

**If your project uses Nuxt Content, read this carefully.**

### Two-Phase Migration Strategy

The migration should be approached in **two separate phases**:

#### Phase 1: Nuxt 3 → Nuxt 4 (Keep Nuxt Content v2)

- Upgrade Nuxt from 3.x to 4.x
- **Keep Nuxt Content at v2.13.4** (do NOT upgrade to v3)
- Migrate to `/app` directory structure
- Ensure all tests pass and site is stable

#### Phase 2: Nuxt Content v2 → v3 (After Nuxt 4 is stable)

- Only after Phase 1 is complete and stable
- Upgrade Nuxt Content from v2 to v3
- Refactor all content queries (breaking API changes)
- Re-test everything

### Why Two Phases?

**Nuxt Content v3 has breaking API changes:**

- `queryContent()` → `queryCollection()`
- Query syntax changes
- Composable API changes
- Requires significant refactoring of all content-related code

**Combining both migrations is risky:**

- If something breaks, you won't know if it's Nuxt 4 or Content v3
- Harder to debug and rollback
- Increases complexity exponentially

### Recommended Approach

1. **Complete this entire guide** using Nuxt Content v2.13.4
2. **Verify everything works** with Nuxt 4 + Content v2
3. **Create a separate task** for Content v2 → v3 migration
4. **Plan Content v3 migration** as a follow-up project

### In This Guide

This guide assumes you're keeping Nuxt Content at v2.13.4. If you need to upgrade to v3, do that as a separate migration after this one is complete.

---

## Phase 1: Preparation and Backup

### Step 1.1: Verify Current State

First, examine the current project:

```bash
# Check current versions
cat package.json | grep -A 5 '"nuxt"'
cat package.json | grep -A 5 '"@nuxt/content"'  # If using Nuxt Content
node --version
cat .nvmrc

# Check current directory structure
ls -la | grep -E "app.vue|components|pages|plugins|assets"

# Verify current build works
yarn dev  # or: npm run dev
# Wait for server to start, then Ctrl+C
yarn generate  # or: npm run generate
# Verify it completes successfully
```

**Expected findings:**

- Nuxt version: 3.x (typically 3.13.x - 3.15.x)
- @nuxt/content: 2.x (if project uses Nuxt Content)
- Node version: 18.x
- Files in root: app.vue, components/, pages/, plugins/, assets/
- Other optional directories: composables/, middleware/, layouts/, server/, content/

### Step 1.2: Create Git Backup Tags

**CRITICAL:** Always create backup points before making changes:

```bash
# Ensure working directory is clean
git status
# If there are uncommitted changes, commit them first

# Create backup tag for Nuxt 4 upgrade
git tag -a pre-nuxt-4-migration -m "Backup before Nuxt 4 upgrade - $(date '+%Y-%m-%d %H:%M:%S')"

# Verify tag was created
git tag -l | grep migration
```

**Why:** This allows instant rollback with `git reset --hard pre-nuxt-4-migration`

### Step 1.3: Document Current State

```bash
# Save current package versions for reference
cat package.json > package.json.backup

# Count current routes (for later verification)
yarn generate 2>&1 | grep -i "prerender" | tail -5
# Note the number of routes prerendered
```

## Phase 2: Nuxt 4 Upgrade

### Step 2.1: Update package.json

**Action:** Modify `package.json` to update the following packages:

```json
{
  "devDependencies": {
    "nuxt": "^4.0.0", // Change from "^3.x.x"
    "@nuxt/content": "^2.13.4", // Keep at v2 (IMPORTANT: Do NOT upgrade to v3)
    "@nuxt/image": "^1.11.0" // Update from older version
  },
  "dependencies": {
    "jsonfile": "^6.2.0" // Add if not present
  }
}
```

**CRITICAL DECISION:** Keep `@nuxt/content` at v2.13.4 (if using Nuxt Content)

- **Why:** v3 has breaking API changes (queryContent → queryCollection)
- **Why:** v2.13.4 is fully compatible with Nuxt 4
- **When to upgrade to v3:** Only after this migration is complete and stable (see Nuxt Content Migration Caveat above)

**Note:** If your project doesn't use Nuxt Content, skip the `@nuxt/content` line entirely.

### Step 2.2: Update Node.js Version

**Action:** Update `.nvmrc` file:

```diff
- 18
+ 20
```

Or if the file doesn't exist, create it:

```bash
echo "20" > .nvmrc
```

**Why:** Nuxt 4 requires Node.js >= 20.19.0 due to dependencies like `unplugin-utils@0.3.1`

**Verify locally:**

```bash
nvm use 20  # or: nvm install 20
node --version  # Should show v20.x.x
```

### Step 2.3: Update nuxt.config.js

**Action:** Open `nuxt.config.js` and make the following changes:

#### Change 1: Remove Deprecated Options

```diff
export default defineNuxtConfig({
-  future: {
-    compatibilityVersion: 4,
-  },
-  experimental: {
-    appManifest: false,
-  },
```

**Why:** These were Nuxt 3 forward-compatibility flags, no longer needed in Nuxt 4

#### Change 2: Fix Typos (if present)

```diff
-  compabilityDate: "2024-10-10",
+  compatibilityDate: "2024-10-10",
```

**Check for:** Common typos in configuration keys

#### Change 3: Migrate generate.routes to nitro.prerender.routes

**Find this pattern:**

```javascript
generate: {
  routes: async () => {
    const routes = await getAppRoutes();
    return routes;
  },
},
```

**Replace with:**

```javascript
nitro: {
  prerender: {
    routes: async () => {
      const routes = await getAppRoutes();
      return routes;
    },
  },
},
```

**Why:** Nuxt 4 uses Nitro's prerender configuration instead of the old `generate` option

**Note:** If the project doesn't have `generate.routes`, skip this step

### Step 2.4: Fix Plugin Syntax (Vuetify-specific)

**Action:** If the project uses Vuetify, check `plugins/vuetify.js` (or similar):

**Look for this incorrect pattern:**

```javascript
export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    ssr: true,
    components,
    ...labsComponents, // ❌ WRONG: spread at root level
  });
});
```

**Fix to:**

```javascript
export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    ssr: true,
    components: {
      ...components,
      ...labsComponents, // ✅ CORRECT: nested under components
    },
  });
});
```

**Why:** `labsComponents` must be nested under the `components` object

**Note:** If the project doesn't use Vuetify or doesn't have this pattern, skip this step

### Step 2.5: Install Dependencies

```bash
# Remove old dependencies
rm -rf node_modules yarn.lock

# Install new dependencies
yarn install
```

**Expected output:**

- Peer dependency warnings (safe to ignore)
- Installation completes successfully
- Time: ~30-60 seconds

**If errors occur:**

- Check that Node.js 20.x is active: `node --version`
- If using nvm: `nvm use 20` or `nvm install 20`

### Step 2.6: Test Nuxt 4 Upgrade

**Test 1: Development Server**

```bash
yarn dev
```

**Expected output:**

```
[nuxi] Nuxt 4.1.3 (with Nitro 2.12.7, Vite 7.1.10 and Vue 3.5.22)
  ➜ Local:    http://localhost:8000/
  ➜ Network:  use --host to expose
```

**Verify:**

- Server starts without errors
- No "Cannot find module" errors
- Homepage loads in browser
- No console errors

**Then:** Press Ctrl+C to stop the server

**Test 2: Static Generation**

```bash
yarn generate
```

**Expected output:**

```
[nuxi] ℹ Building for Nitro preset: static
ℹ Building client...
✔ Client built in Xs
ℹ Building server...
✔ Server built in Xs
[nitro] ℹ Prerendering X routes with crawler
[nitro] ✔ Generated public .output/public
```

**Verify:**

- Build completes without errors
- Number of routes matches original count
- `.output/public` directory contains HTML files

**If @nuxt/content error occurs:**

```
ERROR  queryContent is not defined
```

**Solution:** You accidentally upgraded to @nuxt/content v3. Downgrade to v2.13.4:

```bash
yarn add -D @nuxt/content@^2.13.4
rm -rf node_modules yarn.lock
yarn install
yarn generate
```

### Step 2.7: Commit Nuxt 4 Upgrade

```bash
git add -A
git commit -m "Upgrade to Nuxt 4.1.3

- Update nuxt from 3.x to 4.1.3
- Keep @nuxt/content at v2.13.4 for compatibility
- Update @nuxt/image to 1.11.0
- Update Node.js version to 20 in .nvmrc
- Fix nuxt.config.js: remove deprecated options, fix typos
- Migrate generate.routes to nitro.prerender.routes
- Fix Vuetify plugin labsComponents syntax (if applicable)

All tests passing:
- ✅ yarn dev works
- ✅ yarn generate works
- ✅ All routes prerender successfully"
```

**Checkpoint:** Phase 2 complete. Nuxt 4 is working without `/app` directory migration.

## Phase 3: /app Directory Migration

### Step 3.1: Create Second Backup Tag

```bash
git tag -a pre-app-directory-migration -m "Backup before /app directory migration - $(date '+%Y-%m-%d %H:%M:%S')"
git tag -l | grep migration
```

**Why:** Separate rollback point for the directory restructuring

### Step 3.2: Move Files to /app Directory

**Action:** Move application files to the new `/app` directory:

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

# If you have layouts or middleware directories:
# mv layouts app/
# mv middleware app/
```

**Verify the move:**

```bash
ls -la app/
```

**Expected output:**

```
app.config.js
app.vue
assets/
components/
composables/
pages/
plugins/
```

**Files that should NOT move (stay in root):**

- `content/` - Nuxt Content markdown files
- `public/` - Static assets
- `server/` - Server routes/middleware
- `nuxt.config.js` - Configuration
- `package.json` - Dependencies
- `tsconfig.json` - TypeScript config
- `.nvmrc` - Node version
- Any build scripts (e.g., `creators/`)

### Step 3.3: Update nuxt.config.js CSS Paths

**Action:** Update CSS import paths in `nuxt.config.js`:

**Find:**

```javascript
css: [
  "vuetify/lib/styles/main.sass",
  "@mdi/font/css/materialdesignicons.min.css",
  "../assets/css/variables.scss",
  "../assets/css/app.css",
  "../assets/css/github-markdown.css",
],
```

**Replace with:**

```javascript
css: [
  "vuetify/lib/styles/main.sass",
  "@mdi/font/css/materialdesignicons.min.css",
  "@/assets/css/variables.scss",
  "@/assets/css/app.css",
  "@/assets/css/github-markdown.css",
],
```

**Why:** With the `/app` directory, the `@/` alias points to `/app`, so use it instead of relative paths

**Pattern:** Change any `../assets/` to `@/assets/`

### Step 3.4: Commit Initial Migration

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

### Step 3.5: Test and Fix Issues

**Now test the migration. You WILL encounter errors. This is expected.**

```bash
yarn dev
```

## Phase 4: Fix Common Issues

You will encounter 1-4 issues depending on the project. Handle them systematically.

### Issue 1: SCSS Import Path Broken

**Error message you'll see:**

```
Error: [sass] Can't find stylesheet to import.
  ╷
4 │ @import '../../node_modules/vuetify/_styles.scss';
  │         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  ╵
  app/assets/css/variables.scss 4:9  root stylesheet
```

**Root cause:** The file moved from `/assets/css/` (2 levels from root) to `/app/assets/css/` (3 levels from root)

**Solution:**

1. Find the file (usually `app/assets/css/variables.scss` or similar)
2. Look for SCSS imports with relative paths to `node_modules`
3. Add one more `../` to the path

**Example fix:**

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

**Test again:**

```bash
yarn dev
```

### Issue 2: Import Path Resolution Error

**Error message you'll see:**

```
ERROR  Could not load /Users/.../app//src/utils/file.js
(imported by app/pages/some-page.vue):
ENOENT: no such file or directory
```

**Root cause:** Path alias behavior changed

With `/app` directory:

- `@/` or `~/` → Points to `/app` directory
- `@@/` or `~~/` → Points to project root

**Example:** Pages importing `@/src/utils/thumbor.js` now resolves to `/app/src/utils/thumbor.js` instead of `/src/utils/thumbor.js`

**Solution (Recommended):** Move utility files to `/app/utils`

```bash
# Find what utilities are being imported
grep -r "@/src/utils" app/pages/ --include="*.vue"

# Move utilities to /app/utils
mkdir -p app/utils
mv src/utils/*.js app/utils/
# Or move specific files as needed

# Update all imports
find app/pages -name "*.vue" -type f -exec sed -i '' 's|@/src/utils/|@/utils/|g' {} \;
```

**Verify the changes:**

```bash
grep -r "utils" app/pages/ --include="*.vue" | grep "import"
```

**All imports should now show `@/utils/` instead of `@/src/utils/`**

**Alternative solution:** Use `@@/` alias to reference project root:

```diff
- import { getThumborUrl } from "@/src/utils/thumbor.js";
+ import { getThumborUrl } from "@@/src/utils/thumbor.js";
```

**Commit:**

```bash
git add -A
git commit -m "Move utils to /app and update import paths

- Move src/utils/*.js to app/utils/
- Update all page imports from @/src/utils/ to @/utils/
- This aligns with Nuxt 4's /app directory structure where @ alias points to /app

With the /app directory, the @ alias now resolves to /app instead of project root.
The ~~ or @@ aliases can be used to reference the project root if needed."
```

**Test again:**

```bash
yarn dev
```

### Issue 3: Netlify Build Failure (Node Version)

**This won't appear until you deploy, but fix it now:**

**Error message (on Netlify):**

```
error unplugin-utils@0.3.1: The engine "node" is incompatible with this module.
Expected version ">=20.19.0". Got "18.20.6"
```

**Root cause:** `.nvmrc` wasn't updated or Netlify is caching old version

**Solution:** Verify `.nvmrc` contains `20` (not `v20` or `20.x.x`, just `20`)

```bash
cat .nvmrc
# Should output: 20

# If not, fix it:
echo "20" > .nvmrc
git add .nvmrc
git commit -m "Update Node.js version to 20 for Nuxt 4 compatibility

Nuxt 4 requires Node.js >= 20.19.0
Ensures Netlify uses correct Node version"
```

### Issue 4: Other Import Errors

**If you see other "Cannot find module" errors:**

1. **Identify the file and import:**

   ```
   ERROR  Could not load /path/to/file.js
   (imported by app/pages/some-page.vue)
   ```

2. **Check if the file is in `/app` or project root:**

   ```bash
   find . -name "file.js" -not -path "*/node_modules/*"
   ```

3. **Use correct alias:**

   - If in `/app`: use `@/` or `~/`
   - If in project root: use `@@/` or `~~/`

4. **Update the import in the page/component**

## Phase 5: Final Testing and Verification

### Test 1: Development Server (Final)

```bash
yarn dev
```

**Checklist:**

- [ ] Server starts without errors
- [ ] No "Cannot find module" errors
- [ ] No import resolution errors
- [ ] Homepage loads at http://localhost:8000/
- [ ] Navigate to all major pages
- [ ] Check browser console for errors (should be none)
- [ ] Verify CSS styles load correctly
- [ ] Verify images load correctly
- [ ] Test navigation links

**If all checks pass:** Press Ctrl+C and proceed

### Test 2: Static Generation (Final)

```bash
yarn generate
```

**Checklist:**

- [ ] Build completes without errors
- [ ] All routes prerender successfully
- [ ] Route count matches original (from Step 1.3)
- [ ] No missing module errors
- [ ] `.output/public` directory contains all expected files

**Verify specific routes:**

```bash
ls -la .output/public/
ls -la .output/public/about/
ls -la .output/public/privacy/
# Check other important routes
```

### Test 3: Preview Static Build

```bash
npx serve .output/public
```

**Checklist:**

- [ ] All pages load correctly
- [ ] Navigation works
- [ ] Images load
- [ ] CSS is applied
- [ ] No 404 errors in browser console
- [ ] Forms work (if applicable)
- [ ] Interactive features work

**If all tests pass:** Migration is complete! Proceed to final commit.

## Phase 6: Final Commit and Documentation

### Create Final Summary Commit

```bash
git log --oneline -5
git status
```

**Verify all changes are committed. If there are uncommitted changes, commit them now.**

### Update README.md (Optional but Recommended)

Add a section to README.md documenting the migration:

```markdown
## Nuxt 4 Migration

**✅ Successfully migrated to Nuxt 4 on [DATE]**

This project has been upgraded from Nuxt 3 to Nuxt 4 with the recommended `/app` directory structure.

**Key Changes:**

- Nuxt 4.1.3 with Nitro 2.12.7 and Vite 7.1.10
- `/app` directory structure for better code organization
- Path aliases: `@/` → `/app`, `@@/` → project root
- Node.js 20.x requirement
- All routes successfully prerendering
```

**Commit:**

```bash
git add README.md
git commit -m "Update README with Nuxt 4 migration information"
```

## Rollback Procedures

**If something goes wrong at any point:**

### Option 1: Rollback to Before /app Migration

```bash
git reset --hard pre-app-directory-migration
rm -rf node_modules yarn.lock .nuxt .output
yarn install
```

### Option 2: Rollback to Before Nuxt 4 Upgrade

```bash
git reset --hard pre-nuxt-4-migration
rm -rf node_modules yarn.lock .nuxt .output
yarn install
```

### Option 3: Rollback Specific Commits

```bash
git log --oneline -10
git revert <commit-hash>
```

## Success Verification Checklist

Before considering the migration complete, verify:

- [x] `yarn dev` runs without errors
- [x] `yarn generate` completes successfully
- [x] All routes prerender (count matches original)
- [x] No console errors in browser DevTools
- [x] All pages load and display correctly
- [x] Navigation works on all pages
- [x] CSS/styles load properly
- [x] Images load correctly
- [x] Fonts load correctly
- [x] Interactive features work (forms, buttons, etc.)
- [x] Content from Nuxt Content displays correctly
- [x] Git history is clean with descriptive commits
- [x] README.md is updated (if applicable)

## Post-Migration Notes

### Path Aliases Reference

For future development, remember:

| Alias          | Resolves To  | Use Case        | Example                   |
| -------------- | ------------ | --------------- | ------------------------- |
| `@/` or `~/`   | `/app`       | App code        | `@/components/Foo.vue`    |
| `@@/` or `~~/` | Project root | Config, content | `@@/src/json/config.json` |

### Auto-Imports

Nuxt 4 automatically imports:

- Components from `/app/components`
- Composables from `/app/composables`
- Utils from `/app/utils` (named exports)
- Vue APIs (ref, computed, etc.)
- Nuxt APIs (useRoute, useHead, etc.)

### Deployment

For Netlify deployment:

- **Build command:** `yarn generate` or `npm run generate`
- **Publish directory:** `.output/public`
- **Node version:** Automatically detected from `.nvmrc` (20)

## Key Learnings from Real Migrations

Based on actual Nuxt 3 → Nuxt 4 migrations, here are critical insights:

### Configuration Changes Required

1. **nuxt.config.js changes are mandatory:**

   - Remove `future.compatibilityVersion` (Nuxt 3 forward-compat flag)
   - Remove `experimental.appManifest` (deprecated)
   - Migrate `generate.routes` to `nitro.prerender.routes`
   - Fix typos like `compabilityDate` → `compatibilityDate`

2. **Path aliases behavior changes:**

   - Before: `@/` pointed to project root
   - After: `@/` points to `/app` directory
   - Use `@@/` or `~~/` to reference project root

3. **CSS import paths must be updated:**
   - Relative paths to `node_modules` need adjustment
   - Example: `../../node_modules/` becomes `../../../node_modules/`
   - Better: Use `@/` alias instead of relative paths

### Directory Structure Matters

1. **Files that MUST move to `/app`:**

   - app.vue
   - app.config.js
   - components/
   - composables/
   - pages/
   - plugins/
   - assets/
   - middleware/ (if exists)
   - layouts/ (if exists)

2. **Files that MUST stay in root:**
   - content/ (Nuxt Content markdown)
   - public/ (static assets)
   - server/ (server routes)
   - nuxt.config.js
   - package.json
   - .nvmrc
   - Build scripts

### Common Issues and Solutions

| Issue                            | Cause                                 | Solution                                        |
| -------------------------------- | ------------------------------------- | ----------------------------------------------- |
| SCSS import error                | Relative path to node_modules changed | Add extra `../` to path                         |
| "Cannot find module"             | Import path uses wrong alias          | Use `@/` for `/app` files, `@@/` for root files |
| Netlify build fails              | Node version mismatch                 | Ensure `.nvmrc` contains `20`                   |
| Vuetify components not rendering | labsComponents spread at wrong level  | Nest under `components` object                  |
| Content queries fail             | Accidentally upgraded to Content v3   | Downgrade to v2.13.4                            |
| Hydration mismatch warning       | Server/client version difference      | Normal during migration, resolves on rebuild    |

### Critical Steps That Must Be Done in Order

1. **Always backup before major changes** - Create git tags at each phase
2. **Update Node.js before installing dependencies** - Prevents version conflicts
3. **Test after each phase** - Don't combine multiple changes
4. **Fix imports before moving files** - Easier to track changes
5. **Commit frequently** - Makes rollback easier if needed

---

## Common Pitfalls to Avoid

1. **Don't upgrade @nuxt/content to v3** - Stay on v2.13.4 unless you want to refactor all content queries
2. **Don't forget to update .nvmrc** - Netlify will fail without Node 20.x
3. **Don't use @/ for project root files** - Use @@/ or ~~/ instead
4. **Don't skip the backup tags** - They're essential for quick rollback
5. **Don't commit without testing** - Always test after each major change
6. **Don't combine multiple migrations** - Migrate Nuxt 4 first, then Content v3 separately
7. **Don't ignore hydration warnings** - They're normal during migration but should resolve

---

## Quick Reference: Migration Checklist

Use this checklist to track progress through the migration:

### Phase 1: Preparation

- [ ] Verify current Nuxt 3 version and dependencies
- [ ] Verify current Node.js version (18.x)
- [ ] Verify current build works (`yarn dev` and `yarn generate`)
- [ ] Create git backup tag: `pre-nuxt-4-migration`
- [ ] Document current route count from `yarn generate`

### Phase 2: Nuxt 4 Upgrade

- [ ] Update `package.json`: nuxt to ^4.0.0
- [ ] Keep `@nuxt/content` at ^2.13.4 (if using)
- [ ] Update `.nvmrc` to 20
- [ ] Update `nuxt.config.js`: remove deprecated options
- [ ] Update `nuxt.config.js`: fix typos (compatibilityDate)
- [ ] Update `nuxt.config.js`: migrate generate.routes to nitro.prerender.routes
- [ ] Fix Vuetify plugin syntax (if applicable)
- [ ] Run `yarn install` (or `npm install`)
- [ ] Test: `yarn dev` runs without errors
- [ ] Test: `yarn generate` completes successfully
- [ ] Commit with descriptive message

### Phase 3: /app Directory Migration

- [ ] Create second git backup tag: `pre-app-directory-migration`
- [ ] Create `/app` directory
- [ ] Move app.vue to `/app/app.vue`
- [ ] Move app.config.js to `/app/app.config.js`
- [ ] Move components/ to `/app/components/`
- [ ] Move composables/ to `/app/composables/` (if exists)
- [ ] Move pages/ to `/app/pages/`
- [ ] Move plugins/ to `/app/plugins/` (if exists)
- [ ] Move assets/ to `/app/assets/`
- [ ] Move middleware/ to `/app/middleware/` (if exists)
- [ ] Move layouts/ to `/app/layouts/` (if exists)
- [ ] Update `nuxt.config.js` CSS paths: `../assets/` → `@/assets/`
- [ ] Commit initial migration

### Phase 4: Fix Common Issues

- [ ] Fix SCSS import paths (add extra `../` if needed)
- [ ] Fix import path resolution errors (move utils to `/app/utils`)
- [ ] Update all import statements to use correct aliases
- [ ] Verify Node.js version in `.nvmrc` is correct
- [ ] Test: `yarn dev` runs without errors
- [ ] Test: `yarn generate` completes successfully
- [ ] Commit each fix with descriptive message

### Phase 5: Final Testing

- [ ] Development server: `yarn dev` starts without errors
- [ ] No "Cannot find module" errors
- [ ] No import resolution errors
- [ ] Homepage loads at http://localhost:8000/
- [ ] Navigate to all major pages
- [ ] Check browser console for errors (should be none)
- [ ] Verify CSS styles load correctly
- [ ] Verify images load correctly
- [ ] Test navigation links
- [ ] Static generation: `yarn generate` completes
- [ ] All routes prerender successfully
- [ ] Route count matches original
- [ ] Preview static build: `npx serve .output/public`
- [ ] All pages load correctly in preview
- [ ] Navigation works in preview
- [ ] Images load in preview
- [ ] CSS is applied in preview
- [ ] No 404 errors in browser console

### Phase 6: Final Commit and Documentation

- [ ] All changes are committed
- [ ] Git history is clean with descriptive commits
- [ ] Update README.md with migration information (optional)
- [ ] Verify all tests pass
- [ ] Ready for deployment

---

## End of Migration

If all success criteria are met, the migration is complete. The project is now running Nuxt 4 with the `/app` directory structure and is ready for deployment.

**Final command to push to repository:**

```bash
git push origin main
```

**For Netlify:** The deployment will automatically trigger and should succeed with the new configuration.
