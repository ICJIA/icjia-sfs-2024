/**
 * Comprehensive Accessibility Audit Script for ICJIA SFS 2024
 *
 * This script uses axe-core with Playwright to test all pages for WCAG 2.1 Level AA compliance.
 * It generates detailed reports categorized by severity and provides actionable recommendations.
 *
 * Usage: node accessibility-audit.mjs
 */

import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import fs from "fs";
import path from "path";

// Configuration
const BASE_URL = "http://localhost:8000";
const OUTPUT_DIR = "./accessibility-reports";

// All pages to test
const PAGES_TO_TEST = [
  { path: "/", name: "Home" },
  { path: "/about", name: "About" },
  { path: "/program-summary", name: "Program Summary" },
  { path: "/research", name: "Research" },
  { path: "/sites", name: "Sites" },
  { path: "/resources", name: "Resources" },
  { path: "/childhood-exposure", name: "Childhood Exposure" },
  { path: "/privacy", name: "Privacy" },
];

// Severity categories for reporting
const SEVERITY_LEVELS = {
  critical: { label: "Critical", color: "\x1b[31m" }, // Red
  serious: { label: "Serious", color: "\x1b[33m" }, // Yellow
  moderate: { label: "Moderate", color: "\x1b[36m" }, // Cyan
  minor: { label: "Minor", color: "\x1b[37m" }, // White
};

const RESET_COLOR = "\x1b[0m";

/**
 * Categorize violations by severity
 */
function categorizeViolations(violations) {
  return {
    critical: violations.filter((v) => v.impact === "critical"),
    serious: violations.filter((v) => v.impact === "serious"),
    moderate: violations.filter((v) => v.impact === "moderate"),
    minor: violations.filter((v) => v.impact === "minor"),
  };
}

/**
 * Format violation for console output
 */
function formatViolation(violation, index) {
  const wcagTags = violation.tags
    .filter((tag) => tag.startsWith("wcag"))
    .join(", ");

  return `
  ${index + 1}. ${violation.help}
     Impact: ${violation.impact}
     WCAG: ${wcagTags || "N/A"}
     Description: ${violation.description}
     Affected Elements: ${violation.nodes.length}
     Help URL: ${violation.helpUrl}
     
     Example Element:
     ${violation.nodes[0]?.html || "N/A"}
     
     How to Fix:
     ${violation.nodes[0]?.failureSummary || "See help URL for details"}
  `;
}

/**
 * Generate summary statistics
 */
function generateSummary(allResults) {
  const summary = {
    totalPages: allResults.length,
    totalViolations: 0,
    bySeverity: { critical: 0, serious: 0, moderate: 0, minor: 0 },
    byWCAG: {},
    commonIssues: {},
  };

  allResults.forEach((result) => {
    summary.totalViolations += result.violations.length;

    result.violations.forEach((violation) => {
      // Count by severity
      if (violation.impact) {
        summary.bySeverity[violation.impact] =
          (summary.bySeverity[violation.impact] || 0) + 1;
      }

      // Count by WCAG criterion
      violation.tags
        .filter((tag) => tag.startsWith("wcag"))
        .forEach((tag) => {
          summary.byWCAG[tag] = (summary.byWCAG[tag] || 0) + 1;
        });

      // Track common issues
      const issueKey = violation.id;
      if (!summary.commonIssues[issueKey]) {
        summary.commonIssues[issueKey] = {
          description: violation.help,
          count: 0,
          impact: violation.impact,
          wcag: violation.tags.filter((tag) => tag.startsWith("wcag")),
        };
      }
      summary.commonIssues[issueKey].count += violation.nodes.length;
    });
  });

  return summary;
}

/**
 * Print summary to console
 */
function printSummary(summary, auditTimestamp) {
  console.log("\n" + "=".repeat(80));
  console.log("ACCESSIBILITY AUDIT SUMMARY");
  console.log("=".repeat(80));

  console.log(`\nAudit Date: ${auditTimestamp}`);
  console.log(`Total Pages Tested: ${summary.totalPages}`);
  console.log(`Total Violations Found: ${summary.totalViolations}`);

  console.log("\n--- Violations by Severity ---");
  Object.entries(summary.bySeverity).forEach(([severity, count]) => {
    if (count > 0) {
      const color = SEVERITY_LEVELS[severity]?.color || "";
      console.log(`${color}${severity.toUpperCase()}: ${count}${RESET_COLOR}`);
    }
  });

  console.log("\n--- Top 10 Most Common Issues ---");
  const sortedIssues = Object.entries(summary.commonIssues)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10);

  sortedIssues.forEach(([id, issue], index) => {
    const color = SEVERITY_LEVELS[issue.impact]?.color || "";
    console.log(
      `${index + 1}. ${color}[${issue.impact.toUpperCase()}]${RESET_COLOR} ${
        issue.description
      }`
    );
    console.log(`   Occurrences: ${issue.count}`);
    console.log(`   WCAG: ${issue.wcag.join(", ")}`);
  });

  console.log("\n" + "=".repeat(80));
}

