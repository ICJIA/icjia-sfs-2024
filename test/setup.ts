/**
 * Vitest test setup file.
 * Runs before each test file to set up the testing environment.
 * 
 * @module test/setup
 */

import { vi } from 'vitest'

// Mock Nuxt's useState as a global function (Nuxt auto-imports this)
const stateStore = new Map<string, { value: any }>()

// @ts-ignore - We're mocking a global
globalThis.useState = vi.fn((key: string, init: () => any) => {
  if (!stateStore.has(key)) {
    stateStore.set(key, { value: init() })
  }
  return stateStore.get(key)!
})

// Mock import.meta.env for Vite environment variables
vi.stubGlobal('import.meta', {
  env: {
    VITE_THUMBOR_KEY: 'test-thumbor-key',
    MODE: 'test',
    DEV: true,
    PROD: false,
  },
})

// Global test utilities
beforeAll(() => {
  // Setup code that runs once before all tests
})

afterAll(() => {
  // Cleanup code that runs once after all tests
})

beforeEach(() => {
  // Setup code that runs before each test
  vi.clearAllMocks()
  stateStore.clear() // Clear state between tests
})

afterEach(() => {
  // Cleanup code that runs after each test
})
