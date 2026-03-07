import { describe, it, expect, vi } from 'vitest'
import { MockApiService } from '../src/admin/services/mockApiService'
import type { AdminApiService } from '../src/admin/services/apiService'

describe('MockApiService', () => {
  const service: AdminApiService = new MockApiService()

  describe('getDashboardSummary', () => {
    it('should return dashboard stats', async () => {
      vi.useFakeTimers()
      const promise = service.getDashboardSummary()
      vi.advanceTimersByTime(200)
      const result = await promise

      expect(result).toBeDefined()
      expect(result.stats).toBeInstanceOf(Array)
      expect(result.stats.length).toBeGreaterThan(0)
      expect(result.stats[0]).toHaveProperty('label')
      expect(result.stats[0]).toHaveProperty('value')
      expect(result.modelUsage).toBeInstanceOf(Array)
      expect(result.recentUsage).toBeInstanceOf(Array)
      vi.useRealTimers()
    })
  })

  describe('getUsageHistory', () => {
    it('should return usage records for a given month', async () => {
      vi.useFakeTimers()
      const promise = service.getUsageHistory(2026, 3)
      vi.advanceTimersByTime(200)
      const result = await promise

      expect(result).toBeInstanceOf(Array)
      result.forEach((record) => {
        expect(record).toHaveProperty('date')
        expect(record).toHaveProperty('user')
        expect(record).toHaveProperty('model')
        expect(record).toHaveProperty('tokens')
        expect(record).toHaveProperty('cost')
        expect(record).toHaveProperty('status')
      })
      vi.useRealTimers()
    })
  })

  describe('getMonthlyUsageStats', () => {
    it('should return total tokens and cost', async () => {
      vi.useFakeTimers()
      const promise = service.getMonthlyUsageStats(2026, 3)
      vi.advanceTimersByTime(200)
      const result = await promise

      expect(result).toHaveProperty('totalTokens')
      expect(result).toHaveProperty('totalCost')
      expect(typeof result.totalTokens).toBe('string')
      expect(typeof result.totalCost).toBe('string')
      vi.useRealTimers()
    })
  })

  describe('getUsers', () => {
    it('should return user array', async () => {
      vi.useFakeTimers()
      const promise = service.getUsers()
      vi.advanceTimersByTime(200)
      const users = await promise

      expect(users).toBeInstanceOf(Array)
      expect(users.length).toBeGreaterThan(0)
      users.forEach((user) => {
        expect(user).toHaveProperty('userId')
        expect(user).toHaveProperty('name')
        expect(user).toHaveProperty('department')
      })
      vi.useRealTimers()
    })
  })

  describe('searchUsers', () => {
    it('should filter users by query', async () => {
      vi.useFakeTimers()
      const allPromise = service.getUsers()
      vi.advanceTimersByTime(200)
      const all = await allPromise

      if (all.length > 0) {
        const query = all[0].name.slice(0, 2)
        const searchPromise = service.searchUsers(query)
        vi.advanceTimersByTime(200)
        const filtered = await searchPromise
        expect(filtered.length).toBeLessThanOrEqual(all.length)
      }
      vi.useRealTimers()
    })
  })

  describe('getSettings', () => {
    it('should return admin settings', async () => {
      vi.useFakeTimers()
      const promise = service.getSettings()
      vi.advanceTimersByTime(200)
      const settings = await promise

      expect(settings).toBeDefined()
      expect(settings).toHaveProperty('systemName')
      vi.useRealTimers()
    })
  })

  describe('updateSettings', () => {
    it('should return updated settings', async () => {
      vi.useFakeTimers()
      const promise = service.updateSettings({ defaultModel: 'gpt-4o' })
      vi.advanceTimersByTime(200)
      const result = await promise

      expect(result).toBeDefined()
      expect(result.defaultModel).toBe('gpt-4o')
      vi.useRealTimers()
    })
  })

  describe('getProviders', () => {
    it('should return provider list', async () => {
      vi.useFakeTimers()
      const promise = service.getProviders()
      vi.advanceTimersByTime(200)
      const providers = await promise

      expect(providers).toBeInstanceOf(Array)
      providers.forEach((p) => {
        expect(p).toHaveProperty('name')
        expect(p).toHaveProperty('status')
      })
      vi.useRealTimers()
    })
  })

  describe('getModels', () => {
    it('should return model definitions', async () => {
      vi.useFakeTimers()
      const promise = service.getModels()
      vi.advanceTimersByTime(200)
      const models = await promise

      expect(models).toBeInstanceOf(Array)
      models.forEach((m) => {
        expect(m).toHaveProperty('name')
        expect(m).toHaveProperty('provider')
      })
      vi.useRealTimers()
    })
  })

  describe('getFeatureUsage', () => {
    it('should return feature usage data', async () => {
      vi.useFakeTimers()
      const promise = service.getFeatureUsage()
      vi.advanceTimersByTime(200)
      const features = await promise

      expect(features).toBeInstanceOf(Array)
      vi.useRealTimers()
    })
  })

  describe('getAgentStatus', () => {
    it('should return agent info', async () => {
      vi.useFakeTimers()
      const promise = service.getAgentStatus()
      vi.advanceTimersByTime(200)
      const agents = await promise

      expect(agents).toBeInstanceOf(Array)
      vi.useRealTimers()
    })
  })

  describe('interface compliance', () => {
    it('should implement all AdminApiService methods', () => {
      const methods: (keyof AdminApiService)[] = [
        'getDashboardSummary',
        'getUsageHistory',
        'getMonthlyUsageStats',
        'getStatistics',
        'getUsers',
        'updateUser',
        'searchUsers',
        'getSettings',
        'updateSettings',
        'getProviders',
        'getProviderIncidents',
        'getModels',
        'getMonthlyCosts',
        'getFeatureUsage',
        'getWeeklyTrend',
        'getAdoptionRates',
        'getPrompts',
        'getPromptById',
        'getAgentStatus',
        'getAgentLogs',
        'getDailyTrend',
      ]

      methods.forEach((method) => {
        expect(typeof service[method]).toBe('function')
      })
    })
  })
})
