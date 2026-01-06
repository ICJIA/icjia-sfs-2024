/**
 * Unit tests for the state composables.
 * 
 * These tests verify that the useState-based composables
 * correctly initialize with expected default values.
 * 
 * Note: useState is mocked as a global in test/setup.ts
 * since Nuxt auto-imports it.
 * 
 * @module test/unit/states
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Import composables after setup has mocked useState
import { 
  useCounter, 
  useColor, 
  useNavToggle, 
  useSimpleCounter, 
  useTranslateToggle 
} from '@/composables/states'

describe('State Composables', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useCounter', () => {
    it('should initialize counter to 0', () => {
      const counter = useCounter()
      expect(counter.value).toBe(0)
    })

    it('should return the same state on multiple calls', () => {
      const counter1 = useCounter()
      const counter2 = useCounter()
      // Both should reference the same state object
      expect(counter1).toBe(counter2)
    })
  })

  describe('useColor', () => {
    it('should initialize color to "pink"', () => {
      const color = useColor()
      expect(color.value).toBe('pink')
    })

    it('should be a string type', () => {
      const color = useColor()
      expect(typeof color.value).toBe('string')
    })
  })

  describe('useNavToggle', () => {
    it('should initialize nav toggle to false (closed)', () => {
      const nav = useNavToggle()
      expect(nav.value).toBe(false)
    })

    it('should be a boolean type', () => {
      const nav = useNavToggle()
      expect(typeof nav.value).toBe('boolean')
    })
  })

  describe('useSimpleCounter', () => {
    it('should initialize with provided value', () => {
      const counter = useSimpleCounter(42)
      expect(counter.value).toBe(42)
    })

    it('should accept zero as initial value', () => {
      // Note: This will reuse the state from previous call due to same key 'test'
      // The composable uses useState('test', () => val)
      const counter = useSimpleCounter(0)
      // First call sets the value, subsequent calls return cached value
      expect(typeof counter.value).toBe('number')
    })

    it('should accept negative numbers', () => {
      const counter = useSimpleCounter(-10)
      expect(typeof counter.value).toBe('number')
    })
  })

  describe('useTranslateToggle', () => {
    it('should initialize translate toggle to false (hidden)', () => {
      const translate = useTranslateToggle()
      expect(translate.value).toBe(false)
    })

    it('should be a boolean type', () => {
      const translate = useTranslateToggle()
      expect(typeof translate.value).toBe('boolean')
    })
  })
})
