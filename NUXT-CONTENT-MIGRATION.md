# Nuxt Content v2 to v3 Migration Guide

This guide provides step-by-step instructions for migrating any Nuxt Content v2 project to v3. The migration involves breaking API changes that require careful updates to your codebase.

## Overview of Breaking Changes

Nuxt Content v3 is a complete rewrite with a new architecture based on SQL databases instead of file-based queries. While content files remain the same, the query APIs and component usage have changed significantly.

### Key Changes Summary

| Aspect | v2 | v3 |
|--------|----|----|
| Query API | `queryContent()` | `queryCollection()` |
| Query Method | `.findOne()` | `.first()` |
| Query Method | `.find()` | `.find()` (similar but SQL-based) |
| Configuration | `nuxt.config.ts` | `content.config.ts` |
| Components | `ContentDoc`, `ContentList`, `ContentNavigation` | `ContentRenderer` (primary) |
| Path Field | `._path` | `.path` |
| Navigation Files | `_dir.yml` | `.navigation.yml` |

## Step-by-Step Migration Process

### Step 1: Upgrade Dependencies

```bash
# Using npm
npm install @nuxt/content@latest

# Using yarn
yarn add @nuxt/content@latest

# Using pnpm
pnpm add @nuxt/content@latest
```

This will install Nuxt Content v3 and its dependencies, including the new SQL-based query engine.

### Step 2: Create content.config.ts

Create a new file `content.config.ts` in your project root:

```typescript
import { defineContentConfig, defineCollection } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    content: defineCollection({
      type: 'page',
      source: '**/*.md'
    })
  }
})
```

This configuration:
- Defines a `content` collection for all markdown files
- Sets `type: 'page'` for 1-to-1 file-to-page relationships
- Uses `source: '**/*.md'` to include all markdown files

### Step 3: Update nuxt.config.ts/js

Remove or simplify the `content` configuration in your Nuxt config:

**Before (v2):**
```javascript
export default defineNuxtConfig({
  content: {
    documentDriven: false,
    markdown: {
      mdc: true,
      anchorLinks: { depth: 0 }
    }
  }
})
```

**After (v3):**
```javascript
export default defineNuxtConfig({
  content: {
    // Module-level options only
    // Collection config moved to content.config.ts
  }
})
```

### Step 4: Update Query API Calls

Replace all `queryContent()` calls with `queryCollection()`.

**Before (v2):**
```javascript
const post = await queryContent().where({ _path: "/about" }).findOne();
const posts = await queryContent().where({ category: "blog" }).find();
```

**After (v3):**
```javascript
const post = await queryCollection('content').path('/about').first();
const posts = await queryCollection('content').where('category', '=', 'blog').find();
```

Key differences:
- `queryContent()` → `queryCollection('content')` (specify collection name)
- `.findOne()` → `.first()` (get single item)
- `.where({ _path: "/path" })` → `.path('/path')` (dedicated path method)
- `.where({ field: value })` → `.where('field', '=', value)` (SQL-style syntax)

### Step 5: Update Component Usage

Replace deprecated components with `ContentRenderer`.

**Before (v2):**
```vue
<ContentDoc :value="data" />
<ContentList path="/blog" />
<ContentNavigation />
```

**After (v3):**
```vue
<ContentRenderer :value="data" />
<!-- ContentList and ContentNavigation are removed -->
<!-- Use queryCollection() to fetch and render content -->
```

### Step 6: Update Field References

Change internal field names from underscore prefix to no prefix.

**Before (v2):**
```javascript
const path = post._path;
const body = post._body;
```

**After (v3):**
```javascript
const path = post.path;
const body = post.body;
```

### Step 7: Rename Navigation Files

Rename `_dir.yml` files to `.navigation.yml`:

```bash
# Rename all _dir.yml files
find content -name "_dir.yml" -exec sh -c 'mv "$1" "${1%_dir.yml}.navigation.yml"' _ {} \;
```

Update your collection source to include these files:

```typescript
defineCollection({
  type: 'page',
  source: {
    include: '**',
    exclude: ['**/.!(navigation.yml)']  // Exclude dot files except .navigation.yml
  }
})
```

### Step 8: Update Surroundings API

If using `findSurround()`, use the new dedicated API.

**Before (v2):**
```javascript
const surround = await queryContent('/docs')
  .only(['title', 'description'])
  .findSurround(route.path);
```

**After (v3):**
```javascript
const surround = await queryCollectionItemSurroundings(
  'content',
  '/docs',
  { fields: ['title', 'description'] }
);
```

### Step 9: Test Your Application

Run your application in development mode:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Verify:
- All content pages render correctly
- No console errors related to Content queries
- Navigation between pages works
- Content data displays properly

### Step 10: Build and Test Production

```bash
npm run build
npm run preview
# or
yarn build
yarn preview
```

Verify:
- Build completes without errors
- All routes prerender successfully
- Production preview works correctly
- Content is accessible in production build

## Common Issues and Solutions

### Issue: "queryContent is not defined"

**Cause:** Still using v2 API after upgrading to v3

**Solution:** Replace `queryContent()` with `queryCollection('content')`

### Issue: "Collection 'content' not found"

**Cause:** Missing or incorrect `content.config.ts`

**Solution:** Create `content.config.ts` with proper collection definition

### Issue: Content not rendering

**Cause:** Using deprecated `ContentDoc` or `ContentList` components

**Solution:** Use `ContentRenderer` component instead

### Issue: Path queries not working

**Cause:** Using `._path` instead of `.path`

**Solution:** Update all field references to remove underscore prefix

### Issue: Build fails with "Cannot find module"

**Cause:** Incorrect import paths or missing configuration

**Solution:** 
- Clear cache: `rm -rf .nuxt .output`
- Reinstall dependencies: `npm install` or `yarn install`
- Verify `content.config.ts` exists in project root

## Migration Checklist

- [ ] Upgrade `@nuxt/content` to v3
- [ ] Create `content.config.ts` in project root
- [ ] Update `nuxt.config.ts/js` to remove v2 content config
- [ ] Replace all `queryContent()` calls with `queryCollection()`
- [ ] Replace `.findOne()` with `.first()`
- [ ] Update `.where()` syntax to SQL-style
- [ ] Replace `ContentDoc` with `ContentRenderer`
- [ ] Update field references (remove `_` prefix)
- [ ] Rename `_dir.yml` to `.navigation.yml`
- [ ] Update surroundings API if used
- [ ] Test development server
- [ ] Test production build
- [ ] Test preview mode
- [ ] Verify all content pages render
- [ ] Check console for errors

## Additional Resources

- [Nuxt Content v3 Documentation](https://content.nuxt.com)
- [Nuxt Content v3 Collections Guide](https://content.nuxt.com/docs/collections/define)
- [Nuxt Content v3 Query API](https://content.nuxt.com/docs/utils/query-collection)
- [Nuxt Content v3 Components](https://content.nuxt.com/docs/components/content-renderer)

## Rollback Instructions

If you need to rollback to v2:

```bash
# Downgrade package
npm install @nuxt/content@^2.13.4
# or
yarn add @nuxt/content@^2.13.4

# Restore original nuxt.config content section
# Remove content.config.ts
rm content.config.ts

# Revert all queryCollection() calls to queryContent()
# Revert all .first() calls to .findOne()
# Revert all field references back to underscore prefix
```

Then rebuild and test:

```bash
npm run build
npm run preview
```

