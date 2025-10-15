# ICJIA SFS 2024 - Remaining Accessibility Issues
**Date:** October 15, 2025  
**Status:** ⚠️ CRITICAL ISSUES REMAINING

---

## Summary

After a comprehensive audit of all 8 pages of the website, **1 critical ARIA attribute violation** was identified that still needs to be fixed.

---

## Critical Issue: Button with Visible Text AND aria-label

### Issue Details

**Severity:** CRITICAL  
**WCAG Criterion:** 4.1.2 Name, Role, Value (Level A)  
**Pages Affected:** ALL 8 pages  
**Total Occurrences:** 18 button instances (3 per page)  
**Component:** `app/components/content/TheNavV2.vue`

### Problem Description

Buttons in the top navigation have both visible text content AND aria-label attributes. When both are present on the same element, the aria-label **overrides** the visible text for screen reader users, causing confusion and inconsistency.

### Affected Button Types

#### 1. Logo Button (Lines 80-90)
```html
<v-btn
  @click="$router.push('/')"
  aria-label="Go to homepage"
  variant="text"
  class="hover ml-4 mr-4"
>
  <img alt="ICJIA Logo" src="/icjia-logo.png" width="55" />
</v-btn>
```

**Issue:** The aria-label "Go to homepage" is redundant. The image has alt text, and the button's purpose is clear.

#### 2. Full Title Button (Lines 96-114)
```html
<v-btn
  @click="$router.push('/')"
  aria-label="Go to homepage - Safe From the Start"
  variant="text"
  class="hover hidden-sm-and-down"
>
  <span>SAFE FROM THE START</span>
</v-btn>
```

**Issue:** The aria-label overrides the visible text "SAFE FROM THE START". Screen readers announce "Go to homepage - Safe From the Start" instead of the visible text.

#### 3. Abbreviated Title Button (Lines 120-138)
```html
<v-btn
  @click="$router.push('/')"
  aria-label="Go to homepage - SFS"
  variant="text"
  class="hover hidden-md-and-up"
>
  <span>SFS</span>
</v-btn>
```

**Issue:** Same as above - aria-label overrides visible text "SFS".

#### 4. Menu Dropdown Buttons (Lines 171-181)
```html
<v-btn
  variant="text"
  size="default"
  class="hidden-md-and-down navItem"
  v-bind="props"
  :aria-label="`${menu.main} menu`"
  :aria-expanded="props['aria-expanded']"
  :aria-haspopup="true"
>
  {{ menu.main }}
</v-btn>
```

**Issue:** The aria-label "About menu" (or other menu names) overrides the visible text. Screen readers announce "About menu" but the visible text is just "About".

---

## Solution

### Option 1: Remove aria-label (Recommended)
For buttons with clear visible text or images with alt text, remove the aria-label entirely. The visible text or image alt text is sufficient.

### Option 2: Ensure aria-label Matches Visible Text
If aria-label is needed for additional context, ensure it matches or enhances (not replaces) the visible text.

### Recommended Fixes

**Logo Button:** Remove aria-label (image alt text is sufficient)
```html
<v-btn
  @click="$router.push('/')"
  variant="text"
  class="hover ml-4 mr-4"
>
  <img alt="ICJIA Logo" src="/icjia-logo.png" width="55" />
</v-btn>
```

**Title Buttons:** Remove aria-label (visible text is sufficient)
```html
<v-btn
  @click="$router.push('/')"
  variant="text"
  class="hover hidden-sm-and-down"
>
  <span>SAFE FROM THE START</span>
</v-btn>
```

**Menu Buttons:** Remove aria-label (visible text is sufficient)
```html
<v-btn
  variant="text"
  size="default"
  class="hidden-md-and-down navItem"
  v-bind="props"
  :aria-expanded="props['aria-expanded']"
  :aria-haspopup="true"
>
  {{ menu.main }}
</v-btn>
```

---

## Impact

- **Screen Reader Users:** Currently hear redundant or conflicting information
- **Keyboard Users:** No direct impact, but accessibility is compromised
- **WCAG Compliance:** Violates WCAG 2.1 Level AA criterion 4.1.2

---

## Testing After Fix

1. Run accessibility audit: `node accessibility-audit.mjs`
2. Test with screen readers:
   - NVDA (Windows)
   - JAWS (Windows)
   - VoiceOver (macOS/iOS)
3. Verify button announcements match visible text
4. Test keyboard navigation (Tab, Enter, Space)

---

## Files to Modify

- `app/components/content/TheNavV2.vue` (6 aria-label attributes to remove)

---

## Priority

**CRITICAL** - Must be fixed before production deployment to achieve WCAG 2.1 Level AA compliance.

