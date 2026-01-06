#!/usr/bin/env node
/**
 * @fileoverview Comprehensive Accessibility Audit Report Generator
 * @description Reads sitemap.xml, runs axe-core accessibility checks on all pages
 * across desktop, tablet, and mobile viewports, and generates an HTML report
 * with WCAG 2.1 AA compliance status.
 *
 * Based on: https://github.com/ICJIA/icjia-accessibility-portal/blob/main/audit-accessibility.js
 *
 * Configuration:
 * - Set SITE_URL environment variable to override base URL
 * - Set SERVER_PORT environment variable to override server port to check
 *
 * Note: This script requires a server to be running. Start the server first with:
 *   - yarn dev (for development server - port 8000)
 *   - yarn generate:serve (for generated static site)
 *   - yarn preview (for preview server)
 *
 * @author ICJIA
 */

import { chromium } from "playwright";
import { AxeBuilder } from "@axe-core/playwright";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, "..");

/**
 * Configuration - can be customized per site
 * @type {Object}
 */
const CONFIG = {
  // Path to sitemap.xml (relative to project root)
  sitemapPath: join(projectRoot, "public", "sitemap.xml"),
  // Output path for HTML report (relative to project root)
  outputPath: join(projectRoot, "public", "docs", "accessibility", "index.html"),
  // JSON output for structured data
  jsonOutputPath: join(projectRoot, "public", "docs", "accessibility", "results.json"),
  // Base URL for the site (will be detected from running server)
  baseUrl: process.env.SITE_URL || null,
  // Server port (primary: 8000)
  serverPorts: process.env.SERVER_PORT
    ? [process.env.SERVER_PORT]
    : ["8000", "3000", "5150", "4173", "3003"],
  // Wait time for page load (ms)
  pageLoadTimeout: 5000,
  // Viewport configurations: desktop, tablet, mobile
  viewports: {
    desktop: { width: 1920, height: 1080 },
    tablet: { width: 768, height: 1024 },
    mobile: { width: 375, height: 667 },
  },
};

/**
 * Parse sitemap.xml and extract all URLs
 * @returns {Promise<string[]>} Array of URL paths
 */
async function parseSitemap() {
  const sitemapPath = CONFIG.sitemapPath;

  if (!existsSync(sitemapPath)) {
    throw new Error(`Sitemap not found at ${sitemapPath}`);
  }

  const sitemapContent = readFileSync(sitemapPath, "utf-8");
  const urls = [];

  // Extract URLs from sitemap.xml
  const urlMatches = sitemapContent.matchAll(/<loc>(.*?)<\/loc>/g);
  for (const match of urlMatches) {
    const fullUrl = match[1];
    // Extract path from full URL (ignore the domain, we'll use the detected server)
    try {
      const url = new URL(fullUrl);
      const pathname = url.pathname || "/";
      // Exclude /docs/* routes from accessibility testing
      if (!pathname.startsWith("/docs")) {
        urls.push(pathname);
      }
    } catch {
      // If it's already a path, use it directly
      const path = fullUrl.startsWith("/") ? fullUrl : `/${fullUrl}`;
      if (!path.startsWith("/docs")) {
        urls.push(path);
      }
    }
  }

  return [...new Set(urls)].sort(); // Remove duplicates and sort
}

/**
 * Check if server is already running
 * @param {string} url - URL to test
 * @returns {Promise<boolean>}
 */
async function checkServerRunning(url) {
  try {
    const http = await import("http");
    return new Promise((resolve) => {
      const req = http.get(url, { timeout: 2000 }, () => {
        resolve(true);
      });
      req.on("error", () => resolve(false));
      req.on("timeout", () => {
        req.destroy();
        resolve(false);
      });
    });
  } catch {
    return false;
  }
}

/**
 * Verify server is running and get the base URL
 * Prioritizes dev server (port 8000) first, then checks other common ports
 * @returns {Promise<string>} Base URL of the running server
 * @throws {Error} If server is not running
 */
