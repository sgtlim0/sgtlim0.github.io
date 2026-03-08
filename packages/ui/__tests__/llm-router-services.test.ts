import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { MockLlmRouterService } from '../src/llm-router/services/mockLlmRouterService'
import {
  maskAPIKey,
  validateAPIKey,
  generateAPIKey,
  calculateRateLimit,
  estimateTokens,
  calculateCost,
} from '../src/llm-router/services/apiKeyUtils'
import { streamChatCompletion } from '../src/llm-router/services/streamingService'
import type { ModelFilterParams } from '../src/llm-router/services/types'
import type { StreamingResult } from '../src/llm-router/services/streamingTypes'

// ========== MockLlmRouterService ==========

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
    it('returns paginated response with defaults', async () => {
      const promise = service.getModels()
      vi.advanceTimersByTime(300)
      const result = await promise

      expect(result.data).toBeDefined()
      expect(result.data.length).toBeLessThanOrEqual(20)
      expect(result.total).toBeGreaterThan(0)
      expect(result.page).toBe(1)
      expect(result.pageSize).toBe(20)
    })

    it('filters by provider OpenAI', async () => {
      const promise = service.getModels({ provider: 'OpenAI' })
      vi.advanceTimersByTime(300)
      const result = await promise

      expect(result.data.every((m) => m.provider === 'OpenAI')).toBe(true)
      expect(result.total).toBeGreaterThan(0)
    })

    it('filters by provider Anthropic', async () => {
      const promise = service.getModels({ provider: 'Anthropic' })
      vi.advanceTimersByTime(300)
      const result = await promise

      expect(result.data.every((m) => m.provider === 'Anthropic')).toBe(true)
    })

    it('returns all models for "전체" provider', async () => {
      const allPromise = service.getModels({ provider: '전체' })
      vi.advanceTimersByTime(300)
      const allResult = await allPromise

      const noFilterPromise = service.getModels()
      vi.advanceTimersByTime(300)
      const noFilterResult = await noFilterPromise

      expect(allResult.total).toBe(noFilterResult.total)
    })

    it('filters "기타" provider (excludes main providers)', async () => {
      const promise = service.getModels({ provider: '기타' })
      vi.advanceTimersByTime(300)
      const result = await promise

      const mainProviders = ['OpenAI', 'Anthropic', 'Google', 'Meta', 'Mistral', 'Cohere', 'DeepSeek']
      expect(result.data.every((m) => !mainProviders.includes(m.provider))).toBe(true)
      expect(result.total).toBeGreaterThan(0)
    })

    it('filters by category chat', async () => {
      const promise = service.getModels({ category: 'chat' })
      vi.advanceTimersByTime(300)
      const result = await promise

      expect(result.data.every((m) => m.category === 'chat')).toBe(true)
    })

    it('filters by category embedding', async () => {
      const promise = service.getModels({ category: 'embedding' })
      vi.advanceTimersByTime(300)
      const result = await promise

      expect(result.data.every((m) => m.category === 'embedding')).toBe(true)
    })

    it('returns all for "전체" category', async () => {
      const allPromise = service.getModels({ category: '전체' })
      vi.advanceTimersByTime(300)
      const allResult = await allPromise

      const noFilterPromise = service.getModels()
      vi.advanceTimersByTime(300)
      const noFilterResult = await noFilterPromise

      expect(allResult.total).toBe(noFilterResult.total)
    })

    it('searches by model name', async () => {
      const promise = service.getModels({ search: 'gpt' })
      vi.advanceTimersByTime(300)
      const result = await promise

      expect(result.data.length).toBeGreaterThan(0)
      result.data.forEach((m) => {
        const matchesName = m.name.toLowerCase().includes('gpt')
        const matchesProvider = m.provider.toLowerCase().includes('gpt')
        const matchesId = m.id.toLowerCase().includes('gpt')
        expect(matchesName || matchesProvider || matchesId).toBe(true)
      })
    })

    it('searches by provider name', async () => {
      const promise = service.getModels({ search: 'anthropic' })
      vi.advanceTimersByTime(300)
      const result = await promise

      expect(result.data.length).toBeGreaterThan(0)
      result.data.forEach((m) => {
        expect(m.provider.toLowerCase()).toContain('anthropic')
      })
    })

    it('searches by model ID', async () => {
      const promise = service.getModels({ search: 'claude-opus' })
      vi.advanceTimersByTime(300)
      const result = await promise

      expect(result.data.length).toBeGreaterThan(0)
    })

    it('returns empty for non-matching search', async () => {
      const promise = service.getModels({ search: 'zzzznonexistent' })
      vi.advanceTimersByTime(300)
      const result = await promise

      expect(result.data).toEqual([])
      expect(result.total).toBe(0)
    })

    it('handles pagination page 1', async () => {
      const promise = service.getModels({ page: 1, pageSize: 5 })
      vi.advanceTimersByTime(300)
      const result = await promise

      expect(result.page).toBe(1)
      expect(result.pageSize).toBe(5)
      expect(result.data.length).toBeLessThanOrEqual(5)
    })

    it('handles pagination page 2', async () => {
      const p1Promise = service.getModels({ page: 1, pageSize: 5 })
      vi.advanceTimersByTime(300)
      const p1Result = await p1Promise

      const p2Promise = service.getModels({ page: 2, pageSize: 5 })
      vi.advanceTimersByTime(300)
      const p2Result = await p2Promise

      if (p1Result.total > 5) {
        expect(p2Result.data[0].id).not.toBe(p1Result.data[0].id)
      }
    })

    it('combines provider and search filters', async () => {
      const promise = service.getModels({ provider: 'OpenAI', search: 'gpt' })
      vi.advanceTimersByTime(300)
      const result = await promise

      result.data.forEach((m) => {
        expect(m.provider).toBe('OpenAI')
        const matchesName = m.name.toLowerCase().includes('gpt')
        const matchesId = m.id.toLowerCase().includes('gpt')
        expect(matchesName || matchesId).toBe(true)
      })
    })

    it('combines category and search filters', async () => {
      const promise = service.getModels({ category: 'code', search: 'code' })
      vi.advanceTimersByTime(300)
      const result = await promise

      result.data.forEach((m) => {
        expect(m.category).toBe('code')
      })
    })
  })

  describe('getModelById', () => {
    it('returns model for valid ID', async () => {
      const promise = service.getModelById('gpt-4o')
      vi.advanceTimersByTime(300)
      const result = await promise

      expect(result).not.toBeNull()
      expect(result!.id).toBe('gpt-4o')
      expect(result!.provider).toBe('OpenAI')
    })

    it('returns null for invalid ID', async () => {
      const promise = service.getModelById('nonexistent')
      vi.advanceTimersByTime(300)
      const result = await promise

      expect(result).toBeNull()
    })

    it('returns null for empty ID', async () => {
      const promise = service.getModelById('')
      vi.advanceTimersByTime(300)
      const result = await promise

      expect(result).toBeNull()
    })
  })

  describe('getDashboardStats', () => {
    it('returns all expected fields', async () => {
      const promise = service.getDashboardStats()
      vi.advanceTimersByTime(300)
      const result = await promise

      expect(result.totalModels).toBeGreaterThan(0)
      expect(result.totalRequests).toBeGreaterThan(0)
      expect(result.totalTokens).toBeGreaterThan(0)
      expect(result.totalCost).toBeGreaterThan(0)
      expect(result.avgLatency).toMatch(/^\d+\.\d+초$/)
    })
  })

  describe('getUsageStats', () => {
    it('returns 30 days by default', async () => {
      const promise = service.getUsageStats()
      vi.advanceTimersByTime(300)
      const result = await promise

      expect(result.length).toBe(30)
    })

    it('returns requested number of days', async () => {
      const promise = service.getUsageStats(7)
      vi.advanceTimersByTime(300)
      const result = await promise

      expect(result.length).toBe(7)
    })

    it('returns empty for 0 days', async () => {
      const promise = service.getUsageStats(0)
      vi.advanceTimersByTime(300)
      const result = await promise

      expect(result.length).toBe(0)
    })

    it('returns empty for negative days', async () => {
      const promise = service.getUsageStats(-5)
      vi.advanceTimersByTime(300)
      const result = await promise

      expect(result.length).toBe(0)
    })

    it('returns stats with all required fields', async () => {
      const promise = service.getUsageStats(1)
      vi.advanceTimersByTime(300)
      const result = await promise

      expect(result[0]).toHaveProperty('date')
      expect(result[0]).toHaveProperty('requests')
      expect(result[0]).toHaveProperty('tokens')
      expect(result[0]).toHaveProperty('cost')
    })
  })

  describe('getMonthlyUsage', () => {
    it('returns monthly usage data', async () => {
      const promise = service.getMonthlyUsage()
      vi.advanceTimersByTime(300)
      const result = await promise

      expect(result.length).toBeGreaterThan(0)
      expect(result[0]).toHaveProperty('month')
      expect(result[0]).toHaveProperty('requests')
      expect(result[0]).toHaveProperty('tokens')
      expect(result[0]).toHaveProperty('cost')
    })
  })

  describe('getModelUsageBreakdown', () => {
    it('returns model usage breakdown', async () => {
      const promise = service.getModelUsageBreakdown()
      vi.advanceTimersByTime(300)
      const result = await promise

      expect(result.length).toBeGreaterThan(0)
      expect(result[0]).toHaveProperty('model')
      expect(result[0]).toHaveProperty('requests')
    })
  })

  describe('getAPIKeys', () => {
    it('returns API keys', async () => {
      const promise = service.getAPIKeys()
      vi.advanceTimersByTime(300)
      const result = await promise

      expect(result.length).toBeGreaterThan(0)
      expect(result[0]).toHaveProperty('id')
      expect(result[0]).toHaveProperty('name')
      expect(result[0]).toHaveProperty('key')
      expect(result[0]).toHaveProperty('status')
    })
  })

  describe('createAPIKey', () => {
    it('creates a key with given name', async () => {
      const promise = service.createAPIKey('My Key')
      vi.advanceTimersByTime(300)
      const result = await promise

      expect(result.name).toBe('My Key')
      expect(result.status).toBe('active')
      expect(result.key).toMatch(/^sk-proj-/)
      expect(result.id).toBeTruthy()
      expect(result.created).toBeTruthy()
    })

    it('creates a key with empty name', async () => {
      const promise = service.createAPIKey('')
      vi.advanceTimersByTime(300)
      const result = await promise

      expect(result.name).toBe('')
      expect(result.status).toBe('active')
    })
  })

  describe('revokeAPIKey', () => {
    it('revokes existing key', async () => {
      const createPromise = service.createAPIKey('To Revoke')
      vi.advanceTimersByTime(300)
      const key = await createPromise

      const revokePromise = service.revokeAPIKey(key.id)
      vi.advanceTimersByTime(300)
      await revokePromise

      const keysPromise = service.getAPIKeys()
      vi.advanceTimersByTime(300)
      const keys = await keysPromise

      const revoked = keys.find((k) => k.id === key.id)
      expect(revoked?.status).toBe('revoked')
    })

    it('handles revoking non-existent key without error', async () => {
      const promise = service.revokeAPIKey('nonexistent')
      vi.advanceTimersByTime(300)
      await expect(promise).resolves.toBeUndefined()
    })
  })
})

