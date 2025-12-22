#!/usr/bin/env node
/**
 * @fileoverview Accessibility audit report generator
 * @description Reads sitemap.xml, runs axe-core accessibility checks on all pages,
 * and generates an HTML report with WCAG 2.1 AA compliance status
 *
 * Based on: https://github.com/ICJIA/icjia-accessibility-portal/blob/main/scripts/generate-accessibility-report.js
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
const projectRoot = __dirname;

/**
 * Configuration - can be customized per site
 * @type {Object}
 */
const CONFIG = {
  // Path to sitemap.xml (relative to project root)
  sitemapPath: join(projectRoot, "public", "sitemap.xml"),
  // Output path for HTML report (relative to project root)
  outputPath: join(
    projectRoot,
    "public",
    "documentation",
    "accessibility",
    "index.html"
  ),
  // Base URL for the site (will be detected from running server)
  baseUrl: process.env.SITE_URL || null,
  // Server ports to check (prioritizes dev server port 8000 first)
  serverPorts: process.env.SERVER_PORT 
    ? [process.env.SERVER_PORT] 
    : ["8000", "3000", "5150", "4173", "3003"],
  // Wait time for page load (ms)
  pageLoadTimeout: 5000,
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
      urls.push(url.pathname || "/");
    } catch {
      // If it's already a path, use it directly
      urls.push(fullUrl.startsWith("/") ? fullUrl : `/${fullUrl}`);
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
 * @param {string} viewport - Viewport type ('desktop' or 'mobile')
 * @param {Object} viewportSize - Viewport dimensions {width, height}
 * @returns {Promise<{path: string, violations: Array, passed: boolean, error?: string, viewport: string}>}
 */
async function auditPage(page, path, viewport, viewportSize) {
  const url = `${CONFIG.baseUrl}${path === "/" ? "" : path}`;
  console.log(`  🔍 Auditing ${viewport}: ${path}`);

  try {
    // Set viewport size
    await page.setViewportSize({ width: viewportSize.width, height: viewportSize.height });

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
      `  ${passed ? "✅" : "❌"} ${viewport}: ${passed ? "Passed" : `Found ${results.violations.length} violation(s)`}`
    );

    // Add viewport info to each violation
    const violationsWithViewport = results.violations.map(v => ({
      ...v,
      viewport: viewport
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
 * Generate HTML report from audit results
 * @param {Array} results - Array of audit results (grouped by page)
 * @param {Date} reportDate - Date when report was generated
 * @returns {string} HTML content
 */
function generateHTMLReport(results, reportDate) {
  // Group results by page path (combining desktop and mobile)
  const pagesMap = new Map();
  
  results.forEach((result) => {
    const key = result.path;
    if (!pagesMap.has(key)) {
      pagesMap.set(key, {
        path: result.path,
        desktop: null,
        mobile: null,
        allViolations: [],
        passed: true,
        totalPasses: 0,
        totalIncomplete: 0,
      });
    }
    
    const pageData = pagesMap.get(key);
    if (result.viewport === 'desktop') {
      pageData.desktop = result;
    } else if (result.viewport === 'mobile') {
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
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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

    .page-url {
      color: #7f8c8d;
      font-size: 0.9em;
      word-break: break-all;
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

    .pass-section {
      background: #d4edda;
      border-left: 4px solid var(--success);
      padding: 15px;
      margin: 15px 0;
      border-radius: 5px;
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
  </style>
</head>
<body>
  <div class="container">
    <h1>🔍 Accessibility Audit Report</h1>
    
    <div class="metadata">
      <p><strong>Audit Date & Time:</strong> ${reportTimestamp}</p>
      <p><strong>Total Pages Audited:</strong> ${totalPages} (tested in both desktop and mobile viewports)</p>
      <p><strong>Audit Tool:</strong> axe-core (via @axe-core/playwright)</p>
      <p><strong>WCAG Standards:</strong> WCAG 2.1 Level A & AA</p>
      <p><strong>Viewports Tested:</strong> Desktop (1920x1080) and Mobile (375x667)</p>
    </div>
    
    <div class="info-box">
      <h3>Why axe-core is Essential for Accessibility Testing</h3>
      <p>This accessibility audit was generated using <strong>axe-core</strong>, one of the most comprehensive and trusted accessibility testing tools available. axe-core is developed by Deque Systems and is used by major organizations worldwide to ensure web accessibility compliance.</p>
      <p><strong>Why axe-core is considered one of the best accessibility checkers:</strong></p>
      <ul>
        <li><strong>Comprehensive Coverage:</strong> Tests against WCAG 2.1 Level A and AA guidelines, covering over 50 accessibility rules</li>
        <li><strong>Industry Standard:</strong> Used by Google, Microsoft, and thousands of organizations worldwide</li>
        <li><strong>Open Source:</strong> Free, open-source tool with active community support and continuous improvements</li>
        <li><strong>Accurate Results:</strong> Low false-positive rate with detailed, actionable violation reports</li>
        <li><strong>Automated Testing:</strong> Integrates seamlessly with CI/CD pipelines and development workflows</li>
        <li><strong>Browser Integration:</strong> Works with all major browsers and testing frameworks</li>
      </ul>
      <p style="margin-top: 1rem;">
        <a href="https://www.deque.com/axe/" target="_blank" rel="noopener noreferrer">Learn more about axe-core →</a> | 
        <a href="https://github.com/dequelabs/axe-core" target="_blank" rel="noopener noreferrer">GitHub Repository →</a>
      </p>
      <p style="margin-top: 1rem; font-size: 0.9em; color: #666;">
        <strong>Note:</strong> While axe-core is excellent at finding many accessibility issues, it cannot detect all accessibility problems. Manual testing with screen readers and keyboard navigation is still recommended for comprehensive accessibility validation.
      </p>
    </div>
    
    <h2>Executive Summary</h2>
    
    <div class="stats-grid">
      <div class="stat-card">
        <div class="number">${totalPages}</div>
        <div class="label">Pages Audited</div>
      </div>
      <div class="stat-card ${totalViolations > 0 ? 'danger' : 'success'}">
        <div class="number">${totalViolations}</div>
        <div class="label">Total Violations</div>
      </div>
      <div class="stat-card ${passedPages === totalPages ? 'success' : 'danger'}">
        <div class="number">${passedPages}</div>
        <div class="label">Pages Passing</div>
      </div>
      <div class="stat-card ${violationsBySeverity.critical.length > 0 ? 'danger' : 'success'}">
        <div class="number">${violationsBySeverity.critical.length}</div>
        <div class="label">Critical Issues</div>
      </div>
      <div class="stat-card ${violationsBySeverity.serious.length > 0 ? 'danger' : 'success'}">
        <div class="number">${violationsBySeverity.serious.length}</div>
        <div class="label">Serious Issues</div>
      </div>
    </div>
    
    <h2>Violations by Severity</h2>
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <thead>
        <tr style="background: var(--light);">
          <th style="padding: 12px; text-align: left; border-bottom: 1px solid #ddd;">Severity</th>
          <th style="padding: 12px; text-align: left; border-bottom: 1px solid #ddd;">Count</th>
          <th style="padding: 12px; text-align: left; border-bottom: 1px solid #ddd;">Description</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #ddd;"><span class="severity-badge severity-critical">Critical</span></td>
          <td style="padding: 12px; border-bottom: 1px solid #ddd;">${violationsBySeverity.critical.length}</td>
          <td style="padding: 12px; border-bottom: 1px solid #ddd;">Issues that prevent users from accessing content or functionality</td>
        </tr>
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #ddd;"><span class="severity-badge severity-serious">Serious</span></td>
          <td style="padding: 12px; border-bottom: 1px solid #ddd;">${violationsBySeverity.serious.length}</td>
          <td style="padding: 12px; border-bottom: 1px solid #ddd;">Issues that significantly impact user experience and accessibility</td>
        </tr>
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #ddd;"><span class="severity-badge severity-moderate">Moderate</span></td>
          <td style="padding: 12px; border-bottom: 1px solid #ddd;">${violationsBySeverity.moderate.length}</td>
          <td style="padding: 12px; border-bottom: 1px solid #ddd;">Issues that may cause confusion or difficulty for some users</td>
        </tr>
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #ddd;"><span class="severity-badge severity-minor">Minor</span></td>
          <td style="padding: 12px; border-bottom: 1px solid #ddd;">${violationsBySeverity.minor.length}</td>
          <td style="padding: 12px; border-bottom: 1px solid #ddd;">Issues that are minor inconveniences but don't block access</td>
        </tr>
      </tbody>
    </table>
    
    <h2>Detailed Page Results</h2>
    
    ${pages
      .map(
        (pageData) => {
          const pageName = pageData.path === "/" ? "Home" : pageData.path;
          const desktopResult = pageData.desktop;
          const mobileResult = pageData.mobile;
          const hasErrors = (desktopResult && desktopResult.error) || (mobileResult && mobileResult.error);
          const desktopError = desktopResult?.error;
          const mobileError = mobileResult?.error;
          
          return `
      <div class="page-section">
        <div class="page-header">
          <h3>${pageName}</h3>
        </div>
        
        ${hasErrors ? `
        ${desktopError ? `
        <div class="error-box">
          <strong>Desktop Error:</strong> ${escapeHtml(desktopError)}
        </div>
        ` : ''}
        ${mobileError ? `
        <div class="error-box">
          <strong>Mobile Error:</strong> ${escapeHtml(mobileError)}
        </div>
        ` : ''}
        ` : `
        <div style="margin: 15px 0;">
          <strong>Scan Results:</strong>
          <ul style="margin: 10px 0; padding-left: 25px;">
            <li><strong>Desktop Viewport:</strong> ${desktopResult ? (desktopResult.passed ? '✅ Passed' : `❌ ${desktopResult.violations.length} violation(s)`) : 'Not tested'}</li>
            <li><strong>Mobile Viewport:</strong> ${mobileResult ? (mobileResult.passed ? '✅ Passed' : `❌ ${mobileResult.violations.length} violation(s)`) : 'Not tested'}</li>
            <li><strong>Total Violations:</strong> ${pageData.allViolations.length}</li>
            <li><strong>Total Passed Checks:</strong> ${pageData.totalPasses}</li>
            <li><strong>Total Incomplete Checks:</strong> ${pageData.totalIncomplete}</li>
          </ul>
        </div>
        `}
        
        ${
          pageData.allViolations && pageData.allViolations.length > 0
            ? `
        <h4>Issues Found:</h4>
        ${pageData.allViolations
          .map((violation) => {
            const wcagTags = violation.tags
              .filter((tag) => tag.startsWith("wcag"))
              .join(", ");
            const otherTags = violation.tags
              .filter((tag) => !tag.startsWith("wcag"))
              .join(", ");
            const viewportBadge = violation.viewport ? `<span style="background: #e7f3ff; color: #1976D2; padding: 2px 8px; border-radius: 3px; font-size: 0.85em; margin-left: 8px;">${violation.viewport.toUpperCase()}</span>` : '';

            return `
          <div class="violation">
            <div class="violation-header">
              <span class="severity-badge severity-${violation.impact}">${(violation.impact || "minor").toUpperCase()}</span>
              <span class="violation-title">${escapeHtml(violation.help || violation.id)}${viewportBadge}</span>
            </div>
            <div class="violation-details">
              <p><strong>Rule ID:</strong> ${violation.id}</p>
              <p><strong>Description:</strong> ${escapeHtml(violation.description || "")}</p>
              ${wcagTags ? `<p><strong>WCAG Standards:</strong> ${wcagTags}</p>` : ""}
              ${otherTags ? `<p><strong>Tags:</strong> ${otherTags}</p>` : ""}
              <p><strong>Viewport:</strong> ${violation.viewport || 'Unknown'}</p>
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
            : pageData.passed
              ? `
        <div class="no-issues">
          ✓ This page passes all WCAG 2.1 AA accessibility checks in both desktop and mobile viewports.
        </div>
        `
              : ""
        }
      </div>
      `;
        }
      )
      .join("")}
    
    <h2>Recommendations</h2>
    <div class="info-box">
      <h3>Priority Actions</h3>
      <ol style="margin: 10px 0; padding-left: 25px;">
        ${violationsBySeverity.critical.length > 0 ? `<li><strong>Address Critical Issues First:</strong> ${violationsBySeverity.critical.length} critical issue(s) prevent users from accessing content or functionality. These must be fixed immediately.</li>` : ""}
        ${violationsBySeverity.serious.length > 0 ? `<li><strong>Fix Serious Issues:</strong> ${violationsBySeverity.serious.length} serious issue(s) significantly impact user experience. Address these as high priority.</li>` : ""}
        <li><strong>Regular Audits:</strong> Run this audit script regularly during development to catch issues early</li>
        <li><strong>Manual Testing:</strong> Supplement automated testing with manual keyboard navigation and screen reader testing</li>
        <li><strong>Team Training:</strong> Ensure all developers understand accessibility best practices and WCAG guidelines</li>
        <li><strong>Accessibility Checklist:</strong> Create and maintain an accessibility checklist for code reviews</li>
      </ol>
    </div>
    
    <footer>
      <p>Generated by <strong>axe-core</strong> accessibility testing tool</p>
      <p>WCAG 2.1 AA Compliance Standard</p>
      <p style="margin-top: 10px;">
        <a href="https://www.w3.org/WAI/WCAG21/quickref/" target="_blank" rel="noopener noreferrer">WCAG 2.1 Guidelines</a> | 
        <a href="https://www.deque.com/axe/" target="_blank" rel="noopener noreferrer">Learn more about axe-core</a>
      </p>
    </footer>
  </div>
</body>
</html>`;
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
      if (error.message && error.message.includes("Executable doesn't exist")) {
        console.error("\n❌ ERROR: Playwright browsers are not installed!");
        console.error("   Please run the following command to install Playwright browsers:");
        console.error("\n   yarn playwright install chromium\n");
        console.error("   This is a one-time setup required for the accessibility audit.");
        process.exit(1);
      }
      throw error;
    }

    const context = await browser.newContext();
    const page = await context.newPage();

    // Viewport configurations
    const viewports = {
      desktop: { width: 1920, height: 1080 },
      mobile: { width: 375, height: 667 }
    };

    // Run audits for both desktop and mobile viewports
    console.log("🔍 Running accessibility audits (desktop and mobile viewports)...");
    const results = [];
    for (const urlPath of urls) {
      // Test desktop viewport
      console.log(`\n📄 Testing page: ${urlPath}`);
      const desktopResult = await auditPage(page, urlPath, 'desktop', viewports.desktop);
      results.push(desktopResult);
      
      // Test mobile viewport
      const mobileResult = await auditPage(page, urlPath, 'mobile', viewports.mobile);
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

    // Also write to .output/public if it exists (for immediate serving)
    const outputPublicPath = join(
      projectRoot,
      ".output",
      "public",
      "documentation",
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
        pagesMap.set(key, { path: key, desktop: null, mobile: null, allViolations: [] });
      }
      const pageData = pagesMap.get(key);
      if (result.viewport === 'desktop') {
        pageData.desktop = result;
      } else if (result.viewport === 'mobile') {
        pageData.mobile = result;
      }
      pageData.allViolations.push(...result.violations);
    });

    const pages = Array.from(pagesMap.values());
    const totalPages = pages.length;
    const passedPages = pages.filter((p) => 
      p.desktop?.passed && p.mobile?.passed
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
    console.log(`📊 Total Pages: ${totalPages} (tested in desktop and mobile viewports)`);
    console.log(`✅ Pages Passing (both viewports): ${passedPages}`);
    console.log(`❌ Pages with Issues: ${failedPages}`);
    console.log(`⚠️  Total Violations: ${totalViolations}`);
    console.log("");

    if (failedPages === 0) {
      console.log("✅ All pages pass WCAG 2.1 AA compliance in both desktop and mobile viewports!");
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
