import { describe, it, expect, beforeEach } from 'vitest'
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
    localStorage.clear()
  })

  describe('getAgents', () => {
    it('should return all agents by default', async () => {
      const { agents, total } = await getAgents()
      expect(agents.length).toBeGreaterThan(0)
      expect(total).toBe(agents.length)
    })

    it('should filter by category', async () => {
      const { agents } = await getAgents({ category: 'development' })
      agents.forEach((a) => expect(a.category).toBe('development'))
    })

    it('should filter by search query', async () => {
      const { agents } = await getAgents({ search: '번역' })
      expect(agents.length).toBeGreaterThan(0)
      agents.forEach((a) => {
        const match =
          a.name.includes('번역') ||
          a.description.includes('번역') ||
          a.tags.some((t) => t.includes('번역'))
        expect(match).toBe(true)
      })
    })

    it('should sort by rating', async () => {
      const { agents } = await getAgents({ sortBy: 'rating' })
      for (let i = 1; i < agents.length; i++) {
        expect(agents[i].rating).toBeLessThanOrEqual(agents[i - 1].rating)
      }
    })

    it('should sort by name', async () => {
      const { agents } = await getAgents({ sortBy: 'name' })
      for (let i = 1; i < agents.length; i++) {
        expect(agents[i].name.localeCompare(agents[i - 1].name)).toBeGreaterThanOrEqual(0)
      }
    })

    it('should sort by popular (installs) by default', async () => {
      const { agents } = await getAgents({ sortBy: 'popular' })
      for (let i = 1; i < agents.length; i++) {
        expect(agents[i].installs).toBeLessThanOrEqual(agents[i - 1].installs)
      }
    })

    it('should filter installed only', async () => {
      localStorage.setItem('hchat-installed-agents', JSON.stringify(['agent-translator']))
      const { agents } = await getAgents({ installedOnly: true })
      expect(agents.length).toBe(1)
      expect(agents[0].id).toBe('agent-translator')
    })

    it('should return empty when no match', async () => {
      const { agents, total } = await getAgents({ search: 'xyznonexistent' })
      expect(agents.length).toBe(0)
      expect(total).toBe(0)
    })
  })

  describe('getAgentById', () => {
    it('should return agent for valid id', async () => {
      const agent = await getAgentById('agent-code-review')
      expect(agent).not.toBeNull()
      expect(agent!.name).toBe('코드 리뷰어')
    })

    it('should return null for invalid id', async () => {
      const agent = await getAgentById('nonexistent')
      expect(agent).toBeNull()
    })
  })

  describe('install/uninstall', () => {
    it('should install an agent', async () => {
      const result = await installAgent('agent-translator')
      expect(result).toBe(true)
      expect(isInstalled('agent-translator')).toBe(true)
    })

    it('should not install duplicate', async () => {
      await installAgent('agent-translator')
      const result = await installAgent('agent-translator')
      expect(result).toBe(false)
    })

    it('should uninstall an agent', async () => {
      await installAgent('agent-translator')
      const result = await uninstallAgent('agent-translator')
      expect(result).toBe(true)
      expect(isInstalled('agent-translator')).toBe(false)
    })

    it('should return false when uninstalling non-installed', async () => {
      const result = await uninstallAgent('agent-translator')
      expect(result).toBe(false)
    })

    it('should handle multiple installs', async () => {
      await installAgent('agent-translator')
      await installAgent('agent-code-review')
      expect(isInstalled('agent-translator')).toBe(true)
      expect(isInstalled('agent-code-review')).toBe(true)

      await uninstallAgent('agent-translator')
      expect(isInstalled('agent-translator')).toBe(false)
      expect(isInstalled('agent-code-review')).toBe(true)
    })
  })

  describe('getAgentReviews', () => {
    it('should return reviews array', async () => {
      const reviews = await getAgentReviews('agent-translator')
      expect(reviews.length).toBeGreaterThan(0)
      expect(reviews[0]).toHaveProperty('rating')
      expect(reviews[0]).toHaveProperty('comment')
    })
  })
})
