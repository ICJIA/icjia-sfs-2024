#!/usr/bin/env node
/**
 * @fileoverview Comprehensive test runner with HTML report generation
 * @description Runs all tests (unit and nuxt environment) and generates an HTML report
 * at /public/docs/tests/index.html with detailed results and test descriptions.
 * 
 * Based on: https://github.com/ICJIA/icjia-accessibility-portal/blob/main/test/run-all-tests.js
 * 
 * @author ICJIA
 */

import { spawn } from 'child_process'
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')

/**
 * Test descriptions mapping test names to human-readable explanations.
 * These appear in expandable dropdowns in the HTML report.
 */
const TEST_DESCRIPTIONS = {
  // Thumbor utility tests
  'should be a function that can be imported': 
    'Verifies the getThumborUrl function is properly exported from the thumbor utility module and can be imported by other modules.',
  'should return a URL string': 
    'Confirms that getThumborUrl returns a string URL that can be used in image src attributes.',
  'should use default values when not provided': 
    'Tests that the function works with an empty options object, using sensible defaults for all parameters.',
  'should accept custom width and height': 
    'Verifies custom dimensions can be specified for responsive image generation.',
  'should accept custom quality setting': 
    'Tests that image quality can be customized for different use cases (thumbnails vs. hero images).',
  'should accept custom format': 
    'Confirms support for different image formats like WebP, JPEG, PNG.',
  
  // State composable tests
  'should initialize counter to 0': 
    'Verifies useCounter starts at 0 for consistent initial state across the application.',
  'should return the same state on multiple calls': 
    'Confirms that calling useCounter multiple times returns the same reactive reference (singleton pattern).',
  'should initialize color to "pink"': 
    'Tests the default theme color value used for UI customization.',
  'should be a string type': 
    'Type checking to ensure color state holds string values for CSS compatibility.',
  'should initialize nav toggle to false (closed)': 
    'Confirms mobile navigation starts in closed state for proper UX on page load.',
  'should be a boolean type': 
    'Type checking for boolean toggle states used in conditional rendering.',
  'should initialize with provided value': 
    'Tests that useSimpleCounter accepts and uses the initial value parameter.',
  'should accept zero as initial value': 
    'Edge case testing: zero should be a valid initial value, not treated as falsy.',
  'should accept negative numbers': 
    'Edge case testing: negative numbers should work for counting down scenarios.',
  'should initialize translate toggle to false (hidden)': 
    'Confirms translation modal starts hidden for unobtrusive language selection.',
}

/**
 * Run vitest and capture output
 * @returns {Promise<{passed: boolean, output: string, results: Object|null}>}
 */
async function runVitestTests() {
  return new Promise((resolve) => {
    const args = ['vitest', 'run', '--reporter=json', '--reporter=verbose']
    const proc = spawn('npx', args, {
      cwd: projectRoot,
      shell: true,
      env: { ...process.env, FORCE_COLOR: '0' },
    })

    let stdout = ''
    let stderr = ''

    proc.stdout.on('data', (data) => {
      stdout += data.toString()
      process.stdout.write(data)
    })

    proc.stderr.on('data', (data) => {
      stderr += data.toString()
      process.stderr.write(data)
    })

    proc.on('close', (code) => {
      // Try to parse JSON results
      let results = null
      try {
        const jsonPath = join(projectRoot, 'test-results.json')
        if (existsSync(jsonPath)) {
          results = JSON.parse(readFileSync(jsonPath, 'utf-8'))
        }
      } catch (e) {
        console.warn('Could not parse test results JSON:', e.message)
      }

      resolve({
        passed: code === 0,
        output: stdout + stderr,
        results,
        exitCode: code,
      })
    })
  })
}

/**
 * Escape HTML special characters
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
function escapeHtml(str) {
  if (!str) return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/**
 * Generate HTML report from test results
 * @param {Object} results - Vitest results object
 * @param {Date} reportDate - Date when report was generated
 * @returns {string} HTML content
 */
