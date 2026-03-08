import { describe, it, expect, beforeEach, vi } from 'vitest'
import { MockLlmRouterService } from '../src/llm-router/services/mockLlmRouterService'
import {
  maskAPIKey,
  validateAPIKey,
  generateAPIKey,
  calculateRateLimit,
  estimateTokens,
  calculateCost,
} from '../src/llm-router/services/apiKeyUtils'
import type { ModelFilterParams } from '../src/llm-router/services/types'

describe('MockLlmRouterService', () => {
  let service: MockLlmRouterService

  beforeEach(() => {
    service = new MockLlmRouterService()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('getModels', () => {
    it('should fetch all models without filters', async () => {
      const promise = service.getModels()
      vi.advanceTimersByTime(300) // Advance past delay
      const result = await promise

      expect(result.data).toBeDefined()
      expect(result.data.length).toBeGreaterThan(0)
      expect(result.total).toBeGreaterThan(0)
      expect(result.page).toBe(1)
      expect(result.pageSize).toBe(20)
    })

    it('should filter models by provider', async () => {
      const params: ModelFilterParams = { provider: 'OpenAI' }
      const promise = service.getModels(params)
      vi.advanceTimersByTime(300)
      const result = await promise

      expect(result.data.every((m) => m.provider === 'OpenAI')).toBe(true)
    })

    it('should filter models by category', async () => {
      const params: ModelFilterParams = { category: 'Chat' }
      const promise = service.getModels(params)
      vi.advanceTimersByTime(300)
      const result = await promise

      expect(result.data.every((m) => m.category === 'Chat')).toBe(true)
    })

    it('should search models by name', async () => {
      const params: ModelFilterParams = { search: 'gpt' }
      const promise = service.getModels(params)
      vi.advanceTimersByTime(300)
      const result = await promise

      expect(
        result.data.every(
          (m) => m.name.toLowerCase().includes('gpt') || m.id.toLowerCase().includes('gpt'),
        ),
      ).toBe(true)
    })

    it('should handle pagination', async () => {
      const params: ModelFilterParams = { page: 2, pageSize: 10 }
      const promise = service.getModels(params)
      vi.advanceTimersByTime(300)
      const result = await promise

      expect(result.page).toBe(2)
      expect(result.pageSize).toBe(10)
      expect(result.data.length).toBeLessThanOrEqual(10)
    })

    it('should handle "기타" provider filter', async () => {
      const params: ModelFilterParams = { provider: '기타' }
      const promise = service.getModels(params)
      vi.advanceTimersByTime(300)
      const result = await promise

      const mainProviders = [
        'OpenAI',
        'Anthropic',
        'Google',
        'Meta',
        'Mistral',
        'Cohere',
        'DeepSeek',
      ]
      expect(result.data.every((m) => !mainProviders.includes(m.provider))).toBe(true)
    })

    it('should handle empty search results', async () => {
      const params: ModelFilterParams = { search: 'nonexistentmodel123' }
      const promise = service.getModels(params)
      vi.advanceTimersByTime(300)
      const result = await promise

      expect(result.data).toEqual([])
      expect(result.total).toBe(0)
    })
  })

  describe('getModelById', () => {
    it('should fetch a model by valid ID', async () => {
      const promise = service.getModelById('gpt-4o')
      vi.advanceTimersByTime(300)
      const result = await promise

      expect(result).not.toBeNull()
      expect(result?.id).toBe('gpt-4o')
      expect(result?.provider).toBe('OpenAI')
    })

    it('should return null for invalid ID', async () => {
      const promise = service.getModelById('invalid-model-id')
      vi.advanceTimersByTime(300)
      const result = await promise

      expect(result).toBeNull()
    })

    it('should handle empty ID', async () => {
      const promise = service.getModelById('')
      vi.advanceTimersByTime(300)
      const result = await promise

      expect(result).toBeNull()
    })
  })

  describe('getDashboardStats', () => {
    it('should fetch dashboard statistics', async () => {
      const promise = service.getDashboardStats()
      vi.advanceTimersByTime(300)
      const result = await promise

      expect(result).toBeDefined()
      expect(result.totalModels).toBeGreaterThan(0)
      expect(result.totalRequests).toBeGreaterThan(0)
      expect(result.totalTokens).toBeGreaterThan(0)
      expect(result.totalCost).toBeGreaterThan(0)
      expect(result.avgLatency).toBeDefined()
      expect(result.avgLatency).toMatch(/^\d+\.\d+초$/)
    })
  })

  describe('getUsageStats', () => {
    it('should fetch usage stats for default 30 days', async () => {
      const promise = service.getUsageStats()
      vi.advanceTimersByTime(300)
      const result = await promise

      expect(result).toBeDefined()
      expect(result.length).toBe(30)
      expect(result[0]).toHaveProperty('date')
      expect(result[0]).toHaveProperty('requests')
      expect(result[0]).toHaveProperty('tokens')
      expect(result[0]).toHaveProperty('cost')
    })

    it('should fetch usage stats for custom days', async () => {
      const promise = service.getUsageStats(7)
      vi.advanceTimersByTime(300)
      const result = await promise

      expect(result.length).toBe(7)
    })

    it('should handle zero days', async () => {
      const promise = service.getUsageStats(0)
      vi.advanceTimersByTime(300)
      const result = await promise

      expect(result).toBeDefined()
      expect(result.length).toBe(0)
    })

    it('should handle negative days', async () => {
      const promise = service.getUsageStats(-5)
      vi.advanceTimersByTime(300)
      const result = await promise

      expect(result).toBeDefined()
      expect(result.length).toBe(0)
    })
  })

  describe('getMonthlyUsage', () => {
    it('should fetch monthly usage data', async () => {
      const promise = service.getMonthlyUsage()
      vi.advanceTimersByTime(300)
      const result = await promise

      expect(result).toBeDefined()
      expect(result.length).toBeGreaterThan(0)
      expect(result[0]).toHaveProperty('month')
      expect(result[0]).toHaveProperty('requests')
      expect(result[0]).toHaveProperty('tokens')
      expect(result[0]).toHaveProperty('cost')
    })
  })

  describe('getModelUsageBreakdown', () => {
    it('should fetch model usage breakdown', async () => {
      const promise = service.getModelUsageBreakdown()
      vi.advanceTimersByTime(300)
      const result = await promise

      expect(result).toBeDefined()
      expect(result.length).toBeGreaterThan(0)
      expect(result[0]).toHaveProperty('model')
      expect(result[0]).toHaveProperty('requests')
      expect(result[0]).toHaveProperty('tokens')
      expect(result[0]).toHaveProperty('cost')
    })
  })

  describe('API Key operations', () => {
    it('should fetch all API keys', async () => {
      const promise = service.getAPIKeys()
      vi.advanceTimersByTime(300)
      const result = await promise

      expect(result).toBeDefined()
      expect(result.length).toBeGreaterThan(0)
      expect(result[0]).toHaveProperty('id')
      expect(result[0]).toHaveProperty('name')
      expect(result[0]).toHaveProperty('key')
      expect(result[0]).toHaveProperty('status')
      expect(result[0]).toHaveProperty('created')
    })

    it('should create a new API key', async () => {
      const promise = service.createAPIKey('Test Key')
      vi.advanceTimersByTime(300)
      const result = await promise

      expect(result).toBeDefined()
      expect(result.name).toBe('Test Key')
      expect(result.status).toBe('active')
      expect(result.key).toMatch(/^sk-proj-/)
    })

    it('should handle empty name when creating key', async () => {
      const promise = service.createAPIKey('')
      vi.advanceTimersByTime(300)
      const result = await promise

      expect(result.name).toBe('')
      expect(result.key).toMatch(/^sk-proj-/)
    })

    it('should revoke an API key', async () => {
      const promise = service.revokeAPIKey('test-id')
      vi.advanceTimersByTime(300)
      await expect(promise).resolves.toBeUndefined()
    })

    it('should handle revoking with empty ID', async () => {
      const promise = service.revokeAPIKey('')
      vi.advanceTimersByTime(300)
      await expect(promise).resolves.toBeUndefined()
    })
  })
})

describe('apiKeyUtils', () => {
  describe('maskAPIKey', () => {
    it('should mask API key showing first 7 and last 4 characters', () => {
      const key = 'sk-proj-abcdefghijklmnopqrstuvwxyz123456'
      const masked = maskAPIKey(key)
      expect(masked).toBe('sk-proj...3456')
    })

    it('should handle custom showChars parameter', () => {
      const key = 'sk-proj-abcdefghijklmnopqrstuvwxyz123456'
      const masked = maskAPIKey(key, 10)
      expect(masked).toBe('sk-proj-ab...3456')
    })

    it('should return full key if too short to mask', () => {
      const key = 'sk-short'
      const masked = maskAPIKey(key)
      expect(masked).toBe('sk-short')
    })

    it('should handle empty string', () => {
      const masked = maskAPIKey('')
      expect(masked).toBe('')
    })
  })

  describe('validateAPIKey', () => {
    it('should validate correct API key format', () => {
      const result = validateAPIKey('sk-proj-abcdefghijklmnopqrstuvwxyz123456')
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should reject key not starting with sk-', () => {
      const result = validateAPIKey('api-key-123456789012345678901234')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('API 키는 "sk-"로 시작해야 합니다')
    })

    it('should reject key that is too short', () => {
      const result = validateAPIKey('sk-short')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('API 키는 20자를 초과해야 합니다')
    })

    it('should reject key with invalid characters', () => {
      const result = validateAPIKey('sk-proj-abc@def#ghi$jkl%mno^pqr')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('허용되지 않는 문자가 포함되어 있습니다')
    })

    it('should handle empty string', () => {
      const result = validateAPIKey('')
      expect(result.valid).toBe(false)
    })
  })

  describe('generateAPIKey', () => {
    it('should generate API key with default prefix', () => {
      const key = generateAPIKey()
      expect(key).toMatch(/^sk-proj-[A-Za-z0-9]{48}$/)
    })

    it('should generate API key with custom prefix', () => {
      const key = generateAPIKey('sk-test-')
      expect(key).toMatch(/^sk-test-[A-Za-z0-9]{48}$/)
    })

    it('should generate unique keys', () => {
      const key1 = generateAPIKey()
      const key2 = generateAPIKey()
      expect(key1).not.toBe(key2)
    })
  })

  describe('calculateRateLimit', () => {
    it('should calculate remaining requests correctly', () => {
      const result = calculateRateLimit(30, 100)
      expect(result.remaining).toBe(70)
      expect(result.percentage).toBe(30)
      expect(result.isLimited).toBe(false)
    })

    it('should handle rate limit reached', () => {
      const result = calculateRateLimit(100, 100)
      expect(result.remaining).toBe(0)
      expect(result.percentage).toBe(100)
      expect(result.isLimited).toBe(true)
    })

    it('should handle exceeded rate limit', () => {
      const result = calculateRateLimit(150, 100)
      expect(result.remaining).toBe(0)
      expect(result.percentage).toBe(100)
      expect(result.isLimited).toBe(true)
    })

    it('should handle zero requests', () => {
      const result = calculateRateLimit(0, 100)
      expect(result.remaining).toBe(100)
      expect(result.percentage).toBe(0)
      expect(result.isLimited).toBe(false)
    })

    it('should handle zero limit', () => {
      const result = calculateRateLimit(10, 0)
      expect(result.remaining).toBe(0)
      expect(result.isLimited).toBe(true)
    })
  })

  describe('estimateTokens', () => {
    it('should estimate tokens for English text', () => {
      const text = 'Hello world'
      const tokens = estimateTokens(text)
      expect(tokens).toBe(3) // 11 * 0.25 = 2.75, ceil = 3
    })

    it('should estimate tokens for Korean text', () => {
      const text = '안녕하세요'
      const tokens = estimateTokens(text)
      expect(tokens).toBe(3) // 5 * 0.5 = 2.5, ceil = 3
    })

    it('should estimate tokens for mixed text', () => {
      const text = 'Hello 안녕'
      const tokens = estimateTokens(text)
      expect(tokens).toBe(3) // (6 * 0.25) + (2 * 0.5) = 2.5, ceil = 3
    })

    it('should handle empty string', () => {
      const tokens = estimateTokens('')
      expect(tokens).toBe(0)
    })

    it('should handle special characters', () => {
      const text = '!@#$%^&*()'
      const tokens = estimateTokens(text)
      expect(tokens).toBe(3) // 10 * 0.25 = 2.5, ceil = 3
    })
  })

  describe('calculateCost', () => {
    it('should calculate cost correctly', () => {
      const result = calculateCost(1000000, 500000, 1500, 3000)
      expect(result.inputCost).toBe(1500)
      expect(result.outputCost).toBe(1500)
      expect(result.totalCost).toBe(3000)
    })

    it('should handle zero tokens', () => {
      const result = calculateCost(0, 0, 1500, 3000)
      expect(result.inputCost).toBe(0)
      expect(result.outputCost).toBe(0)
      expect(result.totalCost).toBe(0)
    })

    it('should handle zero prices', () => {
      const result = calculateCost(1000000, 500000, 0, 0)
      expect(result.inputCost).toBe(0)
      expect(result.outputCost).toBe(0)
      expect(result.totalCost).toBe(0)
    })

    it('should round to 2 decimal places', () => {
      const result = calculateCost(123456, 78901, 1234, 5678)
      expect(result.inputCost).toBe(152.34)
      expect(result.outputCost).toBe(448) // Rounded: (78901 / 1000000) * 5678 * 100 / 100
      expect(result.totalCost).toBe(600.34)
    })

    it('should handle very large numbers', () => {
      const result = calculateCost(1000000000, 1000000000, 1000, 2000)
      expect(result.inputCost).toBe(1000000)
      expect(result.outputCost).toBe(2000000)
      expect(result.totalCost).toBe(3000000)
    })
  })
})