/**
 * Main audit function
 */
async function runAccessibilityAudit() {
  const auditDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
  const auditTimestamp = new Date().toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });

  console.log("Starting Comprehensive Accessibility Audit...\n");
  console.log(`Audit Date: ${auditTimestamp}`);
  console.log(
    `Testing ${PAGES_TO_TEST.length} pages for WCAG 2.1 Level AA compliance\n`
  );

  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const allResults = [];

  for (const pageInfo of PAGES_TO_TEST) {
    const url = `${BASE_URL}${pageInfo.path}`;
    console.log(`\nTesting: ${pageInfo.name} (${url})`);

    try {
      await page.goto(url, { waitUntil: "networkidle" });

      // Wait a bit for dynamic content to load
      await page.waitForTimeout(2000);

      // Run axe-core with WCAG 2.1 Level AA rules
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();

      const categorized = categorizeViolations(
        accessibilityScanResults.violations
      );

      console.log(`  ✓ Scan complete`);
      console.log(`    Critical: ${categorized.critical.length}`);
      console.log(`    Serious: ${categorized.serious.length}`);
      console.log(`    Moderate: ${categorized.moderate.length}`);
      console.log(`    Minor: ${categorized.minor.length}`);

      allResults.push({
        page: pageInfo.name,
        path: pageInfo.path,
        url: url,
        timestamp: new Date().toISOString(),
        violations: accessibilityScanResults.violations,
        passes: accessibilityScanResults.passes.length,
        incomplete: accessibilityScanResults.incomplete.length,
        categorized: categorized,
      });

      // Save individual page report
      const pageReportPath = path.join(
        OUTPUT_DIR,
        `${pageInfo.name.toLowerCase().replace(/\s+/g, "-")}-report.json`
      );
      fs.writeFileSync(
        pageReportPath,
        JSON.stringify(accessibilityScanResults, null, 2)
      );
    } catch (error) {
      console.error(`  ✗ Error testing ${pageInfo.name}:`, error.message);
    }
  }

  await browser.close();

  // Generate and save comprehensive report
  const summary = generateSummary(allResults);

  const comprehensiveReport = {
    auditDate: auditDate,
    auditTimestamp: auditTimestamp,
    timestamp: new Date().toISOString(),
    summary: summary,
    results: allResults,
  };

  const reportPath = path.join(OUTPUT_DIR, "comprehensive-audit-report.json");
  fs.writeFileSync(reportPath, JSON.stringify(comprehensiveReport, null, 2));

  // Print summary to console
  printSummary(summary, auditTimestamp);

  // Generate detailed console report for critical and serious issues
  console.log("\n\n" + "=".repeat(80));
  console.log("DETAILED CRITICAL AND SERIOUS ISSUES");
  console.log("=".repeat(80));

  allResults.forEach((result) => {
    const criticalAndSerious = [
      ...result.categorized.critical,
      ...result.categorized.serious,
    ];

    if (criticalAndSerious.length > 0) {
      console.log(
        `\n\n${SEVERITY_LEVELS.critical.color}PAGE: ${result.page}${RESET_COLOR}`
      );
      console.log(`URL: ${result.url}`);
      console.log("-".repeat(80));

      criticalAndSerious.forEach((violation, index) => {
        const color = SEVERITY_LEVELS[violation.impact]?.color || "";
        console.log(
          `${color}${formatViolation(violation, index)}${RESET_COLOR}`
        );
      });
    }
  });

  console.log("\n\n" + "=".repeat(80));
  console.log(`Full reports saved to: ${OUTPUT_DIR}/`);
  console.log("=".repeat(80) + "\n");

  return comprehensiveReport;
}

// Run the audit
runAccessibilityAudit()
  .then(() => {
    console.log("\nAccessibility audit completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\nAudit failed:", error);
    process.exit(1);
  });
