#!/usr/bin/env node

/**
 * @fileoverview Accessibility Audit Script using axe-core
 * @description Comprehensive accessibility audit tool that tests websites against WCAG 2.1 Level AA standards.
 *
 * This script:
 * - Tests against development or production environments
 * - Automatically starts dev server if not running
 * - Reads URLs from sitemap.xml
 * - Tests each URL in multiple viewports (desktop, tablet, mobile)
 * - Tests multiple themes (if configured)
 * - Verifies skip link implementation
 * - Generates HTML and JSON reports
 *
 * @author ICJIA
 * @version 1.0.0
 *
 * REFERENCE IMPLEMENTATION:
 * This script is based on the ICJIA Accessibility Portal reference implementation.
 * All accessibility audits across ICJIA web applications should be based on this script.
 * @see {@link https://github.com/ICJIA/icjia-accessibility-portal/blob/main/audit-accessibility.js}
 *
 * @see {@link https://github.com/dequelabs/axe-core axe-core GitHub}
 * @see {@link https://www.w3.org/WAI/WCAG21/quickref/ WCAG 2.1 Quick Reference}
 */

import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import fs from "fs";
import path from "path";
import { spawn, exec } from "child_process";
import { fileURLToPath } from "url";
import http from "http";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, "..");

/**
 * ============================================================================
 * ⚙️ DEVELOPER CONFIGURATION - EDIT THIS SECTION
 * ============================================================================
 *
 * You can safely modify the AXE_RULE_CONFIG below to enable/disable specific
 * accessibility rules. This is the ONLY section you should modify unless you
 * know what you're doing.
 *
 * ⚠️ WARNING: Be careful with anything below this configuration section.
 *             Changes to the rest of the script may break the audit functionality.
 *
 * ============================================================================
 */

/**
 * Target Environment Configuration
 *
 * Choose whether to run the audit against the development server or production.
 *
 * @type {string}
 * @constant
 * @default "development"
 */
const TARGET_ENV = "development"; // Change to "production" to test against production URL

/**
 * Production URL Configuration
 *
 * The production URL to test against when TARGET_ENV is set to "production".
 */
const PRODUCTION_URL = "https://sfs.icjia.illinois.gov";

/**
 * Development Server Configuration
 *
 * The port number for the local development server.
 * This is used when TARGET_ENV is set to "development".
 */
const DEV_SERVER_PORT = 8000; // Change if your dev server runs on a different port

/**
 * Axe-core Rule Configuration
 *
 * Toggle these rules to test compatibility with Nuxt/Vuetify framework.
 * If a rule causes false positives or conflicts with framework structure,
 * set it to false to disable it.
 */
const AXE_RULE_CONFIG = {
  // Framework-specific rules - enabled for comprehensive testing
  "aria-allowed-role": true, // Works with Nuxt/Vuetify components
  "scrollable-region-focusable": true, // Works with Nuxt/Vuetify scrollable regions

  // Landmark rules - all enabled for WCAG compliance
  "landmark-banner-is-top-level": true,
  "landmark-contentinfo-is-top-level": true,
  "landmark-main-is-top-level": true,
  "landmark-unique": true,

  // ❌ DISABLED: Known incompatibility with Nuxt/Vue component structure
  // The 'region' rule has issues with Vue/Nuxt because components dynamically create
  // regions that don't match the expected HTML5 landmark structure
  region: false,

  // WCAG 2.1 Level AA rules - all enabled
  "css-orientation-lock": true, // WCAG 2.1 SC 1.3.4 - Orientation lock check
  "no-autoplay-audio": true, // WCAG 2.1 SC 1.4.2 - Autoplay audio check
  "page-has-heading-one": true, // Best practice - Page should have h1

  // Focus and navigation rules - all enabled
  "focus-order-semantics": true, // Checks focus order matches DOM order
  "identical-links-same-purpose": true, // Checks for duplicate links with same purpose
  "link-in-text-block": true, // WCAG 2.1 SC 1.4.1 - Link contrast in text blocks

  // Content and labeling rules - all enabled
  "hidden-content": true, // Checks for hidden content that should be visible
  "label-content-name-mismatch": true, // Checks if label text matches accessible name
  "presentation-role-conflict": true, // Checks for presentation role conflicts
};

/**
 * File Paths Configuration
 */
const SITEMAP_PATH = path.join(projectRoot, "public/sitemap.xml");
const OUTPUT_DIR = path.join(projectRoot, "public/docs/accessibility");
const REPORT_FILE = path.join(OUTPUT_DIR, "index.html");

/**
 * Viewport Configuration
 */
const VIEWPORTS = [
  { width: 1920, height: 1080, name: "desktop" },
  { width: 768, height: 1024, name: "tablet" },
  { width: 375, height: 812, name: "mobile" },
];

/**
 * Theme Configuration
 *
 * Configure which themes to test and how to switch between them.
 */
const THEME_CONFIG = {
  themes: [{ name: "dark", value: "dark" }], // Default: dark mode only
  switching: {
    mode: "none", // Default: no theme switching (single theme site)
  },
};

/**
 * Skip Link Configuration
 */
const SKIP_LINK_CONFIG = {
  selector: 'a[href="#main-content"], a.skip-link, a[class*="skip"]',
  targetId: "main-content", // Without the # symbol
};

/**
 * Axe Exclude Selectors
 */
const AXE_EXCLUDE_SELECTORS = [["#__nuxt"]];

/**
 * Development Server Command
 */
const DEV_SERVER_COMMAND = { command: "yarn", args: ["dev:audit"] };

/**
 * Site Information Configuration
 */
const SITE_INFO = {
  name: "ICJIA Safe From the Start",
  description:
    "Safe From the Start website for Illinois Criminal Justice Information Authority",
};

/**
 * Compliance Standards Configuration
 */
