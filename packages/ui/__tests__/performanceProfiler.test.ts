import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import {
  recordRender,
  onRenderCallback,
  getProfile,
  getProfileResults,
  clearProfiles,
  clearProfile,
} from '../src/utils/performanceProfiler'

describe('performanceProfiler', () => {
  beforeEach(() => {
    clearProfiles()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('recordRender', () => {
    it('creates initial metrics for new component', () => {
      recordRender('TestComp', 5.2)

      const profile = getProfile('TestComp')
      expect(profile).toBeDefined()
      expect(profile!.id).toBe('TestComp')
      expect(profile!.renderCount).toBe(1)
      expect(profile!.lastRenderTime).toBe(5.2)
      expect(profile!.averageRenderTime).toBe(5.2)
      expect(profile!.maxRenderTime).toBe(5.2)
      expect(profile!.totalRenderTime).toBe(5.2)
    })

    it('accumulates metrics on multiple renders', () => {
      recordRender('Counter', 3.0)
      recordRender('Counter', 7.0)
      recordRender('Counter', 5.0)

      const profile = getProfile('Counter')
      expect(profile).toBeDefined()
      expect(profile!.renderCount).toBe(3)
      expect(profile!.lastRenderTime).toBe(5.0)
      expect(profile!.totalRenderTime).toBe(15.0)
      expect(profile!.averageRenderTime).toBe(5.0)
      expect(profile!.maxRenderTime).toBe(7.0)
    })

    it('tracks max render time correctly', () => {
      recordRender('Heavy', 2.0)
      recordRender('Heavy', 20.0)
      recordRender('Heavy', 8.0)

      const profile = getProfile('Heavy')
      expect(profile!.maxRenderTime).toBe(20.0)
    })

    it('handles zero duration renders', () => {
      recordRender('Fast', 0)

      const profile = getProfile('Fast')
      expect(profile!.renderCount).toBe(1)
      expect(profile!.lastRenderTime).toBe(0)
      expect(profile!.averageRenderTime).toBe(0)
    })
  })

  describe('onRenderCallback', () => {
    it('records render via React.Profiler compatible callback', () => {
      onRenderCallback('ProfilerComp', 'mount', 4.5)
      onRenderCallback('ProfilerComp', 'update', 2.1)

      const profile = getProfile('ProfilerComp')
      expect(profile!.renderCount).toBe(2)
      expect(profile!.lastRenderTime).toBe(2.1)
      expect(profile!.totalRenderTime).toBeCloseTo(6.6)
    })
  })

  describe('getProfile', () => {
    it('returns undefined for unknown component', () => {
      expect(getProfile('NonExistent')).toBeUndefined()
    })

    it('returns immutable metrics object', () => {
      recordRender('Immutable', 3.0)
      const profile1 = getProfile('Immutable')
      recordRender('Immutable', 5.0)
      const profile2 = getProfile('Immutable')

      // Different references
      expect(profile1).not.toBe(profile2)
      // Old snapshot unchanged
      expect(profile1!.renderCount).toBe(1)
      expect(profile2!.renderCount).toBe(2)
    })
  })

  describe('getProfileResults', () => {
    it('returns empty array when no profiles', () => {
      expect(getProfileResults()).toEqual([])
    })

    it('returns all profiled components', () => {
      recordRender('CompA', 1.0)
      recordRender('CompB', 2.0)
      recordRender('CompC', 3.0)

      const results = getProfileResults()
      expect(results).toHaveLength(3)
      const ids = results.map((r) => r.id)
      expect(ids).toContain('CompA')
      expect(ids).toContain('CompB')
      expect(ids).toContain('CompC')
    })

    it('returns computed average for each component', () => {
      recordRender('Avg', 2.0)
      recordRender('Avg', 4.0)
      recordRender('Avg', 6.0)

      const results = getProfileResults()
      const avg = results.find((r) => r.id === 'Avg')
      expect(avg!.averageRenderTime).toBe(4.0)
    })
  })

  describe('clearProfiles', () => {
    it('removes all profiling data', () => {
      recordRender('A', 1.0)
      recordRender('B', 2.0)
      expect(getProfileResults()).toHaveLength(2)

      clearProfiles()
      expect(getProfileResults()).toHaveLength(0)
      expect(getProfile('A')).toBeUndefined()
    })
  })

  describe('clearProfile', () => {
    it('removes a single component profile', () => {
      recordRender('Keep', 1.0)
      recordRender('Remove', 2.0)

      clearProfile('Remove')

      expect(getProfile('Keep')).toBeDefined()
      expect(getProfile('Remove')).toBeUndefined()
      expect(getProfileResults()).toHaveLength(1)
    })

    it('does nothing for unknown component', () => {
      recordRender('Exists', 1.0)
      clearProfile('DoesNotExist')
      expect(getProfileResults()).toHaveLength(1)
    })
  })

  describe('production environment', () => {
    it('recordRender is a no-op when NODE_ENV is production', () => {
      const original = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'

      recordRender('ProdComp', 5.0)
      expect(getProfile('ProdComp')).toBeUndefined()

      process.env.NODE_ENV = original
    })

    it('getProfileResults returns empty in production', () => {
      // Record something first in dev
      recordRender('DevComp', 3.0)
      expect(getProfileResults()).toHaveLength(1)

      const original = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'

      expect(getProfileResults()).toEqual([])

      process.env.NODE_ENV = original
    })
  })

  describe('multiple components tracking', () => {
    it('tracks independent metrics per component', () => {
      recordRender('Sidebar', 10.0)
      recordRender('Header', 3.0)
      recordRender('Sidebar', 8.0)
      recordRender('Header', 1.0)
      recordRender('Sidebar', 12.0)

      const sidebar = getProfile('Sidebar')
      const header = getProfile('Header')

      expect(sidebar!.renderCount).toBe(3)
      expect(sidebar!.totalRenderTime).toBe(30.0)
      expect(sidebar!.maxRenderTime).toBe(12.0)
      expect(sidebar!.averageRenderTime).toBe(10.0)

      expect(header!.renderCount).toBe(2)
      expect(header!.totalRenderTime).toBe(4.0)
      expect(header!.maxRenderTime).toBe(3.0)
      expect(header!.averageRenderTime).toBe(2.0)
    })
  })
})
