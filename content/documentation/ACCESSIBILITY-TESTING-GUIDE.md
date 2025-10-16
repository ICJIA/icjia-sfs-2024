# Accessibility Testing Guide

This guide explains how to run accessibility audits on the ICJIA SFS 2024 website and maintain WCAG 2.1 Level AA compliance.

## Quick Start

### Prerequisites

1. **Development server must be running:**
   ```bash
   yarn dev
   ```
   The server should be accessible at `http://localhost:8000`

2. **Required dependencies are already installed:**
   - axe-core (v4.11.0)
   - @axe-core/playwright (v4.10.2)
   - playwright (v1.56.0)

### Running the Audit

In a separate terminal (while dev server is running):

```bash
node accessibility-audit.mjs
```

### What the Audit Does

The script will:
1. Test all 8 major pages of the website
2. Check against WCAG 2.1 Level AA standards (wcag2a, wcag2aa, wcag21a, wcag21aa)
3. Display real-time progress for each page
4. Generate detailed JSON reports in `./accessibility-reports/`
5. Show a summary of violations by severity
6. List the top 10 most common issues
7. Provide detailed information for critical and serious violations

### Understanding the Output

#### Console Output

```
Starting Comprehensive Accessibility Audit...

Audit Date: October 14, 2025 at 11:18 AM CDT
Testing 8 pages for WCAG 2.1 Level AA compliance

Testing: Home (http://localhost:8000/)
  ✓ Scan complete
    Critical: 0
    Serious: 0
    Moderate: 0
    Minor: 0
```

#### Severity Levels

- **Critical** (Red) - Major accessibility barriers that prevent access
- **Serious** (Yellow) - Significant issues that seriously impact accessibility
- **Moderate** (Cyan) - Noticeable issues that affect some users
- **Minor** (White) - Small issues with minimal impact

#### Summary Report

```
================================================================================
ACCESSIBILITY AUDIT SUMMARY
================================================================================

Audit Date: October 14, 2025 at 11:18 AM CDT
Total Pages Tested: 8
Total Violations Found: 0

--- Violations by Severity ---
CRITICAL: 0

--- Top 10 Most Common Issues ---
1. [CRITICAL] Issue description
   Occurrences: 8
   WCAG: wcag2a, wcag131
```

### Generated Reports

All reports are saved to `./accessibility-reports/`:

1. **comprehensive-audit-report.json** - Complete audit results with:
   - Audit date and timestamp
   - Summary statistics
   - Results for all pages
   - Detailed violation information

2. **Individual page reports:**
   - `home-report.json`
   - `about-report.json`
   - `program-summary-report.json`
   - `research-report.json`
   - `sites-report.json`
   - `resources-report.json`
   - `childhood-exposure-report.json`
   - `privacy-report.json`

### Report Structure

Each report includes:

```json
{
  "auditDate": "2025-10-14",
  "auditTimestamp": "October 14, 2025 at 11:18 AM CDT",
  "timestamp": "2025-10-14T16:19:04.036Z",
  "summary": {
    "totalPages": 8,
    "totalViolations": 0,
    "bySeverity": { ... },
    "byWCAG": { ... },
    "commonIssues": { ... }
  },
  "results": [ ... ]
}
```

## When to Run Audits

### Required

- **Before deploying to production** - Always run a full audit
- **After major UI changes** - Especially changes to navigation, forms, or interactive elements
- **After framework updates** - When updating Vuetify, Nuxt, or other dependencies
- **Monthly** - Regular compliance checks

### Recommended

- **After adding new pages** - Ensure new content is accessible
- **After content updates** - Verify images have alt text, headings are proper
- **After fixing violations** - Confirm fixes resolved the issues

## Updating the Audit History

After running an audit, update the README.md audit history table:

```markdown
### Audit History

| Date       | Status    | Violations | Notes                                             |
| ---------- | --------- | ---------- | ------------------------------------------------- |
| 2025-10-14 | ✅ PASSED | 0          | Initial comprehensive audit - all issues resolved |
| YYYY-MM-DD | Status    | Count      | Your notes here                                   |
```

## Common Issues and Fixes

### Missing Alt Text

**Issue:** Images without `alt` attributes

