import { describe, it, expect } from 'vitest'
import { MockLlmRouterService } from '../src/llm-router/services/mockLlmRouterService'

const service = new MockLlmRouterService()

describe('MockLlmRouterService', () => {
  describe('getModels', () => {
    it('returns paginated response', async () => {
      const result = await service.getModels()
      expect(result).toHaveProperty('data')
      expect(result).toHaveProperty('total')
      expect(result).toHaveProperty('page')
      expect(result).toHaveProperty('pageSize')
      expect(result.data).toBeInstanceOf(Array)
    })

    it('filters by provider', async () => {
      const result = await service.getModels({ provider: 'OpenAI' })
      expect(result.data.every((m) => m.provider === 'OpenAI')).toBe(true)
      expect(result.total).toBeGreaterThan(0)
    })

    it('filters by "기타" provider (excludes main providers)', async () => {
      const result = await service.getModels({ provider: '기타' })
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

    it('returns all for "전체" provider', async () => {
      const all = await service.getModels({ provider: '전체' })
      const noFilter = await service.getModels()
      expect(all.total).toBe(noFilter.total)
    })

    it('filters by category', async () => {
      const result = await service.getModels({ category: 'Chat' })
      expect(result.data.every((m) => m.category === 'Chat')).toBe(true)
    })

    it('filters by search query', async () => {
      const result = await service.getModels({ search: 'claude' })
      expect(result.data.length).toBeGreaterThan(0)
      result.data.forEach((m) => {
        const matchesName = m.name.toLowerCase().includes('claude')
        const matchesProvider = m.provider.toLowerCase().includes('claude')
        const matchesId = m.id.toLowerCase().includes('claude')
        expect(matchesName || matchesProvider || matchesId).toBe(true)
      })
    })

    it('handles pagination', async () => {
      const page1 = await service.getModels({ page: 1, pageSize: 5 })
      const page2 = await service.getModels({ page: 2, pageSize: 5 })
      expect(page1.data.length).toBeLessThanOrEqual(5)
      expect(page2.data.length).toBeLessThanOrEqual(5)
      expect(page1.page).toBe(1)
      expect(page2.page).toBe(2)

      if (page1.total > 5) {
        expect(page1.data[0].id).not.toBe(page2.data[0].id)
      }
    })

    it('combines filters', async () => {
      const result = await service.getModels({
        provider: 'OpenAI',
        search: 'gpt',
      })
      result.data.forEach((m) => {
        expect(m.provider).toBe('OpenAI')
        expect(m.name.toLowerCase().includes('gpt') || m.id.toLowerCase().includes('gpt')).toBe(
          true,
        )
      })
    })
  })

  describe('getModelById', () => {
    it('returns model by id', async () => {
      const allModels = await service.getModels({ pageSize: 100 })
      const firstId = allModels.data[0].id

      const model = await service.getModelById(firstId)
      expect(model).not.toBeNull()
      expect(model!.id).toBe(firstId)
    })

    it('returns null for unknown id', async () => {
      const model = await service.getModelById('nonexistent-id')
      expect(model).toBeNull()
    })
  })

  describe('getDashboardStats', () => {
    it('returns dashboard statistics', async () => {
      const stats = await service.getDashboardStats()
      expect(stats.totalModels).toBeGreaterThan(0)
      expect(stats.totalRequests).toBeGreaterThanOrEqual(0)
      expect(stats.totalTokens).toBeGreaterThanOrEqual(0)
      expect(stats.totalCost).toBeGreaterThanOrEqual(0)
      expect(stats.avgLatency).toBeTruthy()
    })
  })

  describe('getUsageStats', () => {
    it('returns usage stats for requested days', async () => {
      const stats = await service.getUsageStats(7)
      expect(stats.length).toBeLessThanOrEqual(7)
    })
  })

  describe('getAPIKeys', () => {
    it('returns api keys', async () => {
      const keys = await service.getAPIKeys()
      expect(keys).toBeInstanceOf(Array)
      if (keys.length > 0) {
        expect(keys[0]).toHaveProperty('id')
        expect(keys[0]).toHaveProperty('name')
        expect(keys[0]).toHaveProperty('key')
        expect(keys[0]).toHaveProperty('status')
      }
    })
  })

  describe('createAPIKey', () => {
    it('creates new key with name', async () => {
      const key = await service.createAPIKey('Test Key')
      expect(key.name).toBe('Test Key')
      expect(key.status).toBe('active')
      expect(key.key).toMatch(/^sk-proj-/)
    })
  })

  describe('revokeAPIKey', () => {
    it('revokes existing key', async () => {
      const key = await service.createAPIKey('To Revoke')
      await service.revokeAPIKey(key.id)

      const keys = await service.getAPIKeys()
      const revoked = keys.find((k) => k.id === key.id)
      expect(revoked?.status).toBe('revoked')
    })
  })
})
