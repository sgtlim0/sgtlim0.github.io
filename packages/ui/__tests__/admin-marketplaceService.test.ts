import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  getAgents,
  getAgentById,
  installAgent,
  uninstallAgent,
  isInstalled,
  getAgentReviews,
} from '../src/admin/marketplace/marketplaceService'

describe('marketplaceService', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    localStorage.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('getAgents', () => {
    it('should return agents without filter', async () => {
      const promise = getAgents()
      vi.advanceTimersByTime(300)
      const result = await promise

      expect(result).toHaveProperty('agents')
      expect(result).toHaveProperty('total')
      expect(result.agents.length).toBeGreaterThan(0)
      expect(result.total).toBe(result.agents.length)
    })

    it('should filter by search query', async () => {
      const promise = getAgents({ search: '번역' })
      vi.advanceTimersByTime(300)
      const result = await promise

      result.agents.forEach((a) => {
        const matches =
          a.name.includes('번역') ||
          a.description.includes('번역') ||
          a.tags.some((t) => t.includes('번역'))
        expect(matches).toBe(true)
      })
    })

    it('should sort by rating', async () => {
      const promise = getAgents({ sortBy: 'rating' })
      vi.advanceTimersByTime(300)
      const result = await promise

      for (let i = 0; i < result.agents.length - 1; i++) {
        expect(result.agents[i].rating).toBeGreaterThanOrEqual(result.agents[i + 1].rating)
      }
    })

    it('should sort by name', async () => {
      const promise = getAgents({ sortBy: 'name' })
      vi.advanceTimersByTime(300)
      const result = await promise

      for (let i = 0; i < result.agents.length - 1; i++) {
        expect(result.agents[i].name.localeCompare(result.agents[i + 1].name)).toBeLessThanOrEqual(
          0,
        )
      }
    })

    it('should sort by popular (installs) by default', async () => {
      const promise = getAgents()
      vi.advanceTimersByTime(300)
      const result = await promise

      for (let i = 0; i < result.agents.length - 1; i++) {
        expect(result.agents[i].installs).toBeGreaterThanOrEqual(result.agents[i + 1].installs)
      }
    })
  })

  describe('getAgentById', () => {
    it('should return agent for valid ID', async () => {
      const listPromise = getAgents()
      vi.advanceTimersByTime(300)
      const list = await listPromise

      if (list.agents.length > 0) {
        const id = list.agents[0].id
        const promise = getAgentById(id)
        vi.advanceTimersByTime(200)
        const agent = await promise

        expect(agent).not.toBeNull()
        expect(agent?.id).toBe(id)
      }
    })

    it('should return null for invalid ID', async () => {
      const promise = getAgentById('non-existent')
      vi.advanceTimersByTime(200)
      const agent = await promise

      expect(agent).toBeNull()
    })
  })

  describe('installAgent / uninstallAgent / isInstalled', () => {
    it('should install an agent', async () => {
      const listPromise = getAgents()
      vi.advanceTimersByTime(300)
      const list = await listPromise
      const agentId = list.agents[0].id

      const promise = installAgent(agentId)
      vi.advanceTimersByTime(400)
      const result = await promise

      expect(result).toBe(true)
      expect(isInstalled(agentId)).toBe(true)
    })

    it('should not install already installed agent', async () => {
      const listPromise = getAgents()
      vi.advanceTimersByTime(300)
      const list = await listPromise
      const agentId = list.agents[0].id

      const install1 = installAgent(agentId)
      vi.advanceTimersByTime(400)
      await install1

      const install2 = installAgent(agentId)
      vi.advanceTimersByTime(400)
      const result = await install2

      expect(result).toBe(false)
    })

    it('should uninstall an installed agent', async () => {
      const listPromise = getAgents()
      vi.advanceTimersByTime(300)
      const list = await listPromise
      const agentId = list.agents[0].id

      const installPromise = installAgent(agentId)
      vi.advanceTimersByTime(400)
      await installPromise

      const uninstallPromise = uninstallAgent(agentId)
      vi.advanceTimersByTime(300)
      const result = await uninstallPromise

      expect(result).toBe(true)
      expect(isInstalled(agentId)).toBe(false)
    })

    it('should return false when uninstalling non-installed agent', async () => {
      const promise = uninstallAgent('not-installed')
      vi.advanceTimersByTime(300)
      const result = await promise

      expect(result).toBe(false)
    })
  })

  describe('getAgentReviews', () => {
    it('should return reviews for an agent', async () => {
      const promise = getAgentReviews('agent-1')
      vi.advanceTimersByTime(200)
      const reviews = await promise

      expect(reviews.length).toBeGreaterThan(0)
      reviews.forEach((r) => {
        expect(r).toHaveProperty('id')
        expect(r).toHaveProperty('userId')
        expect(r).toHaveProperty('userName')
        expect(r).toHaveProperty('rating')
        expect(r).toHaveProperty('comment')
        expect(r).toHaveProperty('createdAt')
        expect(r.rating).toBeGreaterThanOrEqual(1)
        expect(r.rating).toBeLessThanOrEqual(5)
      })
    })
  })
})
