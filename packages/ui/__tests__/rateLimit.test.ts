import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { checkRateLimit, resetRateLimit, resetAllRateLimits } from '../src/utils/rateLimit'

const DEFAULT_CONFIG = { limit: 5, windowMs: 60_000 }

describe('checkRateLimit', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    resetAllRateLimits()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should allow the first request', () => {
    const result = checkRateLimit('192.168.1.1', DEFAULT_CONFIG)

    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(4)
  })

  it('should allow requests within the limit', () => {
    for (let i = 0; i < 4; i++) {
      const result = checkRateLimit('192.168.1.2', DEFAULT_CONFIG)
      expect(result.allowed).toBe(true)
    }
  })

  it('should allow exactly limit number of requests', () => {
    for (let i = 0; i < 5; i++) {
      const result = checkRateLimit('192.168.1.3', DEFAULT_CONFIG)
      expect(result.allowed).toBe(true)
    }
  })

  it('should block requests exceeding the limit', () => {
    for (let i = 0; i < 5; i++) {
      checkRateLimit('192.168.1.4', DEFAULT_CONFIG)
    }

    const blocked = checkRateLimit('192.168.1.4', DEFAULT_CONFIG)

    expect(blocked.allowed).toBe(false)
    expect(blocked.remaining).toBe(0)
  })

  it('should return correct remaining count', () => {
    const r1 = checkRateLimit('192.168.1.5', DEFAULT_CONFIG)
    expect(r1.remaining).toBe(4)

    const r2 = checkRateLimit('192.168.1.5', DEFAULT_CONFIG)
    expect(r2.remaining).toBe(3)

    const r3 = checkRateLimit('192.168.1.5', DEFAULT_CONFIG)
    expect(r3.remaining).toBe(2)

    const r4 = checkRateLimit('192.168.1.5', DEFAULT_CONFIG)
    expect(r4.remaining).toBe(1)

    const r5 = checkRateLimit('192.168.1.5', DEFAULT_CONFIG)
    expect(r5.remaining).toBe(0)
  })

  it('should track different IPs independently', () => {
    // Exhaust limit for IP A
    for (let i = 0; i < 5; i++) {
      checkRateLimit('10.0.0.1', DEFAULT_CONFIG)
    }
    const blockedA = checkRateLimit('10.0.0.1', DEFAULT_CONFIG)
    expect(blockedA.allowed).toBe(false)

    // IP B should still be allowed
    const allowedB = checkRateLimit('10.0.0.2', DEFAULT_CONFIG)
    expect(allowedB.allowed).toBe(true)
    expect(allowedB.remaining).toBe(4)
  })

  it('should reset after window expires', () => {
    // Exhaust limit
    for (let i = 0; i < 5; i++) {
      checkRateLimit('192.168.1.6', DEFAULT_CONFIG)
    }

    const blocked = checkRateLimit('192.168.1.6', DEFAULT_CONFIG)
    expect(blocked.allowed).toBe(false)

    // Advance time past the window
    vi.advanceTimersByTime(60_001)

    // Should be allowed again
    const afterReset = checkRateLimit('192.168.1.6', DEFAULT_CONFIG)
    expect(afterReset.allowed).toBe(true)
    expect(afterReset.remaining).toBe(4)
  })

  it('should include resetAt timestamp', () => {
    const now = Date.now()
    const result = checkRateLimit('192.168.1.7', DEFAULT_CONFIG)

    expect(result.resetAt).toBeGreaterThanOrEqual(now + DEFAULT_CONFIG.windowMs)
  })

  it('should handle custom window sizes', () => {
    const shortWindowConfig = { limit: 2, windowMs: 1000 }

    checkRateLimit('192.168.1.8', shortWindowConfig)
    checkRateLimit('192.168.1.8', shortWindowConfig)

    const blocked = checkRateLimit('192.168.1.8', shortWindowConfig)
    expect(blocked.allowed).toBe(false)

    vi.advanceTimersByTime(1001)

    const allowed = checkRateLimit('192.168.1.8', shortWindowConfig)
    expect(allowed.allowed).toBe(true)
  })

  it('should handle resetRateLimit for specific identifier', () => {
    for (let i = 0; i < 5; i++) {
      checkRateLimit('192.168.1.9', DEFAULT_CONFIG)
    }

    const blocked = checkRateLimit('192.168.1.9', DEFAULT_CONFIG)
    expect(blocked.allowed).toBe(false)

    resetRateLimit('192.168.1.9')

    const afterReset = checkRateLimit('192.168.1.9', DEFAULT_CONFIG)
    expect(afterReset.allowed).toBe(true)
    expect(afterReset.remaining).toBe(4)
  })

  it('should handle resetAllRateLimits', () => {
    for (let i = 0; i < 5; i++) {
      checkRateLimit('ip-a', DEFAULT_CONFIG)
      checkRateLimit('ip-b', DEFAULT_CONFIG)
    }

    expect(checkRateLimit('ip-a', DEFAULT_CONFIG).allowed).toBe(false)
    expect(checkRateLimit('ip-b', DEFAULT_CONFIG).allowed).toBe(false)

    resetAllRateLimits()

    expect(checkRateLimit('ip-a', DEFAULT_CONFIG).allowed).toBe(true)
    expect(checkRateLimit('ip-b', DEFAULT_CONFIG).allowed).toBe(true)
  })
})
