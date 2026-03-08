import { describe, it, expect, beforeEach } from 'vitest'
import {
  isFeatureEnabled,
  getFeatureFlags,
  setFeatureFlag,
  subscribe,
  getSnapshot,
  getServerSnapshot,
  resetFlags,
} from '../src/utils/featureFlags'

describe('featureFlags', () => {
  beforeEach(() => {
    localStorage.clear()
    resetFlags()
  })

  describe('isFeatureEnabled', () => {
    it('should return true for enabled default flags', () => {
      expect(isFeatureEnabled('chat.streaming')).toBe(true)
      expect(isFeatureEnabled('roi.simulator')).toBe(true)
      expect(isFeatureEnabled('user.research')).toBe(true)
    })

    it('should return false for disabled default flags', () => {
      expect(isFeatureEnabled('desktop.swarm')).toBe(false)
    })

    it('should return false for non-existent flags', () => {
      expect(isFeatureEnabled('unknown.flag')).toBe(false)
      expect(isFeatureEnabled('')).toBe(false)
    })
  })

  describe('getFeatureFlags', () => {
    it('should return all default flags', () => {
      const flags = getFeatureFlags()
      expect(flags).toHaveLength(4)

      const keys = flags.map((f) => f.key)
      expect(keys).toContain('chat.streaming')
      expect(keys).toContain('roi.simulator')
      expect(keys).toContain('desktop.swarm')
      expect(keys).toContain('user.research')
    })

    it('should return flags with correct structure', () => {
      const flags = getFeatureFlags()
      for (const flag of flags) {
        expect(flag).toHaveProperty('key')
        expect(flag).toHaveProperty('enabled')
        expect(flag).toHaveProperty('description')
        expect(typeof flag.key).toBe('string')
        expect(typeof flag.enabled).toBe('boolean')
        expect(typeof flag.description).toBe('string')
      }
    })
  })

  describe('setFeatureFlag', () => {
    it('should toggle a flag from enabled to disabled', () => {
      expect(isFeatureEnabled('chat.streaming')).toBe(true)
      setFeatureFlag('chat.streaming', false)
      expect(isFeatureEnabled('chat.streaming')).toBe(false)
    })

    it('should toggle a flag from disabled to enabled', () => {
      expect(isFeatureEnabled('desktop.swarm')).toBe(false)
      setFeatureFlag('desktop.swarm', true)
      expect(isFeatureEnabled('desktop.swarm')).toBe(true)
    })

    it('should not create new flags for unknown keys', () => {
      const before = getFeatureFlags().length
      setFeatureFlag('unknown.flag', true)
      const after = getFeatureFlags().length
      expect(after).toBe(before)
      expect(isFeatureEnabled('unknown.flag')).toBe(false)
    })

    it('should not affect other flags when toggling one', () => {
      setFeatureFlag('chat.streaming', false)
      expect(isFeatureEnabled('roi.simulator')).toBe(true)
      expect(isFeatureEnabled('user.research')).toBe(true)
      expect(isFeatureEnabled('desktop.swarm')).toBe(false)
    })
  })

  describe('localStorage persistence', () => {
    it('should persist flag changes to localStorage', () => {
      setFeatureFlag('chat.streaming', false)
      const stored = localStorage.getItem('hchat_feature_flags')
      expect(stored).toBeTruthy()

      const parsed = JSON.parse(stored!)
      expect(parsed['chat.streaming']).toBe(false)
    })

    it('should restore flags from localStorage on load', () => {
      localStorage.setItem(
        'hchat_feature_flags',
        JSON.stringify({
          'chat.streaming': false,
          'desktop.swarm': true,
        })
      )
      resetFlags()

      expect(isFeatureEnabled('chat.streaming')).toBe(false)
      expect(isFeatureEnabled('desktop.swarm')).toBe(true)
      // Other flags keep defaults
      expect(isFeatureEnabled('roi.simulator')).toBe(true)
    })

    it('should handle invalid JSON in localStorage gracefully', () => {
      localStorage.setItem('hchat_feature_flags', 'not-valid-json{{{')
      resetFlags()

      // Should fall back to defaults
      expect(isFeatureEnabled('chat.streaming')).toBe(true)
      expect(isFeatureEnabled('desktop.swarm')).toBe(false)
    })

    it('should ignore unknown keys from localStorage', () => {
      localStorage.setItem(
        'hchat_feature_flags',
        JSON.stringify({
          'unknown.key': true,
          'chat.streaming': false,
        })
      )
      resetFlags()

      expect(isFeatureEnabled('chat.streaming')).toBe(false)
      expect(isFeatureEnabled('unknown.key')).toBe(false)
      expect(getFeatureFlags()).toHaveLength(4)
    })
  })

  describe('subscribe', () => {
    it('should notify listeners when a flag changes', () => {
      let callCount = 0
      subscribe(() => {
        callCount++
      })

      setFeatureFlag('chat.streaming', false)
      expect(callCount).toBe(1)

      setFeatureFlag('desktop.swarm', true)
      expect(callCount).toBe(2)
    })

    it('should return an unsubscribe function', () => {
      let callCount = 0
      const unsubscribe = subscribe(() => {
        callCount++
      })

      setFeatureFlag('chat.streaming', false)
      expect(callCount).toBe(1)

      unsubscribe()

      setFeatureFlag('chat.streaming', true)
      expect(callCount).toBe(1) // no additional call
    })

    it('should not notify when setting unknown flag', () => {
      let callCount = 0
      subscribe(() => {
        callCount++
      })

      setFeatureFlag('unknown.flag', true)
      expect(callCount).toBe(0)
    })
  })

  describe('getSnapshot', () => {
    it('should return current flag states as boolean record', () => {
      const snapshot = getSnapshot()
      expect(snapshot['chat.streaming']).toBe(true)
      expect(snapshot['desktop.swarm']).toBe(false)
      expect(typeof snapshot['roi.simulator']).toBe('boolean')
    })

    it('should reflect changes after setFeatureFlag', () => {
      setFeatureFlag('chat.streaming', false)
      const snapshot = getSnapshot()
      expect(snapshot['chat.streaming']).toBe(false)
    })
  })

  describe('getServerSnapshot', () => {
    it('should return default flag values', () => {
      // Even after changes, server snapshot returns defaults
      setFeatureFlag('chat.streaming', false)
      const serverSnapshot = getServerSnapshot()
      expect(serverSnapshot['chat.streaming']).toBe(true)
      expect(serverSnapshot['desktop.swarm']).toBe(false)
    })
  })

  describe('resetFlags', () => {
    it('should clear cached flags and reload from storage', () => {
      setFeatureFlag('chat.streaming', false)
      expect(isFeatureEnabled('chat.streaming')).toBe(false)

      localStorage.clear()
      resetFlags()

      expect(isFeatureEnabled('chat.streaming')).toBe(true)
    })
  })
})
