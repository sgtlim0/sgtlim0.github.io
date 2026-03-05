import { describe, it, expect } from 'vitest'
import { MockApiService } from '../src/admin/services/mockApiService'

const service = new MockApiService()

describe('MockApiService', () => {
  describe('getDashboardSummary', () => {
    it('returns dashboard stats', async () => {
      const result = await service.getDashboardSummary()
      expect(result.stats).toBeInstanceOf(Array)
      expect(result.stats.length).toBeGreaterThan(0)
      expect(result.recentUsage).toBeInstanceOf(Array)
      expect(result.modelUsage).toBeInstanceOf(Array)
    })

    it('returns immutable copy', async () => {
      const a = await service.getDashboardSummary()
      const b = await service.getDashboardSummary()
      expect(a).not.toBe(b)
      expect(a).toEqual(b)
    })
  })

  describe('getUsers', () => {
    it('returns user list', async () => {
      const users = await service.getUsers()
      expect(users.length).toBeGreaterThan(0)
      expect(users[0]).toHaveProperty('userId')
      expect(users[0]).toHaveProperty('name')
      expect(users[0]).toHaveProperty('department')
      expect(users[0]).toHaveProperty('status')
    })
  })

  describe('searchUsers', () => {
    it('finds users by name', async () => {
      const results = await service.searchUsers('김철수')
      expect(results.length).toBe(1)
      expect(results[0].name).toBe('김철수')
    })

    it('finds users by userId', async () => {
      const results = await service.searchUsers('user01')
      expect(results.length).toBe(1)
      expect(results[0].userId).toBe('user01')
    })

    it('case-insensitive search', async () => {
      const results = await service.searchUsers('USER01')
      expect(results.length).toBe(1)
    })

    it('returns empty for no match', async () => {
      const results = await service.searchUsers('nonexistent')
      expect(results).toEqual([])
    })
  })

  describe('updateUser', () => {
    it('returns updated user', async () => {
      const result = await service.updateUser('user01', { status: 'inactive' })
      expect(result.userId).toBe('user01')
      expect(result.status).toBe('inactive')
    })

    it('throws for unknown userId', async () => {
      await expect(service.updateUser('unknown', {})).rejects.toThrow('User not found')
    })
  })

  describe('getPrompts', () => {
    it('returns all prompts when no category', async () => {
      const prompts = await service.getPrompts()
      expect(prompts.length).toBeGreaterThan(0)
    })

    it('filters by category', async () => {
      const devPrompts = await service.getPrompts('개발')
      expect(devPrompts.length).toBeGreaterThan(0)
      expect(devPrompts.every((p) => p.category === '개발')).toBe(true)
    })

    it('returns all for "전체"', async () => {
      const all = await service.getPrompts('전체')
      const noFilter = await service.getPrompts()
      expect(all.length).toBe(noFilter.length)
    })
  })

  describe('getPromptById', () => {
    it('returns prompt by id', async () => {
      const prompt = await service.getPromptById('1')
      expect(prompt.id).toBe('1')
      expect(prompt.title).toBeTruthy()
    })

    it('throws for unknown id', async () => {
      await expect(service.getPromptById('999')).rejects.toThrow('Prompt not found')
    })
  })

  describe('getMonthlyCosts', () => {
    it('returns requested number of months', async () => {
      const costs = await service.getMonthlyCosts(3)
      expect(costs.length).toBe(3)
    })

    it('defaults to 6 months', async () => {
      const costs = await service.getMonthlyCosts()
      expect(costs.length).toBe(6)
    })

    it('has expected structure', async () => {
      const costs = await service.getMonthlyCosts(1)
      expect(costs[0]).toHaveProperty('month')
      expect(costs[0]).toHaveProperty('bedrock')
      expect(costs[0]).toHaveProperty('openai')
      expect(costs[0]).toHaveProperty('google')
    })
  })

  describe('getAgentLogs', () => {
    it('returns limited logs', async () => {
      const logs = await service.getAgentLogs(3)
      expect(logs.length).toBe(3)
    })

    it('defaults to max 10', async () => {
      const logs = await service.getAgentLogs()
      expect(logs.length).toBeLessThanOrEqual(10)
    })
  })

  describe('getWeeklyTrend', () => {
    it('returns requested weeks', async () => {
      const trends = await service.getWeeklyTrend(2)
      expect(trends.length).toBe(2)
    })
  })

  describe('getStatistics', () => {
    it('returns statistics data', async () => {
      const stats = await service.getStatistics('monthly')
      expect(stats.monthlySummary).toBeInstanceOf(Array)
      expect(stats.monthlyTrend).toBeInstanceOf(Array)
      expect(stats.modelBreakdown).toBeInstanceOf(Array)
      expect(stats.topUsers).toBeInstanceOf(Array)
    })
  })

  describe('getSettings', () => {
    it('returns settings', async () => {
      const settings = await service.getSettings()
      expect(settings.systemName).toBeTruthy()
      expect(settings.models).toBeInstanceOf(Array)
    })
  })

  describe('updateSettings', () => {
    it('returns merged settings', async () => {
      const result = await service.updateSettings({ systemName: 'New Name' })
      expect(result.systemName).toBe('New Name')
      expect(result.models).toBeInstanceOf(Array)
    })
  })
})