function generateHTMLReport(results, reportDate) {
  const reportTimestamp = reportDate.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short',
  })

  // Parse results
  const testFiles = results?.testResults || []
  let totalTests = 0
  let passedTests = 0
  let failedTests = 0
  let skippedTests = 0
  let totalDuration = 0

  const fileResults = testFiles.map((file) => {
    const fileName = file.name?.replace(projectRoot, '') || 'Unknown file'
    const assertions = file.assertionResults || []
    
    let filePassed = 0
    let fileFailed = 0
    let fileSkipped = 0
    
    assertions.forEach((test) => {
      totalTests++
      if (test.status === 'passed') {
        passedTests++
        filePassed++
      } else if (test.status === 'failed') {
        failedTests++
        fileFailed++
      } else {
        skippedTests++
        fileSkipped++
      }
    })

    totalDuration += file.endTime - file.startTime || 0

    return {
      fileName,
      assertions,
      passed: filePassed,
      failed: fileFailed,
      skipped: fileSkipped,
      duration: file.endTime - file.startTime || 0,
    }
  })

  const allPassed = failedTests === 0

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Test Results - ${reportTimestamp}</title>
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
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
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

    .stat-card .label {
      color: #7f8c8d;
      margin-top: 5px;
    }

    .file-section {
      margin: 30px 0;
      padding: 20px;
      background: var(--light);
      border-radius: 5px;
      border-left: 4px solid var(--info);
    }

    .file-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }

    .file-header h3 {
      color: var(--primary);
      font-family: 'Courier New', monospace;
      font-size: 0.95rem;
    }

    .file-stats {
      display: flex;
      gap: 15px;
      font-size: 0.9rem;
    }

    .test-case {
      background: white;
      padding: 15px;
      margin: 10px 0;
      border-radius: 5px;
      border-left: 4px solid var(--success);
    }

    .test-case.failed {
      border-left-color: var(--danger);
    }

    .test-case.skipped {
      border-left-color: var(--warning);
      opacity: 0.7;
    }

    .test-case-title {
      font-weight: bold;
      color: var(--primary);
      margin-bottom: 5px;
    }

    .test-case-duration {
      font-size: 0.85rem;
      color: #7f8c8d;
    }

    .test-case-description {
      margin-top: 10px;
    }

    .test-case-description summary {
      font-size: 0.85rem;
      color: var(--info);
      cursor: pointer;
      user-select: none;
    }

    .test-case-description summary:hover {
      text-decoration: underline;
    }

    .test-case-description .description-content {
      margin-top: 10px;
      padding: 15px;
      background: #e7f3ff;
      border-left: 3px solid var(--info);
      border-radius: 4px;
      font-size: 0.9rem;
      color: #1976D2;
      line-height: 1.5;
    }

    .error-message {
      margin-top: 10px;
      padding: 10px;
      background: #f8d7da;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      font-size: 0.85rem;
      color: #721c24;
      white-space: pre-wrap;
      word-break: break-word;
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
      .file-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🧪 Test Results</h1>
    
    <div class="metadata">
      <p><strong>Test Date & Time:</strong> ${reportTimestamp}</p>
      <p><strong>Test Framework:</strong> Vitest</p>
      <p><strong>Total Duration:</strong> ${(totalDuration / 1000).toFixed(2)}s</p>
      <p><strong>Test Files:</strong> ${fileResults.length}</p>
    </div>
    
    <h2>Summary</h2>
    
    <div class="stats-grid">
      <div class="stat-card">
        <div class="number">${totalTests}</div>
        <div class="label">Total Tests</div>
      </div>
      <div class="stat-card success">
        <div class="number">${passedTests}</div>
        <div class="label">Passed</div>
      </div>
      <div class="stat-card ${failedTests > 0 ? 'danger' : 'success'}">
        <div class="number">${failedTests}</div>
        <div class="label">Failed</div>
      </div>
      <div class="stat-card">
        <div class="number">${skippedTests}</div>
        <div class="label">Skipped</div>
      </div>
    </div>
    
    ${allPassed ? `
    <div class="info-box" style="background: #d4edda; border-color: #28a745;">
      <h3 style="color: #155724;">✅ All Tests Passed!</h3>
      <p style="color: #155724;">All ${totalTests} tests completed successfully.</p>
    </div>
    ` : `
    <div class="info-box" style="background: #f8d7da; border-color: #dc3545;">
      <h3 style="color: #721c24;">❌ Some Tests Failed</h3>
      <p style="color: #721c24;">${failedTests} of ${totalTests} tests failed. Review the details below.</p>
    </div>
    `}
    
    <h2>Detailed Results</h2>
    
    ${fileResults.map((file) => `
    <div class="file-section">
      <div class="file-header">
        <h3>${escapeHtml(file.fileName)}</h3>
        <div class="file-stats">
          <span>✅ ${file.passed}</span>
          <span>❌ ${file.failed}</span>
          <span>⏱️ ${(file.duration / 1000).toFixed(2)}s</span>
        </div>
      </div>
      
      ${file.assertions.map((test) => {
        const title = test.title || test.fullName || 'Unknown test'
        const caseStatus = test.status || 'unknown'
        const caseClass = caseStatus === 'passed' ? '' : caseStatus === 'failed' ? 'failed' : 'skipped'
        const statusIcon = caseStatus === 'passed' ? '✅' : caseStatus === 'failed' ? '❌' : '⚠️'
        const duration = test.duration ? `${test.duration}ms` : 'N/A'
        
        // Look up description for this test
        const description = TEST_DESCRIPTIONS[title] || null
        const descriptionHTML = description ? `
          <details class="test-case-description">
            <summary>What does this test verify?</summary>
            <div class="description-content">
              <p>${escapeHtml(description)}</p>
            </div>
          </details>
        ` : ''
        
        // Error message for failed tests
        const errorHTML = test.failureMessages?.length > 0 ? `
          <div class="error-message">${escapeHtml(test.failureMessages.join('\n'))}</div>
        ` : ''
        
        return `
        <div class="test-case ${caseClass}">
          <div class="test-case-title">${statusIcon} ${escapeHtml(title)}</div>
          <div class="test-case-duration">Duration: ${duration}</div>
          ${descriptionHTML}
          ${errorHTML}
        </div>
        `
      }).join('')}
    </div>
    `).join('')}
    
    <div class="info-box">
      <h3>About This Report</h3>
      <p>This report is automatically generated by running the test suite. Each test case includes:</p>
      <ul style="margin: 10px 0 0 20px;">
        <li><strong>Test title:</strong> The name of the test as defined in the test file</li>
        <li><strong>Duration:</strong> How long the test took to execute</li>
        <li><strong>Description:</strong> An expandable explanation of what the test verifies</li>
        <li><strong>Error details:</strong> For failed tests, the full error message</li>
      </ul>
    </div>
    
    <footer>
      <p>Generated by <strong>Vitest</strong> test framework</p>
      <p style="margin-top: 10px;">
        <a href="/docs/">← Back to Documentation Portal</a> | 
        <a href="https://vitest.dev/" target="_blank" rel="noopener noreferrer">Vitest Documentation</a>
      </p>
    </footer>
  </div>
</body>
</html>`
}

/**
 * Main function
 */
async function main() {
  console.log('')
  console.log('┌' + '─'.repeat(60) + '┐')
  console.log('│' + ' '.repeat(15) + 'RUNNING ALL TESTS' + ' '.repeat(27) + '│')
  console.log('└' + '─'.repeat(60) + '┘')
  console.log('')

  const startTime = Date.now()
  
  // Run tests
  console.log('🧪 Running Vitest tests...\n')
  const testResults = await runVitestTests()
  
  const duration = Date.now() - startTime
  
  // Generate HTML report
  console.log('\n📝 Generating HTML report...')
  const reportDate = new Date()
  
  const outputDir = join(projectRoot, 'public', 'docs', 'tests')
  const outputPath = join(outputDir, 'index.html')
  
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true })
  }
  
  if (testResults.results) {
    const htmlReport = generateHTMLReport(testResults.results, reportDate)
    writeFileSync(outputPath, htmlReport, 'utf-8')
    console.log(`✓ Report generated: ${outputPath}`)
  } else {
    console.log('⚠️ Could not generate HTML report - no test results available')
  }
  
  // Summary
  console.log('')
  console.log('┌' + '─'.repeat(60) + '┐')
  console.log('│' + ' '.repeat(23) + 'SUMMARY' + ' '.repeat(29) + '│')
  console.log('└' + '─'.repeat(60) + '┘')
  console.log(`⏱️  Total Duration: ${(duration / 1000).toFixed(2)}s`)
  console.log(`${testResults.passed ? '✅' : '❌'} Tests: ${testResults.passed ? 'PASSED' : 'FAILED'}`)
  console.log(`📄 Report: ${outputPath}`)
  console.log('')
  
  process.exit(testResults.passed ? 0 : 1)
}

main()