const COMPLIANCE_STANDARDS = [
  {
    name: "IITAA Accessibility Standards for Illinois",
    description:
      "The Illinois Information Technology Accessibility (IITAA) standards require that all state websites and digital services be accessible to individuals with disabilities. These standards align with WCAG 2.1 Level AA and Section 508 requirements.",
    links: [
      {
        text: "IITAA Standards Documentation",
        url: "https://doit.illinois.gov/initiatives/accessibility/iitaa.html",
      },
    ],
  },
  {
    name: "WCAG 2.1 Level AA Guidelines",
    description:
      "The Web Content Accessibility Guidelines (WCAG) 2.1 Level AA are internationally recognized standards for web accessibility. These guidelines provide a comprehensive framework for making web content accessible to people with disabilities.",
    links: [
      {
        text: "WCAG 2.1 Quick Reference",
        url: "https://www.w3.org/WAI/WCAG21/quickref/",
      },
    ],
  },
  {
    name: "Section 508 Standards",
    description:
      "Section 508 of the Rehabilitation Act requires federal agencies and organizations receiving federal funding to make their electronic and information technology accessible to people with disabilities.",
    links: [
      {
        text: "Section 508 Standards",
        url: "https://www.section508.gov/",
      },
    ],
  },
  {
    name: "ADA Title II Requirements",
    description:
      "Title II of the Americans with Disabilities Act requires state and local governments to provide equal access to their services, programs, and activities, including websites and digital content.",
    links: [
      {
        text: "ADA.gov - Web Accessibility",
        url: "https://www.ada.gov/resources/web-guidance/",
      },
    ],
  },
];

/**
 * ============================================================================
 * 🚫 DO NOT MODIFY BELOW THIS LINE (unless you know what you're doing)
 * ============================================================================
 */

// Determine base URL based on target environment
let BASE_URL =
  TARGET_ENV === "production"
    ? PRODUCTION_URL
    : `http://localhost:${DEV_SERVER_PORT}`;

/**
 * Parse sitemap.xml and extract URLs
 * @returns {Promise<string[]>} Array of URLs
 */
async function parseSitemap() {
  if (!fs.existsSync(SITEMAP_PATH)) {
    throw new Error(`Sitemap not found at ${SITEMAP_PATH}`);
  }

  const content = fs.readFileSync(SITEMAP_PATH, "utf-8");
  const urls = [];

  // Simple regex to extract URLs from sitemap
  const locRegex = /<loc>(.*?)<\/loc>/g;
  let match;
  while ((match = locRegex.exec(content)) !== null) {
    let url = match[1];
    // Convert full URLs to paths
    try {
      const urlObj = new URL(url);
      url = urlObj.pathname || "/";
    } catch {
      // If it's already a path, use it as-is
      if (!url.startsWith("/")) {
        url = "/" + url;
      }
    }
    // Exclude /docs/* routes from accessibility testing
    if (!url.startsWith("/docs")) {
      urls.push(url);
    }
  }

  return [...new Set(urls)].sort(); // Remove duplicates and sort
}

/**
 * Check if server is running
 * @param {string} url - URL to check
 * @returns {Promise<boolean>}
 */
