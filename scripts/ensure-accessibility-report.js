#!/usr/bin/env node
/**
 * @fileoverview Ensures accessibility report placeholder exists
 * @description Creates a placeholder HTML file at /public/docs/accessibility/index.html
 * if one doesn't exist, preventing 404 errors during development and initial builds.
 * 
 * This script runs as part of the build pipeline (predev, prebuild, pregenerate)
 * to guarantee the documentation portal is always accessible.
 * 
 * @author ICJIA
 * @see https://github.com/ICJIA/icjia-accessibility-portal/blob/main/scripts/ensure-accessibility-report.js
 */

import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

/**
 * Paths for documentation files
 */
const PATHS = {
  accessibilityDir: join(projectRoot, 'public', 'docs', 'accessibility'),
  accessibilityReport: join(projectRoot, 'public', 'docs', 'accessibility', 'index.html'),
  testsDir: join(projectRoot, 'public', 'docs', 'tests'),
  testsReport: join(projectRoot, 'public', 'docs', 'tests', 'index.html'),
  docsIndex: join(projectRoot, 'public', 'docs', 'index.html'),
};

/**
 * Generate placeholder HTML for accessibility report
 * @returns {string} HTML content
 */
function generateAccessibilityPlaceholder() {
  const timestamp = new Date().toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Accessibility Audit Report - Placeholder</title>
  <style>
    :root {
      --primary: #2c3e50;
      --info: #17a2b8;
      --warning: #ffc107;
      --light: #f8f9fa;
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
      max-width: 800px;
      margin: 0 auto;
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    h1 { color: var(--primary); margin-bottom: 20px; }
    .warning-box {
      background: #fff3cd;
      border-left: 4px solid var(--warning);
      padding: 20px;
      margin: 20px 0;
      border-radius: 5px;
    }
    .info-box {
      background: #e7f3ff;
      border-left: 4px solid var(--info);
      padding: 20px;
      margin: 20px 0;
      border-radius: 5px;
    }
    code {
      background: #f4f4f4;
      padding: 3px 8px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
    }
    pre {
      background: #2d3748;
      color: #e2e8f0;
      padding: 15px;
      border-radius: 5px;
      overflow-x: auto;
      margin: 15px 0;
    }
    footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      color: #7f8c8d;
      font-size: 0.9em;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🔍 Accessibility Audit Report</h1>
    
    <div class="warning-box">
      <h3>⚠️ Placeholder Report</h3>
      <p>This is a placeholder file. The actual accessibility audit report has not been generated yet.</p>
    </div>
    
    <div class="info-box">
      <h3>How to Generate the Report</h3>
      <p>To generate the full accessibility audit report, run the following commands:</p>
      <pre><code># Terminal 1: Start the development server for audits
yarn dev:audit

# Terminal 2: Run the accessibility audit
yarn audit:a11y</code></pre>
      <p style="margin-top: 15px;">The audit will:</p>
      <ul style="margin: 10px 0 0 20px;">
        <li>Test all pages from sitemap.xml</li>
        <li>Check desktop (1920x1080), tablet (768x1024), and mobile (375x667) viewports</li>
        <li>Validate against WCAG 2.1 Level AA standards</li>
        <li>Generate a detailed HTML report at this location</li>
      </ul>
    </div>
    
    <footer>
      <p>Placeholder generated: ${timestamp}</p>
      <p><a href="/docs/">← Back to Documentation Portal</a></p>
    </footer>
  </div>
</body>
</html>`;
}

/**
 * Generate placeholder HTML for test report
 * @returns {string} HTML content
 */
function generateTestsPlaceholder() {
  const timestamp = new Date().toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Test Results - Placeholder</title>
  <style>
    :root {
      --primary: #2c3e50;
      --info: #17a2b8;
      --warning: #ffc107;
      --light: #f8f9fa;
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
      max-width: 800px;
      margin: 0 auto;
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    h1 { color: var(--primary); margin-bottom: 20px; }
    .warning-box {
      background: #fff3cd;
      border-left: 4px solid var(--warning);
      padding: 20px;
      margin: 20px 0;
      border-radius: 5px;
    }
    .info-box {
      background: #e7f3ff;
      border-left: 4px solid var(--info);
      padding: 20px;
      margin: 20px 0;
      border-radius: 5px;
    }
    pre {
      background: #2d3748;
      color: #e2e8f0;
      padding: 15px;
      border-radius: 5px;
      overflow-x: auto;
      margin: 15px 0;
    }
    footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      color: #7f8c8d;
      font-size: 0.9em;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🧪 Test Results</h1>
    
    <div class="warning-box">
      <h3>⚠️ Placeholder Report</h3>
      <p>This is a placeholder file. The actual test results report has not been generated yet.</p>
    </div>
    
    <div class="info-box">
      <h3>How to Generate the Report</h3>
      <p>To generate the full test results report, run:</p>
      <pre><code># Run the complete test suite
yarn test</code></pre>
      <p style="margin-top: 15px;">The test suite will:</p>
      <ul style="margin: 10px 0 0 20px;">
        <li>Run unit tests for utilities and composables</li>
        <li>Run Nuxt environment tests</li>
        <li>Generate an HTML report with detailed results</li>
      </ul>
    </div>
    
    <footer>
      <p>Placeholder generated: ${timestamp}</p>
      <p><a href="/docs/">← Back to Documentation Portal</a></p>
    </footer>
  </div>
</body>
</html>`;
}

/**
 * Main function to ensure all placeholder files exist
 */
function main() {
  console.log('');
  console.log('┌' + '─'.repeat(60) + '┐');
  console.log('│' + ' '.repeat(15) + 'ENSURE DOCUMENTATION PLACEHOLDERS' + ' '.repeat(10) + '│');
  console.log('└' + '─'.repeat(60) + '┘');
  console.log('');

  // Ensure accessibility report directory and placeholder
  if (!existsSync(PATHS.accessibilityDir)) {
    mkdirSync(PATHS.accessibilityDir, { recursive: true });
    console.log('✓ Created directory: public/docs/accessibility/');
  }

  if (!existsSync(PATHS.accessibilityReport)) {
    writeFileSync(PATHS.accessibilityReport, generateAccessibilityPlaceholder(), 'utf-8');
    console.log('✓ Created placeholder: public/docs/accessibility/index.html');
  } else {
    console.log('✓ Accessibility report exists: public/docs/accessibility/index.html');
  }

  // Ensure tests report directory and placeholder
  if (!existsSync(PATHS.testsDir)) {
    mkdirSync(PATHS.testsDir, { recursive: true });
    console.log('✓ Created directory: public/docs/tests/');
  }

  if (!existsSync(PATHS.testsReport)) {
    writeFileSync(PATHS.testsReport, generateTestsPlaceholder(), 'utf-8');
    console.log('✓ Created placeholder: public/docs/tests/index.html');
  } else {
    console.log('✓ Test report exists: public/docs/tests/index.html');
  }

  console.log('');
  console.log('✅ Documentation placeholders ensured successfully!');
  console.log('');
}

main();


