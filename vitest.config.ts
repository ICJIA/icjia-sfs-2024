/**
 * Vitest configuration for ICJIA Safe From the Start application.
 * 
 * Configures unit testing environment with Vue support and Nuxt integration.
 * Tests are organized into unit tests (pure functions) and nuxt tests (composables, components).
 * 
 * @see https://vitest.dev/config/
 * @see https://nuxt.com/docs/getting-started/testing
 */

import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  
  test: {
    // Enable globals for describe, it, expect without imports
    globals: true,
    
    // Use happy-dom for DOM testing (faster than jsdom)
    environment: 'happy-dom',
    
    // Include test files from test directory
    include: [
      'test/**/*.test.ts',
      'test/**/*.spec.ts',
    ],
    
    // Exclude node_modules and dist
    exclude: [
      'node_modules',
      'dist',
      '.output',
      '.nuxt',
    ],
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules',
        'test',
        '**/*.d.ts',
        '**/*.config.*',
        '.nuxt',
        '.output',
      ],
    },
    
    // Reporter configuration
    reporters: ['verbose', 'json'],
    outputFile: {
      json: './test-results.json',
    },
    
    // Setup files for test environment
    setupFiles: ['./test/setup.ts'],
    
    // Timeout for async tests
    testTimeout: 10000,
  },
  
  resolve: {
    alias: {
      '@': resolve(__dirname, './app'),
      '~': resolve(__dirname, './'),
      '#app': resolve(__dirname, './node_modules/nuxt/dist/app'),
    },
  },
})