async function verifyServerRunning() {
  // If baseUrl is explicitly set, use it
  if (CONFIG.baseUrl) {
    const running = await checkServerRunning(CONFIG.baseUrl);
    if (running) {
      console.log(`✓ Server is running at ${CONFIG.baseUrl}`);
      return CONFIG.baseUrl;
    }
    throw new Error(`Server is not running at ${CONFIG.baseUrl}`);
  }

  console.log("Checking for running server...");

  for (const port of CONFIG.serverPorts) {
    const url = `http://localhost:${port}`;
    const running = await checkServerRunning(url);
    if (running) {
      console.log(`✓ Server is running at ${url}`);
      return url;
    }
  }

  // Server not running - error out with helpful message
  throw new Error(
    `\n❌ Server is not running!\n\n` +
      `Please start the server first:\n` +
      `  • For dev server: yarn dev (port 8000)\n` +
      `  • For generated site: yarn generate:serve (port 5150)\n` +
      `  • For preview: yarn preview (port 3000)\n\n` +
      `Then open a new terminal tab and run the accessibility audit again:\n` +
      `  yarn audit:a11y:full\n`
  );
}

/**
 * Run accessibility audit on a single page with a specific viewport
 * @param {import('playwright').Page} page - Playwright page object
 * @param {string} path - URL path to audit
 * @param {string} viewport - Viewport type ('desktop', 'tablet', or 'mobile')
 * @param {Object} viewportSize - Viewport dimensions {width, height}
 * @returns {Promise<{path: string, violations: Array, passed: boolean, error?: string, viewport: string}>}
 */