// ========== apiKeyUtils ==========

describe('apiKeyUtils', () => {
  describe('maskAPIKey', () => {
    it('masks key showing first 7 and last 4 characters', () => {
      expect(maskAPIKey('sk-proj-abcdefghijklmnopqrstuvwxyz123456')).toBe('sk-proj...3456')
    })

    it('respects custom showChars parameter', () => {
      expect(maskAPIKey('sk-proj-abcdefghijklmnopqrstuvwxyz123456', 10)).toBe('sk-proj-ab...3456')
    })

    it('returns full key if too short to mask', () => {
      expect(maskAPIKey('sk-short')).toBe('sk-short')
    })

    it('returns empty string for empty input', () => {
      expect(maskAPIKey('')).toBe('')
    })

    it('handles key exactly at boundary length', () => {
      // showChars=7, suffix=4 => boundary = 11
      const key = 'sk-1234567' // length 10 < 11
      expect(maskAPIKey(key)).toBe('sk-1234567')
    })

    it('masks key just above boundary length', () => {
      // showChars=7, suffix=4 => boundary = 11, so length 12 should mask
      const key = 'sk-123456789' // length 12 > 11
      expect(maskAPIKey(key)).toBe('sk-1234...6789')
    })
  })

  describe('validateAPIKey', () => {
    it('validates correct API key', () => {
      const result = validateAPIKey('sk-proj-abcdefghijklmnopqrstuvwxyz123456')
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('rejects key not starting with sk-', () => {
      const result = validateAPIKey('api-key-123456789012345678901234')
      expect(result.valid).toBe(false)
      expect(result.error).toContain('sk-')
    })

    it('rejects short key (<=20 chars)', () => {
      const result = validateAPIKey('sk-shortkey')
      expect(result.valid).toBe(false)
      expect(result.error).toContain('20')
    })

    it('rejects key with special characters', () => {
      const result = validateAPIKey('sk-proj-abc@def#ghi$jkl%mno^pqr')
      expect(result.valid).toBe(false)
    })

    it('rejects empty string', () => {
      const result = validateAPIKey('')
      expect(result.valid).toBe(false)
    })

    it('accepts key with hyphens and underscores', () => {
      const result = validateAPIKey('sk-proj-abc_def-ghi_jkl_mno')
      expect(result.valid).toBe(true)
    })

    it('rejects key at exactly 20 chars', () => {
      const result = validateAPIKey('sk-12345678901234567') // 20 chars
      expect(result.valid).toBe(false)
    })

    it('accepts key at 21 chars', () => {
      const result = validateAPIKey('sk-123456789012345678') // 21 chars
      expect(result.valid).toBe(true)
    })
  })

  describe('generateAPIKey', () => {
    it('generates key with default prefix', () => {
      const key = generateAPIKey()
      expect(key.startsWith('sk-proj-')).toBe(true)
      expect(key.length).toBe(8 + 48) // prefix + random part
    })

    it('generates key with custom prefix', () => {
      const key = generateAPIKey('sk-test-')
      expect(key.startsWith('sk-test-')).toBe(true)
    })

    it('generates unique keys', () => {
      const keys = new Set(Array.from({ length: 10 }, () => generateAPIKey()))
      expect(keys.size).toBe(10)
    })

    it('generates key containing only alphanumeric characters in random part', () => {
      const key = generateAPIKey()
      const randomPart = key.slice(8) // remove prefix
      expect(randomPart).toMatch(/^[A-Za-z0-9]+$/)
    })
  })

  describe('calculateRateLimit', () => {
    it('calculates remaining correctly', () => {
      const result = calculateRateLimit(30, 100)
      expect(result.remaining).toBe(70)
      expect(result.percentage).toBe(30)
      expect(result.isLimited).toBe(false)
    })

    it('handles rate limit reached', () => {
      const result = calculateRateLimit(100, 100)
      expect(result.remaining).toBe(0)
      expect(result.percentage).toBe(100)
      expect(result.isLimited).toBe(true)
    })

    it('handles exceeded rate limit', () => {
      const result = calculateRateLimit(150, 100)
      expect(result.remaining).toBe(0)
      expect(result.percentage).toBe(100)
      expect(result.isLimited).toBe(true)
    })

    it('handles zero requests', () => {
      const result = calculateRateLimit(0, 100)
      expect(result.remaining).toBe(100)
      expect(result.percentage).toBe(0)
      expect(result.isLimited).toBe(false)
    })

    it('handles zero limit (division by zero)', () => {
      const result = calculateRateLimit(10, 0)
      expect(result.remaining).toBe(0)
      expect(result.isLimited).toBe(true)
    })

    it('rounds percentage to 2 decimal places', () => {
      const result = calculateRateLimit(1, 3)
      expect(result.percentage).toBe(33.33)
    })
  })

  describe('estimateTokens', () => {
    it('estimates English text tokens', () => {
      const tokens = estimateTokens('Hello world')
      expect(tokens).toBe(3) // 11 * 0.25 = 2.75, ceil = 3
    })

    it('estimates Korean text tokens', () => {
      const tokens = estimateTokens('안녕하세요')
      expect(tokens).toBe(3) // 5 * 0.5 = 2.5, ceil = 3
    })

    it('estimates mixed text tokens', () => {
      const tokens = estimateTokens('Hello 안녕')
      expect(tokens).toBe(3)
    })

    it('returns 0 for empty string', () => {
      expect(estimateTokens('')).toBe(0)
    })

    it('handles special characters', () => {
      const tokens = estimateTokens('!@#$%^&*()')
      expect(tokens).toBe(3) // 10 * 0.25 = 2.5, ceil = 3
    })

    it('handles single character', () => {
      expect(estimateTokens('a')).toBe(1) // 1 * 0.25 = 0.25, ceil = 1
    })

    it('handles single Korean character', () => {
      expect(estimateTokens('가')).toBe(1) // 1 * 0.5 = 0.5, ceil = 1
    })
  })

  describe('calculateCost', () => {
    it('calculates cost correctly', () => {
      const result = calculateCost(1000000, 500000, 1500, 3000)
      expect(result.inputCost).toBe(1500)
      expect(result.outputCost).toBe(1500)
      expect(result.totalCost).toBe(3000)
    })

    it('handles zero tokens', () => {
      const result = calculateCost(0, 0, 1500, 3000)
      expect(result.inputCost).toBe(0)
      expect(result.outputCost).toBe(0)
      expect(result.totalCost).toBe(0)
    })

    it('handles zero prices', () => {
      const result = calculateCost(1000000, 500000, 0, 0)
      expect(result.inputCost).toBe(0)
      expect(result.outputCost).toBe(0)
      expect(result.totalCost).toBe(0)
    })

    it('rounds to 2 decimal places', () => {
      const result = calculateCost(123456, 78901, 1234, 5678)
      // inputCost = (123456 / 1000000) * 1234 = 152.3... round to 152.34
      expect(typeof result.inputCost).toBe('number')
      expect(result.totalCost).toBe(
        Math.round((result.inputCost + result.outputCost) * 100) / 100,
      )
    })

    it('handles very large token counts', () => {
      const result = calculateCost(1000000000, 1000000000, 1000, 2000)
      expect(result.inputCost).toBe(1000000)
      expect(result.outputCost).toBe(2000000)
      expect(result.totalCost).toBe(3000000)
    })

    it('handles small token counts', () => {
      const result = calculateCost(1, 1, 1000, 2000)
      // (1 / 1000000) * 1000 = 0.001, round = 0
      expect(result.inputCost).toBe(0)
      expect(result.outputCost).toBe(0)
    })
  })
})

// ========== streamingService ==========

describe('streamChatCompletion', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('calls onError for unknown model', () => {
    const onError = vi.fn()

    streamChatCompletion({
      model: 'nonexistent-model',
      messages: [{ role: 'user', content: 'hello' }],
      onError,
    })

    vi.advanceTimersByTime(10)
    expect(onError).toHaveBeenCalledWith(expect.any(Error))
    expect(onError.mock.calls[0][0].message).toContain('nonexistent-model')
  })

  it('does not call onError after abort for unknown model', () => {
    const onError = vi.fn()

    const controller = streamChatCompletion({
      model: 'nonexistent-model',
      messages: [{ role: 'user', content: 'hello' }],
      onError,
    })

    controller.abort()
    vi.advanceTimersByTime(10)
    expect(onError).not.toHaveBeenCalled()
  })

  it('returns a controller with abort method', () => {
    const controller = streamChatCompletion({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: 'hello' }],
    })

    expect(controller).toBeDefined()
    expect(typeof controller.abort).toBe('function')
  })

  it('calls onToken for each chunk', () => {
    const onToken = vi.fn()
    const onComplete = vi.fn()

    streamChatCompletion({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: 'hello' }],
      onToken,
      onComplete,
    })

    // Advance past base delay + many token delays
    vi.advanceTimersByTime(30000)

    expect(onToken).toHaveBeenCalled()
    expect(onToken.mock.calls.length).toBeGreaterThan(0)
  })

  it('calls onComplete when streaming finishes', () => {
    const onComplete = vi.fn()

    streamChatCompletion({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: 'hello' }],
      onComplete,
    })

    // Advance enough time for full completion
    vi.advanceTimersByTime(120000)

    expect(onComplete).toHaveBeenCalledTimes(1)
    const result: StreamingResult = onComplete.mock.calls[0][0]
    expect(result.content).toBeTruthy()
    expect(result.model).toBe('gpt-4o')
    expect(result.inputTokens).toBeGreaterThan(0)
    expect(result.outputTokens).toBeGreaterThan(0)
    expect(result.totalTokens).toBe(result.inputTokens + result.outputTokens)
    expect(result.responseTimeMs).toBeGreaterThanOrEqual(0)
    expect(result.estimatedCostKRW).toBeGreaterThanOrEqual(0)
    expect(['stop', 'length']).toContain(result.finishReason)
  })

  it('respects abort to stop streaming', () => {
    const onToken = vi.fn()
    const onComplete = vi.fn()

    const controller = streamChatCompletion({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: 'hello' }],
      onToken,
      onComplete,
    })

    // Advance past base delay to emit a few tokens
    vi.advanceTimersByTime(500)
    const tokensBeforeAbort = onToken.mock.calls.length
    expect(tokensBeforeAbort).toBeGreaterThan(0)

    // abort() sets aborted=true and clears the pending timeout,
    // preventing any further emitNextChunk calls
    controller.abort()

    // Advance well past any potential timer
    vi.advanceTimersByTime(120000)

    // No additional tokens emitted after abort
    expect(onToken.mock.calls.length).toBe(tokensBeforeAbort)
    // onComplete is NOT called because the abort clears the timer before
    // emitNextChunk can check the aborted flag
    expect(onComplete).not.toHaveBeenCalled()
  })

  it('handles keyword-matched responses for code keywords', () => {
    const onComplete = vi.fn()

    streamChatCompletion({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: 'Write some code for me' }],
      onComplete,
    })

    vi.advanceTimersByTime(120000)

    expect(onComplete).toHaveBeenCalled()
    const result = onComplete.mock.calls[0][0]
    expect(result.content).toBeTruthy()
  })

  it('handles keyword-matched responses for translation keywords', () => {
    const onComplete = vi.fn()

    streamChatCompletion({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: '번역 해주세요' }],
      onComplete,
    })

    vi.advanceTimersByTime(120000)

    expect(onComplete).toHaveBeenCalled()
    expect(onComplete.mock.calls[0][0].content).toBeTruthy()
  })

  it('handles summary/analysis keywords', () => {
    const onComplete = vi.fn()

    streamChatCompletion({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: '요약해주세요' }],
      onComplete,
    })

    vi.advanceTimersByTime(120000)

    expect(onComplete).toHaveBeenCalled()
  })

  it('handles greeting keywords', () => {
    const onComplete = vi.fn()

    streamChatCompletion({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: '안녕하세요' }],
      onComplete,
    })

    vi.advanceTimersByTime(120000)

    expect(onComplete).toHaveBeenCalled()
  })

  it('handles explain/compare keywords', () => {
    const onComplete = vi.fn()

    streamChatCompletion({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: '차이를 설명해주세요' }],
      onComplete,
    })

    vi.advanceTimersByTime(120000)

    expect(onComplete).toHaveBeenCalled()
  })

  it('handles fallback response for unmatched keywords', () => {
    const onComplete = vi.fn()

    streamChatCompletion({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: 'xyzzy plugh random unrelated input 1234' }],
      onComplete,
    })

    vi.advanceTimersByTime(120000)

    expect(onComplete).toHaveBeenCalled()
    expect(onComplete.mock.calls[0][0].content).toBeTruthy()
  })

  it('calculates cost based on model pricing', () => {
    const onComplete = vi.fn()

    streamChatCompletion({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: 'hello' }],
      onComplete,
    })

    vi.advanceTimersByTime(120000)

    expect(onComplete).toHaveBeenCalled()
    const result = onComplete.mock.calls[0][0]
    expect(typeof result.estimatedCostKRW).toBe('number')
    expect(result.estimatedCostKRW).toBeGreaterThanOrEqual(0)
  })

  it('uses different latency profiles per provider', () => {
    // We just verify it doesn't error for different providers
    const providers = [
      'gpt-4o', // OpenAI
      'claude-opus-4-6', // Anthropic
      'gemini-2-5-pro', // Google
      'llama-3-3-70b', // Meta
      'codestral', // Mistral
    ]

    providers.forEach((modelId) => {
      const onComplete = vi.fn()
      streamChatCompletion({
        model: modelId,
        messages: [{ role: 'user', content: 'test' }],
        onComplete,
      })
      vi.advanceTimersByTime(120000)
      expect(onComplete).toHaveBeenCalled()
    })
  })

  it('respects maxTokens to limit output', () => {
    const onToken = vi.fn()
    const onComplete = vi.fn()

    streamChatCompletion({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: 'hello' }],
      maxTokens: 3,
      onToken,
      onComplete,
    })

    vi.advanceTimersByTime(120000)

    expect(onComplete).toHaveBeenCalled()
    // With maxTokens=3, output chunks should be limited
    expect(onToken.mock.calls.length).toBeLessThanOrEqual(3)
  })

  it('handles multiple messages for input token calculation', () => {
    const onComplete = vi.fn()

    streamChatCompletion({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Hello there!' },
        { role: 'assistant', content: 'Hi!' },
        { role: 'user', content: 'How are you?' },
      ],
      onComplete,
    })

    vi.advanceTimersByTime(120000)

    expect(onComplete).toHaveBeenCalled()
    const result = onComplete.mock.calls[0][0]
    // Input tokens should reflect all messages combined
    expect(result.inputTokens).toBeGreaterThan(0)
  })

  it('works without callback functions', () => {
    // Should not throw
    const controller = streamChatCompletion({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: 'hello' }],
    })

    vi.advanceTimersByTime(120000)
    controller.abort()
  })

  it('sets finishReason to length when maxTokens truncates output', () => {
    const onComplete = vi.fn()

    streamChatCompletion({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: 'hello' }],
      maxTokens: 1,
      onComplete,
    })

    vi.advanceTimersByTime(120000)

    expect(onComplete).toHaveBeenCalled()
    const result = onComplete.mock.calls[0][0]
    expect(result.finishReason).toBe('length')
  })
})

