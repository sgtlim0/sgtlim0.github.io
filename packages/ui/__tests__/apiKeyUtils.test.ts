import { describe, it, expect } from 'vitest'
import {
  maskAPIKey,
  validateAPIKey,
  generateAPIKey,
  calculateRateLimit,
  estimateTokens,
  calculateCost,
} from '../src/llm-router/services/apiKeyUtils'

describe('apiKeyUtils', () => {
  describe('maskAPIKey', () => {
    it('masks the middle of a key with default showChars', () => {
      const key = 'sk-proj-abcdefghijklmnopqrstuvwxyz1234567890'
      const masked = maskAPIKey(key)
      expect(masked).toMatch(/^sk-proj/)
      expect(masked).toMatch(/7890$/)
      expect(masked).toContain('...')
    })

    it('uses configurable showChars', () => {
      const key = 'sk-proj-abcdefghijklmnopqrstuvwxyz1234567890'
      const masked4 = maskAPIKey(key, 4)
      expect(masked4.startsWith('sk-p')).toBe(true)
      expect(masked4.endsWith('7890')).toBe(true)
      expect(masked4).toContain('...')
    })

    it('returns short keys unchanged when below threshold', () => {
      const shortKey = 'sk-abc'
      const result = maskAPIKey(shortKey)
      // Short key (length <= showChars + 4) should be returned as-is
      expect(result).toBe(shortKey)
    })
  })

  describe('validateAPIKey', () => {
    it('validates a correct API key', () => {
      const result = validateAPIKey('sk-proj-abcdefghijklmnop1234')
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('rejects key without sk- prefix', () => {
      const result = validateAPIKey('pk-proj-abcdefghijklmnop1234')
      expect(result.valid).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('rejects key that is too short', () => {
      const result = validateAPIKey('sk-short')
      expect(result.valid).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('rejects key with invalid characters', () => {
      const result = validateAPIKey('sk-proj-abcdefghijklmnop!@#$')
      expect(result.valid).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('generateAPIKey', () => {
    it('generates a key with default prefix', () => {
      const key = generateAPIKey()
      expect(key).toMatch(/^sk-proj-/)
    })

    it('generates a key with custom prefix', () => {
      const key = generateAPIKey('sk-test-')
      expect(key).toMatch(/^sk-test-/)
    })

    it('generates a key of consistent length', () => {
      const key = generateAPIKey()
      // prefix (8) + random part (48) = 56
      expect(key.length).toBe(56)
    })

    it('generates unique keys each call', () => {
      const key1 = generateAPIKey()
      const key2 = generateAPIKey()
      expect(key1).not.toBe(key2)
    })
  })

  describe('calculateRateLimit', () => {
    it('calculates remaining for normal usage', () => {
      const result = calculateRateLimit(30, 100)
      expect(result.remaining).toBe(70)
      expect(result.percentage).toBe(30)
      expect(result.isLimited).toBe(false)
    })

    it('returns zero remaining at limit', () => {
      const result = calculateRateLimit(100, 100)
      expect(result.remaining).toBe(0)
      expect(result.percentage).toBe(100)
      expect(result.isLimited).toBe(true)
    })

    it('handles over limit', () => {
      const result = calculateRateLimit(150, 100)
      expect(result.remaining).toBe(0)
      expect(result.percentage).toBe(100)
      expect(result.isLimited).toBe(true)
    })

    it('handles zero usage', () => {
      const result = calculateRateLimit(0, 100)
      expect(result.remaining).toBe(100)
      expect(result.percentage).toBe(0)
      expect(result.isLimited).toBe(false)
    })
  })

  describe('estimateTokens', () => {
    it('estimates English text (~4 chars per token)', () => {
      // 20 English chars → ~5 tokens
      const tokens = estimateTokens('Hello, this is a tes')
      expect(tokens).toBeGreaterThanOrEqual(4)
      expect(tokens).toBeLessThanOrEqual(8)
    })

    it('estimates Korean text (~2 chars per token)', () => {
      // 10 Korean chars → ~5 tokens
      const tokens = estimateTokens('안녕하세요반갑습니다')
      expect(tokens).toBeGreaterThanOrEqual(4)
      expect(tokens).toBeLessThanOrEqual(8)
    })

    it('estimates mixed text', () => {
      const tokens = estimateTokens('Hello 안녕하세요')
      expect(tokens).toBeGreaterThan(0)
    })

    it('returns 0 for empty string', () => {
      expect(estimateTokens('')).toBe(0)
    })
  })

  describe('calculateCost', () => {
    it('calculates basic cost', () => {
      // 1M input tokens at 3300 KRW + 1M output tokens at 13200 KRW
      const result = calculateCost(1_000_000, 1_000_000, 3300, 13200)
      expect(result.inputCost).toBe(3300)
      expect(result.outputCost).toBe(13200)
      expect(result.totalCost).toBe(16500)
    })

    it('returns zero for zero tokens', () => {
      const result = calculateCost(0, 0, 3300, 13200)
      expect(result.inputCost).toBe(0)
      expect(result.outputCost).toBe(0)
      expect(result.totalCost).toBe(0)
    })

    it('calculates with real pricing example', () => {
      // GPT-4o: input 3300/1M, output 13200/1M
      // 10000 input tokens, 5000 output tokens
      const result = calculateCost(10000, 5000, 3300, 13200)
      // (10000/1M)*3300 = 0.033
      // (5000/1M)*13200 = 0.066
      expect(result.inputCost).toBeGreaterThan(0)
      expect(result.outputCost).toBeGreaterThan(0)
      expect(result.totalCost).toBeCloseTo(result.inputCost + result.outputCost, 2)
    })
  })
})
