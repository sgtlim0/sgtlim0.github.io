/**
 * Memory-based rate limiter for LLM Router API routes.
 *
 * Sliding window algorithm with endpoint-specific limits.
 * Mirrors the pattern from apps/user/app/api/lib/rateLimit.ts.
 */

import { NextResponse } from 'next/server'

interface SlidingWindowEntry {
  timestamps: number[]
}

export interface RateLimitPreset {
  limit: number
  windowMs: number
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
  retryAfterMs: number
}

export const RATE_LIMIT_PRESETS: Record<string, RateLimitPreset> = {
  read: { limit: 60, windowMs: 60_000 },
  stream: { limit: 10, windowMs: 60_000 },
  compare: { limit: 20, windowMs: 60_000 },
  keys: { limit: 10, windowMs: 60_000 },
  default: { limit: 30, windowMs: 60_000 },
}

const store = new Map<string, SlidingWindowEntry>()

let lastCleanup = Date.now()
const CLEANUP_INTERVAL_MS = 30_000

function makeKey(ip: string, endpoint: string): string {
  return `${ip}:${endpoint}`
}

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

  const validTimestamps = entry.timestamps.filter((t) => t > windowStart)

  if (validTimestamps.length >= limit) {
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

export function createRateLimitResponse(result: RateLimitResult): NextResponse {
  const retryAfterSeconds = Math.ceil(result.retryAfterMs / 1000)

  return NextResponse.json(
    { success: false, error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' },
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

export function addRateLimitHeaders(response: NextResponse, result: RateLimitResult): NextResponse {
  response.headers.set('X-RateLimit-Remaining', String(result.remaining))
  response.headers.set('X-RateLimit-Reset', String(Math.ceil(result.resetAt / 1000)))
  return response
}