// ========== LlmRouterServiceProvider ==========

describe('LlmRouterServiceProvider', () => {
  it('exports LlmRouterServiceProvider and useLlmRouterService', async () => {
    const mod = await import('../src/llm-router/services/LlmRouterServiceProvider')
    expect(mod.LlmRouterServiceProvider).toBeDefined()
    expect(mod.useLlmRouterService).toBeDefined()
  })

  it('useLlmRouterService throws when used outside provider', async () => {
    const { renderHook } = await import('@testing-library/react')
    const { useLlmRouterService } = await import(
      '../src/llm-router/services/LlmRouterServiceProvider'
    )

    expect(() => {
      renderHook(() => useLlmRouterService())
    }).toThrow('useLlmRouterService must be used within LlmRouterServiceProvider')
  })

  it('provides mock service by default', async () => {
    const { renderHook } = await import('@testing-library/react')
    const { LlmRouterServiceProvider, useLlmRouterService } = await import(
      '../src/llm-router/services/LlmRouterServiceProvider'
    )
    const React = await import('react')

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(LlmRouterServiceProvider, null, children)

    const { result } = renderHook(() => useLlmRouterService(), { wrapper })
    expect(result.current).toBeDefined()
    expect(typeof result.current.getModels).toBe('function')
    expect(typeof result.current.getModelById).toBe('function')
    expect(typeof result.current.getDashboardStats).toBe('function')
    expect(typeof result.current.getAPIKeys).toBe('function')
    expect(typeof result.current.createAPIKey).toBe('function')
    expect(typeof result.current.revokeAPIKey).toBe('function')
  })

  it('accepts custom service', async () => {
    const { renderHook } = await import('@testing-library/react')
    const { LlmRouterServiceProvider, useLlmRouterService } = await import(
      '../src/llm-router/services/LlmRouterServiceProvider'
    )
    const React = await import('react')

    const customService = {
      getModels: vi.fn(),
      getModelById: vi.fn(),
      getDashboardStats: vi.fn(),
      getUsageStats: vi.fn(),
      getMonthlyUsage: vi.fn(),
      getModelUsageBreakdown: vi.fn(),
      getAPIKeys: vi.fn(),
      createAPIKey: vi.fn(),
      revokeAPIKey: vi.fn(),
    }

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(LlmRouterServiceProvider, { service: customService }, children)

    const { result } = renderHook(() => useLlmRouterService(), { wrapper })
    expect(result.current).toBe(customService)
  })
})