async function auditPage(page, path, viewport, viewportSize) {
  const url = `${CONFIG.baseUrl}${path === "/" ? "" : path}`;
  console.log(`  🔍 Auditing ${viewport}: ${path}`);

  try {
    // Set viewport size
    await page.setViewportSize({
      width: viewportSize.width,
      height: viewportSize.height,
    });

    const response = await page.goto(url, {
      waitUntil: "networkidle",
      timeout: CONFIG.pageLoadTimeout * 6, // 30 seconds
    });

    // Check if we got redirected
    const finalUrl = page.url();
    if (finalUrl !== url) {
      console.log(`  ⚠️  Redirected from ${url} to ${finalUrl}`);
    }

    // Check response status
    if (response) {
      const status = response.status();
      if (status === 404) {
        console.log(`  ❌ Page not found (404) - route may not exist`);
        return {
          path,
          violations: [],
          passed: false,
          viewport,
          error:
            "Page not found (404) - route may not exist. Try restarting the dev server.",
          timestamp: new Date().toISOString(),
        };
      }
      if (status !== 200) {
        console.log(`  ⚠️  Warning: Non-200 status code: ${status}`);
      }
    }

    await page.waitForTimeout(2000); // Wait for dynamic content

    // Wait a bit more for Vue to fully render
    await page.waitForTimeout(1000);

    // Run axe-core analysis
    let axeBuilder = new AxeBuilder({ page }).withTags([
      "wcag2a",
      "wcag2aa",
      "wcag21a",
      "wcag21aa",
    ]);

    const results = await axeBuilder.analyze();

    const passed = results.violations.length === 0;
    console.log(
      `  ${passed ? "✅" : "❌"} ${viewport}: ${
        passed ? "Passed" : `Found ${results.violations.length} violation(s)`
      }`
    );

    // Add viewport info to each violation
    const violationsWithViewport = results.violations.map((v) => ({
      ...v,
      viewport: viewport,
    }));

    return {
      path,
      violations: violationsWithViewport,
      passed,
      passes: results.passes.length,
      incomplete: results.incomplete.length,
      viewport,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`  ❌ Error (${viewport}): ${error.message}`);
    return {
      path,
      violations: [],
      passed: false,
      viewport,
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
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
 * Generate HTML report from audit results
 * @param {Array} results - Array of audit results (grouped by page)
 * @param {Date} reportDate - Date when report was generated
 * @returns {string} HTML content
 */
function generateHTMLReport(results, reportDate) {
  // Group results by page path (combining desktop, tablet, and mobile)
  const pagesMap = new Map();

  results.forEach((result) => {
    const key = result.path;
    if (!pagesMap.has(key)) {
      pagesMap.set(key, {
        path: result.path,
        desktop: null,
        tablet: null,
        mobile: null,
        allViolations: [],
        passed: true,
        totalPasses: 0,
        totalIncomplete: 0,
      });
    }

    const pageData = pagesMap.get(key);
    if (result.viewport === "desktop") {
      pageData.desktop = result;
    } else if (result.viewport === "tablet") {
      pageData.tablet = result;
    } else if (result.viewport === "mobile") {
      pageData.mobile = result;
    }

    // Combine violations
    pageData.allViolations.push(...result.violations);
    if (!result.passed) {
      pageData.passed = false;
    }
    pageData.totalPasses += result.passes || 0;
    pageData.totalIncomplete += result.incomplete || 0;
  });

  const pages = Array.from(pagesMap.values());
  const totalPages = pages.length;
  const passedPages = pages.filter((p) => p.passed).length;
  const failedPages = totalPages - passedPages;
  const totalViolations = pages.reduce(
    (sum, p) => sum + p.allViolations.length,
    0
  );

  // Categorize violations by severity
  const violationsBySeverity = {
    critical: [],
    serious: [],
    moderate: [],
    minor: [],
  };

  pages.forEach((pageData) => {
    pageData.allViolations.forEach((violation) => {
      const impact = violation.impact || "minor";
      if (violationsBySeverity[impact]) {
        violationsBySeverity[impact].push({
          ...violation,
          page: pageData.path,
        });
      }
    });
  });

  const reportTimestamp = reportDate.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Accessibility Audit Report - ${reportTimestamp}</title>
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

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

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

    h3 {
      color: #555;
      margin-top: 20px;
      margin-bottom: 10px;
    }

    .metadata {
      background: var(--light);
      padding: 20px;
      border-radius: 5px;
      margin-bottom: 30px;
    }

    .metadata p {
      margin: 5px 0;
    }

    .metadata strong {
      color: var(--primary);
    }

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

    .stat-card.success .number {
      color: var(--success);
    }

    .stat-card.danger .number {
      color: var(--danger);
    }

    .stat-card .label {
      color: #7f8c8d;
      margin-top: 5px;
    }

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

    .page-header {
      margin-bottom: 15px;
    }

    .page-header h3 {
      color: var(--primary);
      margin-bottom: 5px;
    }

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

    .violation-title {
      font-weight: bold;
      color: var(--primary);
      flex: 1;
    }

    .violation-details {
      margin-top: 10px;
    }

    .violation-details p {
      margin: 8px 0;
    }

    .violation-details strong {
      color: var(--primary);
    }

    .violation-nodes {
      margin: 10px 0;
      padding-left: 20px;
    }

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

    .info-box h3 {
      color: #1976D2;
      margin-top: 0;
    }

    .info-box ul {
      margin: 10px 0;
      padding-left: 25px;
    }

    .info-box li {
      margin: 5px 0;
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

    th {
      background: var(--light);
    }

    footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #ddd;
      text-align: center;
      color: #7f8c8d;
      font-size: 0.9em;
    }

    footer a {
      color: var(--info);
      text-decoration: none;
    }

    footer a:hover {
      text-decoration: underline;
    }

    @media (max-width: 768px) {
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      
      .violation-header {
        flex-direction: column;
        align-items: flex-start;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🔍 Accessibility Audit Report</h1>
    
    <div class="metadata">
      <p><strong>Audit Date & Time:</strong> ${reportTimestamp}</p>
      <p><strong>Total Pages Audited:</strong> ${totalPages} (tested in desktop, tablet, and mobile viewports)</p>
      <p><strong>Audit Tool:</strong> axe-core (via @axe-core/playwright)</p>
      <p><strong>WCAG Standards:</strong> WCAG 2.1 Level A & AA</p>
      <p><strong>Viewports Tested:</strong></p>
      <ul style="margin: 10px 0 0 25px;">
        <li>Desktop: ${CONFIG.viewports.desktop.width}×${CONFIG.viewports.desktop.height}</li>
        <li>Tablet: ${CONFIG.viewports.tablet.width}×${CONFIG.viewports.tablet.height}</li>
        <li>Mobile: ${CONFIG.viewports.mobile.width}×${CONFIG.viewports.mobile.height}</li>
      </ul>
    </div>
    
    <div class="info-box">
      <h3>Why axe-core is Essential for Accessibility Testing</h3>
      <p>This accessibility audit was generated using <strong>axe-core</strong>, one of the most comprehensive and trusted accessibility testing tools available.</p>
      <p><strong>Key Features:</strong></p>
      <ul>
        <li><strong>Comprehensive Coverage:</strong> Tests against WCAG 2.1 Level A and AA guidelines</li>
        <li><strong>Industry Standard:</strong> Used by Google, Microsoft, and thousands of organizations</li>
        <li><strong>Open Source:</strong> Free, actively maintained tool</li>
        <li><strong>Accurate Results:</strong> Low false-positive rate with actionable reports</li>
      </ul>
      <p style="margin-top: 1rem;">
        <a href="https://www.deque.com/axe/" target="_blank" rel="noopener noreferrer">Learn more about axe-core →</a>
      </p>
      <p style="margin-top: 1rem; font-size: 0.9em; color: #666;">
        <strong>Note:</strong> Automated testing catches ~30-50% of accessibility issues. Manual testing with screen readers and keyboard navigation is also recommended.
      </p>
    </div>
    
    <h2>Executive Summary</h2>
    
    <div class="stats-grid">
      <div class="stat-card">
        <div class="number">${totalPages}</div>
        <div class="label">Pages Audited</div>
      </div>
      <div class="stat-card ${totalViolations > 0 ? "danger" : "success"}">
        <div class="number">${totalViolations}</div>
        <div class="label">Total Violations</div>
      </div>
      <div class="stat-card ${passedPages === totalPages ? "success" : "danger"}">
        <div class="number">${passedPages}</div>
        <div class="label">Pages Passing</div>
      </div>
      <div class="stat-card ${
        violationsBySeverity.critical.length > 0 ? "danger" : "success"
      }">
        <div class="number">${violationsBySeverity.critical.length}</div>
        <div class="label">Critical Issues</div>
      </div>
      <div class="stat-card ${
        violationsBySeverity.serious.length > 0 ? "danger" : "success"
      }">
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
    
    <h2>Detailed Page Results</h2>
    
    ${pages
      .map((pageData) => {
        const pageName = pageData.path === "/" ? "Home" : pageData.path;
        const desktopResult = pageData.desktop;
        const tabletResult = pageData.tablet;
        const mobileResult = pageData.mobile;
        const hasErrors =
          (desktopResult && desktopResult.error) ||
          (tabletResult && tabletResult.error) ||
          (mobileResult && mobileResult.error);

        return `
    <div class="page-section">
      <div class="page-header">
        <h3>${pageName}</h3>
      </div>
      
      ${
        hasErrors
          ? `
      ${
        desktopResult?.error
          ? `<div class="error-box"><strong>Desktop Error:</strong> ${escapeHtml(
              desktopResult.error
            )}</div>`
          : ""
      }
      ${
        tabletResult?.error
          ? `<div class="error-box"><strong>Tablet Error:</strong> ${escapeHtml(
              tabletResult.error
            )}</div>`
          : ""
      }
      ${
        mobileResult?.error
          ? `<div class="error-box"><strong>Mobile Error:</strong> ${escapeHtml(
              mobileResult.error
            )}</div>`
          : ""
      }
      `
          : `
      <div style="margin: 15px 0;">
        <strong>Scan Results:</strong>
        <ul style="margin: 10px 0; padding-left: 25px;">
          <li><strong>Desktop (${CONFIG.viewports.desktop.width}×${
              CONFIG.viewports.desktop.height
            }):</strong> ${
              desktopResult
                ? desktopResult.passed
                  ? "✅ Passed"
                  : `❌ ${desktopResult.violations.length} violation(s)`
                : "Not tested"
            }</li>
          <li><strong>Tablet (${CONFIG.viewports.tablet.width}×${
              CONFIG.viewports.tablet.height
            }):</strong> ${
              tabletResult
                ? tabletResult.passed
                  ? "✅ Passed"
                  : `❌ ${tabletResult.violations.length} violation(s)`
                : "Not tested"
            }</li>
          <li><strong>Mobile (${CONFIG.viewports.mobile.width}×${
              CONFIG.viewports.mobile.height
            }):</strong> ${
              mobileResult
                ? mobileResult.passed
                  ? "✅ Passed"
                  : `❌ ${mobileResult.violations.length} violation(s)`
                : "Not tested"
            }</li>
          <li><strong>Total Violations:</strong> ${
            pageData.allViolations.length
          }</li>
          <li><strong>Total Passed Checks:</strong> ${pageData.totalPasses}</li>
        </ul>
      </div>
      `
      }
      
      ${
        pageData.allViolations && pageData.allViolations.length > 0
          ? `
      <h4>Issues Found:</h4>
      ${pageData.allViolations
        .map((violation) => {
          const wcagTags = violation.tags
            .filter((tag) => tag.startsWith("wcag"))
            .join(", ");

          return `
        <div class="violation">
          <div class="violation-header">
            <span class="severity-badge severity-${violation.impact}">${(
            violation.impact || "minor"
          ).toUpperCase()}</span>
            <span class="violation-title">${escapeHtml(
              violation.help || violation.id
            )}</span>
            <span class="viewport-badge">${violation.viewport}</span>
          </div>
          <div class="violation-details">
            <p><strong>Rule ID:</strong> ${violation.id}</p>
            <p><strong>Description:</strong> ${escapeHtml(
              violation.description || ""
            )}</p>
            ${wcagTags ? `<p><strong>WCAG Standards:</strong> ${wcagTags}</p>` : ""}
            <p><strong>Affected Elements:</strong> ${
              violation.nodes ? violation.nodes.length : 0
            }</p>
            <p><strong>Help URL:</strong> <a href="${
              violation.helpUrl
            }" target="_blank" rel="noopener noreferrer">${
            violation.helpUrl
          }</a></p>
            
            ${
              violation.nodes && violation.nodes.length > 0
                ? `
            <div class="violation-nodes">
              <strong>Affected Elements (${violation.nodes.length}):</strong>
              ${violation.nodes
                .slice(0, 5)
                .map(
                  (node) => `
              <div class="violation-node">${escapeHtml(
                node.html || node.target?.join(" ") || "N/A"
              )}</div>
              `
                )
                .join("")}
              ${
                violation.nodes.length > 5
                  ? `<div class="violation-node">... and ${
                      violation.nodes.length - 5
                    } more</div>`
                  : ""
              }
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
          : pageData.passed
          ? `
      <div class="no-issues">
        ✓ This page passes all WCAG 2.1 AA accessibility checks across all viewports.
      </div>
      `
          : ""
      }
    </div>
    `;
      })
      .join("")}
    
    <h2>Recommendations</h2>
    <div class="info-box">
      <h3>Priority Actions</h3>
      <ol style="margin: 10px 0; padding-left: 25px;">
        ${
          violationsBySeverity.critical.length > 0
            ? `<li><strong>Address Critical Issues First:</strong> ${violationsBySeverity.critical.length} critical issue(s) prevent users from accessing content. Fix immediately.</li>`
            : ""
        }
        ${
          violationsBySeverity.serious.length > 0
            ? `<li><strong>Fix Serious Issues:</strong> ${violationsBySeverity.serious.length} serious issue(s) significantly impact user experience.</li>`
            : ""
        }
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
        <a href="https://www.w3.org/WAI/WCAG21/quickref/" target="_blank" rel="noopener noreferrer">WCAG 2.1 Guidelines</a>
      </p>
    </footer>
  </div>
</body>
</html>`;
}

/**
 * Main function
 */
async function main() {
  console.log("");
  console.log("┌" + "─".repeat(78) + "┐");
  console.log(
    "│" +
      " ".repeat(10) +
      "ACCESSIBILITY AUDIT REPORT GENERATOR" +
      " ".repeat(30) +
      "│"
  );
  console.log("│" + " ".repeat(15) + "Desktop • Tablet • Mobile Viewports" + " ".repeat(26) + "│");
  console.log("└" + "─".repeat(78) + "┘");
  console.log("Tool: axe-core (WCAG 2.1 AA compliance)");
  console.log("");

  try {
    // Verify server is running first (before parsing sitemap)
    const baseUrl = await verifyServerRunning();
    CONFIG.baseUrl = baseUrl;
    console.log(`📍 Using server URL: ${baseUrl}`);
    console.log("");

    // Parse sitemap
    console.log("📄 Reading sitemap.xml...");
    const urls = await parseSitemap();
    console.log(`✓ Found ${urls.length} page(s) in sitemap:`);
    urls.forEach((url) => console.log(`   - ${url}`));
    console.log("");

    // Check for Playwright browsers
    console.log("🌐 Launching browser...");
    let browser;
    try {
      browser = await chromium.launch({ headless: true });
    } catch (error) {
      if (
        error.message &&
        error.message.includes("Executable doesn't exist")
      ) {
        console.error("\n❌ ERROR: Playwright browsers are not installed!");
        console.error(
          "   Please run the following command to install Playwright browsers:"
        );
        console.error("\n   npx playwright install chromium\n");
        console.error(
          "   This is a one-time setup required for the accessibility audit."
        );
        process.exit(1);
      }
      throw error;
    }

    const context = await browser.newContext();
    const page = await context.newPage();

    // Run audits for all three viewports
    console.log(
      "🔍 Running accessibility audits (desktop, tablet, and mobile viewports)..."
    );
    const results = [];
    
    for (const urlPath of urls) {
      console.log(`\n📄 Testing page: ${urlPath}`);
      
      // Test desktop viewport
      const desktopResult = await auditPage(
        page,
        urlPath,
        "desktop",
        CONFIG.viewports.desktop
      );
      results.push(desktopResult);

      // Test tablet viewport
      const tabletResult = await auditPage(
        page,
        urlPath,
        "tablet",
        CONFIG.viewports.tablet
      );
      results.push(tabletResult);

      // Test mobile viewport
      const mobileResult = await auditPage(
        page,
        urlPath,
        "mobile",
        CONFIG.viewports.mobile
      );
      results.push(mobileResult);
    }

    await browser.close();
    console.log("");

    // Generate HTML report
    console.log("📝 Generating HTML report...");
    const reportDate = new Date();
    const htmlReport = generateHTMLReport(results, reportDate);

    // Write to public directory
    const outputDir = dirname(CONFIG.outputPath);
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }
    writeFileSync(CONFIG.outputPath, htmlReport, "utf-8");
    console.log(`✓ Report generated: ${CONFIG.outputPath}`);

    // Write JSON results
    const jsonOutput = {
      generatedAt: reportDate.toISOString(),
      config: {
        viewports: CONFIG.viewports,
        wcagStandards: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"],
      },
      results: results,
    };
    writeFileSync(CONFIG.jsonOutputPath, JSON.stringify(jsonOutput, null, 2), "utf-8");
    console.log(`✓ JSON data saved: ${CONFIG.jsonOutputPath}`);

    // Also write to .output/public if it exists (for immediate serving)
    const outputPublicPath = join(
      projectRoot,
      ".output",
      "public",
      "docs",
      "accessibility",
      "index.html"
    );
    const outputPublicDir = dirname(outputPublicPath);
    const outputPublicBase = join(projectRoot, ".output", "public");

    if (existsSync(outputPublicBase)) {
      if (!existsSync(outputPublicDir)) {
        mkdirSync(outputPublicDir, { recursive: true });
      }
      writeFileSync(outputPublicPath, htmlReport, "utf-8");
      console.log(`✓ Report also copied to: ${outputPublicPath}`);
    }

    console.log("");

    // Summary - group by page
    const pagesMap = new Map();
    results.forEach((result) => {
      const key = result.path;
      if (!pagesMap.has(key)) {
        pagesMap.set(key, {
          path: key,
          desktop: null,
          tablet: null,
          mobile: null,
          allViolations: [],
        });
      }
      const pageData = pagesMap.get(key);
      if (result.viewport === "desktop") {
        pageData.desktop = result;
      } else if (result.viewport === "tablet") {
        pageData.tablet = result;
      } else if (result.viewport === "mobile") {
        pageData.mobile = result;
      }
      pageData.allViolations.push(...result.violations);
    });

    const pages = Array.from(pagesMap.values());
    const totalPages = pages.length;
    const passedPages = pages.filter(
      (p) => p.desktop?.passed && p.tablet?.passed && p.mobile?.passed
    ).length;
    const failedPages = totalPages - passedPages;
    const totalViolations = pages.reduce(
      (sum, p) => sum + p.allViolations.length,
      0
    );

    console.log("");
    console.log("┌" + "─".repeat(78) + "┐");
    console.log("│" + " ".repeat(30) + "SUMMARY" + " ".repeat(40) + "│");
    console.log("└" + "─".repeat(78) + "┘");
    console.log(
      `📊 Total Pages: ${totalPages} (tested in desktop, tablet, and mobile viewports)`
    );
    console.log(`✅ Pages Passing (all viewports): ${passedPages}`);
    console.log(`❌ Pages with Issues: ${failedPages}`);
    console.log(`⚠️  Total Violations: ${totalViolations}`);
    console.log("");

    if (failedPages === 0) {
      console.log(
        "✅ All pages pass WCAG 2.1 AA compliance in all viewports!"
      );
    } else {
      console.log(`❌ ${failedPages} page(s) have accessibility issues.`);
      console.log(`   📄 See report: ${CONFIG.outputPath}`);
    }
    console.log("");
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    if (error.message.includes("Server is not running")) {
      console.error("\n💡 Tip: Start the dev server in a separate terminal tab:");
      console.error("   yarn dev");
      console.error("\n   Then run this audit again in a new terminal tab.");
    }
    process.exit(1);
  }
}

// Handle cleanup
process.on("SIGINT", () => {
  process.exit(1);
});

main();