**Fix:**
```vue
<!-- Before -->
<v-img src="image.jpg" />

<!-- After -->
<v-img src="image.jpg" alt="Descriptive text about the image" />
```

### Nested Interactive Controls

**Issue:** Buttons or links inside other interactive elements

**Fix:** Restructure to separate interactive elements using absolute positioning or flexbox

### ARIA Role Conflicts

**Issue:** Conflicting ARIA roles (common with Vuetify components)

**Fix:** Override roles or use JavaScript to remove problematic attributes

### Color Contrast

**Issue:** Text doesn't meet minimum contrast ratios

**Fix:** Adjust colors to meet WCAG AA standards:
- Normal text: 4.5:1
- Large text: 3:1
- AAA (ideal): 7:1 for normal, 4.5:1 for large

## Manual Testing Checklist

Automated testing catches ~30-50% of accessibility issues. Also perform manual testing:

### Keyboard Navigation

- [ ] Tab through all interactive elements
- [ ] Verify focus indicators are visible
- [ ] Test Enter/Space on buttons and links
- [ ] Verify skip navigation link works
- [ ] Check modal/dialog keyboard trapping

### Screen Reader Testing

- [ ] Test with NVDA (Windows)
- [ ] Test with JAWS (Windows)
- [ ] Test with VoiceOver (Mac/iOS)
- [ ] Verify all images have descriptive alt text
- [ ] Check ARIA labels are meaningful
- [ ] Verify form labels are associated

### Visual Testing

- [ ] Zoom to 200% - content should reflow
- [ ] Test with high contrast mode
- [ ] Verify color is not the only indicator
- [ ] Check focus indicators are visible
- [ ] Test with color blindness simulators

### Mobile Testing

- [ ] Test touch targets (minimum 44x44px)
- [ ] Verify mobile navigation is accessible
- [ ] Check orientation changes work
- [ ] Test with mobile screen readers

## Tools and Resources

### Browser Extensions

- **axe DevTools** - Chrome/Firefox extension for manual testing
- **WAVE** - Web accessibility evaluation tool
- **Lighthouse** - Built into Chrome DevTools

### Online Tools

- **WebAIM Contrast Checker** - https://webaim.org/resources/contrastchecker/
- **Color Blindness Simulator** - https://www.color-blindness.com/coblis-color-blindness-simulator/
- **WAVE Web Accessibility Evaluation Tool** - https://wave.webaim.org/

### Documentation

- **WCAG 2.1 Guidelines** - https://www.w3.org/WAI/WCAG21/quickref/
- **axe-core Rules** - https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md
- **Vuetify Accessibility** - https://vuetifyjs.com/en/features/accessibility/

## Troubleshooting

### Dev Server Not Running

**Error:** `Error: connect ECONNREFUSED 127.0.0.1:8000`

**Solution:**
```bash
# Start the dev server in a separate terminal
yarn dev
```

### Playwright Browser Not Installed

**Error:** `browserType.launch: Executable doesn't exist`

**Solution:**
```bash
npx playwright install chromium
```

### Port Already in Use

**Error:** `Port 8000 is already in use`

**Solution:**
```bash
# Find and kill the process using port 8000
lsof -ti:8000 | xargs kill -9

# Or use a different port in nuxt.config.js
```

### Stale Results

If you've made changes but the audit shows old violations:

1. Clear browser cache
2. Restart dev server
3. Wait for page to fully load (script waits 2 seconds)
4. Re-run audit

## CI/CD Integration

To integrate accessibility testing into your CI/CD pipeline:

### GitHub Actions Example

```yaml
name: Accessibility Audit

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  accessibility:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: yarn install
      - run: yarn dev &
      - run: sleep 10 # Wait for server to start
      - run: node accessibility-audit.mjs
      - name: Upload reports
        uses: actions/upload-artifact@v3
        with:
          name: accessibility-reports
          path: accessibility-reports/
```

## Contact

For questions about accessibility or this testing process, contact the ICJIA development team.

## Additional Resources

- [ACCESSIBILITY-AUDIT-REPORT.md](./ACCESSIBILITY-AUDIT-REPORT.md) - Latest audit results
- [README.md](./README.md) - Project documentation
- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)