// ========== Barrel exports ==========

describe('LLM Router barrel exports', () => {
  it('exports all components from index', async () => {
    const mod = await import('../src/llm-router/index')
    expect(mod.LRNavbar).toBeDefined()
    expect(mod.ModelTable).toBeDefined()
    expect(mod.ProviderBadge).toBeDefined()
    expect(mod.PriceCell).toBeDefined()
    expect(mod.CodeBlock).toBeDefined()
    expect(mod.DocsSidebar).toBeDefined()
    expect(mod.StreamingPlayground).toBeDefined()
    expect(mod.ModelComparison).toBeDefined()
  })

  it('exports mock data', async () => {
    const mod = await import('../src/llm-router/index')
    expect(mod.models).toBeDefined()
    expect(mod.providers).toBeDefined()
    expect(mod.categories).toBeDefined()
    expect(mod.mockModels).toBeDefined()
    expect(mod.mockAPIKeys).toBeDefined()
  })

  it('exports service types and classes', async () => {
    const mod = await import('../src/llm-router/services/index')
    expect(mod.MockLlmRouterService).toBeDefined()
    expect(mod.mockLlmRouterService).toBeDefined()
    expect(mod.LlmRouterServiceProvider).toBeDefined()
    expect(mod.useLlmRouterService).toBeDefined()
  })

  it('exports apiKeyUtils functions', async () => {
    const mod = await import('../src/llm-router/services/index')
    expect(mod.maskAPIKey).toBeDefined()
    expect(mod.validateAPIKey).toBeDefined()
    expect(mod.generateAPIKey).toBeDefined()
    expect(mod.calculateRateLimit).toBeDefined()
    expect(mod.estimateTokens).toBeDefined()
    expect(mod.calculateCost).toBeDefined()
  })

  it('exports streaming service', async () => {
    const mod = await import('../src/llm-router/services/index')
    expect(mod.streamChatCompletion).toBeDefined()
    expect(mod.useStreamingChat).toBeDefined()
  })
})
