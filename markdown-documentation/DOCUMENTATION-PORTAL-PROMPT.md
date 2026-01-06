# Documentation Portal Creation Prompt (Nuxt 4 + Vuetify 3)

**Version**: 1.0.0  
**Last Updated**: January 6, 2026  
**Purpose**: Comprehensive prompt for LLMs to create a documentation portal with testing, accessibility auditing, and JSDoc generation for any Nuxt 4 + Vuetify 3 application.

---

## How to Use This Prompt

Copy and paste this entire document into an LLM along with your repository context. The LLM will implement:

1. **Unit & Integration Testing** with Vitest and HTML report generation
2. **Accessibility Auditing** with axe-core for multiple viewports
3. **JSDoc/TypeDoc Generation** for API documentation
4. **Light/Dark Mode Testing** (if applicable)
5. **Documentation Portal** with navigation and footer links
6. **"Never 404" Placeholder Strategy** for all documentation endpoints

> 📌 **Reference Implementation**: This prompt is based on the [ICJIA Accessibility Portal](https://github.com/ICJIA/icjia-accessibility-portal) and [ICJIA SFS 2024](https://github.com/ICJIA/icjia-sfs-2024) projects.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Required Dependencies](#required-dependencies)
3. [Directory Structure](#directory-structure)
4. [Configuration Files](#configuration-files)
5. [Package.json Scripts](#packagejson-scripts)
6. [Test Suite Implementation](#test-suite-implementation)
7. [Accessibility Audit Implementation](#accessibility-audit-implementation)
8. [JSDoc Generation](#jsdoc-generation)
9. [Documentation Portal Index](#documentation-portal-index)
10. [Placeholder Strategy](#placeholder-strategy)
11. [Footer & Navigation Integration](#footer--navigation-integration)
12. [Nuxt Configuration Updates](#nuxt-configuration-updates)
13. [Verification Checklist](#verification-checklist)
14. [LLM Questions for Developer](#llm-questions-for-developer)
15. [Chrome DevTools 404 Fix](#chrome-devtools-404-fix)
16. [Advanced Accessibility Audit Script](#advanced-accessibility-audit-script)
17. [Light/Dark Mode Testing](#lightdark-mode-testing)
18. [GitHub Reference Links Summary](#github-reference-links-summary)
19. [Netlify Deployment Configuration](#netlify-deployment-configuration)

---

## Prerequisites

### Required Environment

| Requirement    | Minimum Version | Recommended Version | Notes                   |
| -------------- | --------------- | ------------------- | ----------------------- |
| **Node.js**    | 18.18.0         | 22.14.0+            | LTS version recommended |
| **Yarn**       | 1.22.19         | 1.22.22+            | Or npm 10.0.0+          |
| **Nuxt**       | 3.0.0           | 4.0.0+              | With Vue 3 support      |
| **Vuetify**    | 3.0.0           | 3.7.0+              | For UI components       |
| **TypeScript** | 5.0.0           | 5.7.0+              | For type safety         |

### Version File (`.nvmrc`)

Create `.nvmrc` in project root:

```
22.14.0
```

**GitHub Reference**: [`.nvmrc`](https://github.com/ICJIA/icjia-accessibility-portal/blob/main/.nvmrc)

---

## Required Dependencies

### Add to `package.json`

```json
{
  "devDependencies": {
    "@axe-core/playwright": "^4.10.2",
    "@vitejs/plugin-vue": "^5.2.0",
    "axe-core": "^4.11.0",
    "happy-dom": "^15.11.0",
    "playwright": "^1.56.0",
    "typedoc": "^0.27.0",
    "vitest": "^2.1.0"
  }
}
```

### Installation Commands

```bash
# Using Yarn
yarn add -D @axe-core/playwright axe-core playwright vitest happy-dom typedoc @vitejs/plugin-vue

# Using npm
npm install -D @axe-core/playwright axe-core playwright vitest happy-dom typedoc @vitejs/plugin-vue

# Install Playwright browsers (required for accessibility testing)
npx playwright install chromium
```

**GitHub Reference**: [`package.json`](https://github.com/ICJIA/icjia-accessibility-portal/blob/main/package.json)

---

## Directory Structure

Implement this directory structure:

```
/
├── public/
│   ├── docs/                          # Documentation portal root
│   │   ├── index.html                 # Portal landing page
│   │   ├── accessibility/             # Accessibility audit reports
│   │   │   ├── index.html             # Audit HTML report
│   │   │   └── results.json           # Machine-readable results
│   │   ├── tests/                     # Test result reports
│   │   │   └── index.html             # Test HTML report
│   │   └── jsdoc/                     # API documentation
│   │       ├── index.html             # TypeDoc entry
│   │       └── [generated files]
│   ├── .well-known/                   # Browser/tool requests
│   │   └── appspecific/
│   │       └── com.chrome.devtools.json
│   ├── sitemap.xml                    # Site map (exclude /docs/*)
│   └── robots.txt                     # Search engine directives
├── scripts/
│   ├── ensure-accessibility-report.js # Placeholder creator
│   └── [other build scripts]
├── test/
│   ├── unit/                          # Unit tests (pure functions)
│   │   └── *.test.ts
│   ├── nuxt/                          # Nuxt environment tests
│   │   └── *.test.ts
│   ├── e2e/                           # End-to-end tests (optional)
│   ├── run-all-tests.mjs              # Test runner with HTML output
│   ├── setup.ts                       # Test setup file
│   └── README.md                      # Test documentation
├── accessibility-audit.mjs            # Accessibility audit script
├── vitest.config.ts                   # Vitest configuration
├── typedoc.json                       # TypeDoc configuration
└── tsconfig.json                      # TypeScript configuration
```

**GitHub Reference**: [Project Structure](https://github.com/ICJIA/icjia-accessibility-portal)

---

## Configuration Files

### Vitest Configuration (`vitest.config.ts`)

```typescript
/**
 * Vitest configuration for Nuxt/Vue testing.
 * @see https://vitest.dev/config/
 */

import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

export default defineConfig({
  plugins: [vue()],

  test: {
    // Enable globals for describe, it, expect without imports
    globals: true,

    // Use happy-dom for DOM testing (faster than jsdom)
    environment: "happy-dom",

    // Include test files from test directory
    include: ["test/**/*.test.ts", "test/**/*.spec.ts"],

    // Exclude build artifacts
    exclude: ["node_modules", "dist", ".output", ".nuxt"],

    // Coverage configuration
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      reportsDirectory: "./coverage",
      exclude: [
        "node_modules",
        "test",
        "**/*.d.ts",
        "**/*.config.*",
        ".nuxt",
        ".output",
      ],
    },

    // Reporter configuration - output JSON for HTML generation
    reporters: ["verbose", "json"],
    outputFile: {
      json: "./test-results.json",
    },

    // Setup files for test environment
    setupFiles: ["./test/setup.ts"],

    // Timeout for async tests
    testTimeout: 10000,
  },

  resolve: {
    alias: {
      "@": resolve(__dirname, "./app"),
      "~": resolve(__dirname, "./"),
      "#app": resolve(__dirname, "./node_modules/nuxt/dist/app"),
    },
  },
});
```

**GitHub Reference**: [`vitest.config.ts`](https://github.com/ICJIA/icjia-sfs-2024/blob/main/vitest.config.ts)

---

### TypeDoc Configuration (`typedoc.json`)

```json
{
  "$schema": "https://typedoc.org/schema.json",
  "tsconfig": "./tsconfig.json",
  "entryPoints": ["app/composables/*.ts", "app/utils/*.ts", "app/plugins/*.ts"],
  "entryPointStrategy": "expand",
  "out": "public/docs/jsdoc",
  "name": "PROJECT_NAME - API Documentation",
  "readme": "none",
  "includeVersion": true,
  "excludePrivate": true,
  "excludeProtected": true,
  "excludeInternal": true,
  "excludeNotDocumented": false,
  "sourceLinkTemplate": "https://github.com/ORG_NAME/REPO_NAME/blob/main/{path}#L{line}",
  "navigationLinks": {
    "Home": "/",
    "Documentation Portal": "/docs/"
  }
}
```

**GitHub Reference**: [`typedoc.json`](https://github.com/ICJIA/icjia-accessibility-portal/blob/main/typedoc.json)

---

### Test Setup (`test/setup.ts`)

```typescript
/**
 * @fileoverview Test setup file for Vitest
 * @description Configures the testing environment with mocks and utilities
 */

import { vi } from "vitest";

// Mock Vue router for composables that use useRouter
vi.mock("vue-router", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  useRoute: () => ({
    path: "/",
    params: {},
    query: {},
  }),
}));

// Mock Nuxt composables if needed
vi.mock("#app", () => ({
  useRuntimeConfig: () => ({
    public: {
      siteUrl: "http://localhost:3000",
    },
  }),
}));

// Global test utilities
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));
```

**GitHub Reference**: [`test/setup.ts`](https://github.com/ICJIA/icjia-sfs-2024/blob/main/test/setup.ts)

---

## Package.json Scripts

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "dev": "yarn ensure:docs && nuxt dev --port=3000",
    "build": "yarn ensure:docs && nuxt build",
    "generate": "yarn ensure:docs && nuxt generate",

    "ensure:docs": "node ./scripts/ensure-accessibility-report.js",

    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:all": "node ./test/run-all-tests.mjs",

    "audit:a11y": "node accessibility-audit.mjs",

    "docs:jsdoc": "npx typedoc",
    "docs:all": "yarn test:all && yarn audit:a11y && yarn docs:jsdoc"
  }
}
```

**Script Descriptions**:

| Script          | Purpose                                            |
| --------------- | -------------------------------------------------- |
| `ensure:docs`   | Creates placeholder HTML files if they don't exist |
| `test`          | Runs tests once                                    |
| `test:watch`    | Runs tests in watch mode                           |
| `test:coverage` | Runs tests with coverage report                    |
| `test:all`      | Runs all tests and generates HTML report           |
| `audit:a11y`    | Runs accessibility audit                           |
| `docs:jsdoc`    | Generates API documentation                        |
| `docs:all`      | Generates all documentation (tests + a11y + jsdoc) |

**GitHub Reference**: [`package.json`](https://github.com/ICJIA/icjia-sfs-2024/blob/main/package.json)

---

## Test Suite Implementation

### Test Runner with HTML Report (`test/run-all-tests.mjs`)

This script runs all tests and generates an HTML report at `/public/docs/tests/index.html`:

```javascript
#!/usr/bin/env node
/**
 * @fileoverview Comprehensive test runner with HTML report generation
 * @description Runs all tests (unit and nuxt environment) and generates an HTML report
 * at /public/docs/tests/index.html with detailed results and test descriptions.
 *
 * @see https://github.com/ICJIA/icjia-sfs-2024/blob/main/test/run-all-tests.mjs
 */

import { spawn } from "child_process";
import { writeFileSync, mkdirSync, existsSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, "..");

/**
 * Test descriptions mapping test names to human-readable explanations.
 * These appear in expandable dropdowns in the HTML report.
 *
 * IMPORTANT: Add a description for EVERY test in your project.
 * The key must match the test title exactly (from the `it()` or `test()` call).
 */
const TEST_DESCRIPTIONS = {
  // Example descriptions - customize for your tests
  "should return a valid result":
    "Verifies the function returns a valid result under normal conditions.",
  "should handle edge cases":
    "Tests edge cases like empty inputs, null values, and boundary conditions.",
  // Add your test descriptions here...
};

/**
 * Run vitest and capture output
 * @returns {Promise<{passed: boolean, output: string, results: Object|null}>}
 */
async function runVitestTests() {
  return new Promise((resolve) => {
    const args = ["vitest", "run", "--reporter=json", "--reporter=verbose"];
    const proc = spawn("npx", args, {
      cwd: projectRoot,
      shell: true,
      env: { ...process.env, FORCE_COLOR: "0" },
    });

    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (data) => {
      stdout += data.toString();
      process.stdout.write(data);
    });

    proc.stderr.on("data", (data) => {
      stderr += data.toString();
      process.stderr.write(data);
    });

    proc.on("close", (code) => {
      let results = null;
      try {
        const jsonPath = join(projectRoot, "test-results.json");
        if (existsSync(jsonPath)) {
          results = JSON.parse(readFileSync(jsonPath, "utf-8"));
        }
      } catch (e) {
        console.warn("Could not parse test results JSON:", e.message);
      }

      resolve({
        passed: code === 0,
        output: stdout + stderr,
        results,
        exitCode: code,
      });
    });
  });
}

/**
 * Escape HTML special characters
 */
function escapeHtml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Generate HTML report from test results
 */
function generateHTMLReport(results, reportDate) {
  const reportTimestamp = reportDate.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
  });

  const testFiles = results?.testResults || [];
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  let skippedTests = 0;
  let totalDuration = 0;

  const fileResults = testFiles.map((file) => {
    const fileName = file.name?.replace(projectRoot, "") || "Unknown file";
    const assertions = file.assertionResults || [];

    let filePassed = 0;
    let fileFailed = 0;
    let fileSkipped = 0;

    assertions.forEach((test) => {
      totalTests++;
      if (test.status === "passed") {
        passedTests++;
        filePassed++;
      } else if (test.status === "failed") {
        failedTests++;
        fileFailed++;
      } else {
        skippedTests++;
        fileSkipped++;
      }
    });

    totalDuration += file.endTime - file.startTime || 0;

    return {
      fileName,
      assertions,
      passed: filePassed,
      failed: fileFailed,
      skipped: fileSkipped,
      duration: file.endTime - file.startTime || 0,
    };
  });

  const allPassed = failedTests === 0;

  // Generate HTML (full template in reference implementation)
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Test Results - ${reportTimestamp}</title>
  <style>
    /* Styling for test report - see GitHub reference for full CSS */
    :root { --primary: #2c3e50; --success: #28a745; --danger: #dc3545; }
    body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; padding: 20px; background: #f5f5f5; }
    .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; }
    h1 { color: var(--primary); border-bottom: 3px solid #17a2b8; padding-bottom: 10px; }
    .stat-card { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 5px; }
    .stat-card .number { font-size: 2.5em; font-weight: bold; }
    .success .number { color: var(--success); }
    .danger .number { color: var(--danger); }
    .test-case { padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid var(--success); background: white; }
    .test-case.failed { border-left-color: var(--danger); }
    .test-case-description summary { color: #17a2b8; cursor: pointer; font-size: 0.85rem; }
    .description-content { margin-top: 10px; padding: 15px; background: #e7f3ff; border-left: 3px solid #17a2b8; }
    footer { margin-top: 40px; border-top: 2px solid #ddd; padding-top: 20px; text-align: center; color: #7f8c8d; }
    footer a { color: #17a2b8; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🧪 Test Results</h1>
    
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 20px 0;">
      <div class="stat-card"><div class="number">${totalTests}</div><div>Total Tests</div></div>
      <div class="stat-card success"><div class="number">${passedTests}</div><div>Passed</div></div>
      <div class="stat-card ${failedTests > 0 ? "danger" : "success"}"><div class="number">${failedTests}</div><div>Failed</div></div>
      <div class="stat-card"><div class="number">${skippedTests}</div><div>Skipped</div></div>
    </div>
    
    ${allPassed ? '<div style="background: #d4edda; padding: 20px; border-radius: 5px; color: #155724;">✅ All tests passed!</div>' : '<div style="background: #f8d7da; padding: 20px; border-radius: 5px; color: #721c24;">❌ Some tests failed. Review details below.</div>'}
    
    <h2>Detailed Results</h2>
    ${fileResults
      .map(
        (file) => `
      <div style="background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #17a2b8;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
          <h3 style="font-family: monospace; font-size: 0.95rem;">${escapeHtml(file.fileName)}</h3>
          <span>✅ ${file.passed} ❌ ${file.failed} ⏱️ ${(file.duration / 1000).toFixed(2)}s</span>
        </div>
        ${file.assertions
          .map((test) => {
            const status =
              test.status === "passed"
                ? "✅"
                : test.status === "failed"
                  ? "❌"
                  : "⚠️";
            const description = TEST_DESCRIPTIONS[test.title] || null;
            return `
            <div class="test-case ${test.status === "failed" ? "failed" : ""}">
              <div><strong>${status} ${escapeHtml(test.title)}</strong></div>
              <div style="font-size: 0.85rem; color: #7f8c8d;">Duration: ${test.duration || 0}ms</div>
              ${description ? `<details class="test-case-description"><summary>What does this test verify?</summary><div class="description-content">${escapeHtml(description)}</div></details>` : ""}
              ${test.failureMessages?.length > 0 ? `<pre style="background: #f8d7da; padding: 10px; margin-top: 10px; border-radius: 4px; font-size: 0.85rem; color: #721c24;">${escapeHtml(test.failureMessages.join("\\n"))}</pre>` : ""}
            </div>
          `;
          })
          .join("")}
      </div>
    `
      )
      .join("")}
    
    <footer>
      <p>Generated: ${reportTimestamp}</p>
      <p><a href="/docs/">← Back to Documentation Portal</a> | <a href="https://vitest.dev/" target="_blank">Vitest Documentation</a></p>
    </footer>
  </div>
</body>
</html>`;
}

async function main() {
  console.log("🧪 Running all tests...");

  const testResults = await runVitestTests();
  const reportDate = new Date();

  const outputDir = join(projectRoot, "public", "docs", "tests");
  const outputPath = join(outputDir, "index.html");

  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  if (testResults.results) {
    const htmlReport = generateHTMLReport(testResults.results, reportDate);
    writeFileSync(outputPath, htmlReport, "utf-8");
    console.log(`✓ Report generated: ${outputPath}`);
  }

  process.exit(testResults.passed ? 0 : 1);
}

main();
```

**GitHub Reference**: [`test/run-all-tests.mjs`](https://github.com/ICJIA/icjia-sfs-2024/blob/main/test/run-all-tests.mjs)

---

## Accessibility Audit Implementation

### Accessibility Audit Script (`accessibility-audit.mjs`)

This script tests all pages for WCAG 2.1 AA compliance across multiple viewports:

```javascript
/**
 * Comprehensive Accessibility Audit Script
 *
 * Tests all pages for WCAG 2.1 Level AA compliance using axe-core with Playwright.
 * Generates detailed reports categorized by severity.
 *
 * @see https://github.com/ICJIA/icjia-sfs-2024/blob/main/accessibility-audit.mjs
 */

import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import fs from "fs";
import path from "path";

// Configuration - CUSTOMIZE THESE FOR YOUR PROJECT
const BASE_URL = "http://localhost:3000";
const OUTPUT_DIR = "./public/docs/accessibility";

// Pages to test - update with your routes
const PAGES_TO_TEST = [
  { path: "/", name: "Home" },
  { path: "/about", name: "About" },
  // Add your routes here...
];

// Viewports to test
const VIEWPORTS = [
  { name: "desktop", width: 1920, height: 1080 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 375, height: 667 },
];

// Theme modes to test (if your app supports light/dark mode)
const THEMES = [
  { name: "light", selector: null }, // null = default theme
  { name: "dark", selector: ".dark-mode" }, // or your theme toggle mechanism
];

/**
 * Run accessibility audit
 */
async function runAccessibilityAudit() {
  const auditDate = new Date().toISOString().split("T")[0];
  const auditTimestamp = new Date().toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });

  console.log("Starting Accessibility Audit...\n");
  console.log(
    `Testing ${PAGES_TO_TEST.length} pages × ${VIEWPORTS.length} viewports`
  );

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const allResults = [];

  for (const pageInfo of PAGES_TO_TEST) {
    for (const viewport of VIEWPORTS) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
      });
      const page = await context.newPage();
      const url = `${BASE_URL}${pageInfo.path}`;

      console.log(`\nTesting: ${pageInfo.name} (${viewport.name})`);

      try {
        await page.goto(url, { waitUntil: "networkidle" });
        await page.waitForTimeout(1000); // Wait for dynamic content

        // Run axe-core with WCAG 2.1 Level AA rules
        const accessibilityScanResults = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
          .analyze();

        const violations = accessibilityScanResults.violations;
        const categorized = {
          critical: violations.filter((v) => v.impact === "critical"),
          serious: violations.filter((v) => v.impact === "serious"),
          moderate: violations.filter((v) => v.impact === "moderate"),
          minor: violations.filter((v) => v.impact === "minor"),
        };

        console.log(
          `  Critical: ${categorized.critical.length}, Serious: ${categorized.serious.length}, Moderate: ${categorized.moderate.length}, Minor: ${categorized.minor.length}`
        );

        allResults.push({
          page: pageInfo.name,
          path: pageInfo.path,
          viewport: viewport.name,
          url,
          timestamp: new Date().toISOString(),
          violations,
          passes: accessibilityScanResults.passes.length,
          incomplete: accessibilityScanResults.incomplete.length,
          categorized,
        });
      } catch (error) {
        console.error(`  ✗ Error: ${error.message}`);
      }

      await context.close();
    }
  }

  await browser.close();

  // Save JSON results
  const resultsPath = path.join(OUTPUT_DIR, "results.json");
  fs.writeFileSync(
    resultsPath,
    JSON.stringify(
      {
        auditDate,
        auditTimestamp,
        results: allResults,
      },
      null,
      2
    )
  );

  // Generate HTML report
  generateHTMLReport(allResults, auditTimestamp, OUTPUT_DIR);

  console.log(`\n✅ Audit complete! Reports saved to: ${OUTPUT_DIR}/`);
}

/**
 * Generate HTML accessibility report
 */
function generateHTMLReport(results, timestamp, outputDir) {
  const totalViolations = results.reduce(
    (sum, r) => sum + r.violations.length,
    0
  );
  const criticalCount = results.reduce(
    (sum, r) => sum + r.categorized.critical.length,
    0
  );
  const seriousCount = results.reduce(
    (sum, r) => sum + r.categorized.serious.length,
    0
  );

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Accessibility Audit Report - ${timestamp}</title>
  <style>
    :root { --primary: #2c3e50; --success: #28a745; --danger: #dc3545; --warning: #ffc107; }
    body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; padding: 20px; background: #f5f5f5; }
    .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; }
    h1 { color: var(--primary); }
    .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin: 20px 0; }
    .stat { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 5px; }
    .stat .number { font-size: 2em; font-weight: bold; }
    .critical { color: var(--danger); }
    .serious { color: var(--warning); }
    .success { color: var(--success); }
    .violation { background: #fff3cd; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid var(--warning); }
    .violation.critical { background: #f8d7da; border-left-color: var(--danger); }
    footer { margin-top: 40px; border-top: 2px solid #ddd; padding-top: 20px; text-align: center; color: #7f8c8d; }
    footer a { color: #17a2b8; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <h1>♿ Accessibility Audit Report</h1>
    <p><strong>Audit Date:</strong> ${timestamp}</p>
    <p><strong>WCAG Standard:</strong> WCAG 2.1 Level AA</p>
    
    <div class="summary">
      <div class="stat"><div class="number">${results.length}</div><div>Pages × Viewports</div></div>
      <div class="stat"><div class="number ${totalViolations === 0 ? "success" : "critical"}">${totalViolations}</div><div>Total Violations</div></div>
      <div class="stat"><div class="number critical">${criticalCount}</div><div>Critical</div></div>
      <div class="stat"><div class="number serious">${seriousCount}</div><div>Serious</div></div>
    </div>
    
    ${totalViolations === 0 ? '<div style="background: #d4edda; padding: 20px; border-radius: 5px; color: #155724;">✅ No WCAG 2.1 AA violations found!</div>' : ""}
    
    <h2>Page Results</h2>
    ${results
      .map(
        (result) => `
      <div style="background: #f8f9fa; padding: 20px; margin: 15px 0; border-radius: 5px;">
        <h3>${result.page} (${result.viewport})</h3>
        <p>Violations: ${result.violations.length} | Passes: ${result.passes}</p>
        ${result.violations
          .map(
            (v) => `
          <div class="violation ${v.impact}">
            <strong>${v.impact.toUpperCase()}: ${v.help}</strong>
            <p>${v.description}</p>
            <p><small>Affected elements: ${v.nodes.length} | <a href="${v.helpUrl}" target="_blank">How to fix →</a></small></p>
          </div>
        `
          )
          .join("")}
      </div>
    `
      )
      .join("")}
    
    <footer>
      <p>Powered by <a href="https://www.deque.com/axe/" target="_blank">axe-core</a></p>
      <p><a href="/docs/">← Back to Documentation Portal</a></p>
    </footer>
  </div>
</body>
</html>`;

  fs.writeFileSync(path.join(outputDir, "index.html"), html);
}

runAccessibilityAudit().catch(console.error);
```

**GitHub Reference**: [`accessibility-audit.mjs`](https://github.com/ICJIA/icjia-sfs-2024/blob/main/accessibility-audit.mjs)

---

## JSDoc Generation

TypeDoc automatically generates API documentation from JSDoc comments.

### JSDoc Comment Example

````typescript
/**
 * @fileoverview Composable for managing application state
 * @module composables/states
 */

/**
 * Counter state composable for tracking numeric values.
 *
 * @returns {Object} Counter state and methods
 * @returns {Ref<number>} return.count - The current count value
 * @returns {Function} return.increment - Increment the count
 * @returns {Function} return.decrement - Decrement the count
 *
 * @example
 * ```ts
 * const { count, increment, decrement } = useCounter()
 * increment() // count.value is now 1
 * ```
 */
export function useCounter() {
  const count = ref(0);

  function increment() {
    count.value++;
  }

  function decrement() {
    count.value--;
  }

  return { count, increment, decrement };
}
````

**GitHub Reference**: [`app/composables/`](https://github.com/ICJIA/icjia-accessibility-portal/tree/main/app/composables)

---

## Documentation Portal Index

Create the main documentation portal landing page at `public/docs/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Documentation Portal - PROJECT_NAME</title>
    <style>
      :root {
        --primary: #2c3e50;
        --info: #17a2b8;
        --success: #28a745;
        --light: #f8f9fa;
      }
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      body {
        font-family:
          -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        background: #f5f5f5;
        padding: 20px;
        line-height: 1.6;
      }
      .container {
        max-width: 900px;
        margin: 0 auto;
        background: white;
        padding: 40px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      }
      h1 {
        color: var(--primary);
        border-bottom: 3px solid var(--info);
        padding-bottom: 15px;
        margin-bottom: 30px;
      }
      .doc-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
        margin: 30px 0;
      }
      .doc-card {
        background: var(--light);
        padding: 25px;
        border-radius: 8px;
        border-left: 4px solid var(--info);
        transition:
          transform 0.2s,
          box-shadow 0.2s;
      }
      .doc-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }
      .doc-card h3 {
        color: var(--primary);
        margin-bottom: 10px;
      }
      .doc-card p {
        color: #666;
        margin-bottom: 15px;
        font-size: 0.95rem;
      }
      .doc-card a {
        display: inline-block;
        color: var(--info);
        text-decoration: none;
        font-weight: 600;
      }
      .doc-card a:hover {
        text-decoration: underline;
      }
      .tech-info {
        background: #e7f3ff;
        padding: 20px;
        border-radius: 5px;
        margin: 20px 0;
      }
      .tech-info h3 {
        color: #1976d2;
        margin-bottom: 10px;
      }
      footer {
        margin-top: 40px;
        padding-top: 20px;
        border-top: 2px solid #ddd;
        text-align: center;
        color: #7f8c8d;
      }
      footer a {
        color: var(--info);
        text-decoration: none;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>📚 Documentation Portal</h1>

      <p>
        Welcome to the documentation portal for <strong>PROJECT_NAME</strong>.
        This portal provides comprehensive documentation including test results,
        accessibility audits, and API documentation.
      </p>

      <div class="doc-grid">
        <div class="doc-card">
          <h3>🧪 Test Results</h3>
          <p>
            Unit and integration test results with detailed descriptions and
            pass/fail status.
          </p>
          <a href="/docs/tests/">View Test Results →</a>
        </div>

        <div class="doc-card">
          <h3>♿ Accessibility Audit</h3>
          <p>
            WCAG 2.1 AA compliance audit results across multiple viewports
            (desktop, tablet, mobile).
          </p>
          <a href="/docs/accessibility/">View Accessibility Report →</a>
        </div>

        <div class="doc-card">
          <h3>📖 API Documentation</h3>
          <p>
            TypeDoc-generated documentation for composables, utilities, and
            plugins.
          </p>
          <a href="/docs/jsdoc/">View API Docs →</a>
        </div>
      </div>

      <div class="tech-info">
        <h3>Technology Stack</h3>
        <ul style="margin: 10px 0 0 20px;">
          <li><strong>Framework:</strong> Nuxt 4 + Vue 3</li>
          <li><strong>UI Library:</strong> Vuetify 3</li>
          <li><strong>Testing:</strong> Vitest + Playwright</li>
          <li><strong>Accessibility:</strong> axe-core</li>
          <li><strong>Documentation:</strong> TypeDoc</li>
        </ul>
      </div>

      <h2>Quick Links</h2>
      <ul style="margin: 15px 0 0 20px;">
        <li><a href="/">← Back to Application</a></li>
        <li>
          <a href="https://github.com/ORG_NAME/REPO_NAME" target="_blank"
            >GitHub Repository</a
          >
        </li>
        <li>
          <a href="https://vuetifyjs.com/" target="_blank"
            >Vuetify Documentation</a
          >
        </li>
        <li>
          <a href="https://nuxt.com/" target="_blank">Nuxt Documentation</a>
        </li>
      </ul>

      <footer>
        <p>Last updated: <span id="lastUpdated">-</span></p>
        <p style="margin-top: 10px;">
          <a href="https://github.com/ORG_NAME/REPO_NAME" target="_blank"
            >GitHub</a
          >
          |
          <a href="/">Main Site</a>
        </p>
      </footer>
    </div>

    <script>
      document.getElementById("lastUpdated").textContent =
        new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
    </script>
  </body>
</html>
```

**Replace**: `PROJECT_NAME`, `ORG_NAME`, `REPO_NAME` with your project values.

---

## Placeholder Strategy

### Ensure Accessibility Report Script (`scripts/ensure-accessibility-report.js`)

This script creates placeholder HTML files if they don't exist, preventing 404 errors:

```javascript
#!/usr/bin/env node
/**
 * @fileoverview Ensures documentation placeholders exist
 * @description Creates placeholder HTML files for the documentation portal
 * if they don't exist, preventing 404 errors during development.
 *
 * @see https://github.com/ICJIA/icjia-sfs-2024/blob/main/scripts/ensure-accessibility-report.js
 */

import { existsSync, mkdirSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, "..");

const PATHS = {
  accessibilityDir: join(projectRoot, "public", "docs", "accessibility"),
  accessibilityReport: join(
    projectRoot,
    "public",
    "docs",
    "accessibility",
    "index.html"
  ),
  testsDir: join(projectRoot, "public", "docs", "tests"),
  testsReport: join(projectRoot, "public", "docs", "tests", "index.html"),
  docsIndex: join(projectRoot, "public", "docs", "index.html"),
};

function generatePlaceholder(title, instructions) {
  const timestamp = new Date().toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - Placeholder</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; padding: 20px; background: #f5f5f5; }
    .container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; }
    h1 { color: #2c3e50; margin-bottom: 20px; }
    .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 20px 0; border-radius: 5px; }
    .info { background: #e7f3ff; border-left: 4px solid #17a2b8; padding: 20px; margin: 20px 0; border-radius: 5px; }
    pre { background: #2d3748; color: #e2e8f0; padding: 15px; border-radius: 5px; overflow-x: auto; }
    footer { margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px; color: #7f8c8d; }
    footer a { color: #17a2b8; }
  </style>
</head>
<body>
  <div class="container">
    <h1>${title}</h1>
    <div class="warning"><h3>⚠️ Placeholder Report</h3><p>The actual report has not been generated yet.</p></div>
    <div class="info"><h3>How to Generate</h3>${instructions}</div>
    <footer><p>Placeholder generated: ${timestamp}</p><p><a href="/docs/">← Back to Documentation Portal</a></p></footer>
  </div>
</body>
</html>`;
}

function main() {
  console.log("\\n┌" + "─".repeat(50) + "┐");
  console.log(
    "│" +
      " ".repeat(10) +
      "ENSURE DOCUMENTATION PLACEHOLDERS" +
      " ".repeat(5) +
      "│"
  );
  console.log("└" + "─".repeat(50) + "┘\\n");

  // Ensure accessibility report
  if (!existsSync(PATHS.accessibilityDir)) {
    mkdirSync(PATHS.accessibilityDir, { recursive: true });
    console.log("✓ Created: public/docs/accessibility/");
  }
  if (!existsSync(PATHS.accessibilityReport)) {
    const html = generatePlaceholder(
      "Accessibility Audit",
      "<p>Run: <pre>yarn dev && yarn audit:a11y</pre></p>"
    );
    writeFileSync(PATHS.accessibilityReport, html);
    console.log("✓ Created placeholder: public/docs/accessibility/index.html");
  }

  // Ensure test report
  if (!existsSync(PATHS.testsDir)) {
    mkdirSync(PATHS.testsDir, { recursive: true });
    console.log("✓ Created: public/docs/tests/");
  }
  if (!existsSync(PATHS.testsReport)) {
    const html = generatePlaceholder(
      "Test Results",
      "<p>Run: <pre>yarn test:all</pre></p>"
    );
    writeFileSync(PATHS.testsReport, html);
    console.log("✓ Created placeholder: public/docs/tests/index.html");
  }

  console.log("\\n✅ Documentation placeholders ensured!\\n");
}

main();
```

**GitHub Reference**: [`scripts/ensure-accessibility-report.js`](https://github.com/ICJIA/icjia-sfs-2024/blob/main/scripts/ensure-accessibility-report.js)

---

## Footer & Navigation Integration

### Footer Component Example (Vuetify)

Add documentation portal links to your footer:

```vue
<template>
  <v-footer class="bg-grey-darken-4">
    <v-container>
      <v-row>
        <v-col cols="12" md="4">
          <h4 class="text-h6 mb-3">Navigation</h4>
          <div v-for="link in navLinks" :key="link.to">
            <NuxtLink
              :to="link.to"
              class="text-grey-lighten-2 text-decoration-none"
            >
              {{ link.title }}
            </NuxtLink>
          </div>
        </v-col>

        <v-col cols="12" md="4">
          <h4 class="text-h6 mb-3">Documentation</h4>
          <div v-for="link in docLinks" :key="link.href">
            <a
              :href="link.href"
              class="text-grey-lighten-2 text-decoration-none"
              target="_blank"
            >
              {{ link.title }}
              <v-icon size="x-small" class="ml-1">mdi-open-in-new</v-icon>
            </a>
          </div>
        </v-col>

        <v-col cols="12" md="4">
          <h4 class="text-h6 mb-3">External Resources</h4>
          <div v-for="link in externalLinks" :key="link.href">
            <a
              :href="link.href"
              class="text-grey-lighten-2 text-decoration-none"
              target="_blank"
              rel="noopener"
            >
              {{ link.title }}
              <v-icon size="x-small" class="ml-1">mdi-open-in-new</v-icon>
            </a>
          </div>
        </v-col>
      </v-row>

      <v-divider class="my-4"></v-divider>

      <v-row>
        <v-col class="text-center text-grey-lighten-1 text-body-2">
          © {{ currentYear }} PROJECT_NAME. All rights reserved.
        </v-col>
      </v-row>
    </v-container>
  </v-footer>
</template>

<script setup>
const currentYear = new Date().getFullYear();

const navLinks = [
  { to: "/", title: "Home" },
  { to: "/about", title: "About" },
  // Add your navigation links
];

const docLinks = [
  { href: "/docs/", title: "Documentation Portal" },
  { href: "/docs/tests/", title: "Test Results" },
  { href: "/docs/accessibility/", title: "Accessibility Audit" },
  { href: "/docs/jsdoc/", title: "API Documentation" },
];

const externalLinks = [
  { href: "https://github.com/ORG_NAME/REPO_NAME", title: "GitHub Repository" },
  { href: "https://vuetifyjs.com/", title: "Vuetify Docs" },
  { href: "https://nuxt.com/", title: "Nuxt Docs" },
];
</script>
```

---

## Nuxt Configuration Updates

Update `nuxt.config.ts` to handle documentation routes:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  // ... other config

  /**
   * Nitro configuration for static site generation.
   *
   * IMPORTANT: Routes under /docs/* are static HTML files in public/,
   * not Nuxt routes. They must be ignored during prerendering.
   */
  nitro: {
    prerender: {
      // Add your application routes here
      routes: ["/"],
      // Ignore static documentation files
      ignore: ["/docs", "/docs/**"],
    },
  },
});
```

**GitHub Reference**: [`nuxt.config.ts`](https://github.com/ICJIA/icjia-sfs-2024/blob/main/nuxt.config.js)

---

## Verification Checklist

After implementation, verify the following:

### 1. Directory Structure

- [ ] `public/docs/index.html` exists
- [ ] `public/docs/accessibility/index.html` exists
- [ ] `public/docs/tests/index.html` exists
- [ ] `public/docs/jsdoc/` directory exists (after running `yarn docs:jsdoc`)
- [ ] `public/.well-known/appspecific/com.chrome.devtools.json` exists (contains `{}`)

### 2. Scripts

- [ ] `yarn ensure:docs` runs without errors
- [ ] `yarn test:all` generates HTML report
- [ ] `yarn audit:a11y` generates accessibility report (requires running dev server)
- [ ] `yarn docs:jsdoc` generates API documentation

### 3. Development Server

```bash
# Start dev server
yarn dev

# In another terminal, run audits
yarn audit:a11y
yarn test:all
```

### 4. Static Generation

```bash
yarn generate
# Verify .output/public/docs/ contains all documentation
```

### 5. Links

- [ ] Footer links to `/docs/`, `/docs/tests/`, `/docs/accessibility/`, `/docs/jsdoc/` work
- [ ] Documentation portal links back to main site work
- [ ] External links open in new tabs with proper security attributes

---

## LLM Questions for Developer

Before implementing this documentation portal, the LLM should ask the developer:

### Project Information

1. **What is the project name?** (Used in page titles, headers, footers)
2. **What is the GitHub organization/username?** (For repository links)
3. **What is the GitHub repository name?** (For source links in TypeDoc)
4. **What is the base URL for the deployed site?** (For sitemap, canonical URLs)

### Technical Configuration

5. **What port does your dev server run on?** (Default: 3000)
6. **What Node.js version are you using?** (Minimum: 18.18.0, recommended: 22.14.0+)
7. **Are you using Yarn or npm?** (Affects script commands)

### Pages to Test

8. **What routes/pages should be included in accessibility testing?**
   - Example: `/`, `/about`, `/contact`, `/blog`
9. **Do you have any routes that require authentication or special handling?**

### Theme Configuration

10. **Does your app support light/dark mode switching?**
    - If yes: How is the theme toggled? (CSS class, Vuetify theme, etc.)
11. **What viewports should be tested for accessibility?**
    - Default: Desktop (1920×1080), Tablet (768×1024), Mobile (375×667)

### Testing Configuration

12. **What composables/utilities should be documented with TypeDoc?**
    - Default: `app/composables/*.ts`, `app/utils/*.ts`, `app/plugins/*.ts`

13. **Do you have existing tests that need to be integrated?**

14. **What test descriptions should be added for your specific tests?**
    - Provide a mapping of test names to human-readable descriptions

### Documentation Portal

15. **Should the documentation portal be password-protected or public?**

16. **Are there any additional documentation sections needed?**
    - Examples: Changelog, Contributing guide, Deployment guide

17. **Should test/accessibility reports be generated during CI/CD builds?**

### Sitemap Configuration

18. **Are there any routes that should be excluded from the sitemap?**
    - Default exclusions: `/docs/*`, admin routes, error pages

---

## Chrome DevTools 404 Fix

When serving static-generated Nuxt sites, Chrome DevTools automatically requests `/.well-known/appspecific/com.chrome.devtools.json`. Create this file to prevent 404 errors:

```bash
# Create the directory and file
mkdir -p public/.well-known/appspecific
echo '{}' > public/.well-known/appspecific/com.chrome.devtools.json
```

**File contents**: `public/.well-known/appspecific/com.chrome.devtools.json`

```json
{}
```

This is a harmless Chrome DevTools feature check that doesn't affect functionality, but creating the file keeps logs clean.

**GitHub Reference**: [`public/.well-known/appspecific/com.chrome.devtools.json`](https://github.com/ICJIA/icjia-accessibility-portal/blob/main/public/.well-known/appspecific/com.chrome.devtools.json)

---

## Advanced Accessibility Audit Script

For production use, there's a more advanced accessibility audit script that:

- Parses routes from `sitemap.xml` automatically
- Auto-detects running server ports (3000, 8000, 4173, etc.)
- Tests all three viewports for each page
- Generates comprehensive HTML and JSON reports
- Excludes `/docs/*` routes from testing

**GitHub Reference**: [`scripts/accessibility-audit.mjs`](https://github.com/ICJIA/icjia-sfs-2024/blob/main/scripts/accessibility-audit.mjs)

Key features:

```javascript
const CONFIG = {
  // Automatically parse sitemap for routes
  sitemapPath: join(projectRoot, "public", "sitemap.xml"),

  // Output paths
  outputPath: join(
    projectRoot,
    "public",
    "docs",
    "accessibility",
    "index.html"
  ),
  jsonOutputPath: join(
    projectRoot,
    "public",
    "docs",
    "accessibility",
    "results.json"
  ),

  // Auto-detect server port
  serverPorts: ["8000", "3000", "5150", "4173", "3003"],

  // All viewport configurations
  viewports: {
    desktop: { width: 1920, height: 1080 },
    tablet: { width: 768, height: 1024 },
    mobile: { width: 375, height: 667 },
  },
};
```

---

## Light/Dark Mode Testing

If your application supports theme switching (light/dark mode), the accessibility audit should test both themes:

### Vuetify Theme Testing

```javascript
// In your accessibility audit script

const THEMES = [
  {
    name: "light",
    action: async (page) => {
      // Toggle to light mode via Vuetify
      await page.evaluate(() => {
        const vuetify = window.__vuetify__;
        if (vuetify && vuetify.theme) {
          vuetify.theme.global.name = "light";
        }
      });
    },
  },
  {
    name: "dark",
    action: async (page) => {
      await page.evaluate(() => {
        const vuetify = window.__vuetify__;
        if (vuetify && vuetify.theme) {
          vuetify.theme.global.name = "dark";
        }
      });
    },
  },
];

// Test each page in each theme and viewport
for (const pageInfo of PAGES_TO_TEST) {
  for (const viewport of VIEWPORTS) {
    for (const theme of THEMES) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
      });
      const page = await context.newPage();
      await page.goto(url);

      // Apply theme
      await theme.action(page);
      await page.waitForTimeout(500); // Wait for theme transition

      // Run accessibility audit
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();

      // Store results with theme info
      allResults.push({
        page: pageInfo.name,
        viewport: viewport.name,
        theme: theme.name,
        violations: results.violations,
        // ...
      });
    }
  }
}
```

### CSS Class-Based Theme Testing

For apps using CSS class-based themes:

```javascript
const THEMES = [
  { name: "light", className: null },
  { name: "dark", className: "dark-mode" },
];

// Apply theme by toggling class on document element
await page.evaluate((className) => {
  document.documentElement.classList.remove("dark-mode", "light-mode");
  if (className) {
    document.documentElement.classList.add(className);
  }
}, theme.className);
```

### Key Color Contrast Considerations

When testing light/dark modes, pay special attention to:

| Issue                | Light Mode                        | Dark Mode                         |
| -------------------- | --------------------------------- | --------------------------------- |
| **Text contrast**    | Dark text on light bg (min 4.5:1) | Light text on dark bg (min 4.5:1) |
| **Link visibility**  | Underlines or color distinction   | Same, may need brighter colors    |
| **Focus indicators** | Visible outlines (often blue)     | May need brighter outlines        |
| **Form controls**    | Border visibility                 | May need enhanced borders         |
| **Disabled states**  | Reduced contrast (acceptable)     | May be too faint                  |

---

## GitHub Reference Links Summary

All implementation files with direct links:

| File                                     | Purpose                        | GitHub Link                                                                                                                   |
| ---------------------------------------- | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| `vitest.config.ts`                       | Test configuration             | [View](https://github.com/ICJIA/icjia-sfs-2024/blob/main/vitest.config.ts)                                                    |
| `test/run-all-tests.mjs`                 | Test runner with HTML report   | [View](https://github.com/ICJIA/icjia-sfs-2024/blob/main/test/run-all-tests.mjs)                                              |
| `test/setup.ts`                          | Test environment setup         | [View](https://github.com/ICJIA/icjia-sfs-2024/blob/main/test/setup.ts)                                                       |
| `accessibility-audit.mjs`                | Basic accessibility audit      | [View](https://github.com/ICJIA/icjia-sfs-2024/blob/main/accessibility-audit.mjs)                                             |
| `scripts/accessibility-audit.mjs`        | Advanced audit (sitemap-based) | [View](https://github.com/ICJIA/icjia-sfs-2024/blob/main/scripts/accessibility-audit.mjs)                                     |
| `scripts/ensure-accessibility-report.js` | Placeholder creator            | [View](https://github.com/ICJIA/icjia-sfs-2024/blob/main/scripts/ensure-accessibility-report.js)                              |
| `typedoc.json`                           | TypeDoc configuration          | [View](https://github.com/ICJIA/icjia-accessibility-portal/blob/main/typedoc.json)                                            |
| `package.json`                           | Scripts and dependencies       | [View](https://github.com/ICJIA/icjia-sfs-2024/blob/main/package.json)                                                        |
| `nuxt.config.ts`                         | Nuxt configuration             | [View](https://github.com/ICJIA/icjia-sfs-2024/blob/main/nuxt.config.js)                                                      |
| `.nvmrc`                                 | Node version                   | [View](https://github.com/ICJIA/icjia-accessibility-portal/blob/main/.nvmrc)                                                  |
| `public/.well-known/...`                 | Chrome DevTools fix            | [View](https://github.com/ICJIA/icjia-accessibility-portal/blob/main/public/.well-known/appspecific/com.chrome.devtools.json) |

---

## Netlify Deployment Configuration

For deploying to Netlify with the documentation portal:

### `netlify.toml`

```toml
[build]
  # Build command - generates static site
  command = "yarn generate"

  # Publish directory - where Nuxt outputs static files
  publish = ".output/public"

[build.environment]
  # Node version - must match your local development
  NODE_VERSION = "22.14.0"

  # Yarn version
  YARN_VERSION = "1.22.22"

# SPA fallback - redirects all routes to index.html
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

# Security headers
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"

# Cache static assets
[[headers]]
  for = "/_nuxt/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/docs/*"
  [headers.values]
    Cache-Control = "public, max-age=3600"
```

### Pre-build Documentation Generation

For CI/CD pipelines that should generate documentation before deployment:

```toml
[build]
  # Generate all docs before building
  command = "yarn docs:all && yarn generate"
  publish = ".output/public"
```

Or use a separate CI step:

```yaml
# GitHub Actions example
- name: Generate Documentation
  run: |
    yarn test:all
    yarn audit:a11y || true  # Don't fail on a11y warnings
    yarn docs:jsdoc

- name: Build Site
  run: yarn generate
```

**GitHub Reference**: [`netlify.toml`](https://github.com/ICJIA/icjia-accessibility-portal/blob/main/netlify.toml)

---

## Version History

| Version | Date            | Changes                                                                                  |
| ------- | --------------- | ---------------------------------------------------------------------------------------- |
| 1.0.0   | January 6, 2026 | Initial comprehensive prompt combining architecture guide and accessibility audit prompt |

---

_This prompt is designed to be copied in its entirety into an LLM along with repository context. The LLM will implement a complete documentation portal with testing, accessibility auditing, and API documentation._
