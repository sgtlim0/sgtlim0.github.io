import { describe, it, expect } from 'vitest'
import { models, providers, categories, mockAPIKeys, mockUsageStats, mockMonthlyUsage, mockModelUsageBreakdown } from '../src/llm-router/mockData'
import { mockModels } from '../src/llm-router/mockModels'
import type { LLMModel, APIKey, UsageStat, ModelUsage } from '../src/llm-router/types'

describe('mockData model catalog', () => {
  it('contains at least 70 models', () => {
    expect(models.length).toBeGreaterThanOrEqual(70)
  })

  it('every model has all required fields with correct types', () => {
    models.forEach((model: LLMModel) => {
      expect(typeof model.id).toBe('string')
      expect(model.id.length).toBeGreaterThan(0)
      expect(typeof model.name).toBe('string')
      expect(model.name.length).toBeGreaterThan(0)
      expect(typeof model.provider).toBe('string')
      expect(model.provider.length).toBeGreaterThan(0)
      expect(typeof model.providerIcon).toBe('string')
      expect(typeof model.inputPrice).toBe('number')
      expect(model.inputPrice).toBeGreaterThanOrEqual(0)
      expect(typeof model.outputPrice).toBe('number')
      expect(model.outputPrice).toBeGreaterThanOrEqual(0)
      expect(typeof model.contextWindow).toBe('number')
      expect(model.contextWindow).toBeGreaterThan(0)
      expect(typeof model.maxOutput).toBe('number')
      expect(model.maxOutput).toBeGreaterThan(0)
      expect(typeof model.latency).toBe('string')
      expect(model.latency).toMatch(/^\d+(\.\d+)?초$/)
    })
  })

  it('every model has a valid category', () => {
    const validCategories = ['chat', 'completion', 'embedding', 'image', 'audio', 'code']
    models.forEach((model) => {
      expect(validCategories).toContain(model.category)
    })
  })

  it('model IDs are unique', () => {
    const ids = models.map((m) => m.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)
  })

  it('contains models from all major providers', () => {
    const modelProviders = new Set(models.map((m) => m.provider))
    const expectedProviders = ['OpenAI', 'Anthropic', 'Google', 'Meta', 'Mistral', 'Cohere', 'DeepSeek']
    expectedProviders.forEach((provider) => {
      expect(modelProviders.has(provider)).toBe(true)
    })
  })

  it('has popular models flagged', () => {
    const popularModels = models.filter((m) => m.isPopular)
    expect(popularModels.length).toBeGreaterThanOrEqual(5)
  })

  it('contains models of multiple categories', () => {
    const modelCategories = new Set(models.map((m) => m.category))
    expect(modelCategories.size).toBeGreaterThanOrEqual(4)
    expect(modelCategories.has('chat')).toBe(true)
    expect(modelCategories.has('code')).toBe(true)
    expect(modelCategories.has('embedding')).toBe(true)
    expect(modelCategories.has('image')).toBe(true)
  })
})

