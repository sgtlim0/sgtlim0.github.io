/**
 * In-memory sliding window rate limiter.
 * Tracks request counts per identifier (e.g., IP address) within a time window.
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
}

interface RateLimiterConfig {
  /** Maximum requests allowed within the window */
  limit: number
  /** Time window in milliseconds */
  windowMs: number
}

const store = new Map<string, RateLimitEntry>()

function now(): number {
  return Date.now()
}

function cleanup(identifier: string): void {
  const entry = store.get(identifier)
  if (entry && now() >= entry.resetAt) {
    store.delete(identifier)
  }
}

export function checkRateLimit(identifier: string, config: RateLimiterConfig): RateLimitResult {
  cleanup(identifier)

  const entry = store.get(identifier)

  if (!entry) {
    const resetAt = now() + config.windowMs
    store.set(identifier, { count: 1, resetAt })
    return {
      allowed: true,
      remaining: config.limit - 1,
      resetAt,
    }
  }

  if (entry.count >= config.limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
    }
  }

  const updatedEntry: RateLimitEntry = {
    count: entry.count + 1,
    resetAt: entry.resetAt,
  }
  store.set(identifier, updatedEntry)

  return {
    allowed: true,
    remaining: config.limit - updatedEntry.count,
    resetAt: entry.resetAt,
  }
}

export function resetRateLimit(identifier: string): void {
  store.delete(identifier)
}

export function resetAllRateLimits(): void {
  store.clear()
}
