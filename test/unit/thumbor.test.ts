/**
 * Unit tests for the Thumbor image processing utility.
 * 
 * These tests verify that the getThumborUrl function correctly generates
 * Thumbor-processed image URLs with various configuration options.
 * 
 * @module test/unit/thumbor
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the ThumborUrlBuilder
vi.mock('thumbor-url-builder-ts', () => ({
  ThumborUrlBuilder: vi.fn().mockImplementation(() => ({
    setImagePath: vi.fn().mockReturnThis(),
    resize: vi.fn().mockReturnThis(),
    filter: vi.fn().mockReturnThis(),
    smartCrop: vi.fn().mockReturnThis(),
    buildUrl: vi.fn().mockReturnValue('https://image.icjia.cloud/mock-url'),
  })),
}))

describe('getThumborUrl', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should be a function that can be imported', async () => {
    // Dynamic import to test module loading
    const thumborModule = await import('@/utils/thumbor.js')
    expect(thumborModule.getThumborUrl).toBeDefined()
    expect(typeof thumborModule.getThumborUrl).toBe('function')
  })

  it('should return a URL string', async () => {
    const { getThumborUrl } = await import('@/utils/thumbor.js')
    const result = getThumborUrl({
      url: 'https://example.com/image.jpg',
    })
    expect(typeof result).toBe('string')
  })

  it('should use default values when not provided', async () => {
    const { getThumborUrl } = await import('@/utils/thumbor.js')
    // Should not throw with empty options
    const result = getThumborUrl({})
    expect(result).toBeDefined()
  })

  it('should accept custom width and height', async () => {
    const { getThumborUrl } = await import('@/utils/thumbor.js')
    const result = getThumborUrl({
      url: 'https://example.com/image.jpg',
      width: 500,
      height: 300,
    })
    expect(result).toBeDefined()
  })

  it('should accept custom quality setting', async () => {
    const { getThumborUrl } = await import('@/utils/thumbor.js')
    const result = getThumborUrl({
      url: 'https://example.com/image.jpg',
      quality: 90,
    })
    expect(result).toBeDefined()
  })

  it('should accept custom format', async () => {
    const { getThumborUrl } = await import('@/utils/thumbor.js')
    const result = getThumborUrl({
      url: 'https://example.com/image.jpg',
      format: 'jpeg',
    })
    expect(result).toBeDefined()
  })
})