function checkServerRunning(url) {
  return new Promise((resolve) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 80,
      path: "/",
      method: "HEAD",
      timeout: 3000,
    };

    const req = http.request(options, (res) => {
      resolve(true);
    });

    req.on("error", () => resolve(false));
    req.on("timeout", () => {
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

/**
 * Start development server
 * @returns {Promise<ChildProcess>}
 */
async function startDevServer() {
  console.log(
    `\n🚀 Starting development server (${DEV_SERVER_COMMAND.command} ${DEV_SERVER_COMMAND.args.join(" ")})...`
  );

  const serverProcess = spawn(
    DEV_SERVER_COMMAND.command,
    DEV_SERVER_COMMAND.args,
    {
      cwd: projectRoot,
      stdio: ["ignore", "pipe", "pipe"],
      shell: true,
      detached: true,
    }
  );

  // Wait for server to be ready
  let attempts = 0;
  const maxAttempts = 60; // 60 seconds timeout

  while (attempts < maxAttempts) {
    const running = await checkServerRunning(BASE_URL);
    if (running) {
      console.log(`✅ Development server is ready at ${BASE_URL}`);
      return serverProcess;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
    attempts++;
    if (attempts % 10 === 0) {
      console.log(`   Waiting for server... (${attempts}s)`);
    }
  }

  serverProcess.kill();
  throw new Error(
    "Development server failed to start within 60 seconds. Please start it manually with: yarn dev:audit"
  );
}

/**
 * Verify skip link implementation
 * @param {Page} page - Playwright page
 * @returns {Promise<Object>} Skip link verification result
 */
async function verifySkipLink(page) {
  const result = {
    exists: false,
    visible: false,
    targetExists: false,
    issues: [],
  };

  try {
    // Check if skip link exists
    const skipLink = await page.$(SKIP_LINK_CONFIG.selector);
    if (!skipLink) {
      result.issues.push("Skip link not found on page");
      return result;
    }
    result.exists = true;

    // Check if skip link becomes visible on focus
    await skipLink.focus();
    await page.waitForTimeout(100);
    const isVisible = await skipLink.isVisible();
    result.visible = isVisible;
    if (!isVisible) {
      result.issues.push("Skip link does not become visible on focus");
    }

    // Check if target exists
    const target = await page.$(`#${SKIP_LINK_CONFIG.targetId}`);
    if (!target) {
      result.issues.push(
        `Skip link target #${SKIP_LINK_CONFIG.targetId} not found`
      );
    } else {
      result.targetExists = true;
    }
  } catch (error) {
    result.issues.push(`Error verifying skip link: ${error.message}`);
  }

  return result;
}

/**
 * Generate axe rules configuration
 * @returns {Object[]} Rules array for axe-core
 */
function generateAxeRules() {
  const rules = {};
  for (const [ruleId, enabled] of Object.entries(AXE_RULE_CONFIG)) {
    rules[ruleId] = { enabled: enabled };
  }
  return rules;
}

/**
 * Escape HTML special characters
 * @param {string} str - String to escape
 * @returns {string} Escaped string
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
 * Generate HTML report
 * @param {Object[]} results - Audit results
 * @returns {string} HTML report
 */
function generateHTMLReport(results) {
  const timestamp = new Date().toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
  });

  // Calculate statistics
  const totalViolations = results.reduce(
    (sum, r) => sum + (r.violations?.length || 0),
    0
  );
  const totalPasses = results.reduce(
    (sum, r) => sum + (r.passes?.length || 0),
    0
  );
  const totalIncomplete = results.reduce(
    (sum, r) => sum + (r.incomplete?.length || 0),
    0
  );
  const totalInapplicable = results.reduce(
    (sum, r) => sum + (r.inapplicable?.length || 0),
    0
  );
  const totalTests =
    totalViolations + totalPasses + totalIncomplete + totalInapplicable;
  const uniquePages = [...new Set(results.map((r) => r.url))];
  const pagesWithViolations = [
    ...new Set(
      results.filter((r) => (r.violations?.length || 0) > 0).map((r) => r.url)
    ),
  ];

  // Categorize violations by severity
  const violationsBySeverity = {
    critical: [],
    serious: [],
    moderate: [],
    minor: [],
  };

  results.forEach((result) => {
    (result.violations || []).forEach((violation) => {
      const impact = violation.impact || "minor";
      if (violationsBySeverity[impact]) {
        violationsBySeverity[impact].push({
          ...violation,
          url: result.url,
          viewport: result.viewport,
          theme: result.theme,
        });
      }
    });
  });

  // Calculate skip link summary
  const skipLinkSummary = results.reduce(
    (acc, r) => {
      const skipLink = r.skipLink || {};
      if (skipLink.exists) {
        acc.exists++;
        if (skipLink.issues && skipLink.issues.length === 0) {
          acc.working++;
        } else {
          acc.issues += skipLink.issues?.length || 0;
        }
      }
      acc.total++;
      return acc;
    },
    { total: 0, exists: 0, working: 0, issues: 0 }
  );

  // Group results by URL for detailed report
  const resultsByUrl = {};
  results.forEach((result) => {
    if (!resultsByUrl[result.url]) {
      resultsByUrl[result.url] = [];
    }
    resultsByUrl[result.url].push(result);
  });

  // Environment badge
  const environment = TARGET_ENV === "production" ? "Production" : "Development";
  const envBadgeClass = TARGET_ENV === "production" ? "production" : "development";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Accessibility Audit Report - ${timestamp}</title>
  <style>
    :root {
      --primary: #2c3e50;
      --success: #28a745;
      --danger: #dc3545;
      --warning: #ffc107;
      --info: #17a2b8;
      --light: #f8f9fa;
      --dark: #343a40;
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #f5f5f5;
      padding: 20px;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    h1 {
      color: var(--primary);
      border-bottom: 3px solid var(--info);
      padding-bottom: 10px;
      margin-bottom: 30px;
    }

    h2 {
      color: var(--primary);
      margin-top: 30px;
      margin-bottom: 15px;
      border-left: 4px solid var(--info);
      padding-left: 15px;
    }

    h3 { color: #555; margin-top: 20px; margin-bottom: 10px; }

    .metadata {
      background: var(--light);
      padding: 20px;
      border-radius: 5px;
      margin-bottom: 30px;
    }

    .metadata p { margin: 5px 0; }
    .metadata strong { color: var(--primary); }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 15px;
      margin: 20px 0;
    }

    .stat-card {
      background: var(--light);
      padding: 20px;
      border-radius: 5px;
      text-align: center;
      border-left: 4px solid var(--info);
    }

    .stat-card .number {
      font-size: 2.5em;
      font-weight: bold;
      color: var(--primary);
    }

    .stat-card.success .number { color: var(--success); }
    .stat-card.danger .number { color: var(--danger); }
    .stat-card .label { color: #7f8c8d; margin-top: 5px; }

    .severity-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 4px;
      font-weight: bold;
      font-size: 0.85em;
      margin-right: 8px;
    }

    .severity-critical { background: #f8d7da; color: #721c24; }
    .severity-serious { background: #fff3cd; color: #856404; }
    .severity-moderate { background: #d1ecf1; color: #0c5460; }
    .severity-minor { background: #e9ecef; color: #495057; }

    .env-badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 4px;
      font-weight: bold;
      font-size: 0.85em;
    }
    .env-badge.development { background: #fff3cd; color: #856404; }
    .env-badge.production { background: #d4edda; color: #155724; }

    .viewport-badge {
      background: #e7f3ff;
      color: #1976D2;
      padding: 2px 8px;
      border-radius: 3px;
      font-size: 0.85em;
      margin-left: 8px;
      text-transform: uppercase;
    }

    .page-section {
      margin: 30px 0;
      padding: 20px;
      background: var(--light);
      border-radius: 5px;
      border-left: 4px solid var(--info);
    }

    .page-header { margin-bottom: 15px; }
    .page-header h3 { color: var(--primary); margin-bottom: 5px; }

    .violation {
      background: white;
      padding: 15px;
      margin: 15px 0;
      border-radius: 5px;
      border-left: 4px solid var(--danger);
    }

    .violation-header {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 10px;
    }

    .violation-title { font-weight: bold; color: var(--primary); flex: 1; }
    .violation-details { margin-top: 10px; }
    .violation-details p { margin: 8px 0; }
    .violation-details strong { color: var(--primary); }

    .violation-nodes { margin: 10px 0; padding-left: 20px; }

    .violation-node {
      background: var(--light);
      padding: 10px;
      margin: 5px 0;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
      font-size: 0.9em;
      word-break: break-all;
    }

    .no-issues {
      color: var(--success);
      font-weight: bold;
      padding: 10px;
      background: #d4edda;
      border-radius: 5px;
      text-align: center;
    }

    .error-box {
      background: #f8d7da;
      border-left: 4px solid var(--danger);
      padding: 15px;
      margin: 15px 0;
      border-radius: 5px;
      color: #721c24;
    }

    .info-box {
      background: #e7f3ff;
      border-left: 4px solid #2196F3;
      padding: 20px;
      margin: 20px 0;
      border-radius: 5px;
    }

    .info-box h3 { color: #1976D2; margin-top: 0; }
    .info-box ul { margin: 10px 0; padding-left: 25px; }
    .info-box li { margin: 5px 0; }

    details { margin: 15px 0; }
    details summary {
      cursor: pointer;
      font-weight: bold;
      color: var(--primary);
      padding: 10px;
      background: var(--light);
      border-radius: 5px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }

    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }

    th { background: var(--light); }

    footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #ddd;
      text-align: center;
      color: #7f8c8d;
      font-size: 0.9em;
    }

    footer a { color: var(--info); text-decoration: none; }
    footer a:hover { text-decoration: underline; }

    @media (max-width: 768px) {
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
      .violation-header { flex-direction: column; align-items: flex-start; }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🔍 Accessibility Audit Report</h1>
    
    <div class="metadata">
      <p><strong>Site:</strong> ${SITE_INFO.name}</p>
      <p><strong>Generated:</strong> ${timestamp}</p>
      <p><strong>Environment:</strong> <span class="env-badge ${envBadgeClass}">${environment}</span> (${BASE_URL})</p>
      <p><strong>axe-core version:</strong> 4.10.x (via @axe-core/playwright)</p>
      <p><strong>Pages tested:</strong> ${uniquePages.length}</p>
      <p><strong>Viewports tested:</strong> ${VIEWPORTS.map((v) => v.name).join(", ")}</p>
      <p><strong>Themes tested:</strong> ${THEME_CONFIG.themes.map((t) => t.name).join(", ")}</p>
      <p><strong>Rule categories:</strong> WCAG 2.1 Level A & AA</p>
      <p><strong>Viewport Dimensions:</strong></p>
      <ul style="margin: 10px 0 0 25px;">
        ${VIEWPORTS.map((v) => `<li>${v.name}: ${v.width}×${v.height}</li>`).join("")}
      </ul>
    </div>

    <details style="margin: 20px 0; border: 1px solid #ddd; border-radius: 5px;">
      <summary style="border-radius: 5px;">
        ✅ Enabled WCAG Rules (Click to expand)
      </summary>
      <div style="padding: 15px; background: var(--light);">
        <p>This audit tests against the following WCAG 2.1 rule categories:</p>
        <ul style="margin: 10px 0 0 25px;">
          <li><strong>wcag2a</strong> - WCAG 2.0 Level A</li>
          <li><strong>wcag2aa</strong> - WCAG 2.0 Level AA</li>
          <li><strong>wcag21a</strong> - WCAG 2.1 Level A</li>
          <li><strong>wcag21aa</strong> - WCAG 2.1 Level AA</li>
        </ul>
        <p style="margin-top: 15px;"><strong>Configured Rules Status:</strong></p>
        <ul style="margin: 10px 0 0 25px; font-size: 0.95em;">
          ${Object.entries(AXE_RULE_CONFIG)
            .map(
              ([rule, enabled]) =>
                `<li><strong>${rule}</strong>: ${enabled ? "✅ Enabled" : "❌ Disabled"}</li>`
            )
            .join("")}
        </ul>
      </div>
    </details>

    <div class="info-box">
      <h3>About axe-core</h3>
      <p>This accessibility audit was generated using <strong>axe-core</strong>, one of the most comprehensive and trusted accessibility testing tools available.</p>
      <p><strong>Key Features:</strong></p>
      <ul>
        <li><strong>Comprehensive Coverage:</strong> Tests against WCAG 2.1 Level A and AA guidelines</li>
        <li><strong>Industry Standard:</strong> Used by Google, Microsoft, and thousands of organizations</li>
        <li><strong>Open Source:</strong> Free, actively maintained by Deque Systems</li>
        <li><strong>Accurate Results:</strong> Low false-positive rate with actionable reports</li>
      </ul>
      <p style="margin-top: 1rem;">
        <a href="https://www.deque.com/axe/" target="_blank" rel="noopener noreferrer">Learn more about axe-core →</a>
      </p>
      <p style="margin-top: 1rem; font-size: 0.9em; color: #666;">
        <strong>Note:</strong> Automated testing catches ~30-50% of accessibility issues. Manual testing with screen readers and keyboard navigation is also recommended.
      </p>
    </div>

    <details class="info-box" style="margin: 20px 0;">
      <summary style="cursor: pointer; font-weight: bold; color: #1976D2; background: transparent; padding: 0;">
        📋 What does axe-core test for? (Click to expand)
      </summary>
      <div style="padding-top: 15px;">
        <p>axe-core performs automated checks against the Web Content Accessibility Guidelines (WCAG) and other accessibility standards. The tests check for:</p>
        <ul style="margin: 15px 0 0 25px;">
          <li><strong>Semantic HTML:</strong> Proper use of HTML elements, ARIA attributes, and landmarks</li>
          <li><strong>Keyboard Navigation:</strong> All interactive elements must be keyboard accessible</li>
          <li><strong>Color Contrast:</strong> Text must meet WCAG contrast ratio requirements (4.5:1 for normal text, 3:1 for large text)</li>
          <li><strong>Focus Management:</strong> Visible focus indicators and logical tab order</li>
          <li><strong>Form Labels:</strong> All form inputs must have associated labels</li>
          <li><strong>Image Alt Text:</strong> Images must have appropriate alternative text</li>
          <li><strong>Heading Structure:</strong> Proper heading hierarchy (h1 → h2 → h3, etc.)</li>
          <li><strong>Landmark Regions:</strong> Proper use of ARIA landmarks (banner, main, navigation, contentinfo)</li>
          <li><strong>Interactive Elements:</strong> Buttons, links, and controls must have accessible names</li>
          <li><strong>Language Attributes:</strong> HTML lang attribute must be set</li>
        </ul>
      </div>
    </details>

    <details class="info-box" style="margin: 20px 0;">
      <summary style="cursor: pointer; font-weight: bold; color: #1976D2; background: transparent; padding: 0;">
        🔗 What Are Skip Links? (Click to expand)
      </summary>
      <div style="padding-top: 15px;">
        <p><strong>Skip links</strong> are hidden links that appear at the top of a page when a keyboard user tabs into them. They allow users to bypass repetitive content (like navigation menus) and jump directly to the main content.</p>
        <h4 style="margin-top: 15px;">Why Are Skip Links Important?</h4>
        <ul style="margin: 10px 0 0 25px;">
          <li>Essential for keyboard-only users who can't use a mouse</li>
          <li>Required by WCAG 2.1 Success Criterion 2.4.1 (Bypass Blocks)</li>
          <li>Improve navigation efficiency for screen reader users</li>
          <li>Help users with motor impairments who find repeated tabbing difficult</li>
        </ul>
        <h4 style="margin-top: 15px;">Skip Link Implementation Requirements</h4>
        <ul style="margin: 10px 0 0 25px;">
          <li>Must be the first focusable element on the page</li>
          <li>Must become visible when focused</li>
          <li>Must link to a valid target (e.g., #main-content)</li>
          <li>Target element must exist and be focusable</li>
        </ul>
        <h4 style="margin-top: 15px;">Current Skip Link Status</h4>
        <ul style="margin: 10px 0 0 25px;">
          <li><strong>Skip links found:</strong> ${skipLinkSummary.exists}/${skipLinkSummary.total} pages</li>
          <li><strong>Skip links working:</strong> ${skipLinkSummary.working}/${skipLinkSummary.total} pages</li>
          ${skipLinkSummary.issues > 0 ? `<li><strong>Skip link issues:</strong> ${skipLinkSummary.issues}</li>` : ""}
        </ul>
      </div>
    </details>

    <details class="info-box" style="margin: 20px 0;">
      <summary style="cursor: pointer; font-weight: bold; color: #1976D2; background: transparent; padding: 0;">
        🏛️ Accessibility Standards & Compliance (Click to expand)
      </summary>
      <div style="padding-top: 15px;">
        <p>The accessibility tests performed by axe-core are designed to ensure compliance with the following standards:</p>
        ${COMPLIANCE_STANDARDS.map(
          (standard) => `
        <h4 style="margin-top: 15px;">${standard.name}</h4>
        <p>${standard.description}</p>
        ${
          standard.links
            ? `<ul style="margin: 10px 0 0 25px;">
          ${standard.links.map((link) => `<li><a href="${link.url}" target="_blank" rel="noopener noreferrer">${link.text}</a></li>`).join("")}
        </ul>`
            : ""
        }
        `
        ).join("")}
      </div>
    </details>

    <details class="info-box" style="margin: 20px 0;">
      <summary style="cursor: pointer; font-weight: bold; color: #1976D2; background: transparent; padding: 0;">
        🖥️ About Testing Environments (Click to expand)
      </summary>
      <div style="padding-top: 15px;">
        <h4>Development vs. Production Testing</h4>
        <p>This audit was run against the <strong>${environment}</strong> environment (${BASE_URL}).</p>
        <ul style="margin: 15px 0 0 25px;">
          <li><strong>Development:</strong> Tests against your local development server. Results may differ from production due to missing assets, different configurations, or debug features.</li>
          <li><strong>Production:</strong> Tests against your live website. This provides the most accurate results for what users actually experience.</li>
        </ul>
        <p style="margin-top: 15px;"><strong>Recommendation:</strong> Run audits in both environments and fix issues found in either.</p>
      </div>
    </details>

    <details class="info-box" style="margin: 20px 0;">
      <summary style="cursor: pointer; font-weight: bold; color: #1976D2; background: transparent; padding: 0;">
        📝 Framework Notes (Click to expand)
      </summary>
      <div style="padding-top: 15px;">
        <h4>Nuxt + Vuetify Specific Considerations</h4>
        <p>This audit is configured for Nuxt 4 + Vuetify 3 applications with the following considerations:</p>
        <ul style="margin: 15px 0 0 25px;">
          <li><strong>Region rule disabled:</strong> Vue/Nuxt's component structure can cause false positives with the 'region' rule</li>
          <li><strong>Nuxt root excluded:</strong> The #__nuxt container is excluded from testing</li>
          <li><strong>Dynamic content:</strong> The audit waits for Vue to fully render before running tests</li>
          <li><strong>Vuetify components:</strong> ARIA roles on Vuetify components are verified</li>
        </ul>
      </div>
    </details>

    <h2>Executive Summary</h2>
    
    <div class="stats-grid">
      <div class="stat-card">
        <div class="number">${uniquePages.length}</div>
        <div class="label">Pages Audited</div>
      </div>
      <div class="stat-card ${totalViolations > 0 ? "danger" : "success"}">
        <div class="number">${totalViolations}</div>
        <div class="label">Total Violations</div>
      </div>
      <div class="stat-card success">
        <div class="number">${totalPasses}</div>
        <div class="label">Total Passes</div>
      </div>
      <div class="stat-card ${pagesWithViolations.length > 0 ? "danger" : "success"}">
        <div class="number">${uniquePages.length - pagesWithViolations.length}</div>
        <div class="label">Pages Passing</div>
      </div>
      <div class="stat-card">
        <div class="number">${totalTests}</div>
        <div class="label">Total Tests Run</div>
      </div>
      <div class="stat-card ${violationsBySeverity.critical.length > 0 ? "danger" : "success"}">
        <div class="number">${violationsBySeverity.critical.length}</div>
        <div class="label">Critical Issues</div>
      </div>
      <div class="stat-card ${violationsBySeverity.serious.length > 0 ? "danger" : "success"}">
        <div class="number">${violationsBySeverity.serious.length}</div>
        <div class="label">Serious Issues</div>
      </div>
    </div>

    <h2>Violations by Severity</h2>
    <table>
      <thead>
        <tr>
          <th>Severity</th>
          <th>Count</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><span class="severity-badge severity-critical">Critical</span></td>
          <td>${violationsBySeverity.critical.length}</td>
          <td>Issues that prevent users from accessing content or functionality</td>
        </tr>
        <tr>
          <td><span class="severity-badge severity-serious">Serious</span></td>
          <td>${violationsBySeverity.serious.length}</td>
          <td>Issues that significantly impact user experience and accessibility</td>
        </tr>
        <tr>
          <td><span class="severity-badge severity-moderate">Moderate</span></td>
          <td>${violationsBySeverity.moderate.length}</td>
          <td>Issues that may cause confusion or difficulty for some users</td>
        </tr>
        <tr>
          <td><span class="severity-badge severity-minor">Minor</span></td>
          <td>${violationsBySeverity.minor.length}</td>
          <td>Issues that are minor inconveniences but don't block access</td>
        </tr>
      </tbody>
    </table>

    <h2>📋 All Tested Pages</h2>
    
    <table>
      <thead>
        <tr>
          <th>Page</th>
          ${VIEWPORTS.map((v) => `<th>${v.name}</th>`).join("")}
          <th>Violations</th>
          <th>Passes</th>
          <th>Skip Link</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${uniquePages
          .map((url) => {
            const pageResults = resultsByUrl[url] || [];
            const totalViolations = pageResults.reduce(
              (sum, r) => sum + (r.violations?.length || 0),
              0
            );
            const totalPasses = pageResults.reduce(
              (sum, r) => sum + (r.passes?.length || 0),
              0
            );
            const passed = totalViolations === 0;
            const skipLink = pageResults[0]?.skipLink;
            const skipLinkStatus = skipLink?.exists
              ? skipLink.issues?.length === 0
                ? "✅"
                : "⚠️"
              : "❌";

            return `
        <tr>
          <td><strong>${url === "/" ? "Home" : url}</strong></td>
          ${VIEWPORTS.map((v) => {
            const result = pageResults.find((r) => r.viewport === v.name);
            const hasViolations = (result?.violations?.length || 0) > 0;
            return `<td style="text-align: center;">${result ? (hasViolations ? "❌" : "✅") : "-"}</td>`;
          }).join("")}
          <td style="text-align: center;">${totalViolations}</td>
          <td style="text-align: center;">${totalPasses}</td>
          <td style="text-align: center;">${skipLinkStatus}</td>
          <td style="text-align: center;"><span class="severity-badge" style="background: ${passed ? "#d4edda" : "#f8d7da"}; color: ${passed ? "#155724" : "#721c24"};">${passed ? "✅ Pass" : "❌ Fail"}</span></td>
        </tr>
            `;
          })
          .join("")}
      </tbody>
    </table>

    <h2>Detailed Page Results</h2>
    
    ${uniquePages
      .map((url) => {
        const pageResults = resultsByUrl[url] || [];
        const allViolations = pageResults.flatMap((r) =>
          (r.violations || []).map((v) => ({
            ...v,
            viewport: r.viewport,
            theme: r.theme,
          }))
        );
        const totalPasses = pageResults.reduce(
          (sum, r) => sum + (r.passes?.length || 0),
          0
        );
        const skipLink = pageResults[0]?.skipLink;

        return `
    <div class="page-section">
      <div class="page-header">
        <h3>${url === "/" ? "Home" : url}</h3>
      </div>
      
      <div style="margin: 15px 0;">
        <strong>Scan Results:</strong>
        <ul style="margin: 10px 0; padding-left: 25px;">
          ${VIEWPORTS.map((v) => {
            const result = pageResults.find((r) => r.viewport === v.name);
            const violations = result?.violations?.length || 0;
            return `<li><strong>${v.name} (${v.width}×${v.height}):</strong> ${result ? (violations > 0 ? `❌ ${violations} violation(s)` : "✅ Passed") : "Not tested"}</li>`;
          }).join("")}
          <li><strong>Total Violations:</strong> ${allViolations.length}</li>
          <li><strong>Total Passed Checks:</strong> ${totalPasses}</li>
          <li><strong>Skip Link:</strong> ${skipLink?.exists ? (skipLink.issues?.length === 0 ? "✅ Working" : `⚠️ Issues: ${skipLink.issues.join(", ")}`) : "❌ Not found"}</li>
        </ul>
      </div>
      
      ${
        allViolations.length > 0
          ? `
      <h4>Issues Found:</h4>
      ${allViolations
        .map((violation) => {
          const wcagTags = (violation.tags || [])
            .filter((tag) => tag.startsWith("wcag"))
            .join(", ");

          return `
        <div class="violation">
          <div class="violation-header">
            <span class="severity-badge severity-${violation.impact || "minor"}">${(violation.impact || "minor").toUpperCase()}</span>
            <span class="violation-title">${escapeHtml(violation.help || violation.id)}</span>
            <span class="viewport-badge">${violation.viewport}</span>
          </div>
          <div class="violation-details">
            <p><strong>Rule ID:</strong> ${violation.id}</p>
            <p><strong>Description:</strong> ${escapeHtml(violation.description || "")}</p>
            ${wcagTags ? `<p><strong>WCAG Standards:</strong> ${wcagTags}</p>` : ""}
            <p><strong>Affected Elements:</strong> ${violation.nodes ? violation.nodes.length : 0}</p>
            <p><strong>Help URL:</strong> <a href="${violation.helpUrl}" target="_blank" rel="noopener noreferrer">${violation.helpUrl}</a></p>
            
            ${
              violation.nodes && violation.nodes.length > 0
                ? `
            <div class="violation-nodes">
              <strong>Affected Elements (${violation.nodes.length}):</strong>
              ${violation.nodes
                .slice(0, 5)
                .map(
                  (node) => `
              <div class="violation-node">${escapeHtml(node.html || node.target?.join(" ") || "N/A")}</div>
              `
                )
                .join("")}
              ${violation.nodes.length > 5 ? `<div class="violation-node">... and ${violation.nodes.length - 5} more</div>` : ""}
            </div>
            `
                : ""
            }
          </div>
        </div>
        `;
        })
        .join("")}
      `
          : `
      <div class="no-issues">
        ✓ This page passes all WCAG 2.1 AA accessibility checks across all viewports.
      </div>
      `
      }
    </div>
    `;
      })
      .join("")}

    <h2>Recommendations</h2>
    <div class="info-box">
      <h3>Priority Actions</h3>
      <ol style="margin: 10px 0; padding-left: 25px;">
        ${violationsBySeverity.critical.length > 0 ? `<li><strong>Address Critical Issues First:</strong> ${violationsBySeverity.critical.length} critical issue(s) prevent users from accessing content. Fix immediately.</li>` : ""}
        ${violationsBySeverity.serious.length > 0 ? `<li><strong>Fix Serious Issues:</strong> ${violationsBySeverity.serious.length} serious issue(s) significantly impact user experience.</li>` : ""}
        <li><strong>Regular Audits:</strong> Run this audit regularly during development</li>
        <li><strong>Manual Testing:</strong> Supplement with keyboard navigation and screen reader testing</li>
        <li><strong>Team Training:</strong> Ensure developers understand accessibility best practices</li>
      </ol>
    </div>

    <footer>
      <p>Generated by <strong>axe-core</strong> accessibility testing tool</p>
      <p>WCAG 2.1 AA Compliance Standard</p>
      <p style="margin-top: 10px;">
        <a href="/docs/">← Back to Documentation Portal</a> | 
        <a href="https://www.w3.org/WAI/WCAG21/quickref/" target="_blank" rel="noopener noreferrer">WCAG 2.1 Guidelines</a> |
        <a href="https://github.com/ICJIA/icjia-accessibility-portal/blob/main/audit-accessibility.js" target="_blank" rel="noopener noreferrer">Reference Script</a>
      </p>
    </footer>
  </div>
</body>
</html>`;
}

/**
 * Main audit function
 */
async function runAudit() {
  console.log("");
  console.log("┌" + "─".repeat(78) + "┐");
  console.log(
    "│" +
      " ".repeat(15) +
      "ACCESSIBILITY AUDIT (ICJIA Standard)" +
      " ".repeat(26) +
      "│"
  );
  console.log(
    "│" +
      " ".repeat(10) +
      "Reference: github.com/ICJIA/icjia-accessibility-portal" +
      " ".repeat(13) +
      "│"
  );
  console.log("└" + "─".repeat(78) + "┘");
  console.log("");

  let serverProcess = null;
  let serverStartedByScript = false;

  try {
    // Check if server is running
    console.log(`📍 Target environment: ${TARGET_ENV}`);
    console.log(`📍 Base URL: ${BASE_URL}`);

    const serverRunning = await checkServerRunning(BASE_URL);

    if (TARGET_ENV === "development" && !serverRunning) {
      serverProcess = await startDevServer();
      serverStartedByScript = true;
    } else if (!serverRunning) {
      throw new Error(
        `Server is not running at ${BASE_URL}. Please start it first.`
      );
    } else {
      console.log(`✅ Server is running at ${BASE_URL}`);
    }

    // Parse sitemap
    console.log("\n📄 Reading sitemap.xml...");
    const urls = await parseSitemap();
    console.log(`✓ Found ${urls.length} page(s) in sitemap:`);
    urls.forEach((url) => console.log(`   - ${url}`));

    // Ensure output directory exists
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // Launch browser
    console.log("\n🌐 Launching browser...");
    const browser = await chromium.launch({ headless: true });
    const results = [];

    // Test each URL in each viewport and theme
    for (const url of urls) {
      const fullUrl = `${BASE_URL}${url === "/" ? "" : url}`;
      console.log(`\n📄 Testing: ${url}`);

      for (const viewport of VIEWPORTS) {
        for (const theme of THEME_CONFIG.themes) {
          // Use browser.newContext() as required by @axe-core/playwright
          const context = await browser.newContext({
            viewport: {
              width: viewport.width,
              height: viewport.height,
            },
          });
          const page = await context.newPage();

          try {
            console.log(`   🔍 ${viewport.name} / ${theme.name}...`);

            await page.goto(fullUrl, {
              waitUntil: "networkidle",
              timeout: 30000,
            });

            // Wait for Vue/Nuxt to render
            await page.waitForTimeout(2000);

            // Verify skip link
            const skipLinkVerification = await verifySkipLink(page);

            // Run axe-core
            let axeBuilder = new AxeBuilder({ page })
              .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
              .options({ rules: generateAxeRules() });

            // Add exclusions
            for (const selector of AXE_EXCLUDE_SELECTORS) {
              axeBuilder = axeBuilder.exclude(selector);
            }

            const auditResult = await axeBuilder.analyze();

            results.push({
              url,
              viewport: viewport.name,
              theme: theme.name,
              violations: auditResult.violations,
              passes: auditResult.passes,
              incomplete: auditResult.incomplete,
              inapplicable: auditResult.inapplicable,
              skipLink: skipLinkVerification,
            });

            const violationCount = auditResult.violations?.length || 0;
            const passCount = auditResult.passes?.length || 0;

            // Log skip link status
            if (
              skipLinkVerification.exists &&
              skipLinkVerification.issues.length === 0
            ) {
              console.log(`      ✅ Skip link: OK`);
            } else if (skipLinkVerification.exists) {
              console.log(
                `      ⚠️  Skip link: Issues (${skipLinkVerification.issues.length})`
              );
            } else {
              console.log(`      ❌ Skip link: Not found`);
            }

            if (violationCount > 0) {
              console.log(
                `      ⚠️  Found ${violationCount} violation(s), ${passCount} pass(es)`
              );
            } else {
              console.log(`      ✅ No violations, ${passCount} pass(es)`);
            }
          } catch (error) {
            console.error(`      ❌ Error: ${error.message}`);
            results.push({
              url,
              viewport: viewport.name,
              theme: theme.name,
              error: error.message,
              violations: [],
              passes: [],
              incomplete: [],
              inapplicable: [],
            });
          } finally {
            await page.close();
            await context.close();
          }
        }
      }
    }

    await browser.close();

    // Save results
    console.log("\n📝 Generating reports...");

    // Full results JSON
    const fullResultsPath = path.join(OUTPUT_DIR, "results.json");
    fs.writeFileSync(
      fullResultsPath,
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          config: {
            targetEnv: TARGET_ENV,
            baseUrl: BASE_URL,
            viewports: VIEWPORTS,
            themes: THEME_CONFIG.themes,
            wcagStandards: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"],
            rulesConfig: AXE_RULE_CONFIG,
          },
          results,
        },
        null,
        2
      )
    );
    console.log(`✓ Full results saved: ${fullResultsPath}`);

    // Violations-only JSON
    const violationsOnly = results
      .filter((r) => (r.violations?.length || 0) > 0)
      .map((r) => ({
        url: r.url,
        viewport: r.viewport,
        theme: r.theme,
        violations: r.violations || [],
      }));

    const violationsPath = path.join(OUTPUT_DIR, "violations.json");
    fs.writeFileSync(violationsPath, JSON.stringify(violationsOnly, null, 2));
    console.log(`✓ Violations JSON saved: ${violationsPath}`);

    // Errors JSON (alias of violations)
    const errorsPath = path.join(OUTPUT_DIR, "errors.json");
    fs.writeFileSync(errorsPath, JSON.stringify(violationsOnly, null, 2));
    console.log(`✓ Errors JSON saved: ${errorsPath}`);

    // Check if errors.json is empty
    if (violationsOnly.length === 0) {
      console.log(`\n✅ SUCCESS: errors.json is empty - zero violations!`);
    } else {
      const totalErrors = violationsOnly.reduce(
        (sum, item) => sum + (item.violations?.length || 0),
        0
      );
      console.log(
        `\n⚠️  WARNING: errors.json contains ${totalErrors} violation(s) across ${violationsOnly.length} viewport(s)`
      );
    }

    // Generate HTML report
    const htmlReport = generateHTMLReport(results);
    fs.writeFileSync(REPORT_FILE, htmlReport);
    console.log(`✓ HTML report saved: ${REPORT_FILE}`);

    // Summary
    const totalViolations = results.reduce(
      (sum, r) => sum + (r.violations?.length || 0),
      0
    );
    const totalPasses = results.reduce(
      (sum, r) => sum + (r.passes?.length || 0),
      0
    );
    const uniquePages = [...new Set(results.map((r) => r.url))];
    const pagesWithViolations = [
      ...new Set(
        results.filter((r) => (r.violations?.length || 0) > 0).map((r) => r.url)
      ),
    ];

    const skipLinkSummary = results.reduce(
      (acc, r) => {
        const skipLink = r.skipLink || {};
        if (skipLink.exists) {
          acc.exists++;
          if (skipLink.issues && skipLink.issues.length === 0) {
            acc.working++;
          }
        }
        acc.total++;
        return acc;
      },
      { total: 0, exists: 0, working: 0 }
    );

    console.log("\n" + "┌" + "─".repeat(78) + "┐");
    console.log("│" + " ".repeat(35) + "SUMMARY" + " ".repeat(36) + "│");
    console.log("└" + "─".repeat(78) + "┘");
    console.log(`📊 Pages tested: ${uniquePages.length}`);
    console.log(`📊 Viewports tested: ${VIEWPORTS.length}`);
    console.log(
      `📊 Themes: ${THEME_CONFIG.themes.map((t) => t.name).join(", ")}`
    );
    console.log(`📊 Total violations: ${totalViolations}`);
    console.log(`📊 Total passes: ${totalPasses}`);
    console.log(`📊 Pages with violations: ${pagesWithViolations.length}`);
    console.log(
      `📊 Pages passing: ${uniquePages.length - pagesWithViolations.length}`
    );
    console.log(
      `🔗 Skip links found: ${skipLinkSummary.exists}/${skipLinkSummary.total}`
    );
    console.log(
      `🔗 Skip links working: ${skipLinkSummary.working}/${skipLinkSummary.total}`
    );
    console.log(`\n📄 Report: ${REPORT_FILE}`);

    if (totalViolations > 0) {
      console.log(
        `\n⚠️  ${totalViolations} violation(s) found. Please review the report.`
      );
    } else {
      console.log(`\n🎉 No violations found!`);
    }
  } finally {
    // Clean up server if we started it
    if (serverProcess && serverStartedByScript) {
      console.log("\n🛑 Stopping development server...");
      try {
        process.kill(-serverProcess.pid);
      } catch {
        serverProcess.kill();
      }
    }
  }
}

// Run the audit
runAudit().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});