describe('mockModels (Bedrock/Korean providers)', () => {
  it('contains models from Korean and Asian providers', () => {
    const providerNames = new Set(mockModels.map((m) => m.provider))
    expect(providerNames.has('Anthropic (Bedrock)')).toBe(true)
    expect(providerNames.has('Upstage')).toBe(true)
  })

  it('every model has valid structure', () => {
    mockModels.forEach((model: LLMModel) => {
      expect(typeof model.id).toBe('string')
      expect(model.id.length).toBeGreaterThan(0)
      expect(typeof model.name).toBe('string')
      expect(typeof model.inputPrice).toBe('number')
      expect(typeof model.outputPrice).toBe('number')
      expect(typeof model.contextWindow).toBe('number')
      expect(typeof model.maxOutput).toBe('number')
      expect(model.latency).toMatch(/^\d+(\.\d+)?초$/)
    })
  })

  it('model IDs are unique', () => {
    const ids = mockModels.map((m) => m.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('includes free models (Upstage Solar Pro 3 Beta)', () => {
    const freeModels = mockModels.filter((m) => m.inputPrice === 0 && m.outputPrice === 0)
    expect(freeModels.length).toBeGreaterThanOrEqual(1)
  })
})

describe('providers and categories arrays', () => {
  it('providers list starts with "전체"', () => {
    expect(providers[0]).toBe('전체')
  })

  it('providers list contains expected providers', () => {
    expect(providers).toContain('OpenAI')
    expect(providers).toContain('Anthropic')
    expect(providers).toContain('Google')
    expect(providers).toContain('Meta')
    expect(providers).toContain('Mistral')
    expect(providers).toContain('기타')
  })

  it('categories list starts with "전체"', () => {
    expect(categories[0]).toBe('전체')
  })

  it('categories list includes all valid model categories', () => {
    expect(categories).toContain('chat')
    expect(categories).toContain('completion')
    expect(categories).toContain('embedding')
    expect(categories).toContain('image')
    expect(categories).toContain('audio')
    expect(categories).toContain('code')
  })
})

describe('mockAPIKeys', () => {
  it('contains multiple API keys', () => {
    expect(mockAPIKeys.length).toBeGreaterThanOrEqual(3)
  })

  it('every key has required fields', () => {
    mockAPIKeys.forEach((key: APIKey) => {
      expect(typeof key.id).toBe('string')
      expect(typeof key.name).toBe('string')
      expect(typeof key.key).toBe('string')
      expect(key.key).toMatch(/^sk-proj-/)
      expect(typeof key.created).toBe('string')
      expect(typeof key.lastUsed).toBe('string')
      expect(['active', 'revoked']).toContain(key.status)
    })
  })

  it('contains both active and revoked keys', () => {
    const statuses = new Set(mockAPIKeys.map((k) => k.status))
    expect(statuses.has('active')).toBe(true)
    expect(statuses.has('revoked')).toBe(true)
  })
})

describe('mockUsageStats', () => {
  it('contains 30 days of data', () => {
    expect(mockUsageStats.length).toBe(30)
  })

  it('every stat has required numeric fields', () => {
    mockUsageStats.forEach((stat: UsageStat) => {
      expect(typeof stat.date).toBe('string')
      expect(stat.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(typeof stat.requests).toBe('number')
      expect(stat.requests).toBeGreaterThan(0)
      expect(typeof stat.tokens).toBe('number')
      expect(stat.tokens).toBeGreaterThan(0)
      expect(typeof stat.cost).toBe('number')
      expect(stat.cost).toBeGreaterThan(0)
    })
  })

  it('dates are in chronological order', () => {
    for (let i = 1; i < mockUsageStats.length; i++) {
      expect(new Date(mockUsageStats[i].date).getTime()).toBeGreaterThan(
        new Date(mockUsageStats[i - 1].date).getTime(),
      )
    }
  })
})

describe('mockMonthlyUsage', () => {
  it('contains multiple months', () => {
    expect(mockMonthlyUsage.length).toBeGreaterThanOrEqual(3)
  })

  it('every entry has required fields', () => {
    mockMonthlyUsage.forEach((entry) => {
      expect(typeof entry.month).toBe('string')
      expect(entry.month).toMatch(/^\d{4}-\d{2}$/)
      expect(typeof entry.requests).toBe('number')
      expect(typeof entry.tokens).toBe('number')
      expect(typeof entry.cost).toBe('number')
    })
  })
})

describe('mockModelUsageBreakdown', () => {
  it('contains usage data for popular models', () => {
    expect(mockModelUsageBreakdown.length).toBeGreaterThanOrEqual(3)
  })

  it('every entry has required fields', () => {
    mockModelUsageBreakdown.forEach((entry: ModelUsage) => {
      expect(typeof entry.model).toBe('string')
      expect(entry.model.length).toBeGreaterThan(0)
      expect(typeof entry.requests).toBe('number')
      expect(entry.requests).toBeGreaterThan(0)
      expect(typeof entry.tokens).toBe('number')
      expect(entry.tokens).toBeGreaterThan(0)
      expect(typeof entry.cost).toBe('number')
      expect(entry.cost).toBeGreaterThan(0)
    })
  })
})
