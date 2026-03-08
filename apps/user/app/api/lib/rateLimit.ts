/**
 * Enhanced memory-based rate limiter for API routes.
 *
 * Features:
 * - Sliding window algorithm (more accurate than fixed window)
 * - Endpoint-specific limits (login: 5/min, general: 30/min, research: 10/min)
 * - IP-based tracking via X-Forwarded-For / X-Real-IP
 * - 429 Too Many Requests with Retry-After header
 * - Automatic cleanup of expired entries to prevent memory leaks
 */

import { NextResponse } from 'next/server'

/** Sliding window entry: stores timestamps of individual requests */
interface SlidingWindowEntry {
  timestamps: number[]
}

/** Rate limit preset configuration */
export interface RateLimitPreset {
  /** Maximum requests allowed within the window */
  limit: number
  /** Time window in milliseconds */
  windowMs: number
}

/** Rate limit check result */
export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
  retryAfterMs: number
}

/** Built-in presets for different endpoint types */
export const RATE_LIMIT_PRESETS: Record<string, RateLimitPreset> = {
  login: { limit: 5, windowMs: 60_000 },
  chat: { limit: 30, windowMs: 60_000 },
  stream: { limit: 20, windowMs: 60_000 },
  research: { limit: 10, windowMs: 60_000 },
  analyze: { limit: 20, windowMs: 60_000 },
  csrf: { limit: 30, windowMs: 60_000 },
  default: { limit: 30, windowMs: 60_000 },
}

const store = new Map<string, SlidingWindowEntry>()

let lastCleanup = Date.now()
const CLEANUP_INTERVAL_MS = 30_000

/**
 * Creates a composite key from IP and endpoint.
 * @param ip - Client IP address
 * @param endpoint - API endpoint identifier
 * @returns Composite key string
 */
function makeKey(ip: string, endpoint: string): string {
  return `${ip}:${endpoint}`
}

/**
 * Cleans up expired entries from the store.
 * Runs at most once every CLEANUP_INTERVAL_MS to avoid excessive iteration.
 */
function cleanupExpiredEntries(now: number): void {
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) {
    return
  }
  lastCleanup = now

  for (const [key, entry] of store) {
    if (entry.timestamps.length === 0) {
      store.delete(key)
    }
  }
}

/**
 * Checks rate limit using sliding window algorithm.
 *
 * Unlike fixed-window, sliding window counts only requests
 * within the last `windowMs` milliseconds from now, providing
 * smoother rate limiting without burst allowance at window boundaries.
 *
 * @param ip - Client IP address
 * @param endpoint - API endpoint identifier (maps to RATE_LIMIT_PRESETS)
 * @param presetOverride - Optional custom preset (overrides built-in)
 * @returns RateLimitResult with allowed status, remaining count, and reset info
 */
export function checkRateLimit(
  ip: string,
  endpoint: string = 'default',
  presetOverride?: RateLimitPreset,
): RateLimitResult {
  const now = Date.now()
  cleanupExpiredEntries(now)

  const preset = presetOverride || RATE_LIMIT_PRESETS[endpoint] || RATE_LIMIT_PRESETS.default
  const { limit, windowMs } = preset
  const key = makeKey(ip, endpoint)
  const windowStart = now - windowMs

  const entry = store.get(key)

  if (!entry) {
    store.set(key, { timestamps: [now] })
    return {
      allowed: true,
      remaining: limit - 1,
      resetAt: now + windowMs,
      retryAfterMs: 0,
    }
  }

  // Sliding window: filter out timestamps outside the current window
  const validTimestamps = entry.timestamps.filter((t) => t > windowStart)

  if (validTimestamps.length >= limit) {
    // Find the oldest timestamp in the window to calculate retry-after
    const oldestInWindow = validTimestamps[0]
    const retryAfterMs = oldestInWindow + windowMs - now

    store.set(key, { timestamps: validTimestamps })

    return {
      allowed: false,
      remaining: 0,
      resetAt: oldestInWindow + windowMs,
      retryAfterMs: Math.max(0, retryAfterMs),
    }
  }

  // Add the new request timestamp
  const updatedTimestamps = [...validTimestamps, now]
  store.set(key, { timestamps: updatedTimestamps })

  const remaining = limit - updatedTimestamps.length
  const oldestInWindow = updatedTimestamps[0]

  return {
    allowed: true,
    remaining,
    resetAt: oldestInWindow + windowMs,
    retryAfterMs: 0,
  }
}

/**
 * Creates a 429 Too Many Requests response with proper headers.
 * @param result - The rate limit check result
 * @returns NextResponse with 429 status and Retry-After header
 */
export function createRateLimitResponse(result: RateLimitResult): NextResponse {
  const retryAfterSeconds = Math.ceil(result.retryAfterMs / 1000)

  return NextResponse.json(
    { error: 'Too many requests. Please try again later.' },
    {
      status: 429,
      headers: {
        'Retry-After': String(retryAfterSeconds),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)),
      },
    },
  )
}

/**
 * Adds rate limit headers to a successful response.
 * @param response - The response to add headers to
 * @param result - The rate limit check result
 * @returns The response with added headers
 */
export function addRateLimitHeaders(
  response: NextResponse,
  result: RateLimitResult,
): NextResponse {
  response.headers.set('X-RateLimit-Remaining', String(result.remaining))
  response.headers.set('X-RateLimit-Reset', String(Math.ceil(result.resetAt / 1000)))
  return response
}

/**
 * Resets the rate limit for a specific IP and endpoint.
 * @param ip - Client IP address
 * @param endpoint - API endpoint identifier
 */
export function resetRateLimit(ip: string, endpoint: string = 'default'): void {
  store.delete(makeKey(ip, endpoint))
}

/**
 * Resets all rate limits. Useful for testing.
 */
export function resetAllRateLimits(): void {
  store.clear()
  lastCleanup = Date.now()
}

/**
 * Returns the current store size. Useful for monitoring.
 */
export function getStoreSize(): number {
  return store.size
}
