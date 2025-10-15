# ICJIA SFS 2024 - Critical Accessibility Issues Report

**Date:** October 15, 2025  
**Audit Tool:** axe-core 4.10.3 + Siteimprove  
**Standard:** WCAG 2.1 Level AA  
**Status:** ⚠️ **4 CRITICAL ARIA ISSUES FOUND**

---

## Executive Summary

A comprehensive accessibility audit has identified **4 critical ARIA attribute issues** that are flagged by both axe-core and Siteimprove. These issues violate WAI-ARIA authoring practices and must be fixed to achieve WCAG 2.1 Level AA compliance.

### Issues Found: 4

- **Unsupported/Prohibited ARIA attributes:** 4 occurrences across all pages

---

## Critical Issues

### Issue #1: `aria-label` on `<div>` without role (v-list-group header)

**Severity:** SERIOUS  
**WCAG Criterion:** 4.1.2 Name, Role, Value (Level A)  
**Affected Pages:** All pages (navigation menu)  
**Occurrences:** 1

**Problem:**

```html
<div class="v-list-group__header" aria-label="About submenu">About</div>
```

The `aria-label` attribute is not supported on a `<div>` element without a valid ARIA role. This creates confusion for screen readers.

**Solution:**
Add `role="button"` or restructure to use a semantic button element:

```html
<div class="v-list-group__header" role="button" aria-label="About submenu">
  About
</div>
```

**Files to Fix:**

- `app/components/content/TheSidebar.vue` (v-list-group headers)

---

### Issue #2: `aria-label` on `<span>` without role (hero overlay)

**Severity:** SERIOUS  
**WCAG Criterion:** 4.1.2 Name, Role, Value (Level A)  
**Affected Pages:** Home page  
**Occurrences:** 1

**Problem:**

```html
<span aria-label="Safe From the Start program mission">
  Direct services to children who have been exposed to violence
</span>
```

The `aria-label` on a `<span>` without a role is not well-supported. Since the span already has visible text, the aria-label is redundant.

**Solution:**
Remove the `aria-label` attribute since the visible text is sufficient:

```html
<span> Direct services to children who have been exposed to violence </span>
```

**Files to Fix:**

- `app/pages/index.vue` or `app/components/content/SplashHome.vue`

---

### Issue #3: Redundant `role="link"` on `<a>` elements

**Severity:** SERIOUS  
**WCAG Criterion:** 4.1.2 Name, Role, Value (Level A)  
**Affected Pages:** All pages (sidebar navigation)  
**Occurrences:** Multiple

**Problem:**

```html
<a href="/sites" role="link" aria-label="SFS Sites"> Sites </a>
```

The `role="link"` is redundant on `<a>` elements. Native `<a>` elements already have the link role.

**Solution:**
Remove the redundant `role="link"` attribute:

```html
<a href="/sites" aria-label="SFS Sites"> Sites </a>
```

**Files to Fix:**

- `app/components/content/TheSidebar.vue` (v-list-item elements with role="link")

---

### Issue #4: `aria-label` on elements with visible text

**Severity:** MODERATE  
**WCAG Criterion:** 4.1.2 Name, Role, Value (Level A)  
**Affected Pages:** All pages  
**Occurrences:** Multiple

**Problem:**

```html
<a href="/sites" aria-label="Sites">Sites</a>
```

When an element has both visible text and an `aria-label`, the aria-label overrides the visible text for screen readers, which can cause confusion.

**Solution:**
Remove `aria-label` when visible text is sufficient:

```html
<a href="/sites">Sites</a>
```

Or if aria-label is needed for additional context, ensure it matches or enhances the visible text:

```html
<a href="/sites" aria-label="SFS Sites - Learn about our partner sites"
  >Sites</a
>
```

---

## Recommended Fix Priority

1. **HIGH:** Fix Issue #1 (v-list-group header aria-label) - Affects all pages
2. **HIGH:** Fix Issue #2 (hero span aria-label) - Home page
3. **MEDIUM:** Fix Issue #3 (redundant role="link") - Sidebar navigation
4. **MEDIUM:** Fix Issue #4 (aria-label on visible text) - Navigation elements

---

## Files Requiring Changes

