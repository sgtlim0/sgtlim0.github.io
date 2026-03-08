import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  trackEvent,
  trackPageView,
  trackTiming,
  getEventHistory,
  clearEventHistory,
  setAnalyticsEnabled,
  isAnalyticsEnabled,
  registerProvider,
  removeAllProviders,
  flush,
  resetAnalytics,
  createConsoleProvider,
  createNoopProvider,
  type AnalyticsEvent,
  type AnalyticsProvider,
} from '../src/utils/analytics'

// Mock sanitizePII
vi.mock('../src/utils/sanitize', () => ({
  sanitizePII: vi.fn((text: string) => {
    // Simulate masking emails
    const sanitized = text.replace(
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
      '[이메일]',
    )
    const maskedCount = sanitized !== text ? 1 : 0
    return { sanitized, maskedCount }
  }),
}))

describe('analytics', () => {
  beforeEach(() => {
    resetAnalytics()
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    resetAnalytics()
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  // ---------------------------------------------------------------------------
  // trackEvent
  // ---------------------------------------------------------------------------
  describe('trackEvent', () => {
    it('records events to history', () => {
      trackEvent('button_click', 'interaction', { buttonId: 'submit' })

      const history = getEventHistory()
      expect(history).toHaveLength(1)
      expect(history[0].name).toBe('button_click')
      expect(history[0].category).toBe('interaction')
      expect(history[0].properties).toEqual({ buttonId: 'submit' })
      expect(history[0].timestamp).toBeGreaterThan(0)
    })

    it('handles events without properties', () => {
      trackEvent('app_start', 'interaction')

      const history = getEventHistory()
      expect(history).toHaveLength(1)
      expect(history[0].properties).toBeUndefined()
    })

    it('records multiple events in order', () => {
      trackEvent('first', 'navigation')
      trackEvent('second', 'interaction')
      trackEvent('third', 'error')

      const history = getEventHistory()
      expect(history).toHaveLength(3)
      expect(history[0].name).toBe('first')
      expect(history[1].name).toBe('second')
      expect(history[2].name).toBe('third')
    })

    it('supports all event categories', () => {
      const categories = ['navigation', 'interaction', 'error', 'performance', 'business'] as const
      for (const category of categories) {
        trackEvent(`test_${category}`, category)
      }

      const history = getEventHistory()
      expect(history).toHaveLength(5)
      for (let i = 0; i < categories.length; i++) {
        expect(history[i].category).toBe(categories[i])
      }
    })
  })

  // ---------------------------------------------------------------------------
  // PII sanitization
  // ---------------------------------------------------------------------------
  describe('PII sanitization', () => {
    it('sanitizes string properties containing PII', () => {
      trackEvent('form_submit', 'interaction', {
        email: 'user@example.com',
        name: 'John',
      })

      const history = getEventHistory()
      expect(history[0].properties?.email).toBe('[이메일]')
      expect(history[0].properties?.name).toBe('John')
    })

    it('does not modify non-string properties', () => {
      trackEvent('metric', 'performance', {
        value: 42,
        nested: { key: 'val' },
        flag: true,
      })

      const history = getEventHistory()
      expect(history[0].properties?.value).toBe(42)
      expect(history[0].properties?.flag).toBe(true)
    })
  })

  // ---------------------------------------------------------------------------
  // trackPageView
  // ---------------------------------------------------------------------------
  describe('trackPageView', () => {
    it('tracks page views as navigation events', () => {
      trackPageView('/dashboard', 'Dashboard')

      const history = getEventHistory()
      expect(history).toHaveLength(1)
      expect(history[0].name).toBe('page_view')
      expect(history[0].category).toBe('navigation')
      expect(history[0].properties?.path).toBe('/dashboard')
      expect(history[0].properties?.title).toBe('Dashboard')
    })

    it('works without a title', () => {
      trackPageView('/about')

      const history = getEventHistory()
      expect(history[0].properties?.path).toBe('/about')
      expect(history[0].properties?.title).toBeUndefined()
    })
  })

  // ---------------------------------------------------------------------------
  // trackTiming
  // ---------------------------------------------------------------------------
  describe('trackTiming', () => {
    it('tracks timing as performance events', () => {
      trackTiming('api_response', 350)

      const history = getEventHistory()
      expect(history).toHaveLength(1)
      expect(history[0].name).toBe('api_response')
      expect(history[0].category).toBe('performance')
      expect(history[0].properties?.durationMs).toBe(350)
    })
  })

  // ---------------------------------------------------------------------------
  // getEventHistory
  // ---------------------------------------------------------------------------
  describe('getEventHistory', () => {
    it('returns a copy, not the internal array', () => {
      trackEvent('test', 'interaction')
      const h1 = getEventHistory()
      const h2 = getEventHistory()
      expect(h1).toEqual(h2)
      expect(h1).not.toBe(h2)
    })

    it('returns the most recent N events when limit is provided', () => {
      for (let i = 0; i < 5; i++) {
        trackEvent(`event_${i}`, 'interaction')
      }

      const last3 = getEventHistory(3)
      expect(last3).toHaveLength(3)
      expect(last3[0].name).toBe('event_2')
      expect(last3[2].name).toBe('event_4')
    })

    it('returns all events when limit exceeds count', () => {
      trackEvent('only', 'interaction')
      const all = getEventHistory(100)
      expect(all).toHaveLength(1)
    })
  })

  // ---------------------------------------------------------------------------
  // clearEventHistory
  // ---------------------------------------------------------------------------
  describe('clearEventHistory', () => {
    it('clears both history and buffer', () => {
      trackEvent('a', 'interaction')
      trackEvent('b', 'interaction')
      clearEventHistory()

      expect(getEventHistory()).toHaveLength(0)
    })
  })

  // ---------------------------------------------------------------------------
  // setAnalyticsEnabled / isAnalyticsEnabled
  // ---------------------------------------------------------------------------
  describe('setAnalyticsEnabled', () => {
    it('disables event tracking when set to false', () => {
      setAnalyticsEnabled(false)
      trackEvent('ignored', 'interaction')

      expect(getEventHistory()).toHaveLength(0)
      expect(isAnalyticsEnabled()).toBe(false)
    })

    it('re-enables event tracking when set to true', () => {
      setAnalyticsEnabled(false)
      trackEvent('ignored', 'interaction')
      setAnalyticsEnabled(true)
      trackEvent('captured', 'interaction')

      expect(getEventHistory()).toHaveLength(1)
      expect(getEventHistory()[0].name).toBe('captured')
      expect(isAnalyticsEnabled()).toBe(true)
    })
  })

  // ---------------------------------------------------------------------------
  // Providers
  // ---------------------------------------------------------------------------
  describe('registerProvider', () => {
    it('calls init on registration', () => {
      const init = vi.fn()
      const provider: AnalyticsProvider = {
        name: 'test',
        sendBatch: vi.fn(),
        init,
      }

      registerProvider(provider)
      expect(init).toHaveBeenCalledOnce()
    })

    it('handles init errors gracefully', () => {
      const provider: AnalyticsProvider = {
        name: 'bad-init',
        sendBatch: vi.fn(),
        init: () => {
          throw new Error('init failure')
        },
      }

      // Should not throw
      expect(() => registerProvider(provider)).not.toThrow()
    })
  })

  describe('removeAllProviders', () => {
    it('calls destroy on all providers', () => {
      const destroy1 = vi.fn()
      const destroy2 = vi.fn()

      registerProvider({ name: 'p1', sendBatch: vi.fn(), destroy: destroy1 })
      registerProvider({ name: 'p2', sendBatch: vi.fn(), destroy: destroy2 })

      removeAllProviders()

      expect(destroy1).toHaveBeenCalledOnce()
      expect(destroy2).toHaveBeenCalledOnce()
    })

    it('handles destroy errors gracefully', () => {
      registerProvider({
        name: 'bad-destroy',
        sendBatch: vi.fn(),
        destroy: () => {
          throw new Error('destroy failure')
        },
      })

      expect(() => removeAllProviders()).not.toThrow()
    })
  })

  // ---------------------------------------------------------------------------
  // Batching / flush
  // ---------------------------------------------------------------------------
  describe('batching', () => {
    it('flushes events to providers when batch size (10) is reached', () => {
      const sendBatch = vi.fn()
      registerProvider({ name: 'batch-test', sendBatch })

      // Track 10 events to trigger auto-flush
      for (let i = 0; i < 10; i++) {
        trackEvent(`event_${i}`, 'interaction')
      }

      expect(sendBatch).toHaveBeenCalledOnce()
      expect(sendBatch.mock.calls[0][0]).toHaveLength(10)
    })

    it('does not flush before batch size is reached', () => {
      const sendBatch = vi.fn()
      registerProvider({ name: 'batch-test', sendBatch })

      for (let i = 0; i < 9; i++) {
        trackEvent(`event_${i}`, 'interaction')
      }

      expect(sendBatch).not.toHaveBeenCalled()
    })

    it('flushes remaining events on manual flush()', () => {
      const sendBatch = vi.fn()
      registerProvider({ name: 'manual-flush', sendBatch })

      trackEvent('partial', 'interaction')
      flush()

      expect(sendBatch).toHaveBeenCalledOnce()
      expect(sendBatch.mock.calls[0][0]).toHaveLength(1)
    })

    it('does not flush when buffer is empty', () => {
      const sendBatch = vi.fn()
      registerProvider({ name: 'empty', sendBatch })

      flush()
      expect(sendBatch).not.toHaveBeenCalled()
    })

    it('flushes on timer interval (5s)', () => {
      const sendBatch = vi.fn()
      registerProvider({ name: 'timer-flush', sendBatch })

      trackEvent('timed', 'interaction')
      vi.advanceTimersByTime(5000)

      expect(sendBatch).toHaveBeenCalledOnce()
    })

    it('sends events to multiple providers', () => {
      const sendBatch1 = vi.fn()
      const sendBatch2 = vi.fn()
      registerProvider({ name: 'p1', sendBatch: sendBatch1 })
      registerProvider({ name: 'p2', sendBatch: sendBatch2 })

      trackEvent('multi', 'interaction')
      flush()

      expect(sendBatch1).toHaveBeenCalledOnce()
      expect(sendBatch2).toHaveBeenCalledOnce()
    })

    it('handles provider sendBatch errors gracefully', () => {
      registerProvider({
        name: 'error-provider',
        sendBatch: () => {
          throw new Error('send failure')
        },
      })

      trackEvent('test', 'interaction')
      expect(() => flush()).not.toThrow()
    })
  })

  // ---------------------------------------------------------------------------
  // History cap
  // ---------------------------------------------------------------------------
  describe('history cap', () => {
    it('caps event history at 500 entries', () => {
      for (let i = 0; i < 550; i++) {
        trackEvent(`event_${i}`, 'interaction')
      }

      const history = getEventHistory()
      expect(history).toHaveLength(500)
      // Should keep the most recent
      expect(history[0].name).toBe('event_50')
      expect(history[499].name).toBe('event_549')
    })
  })

  // ---------------------------------------------------------------------------
  // Built-in providers
  // ---------------------------------------------------------------------------
  describe('createConsoleProvider', () => {
    it('creates a provider named "console"', () => {
      const provider = createConsoleProvider()
      expect(provider.name).toBe('console')
    })

    it('logs events via console.debug', () => {
      const debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {})
      const provider = createConsoleProvider()

      const event: AnalyticsEvent = {
        name: 'test',
        category: 'interaction',
        properties: { key: 'value' },
        timestamp: Date.now(),
      }

      provider.sendBatch([event])
      expect(debugSpy).toHaveBeenCalledOnce()
      expect(debugSpy).toHaveBeenCalledWith(
        '[analytics] interaction/test',
        { key: 'value' },
      )
    })

    it('uses empty string when properties are undefined', () => {
      const debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {})
      const provider = createConsoleProvider()

      provider.sendBatch([{ name: 'bare', category: 'error', timestamp: Date.now() }])
      expect(debugSpy).toHaveBeenCalledWith('[analytics] error/bare', '')
    })
  })

  describe('createNoopProvider', () => {
    it('creates a provider named "noop"', () => {
      const provider = createNoopProvider()
      expect(provider.name).toBe('noop')
    })

    it('does not throw when sendBatch is called', () => {
      const provider = createNoopProvider()
      expect(() =>
        provider.sendBatch([{ name: 'x', category: 'navigation', timestamp: 0 }]),
      ).not.toThrow()
    })
  })

  // ---------------------------------------------------------------------------
  // resetAnalytics
  // ---------------------------------------------------------------------------
  describe('resetAnalytics', () => {
    it('restores default state', () => {
      setAnalyticsEnabled(false)
      trackEvent('ignored', 'interaction')
      resetAnalytics()

      expect(isAnalyticsEnabled()).toBe(true)
      expect(getEventHistory()).toHaveLength(0)
    })
  })
})