1. `app/components/content/TheSidebar.vue`

   - Remove `role="link"` from v-list-item elements
   - Add `role="button"` to v-list-group headers
   - Review aria-label usage

2. `app/pages/index.vue` or `app/components/content/SplashHome.vue`

   - Remove aria-label from hero overlay span

3. `app/components/content/TheNavV2.vue`
   - Review aria-label usage on navigation buttons and links

---

## Fixes Applied ✅

### Fix #1: SplashHome.vue - Removed aria-label from span

**File:** `app/components/content/SplashHome.vue` (Line 102)

**Before:**

```html
<span aria-label="Safe From the Start program mission">
  Direct services to children who have been exposed to violence
</span>
```

**After:**

```html
<span> Direct services to children who have been exposed to violence </span>
```

**Reason:** The span already has visible text. The aria-label was redundant and not supported on a span without a role.

---

### Fix #2: TheSidebar.vue - Added role="button" to accordion header

**File:** `app/components/content/TheSidebar.vue` (Line 69-74)

**Before:**

```html
<v-list-item
  v-bind="props"
  style="font-weight: 900 !important"
  :aria-label="`${menu.main} submenu`"
  >{{ menu.main }}</v-list-item
>
```

**After:**

```html
<v-list-item
  v-bind="props"
  style="font-weight: 900 !important"
  role="button"
  :aria-label="`${menu.main} submenu`"
  >{{ menu.main }}</v-list-item
>
```

**Reason:** The v-list-item renders as a div with aria-label. Adding role="button" makes the aria-label valid.

---

### Fix #3: TheSidebar.vue - Removed redundant aria-label from child items

**File:** `app/components/content/TheSidebar.vue` (Line 102-109)

**Before:**

```html
<v-list-item
  v-if="child.title"
  exact
  style="margin-top: 0px; font-weight: 400; color: #555"
  :to="child.link"
  :aria-label="child.title"
>
  <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{ child.title }}</span>
</v-list-item>
```

**After:**

```html
<v-list-item
  v-if="child.title"
  exact
  style="margin-top: 0px; font-weight: 400; color: #555"
  :to="child.link"
>
  <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{ child.title }}</span>
</v-list-item>
```

**Reason:** The v-list-item already has visible text. The aria-label was redundant.

---

### Fix #4: TheSidebar.vue - Removed redundant aria-label from direct links

**File:** `app/components/content/TheSidebar.vue` (Line 117-123)

**Before:**

```html
<v-list-item
  v-else
  style="font-weight: 900 !important"
  :to="menu.link"
  class="hover"
  :aria-label="menu.main"
  >{{ menu.main }}</v-list-item
>
```

**After:**

```html
<v-list-item
  v-else
  style="font-weight: 900 !important"
  :to="menu.link"
  class="hover"
  >{{ menu.main }}</v-list-item
>
```

**Reason:** The v-list-item already has visible text. The aria-label was redundant.

---

### Fix #5: TheNavV2.vue - Removed redundant aria-label from navigation buttons

**File:** `app/components/content/TheNavV2.vue` (Line 254-268)

**Before:**

```html
<v-btn
  :to="menu?.external ? null : menu?.link"
  :href="menu?.external ? menu.link : null"
  :target="menu?.external ? '_blank' : null"
  :aria-label="menu.main"
  variant="text"
  size="default"
  class="hidden-sm-and-down navItem"
  style="font-weight: 900 !important; font-size: 18px"
  >{{ menu.main }}&nbsp;
  <v-icon v-if="menu.icon" right small color="black">{{ menu.icon }}</v-icon>
</v-btn>
```

**After:**

```html
<v-btn
  :to="menu?.external ? null : menu?.link"
  :href="menu?.external ? menu.link : null"
  :target="menu?.external ? '_blank' : null"
  variant="text"
  size="default"
  class="hidden-sm-and-down navItem"
  style="font-weight: 900 !important; font-size: 18px"
  >{{ menu.main }}&nbsp;
  <v-icon v-if="menu.icon" right small color="black">{{ menu.icon }}</v-icon>
</v-btn>
```

**Reason:** The button already has visible text. The aria-label was redundant.

---

## Testing After Fixes

After making changes, run:

```bash
node accessibility-audit.mjs
```

Verify all violations are resolved and no new issues are introduced.
