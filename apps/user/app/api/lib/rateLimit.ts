/**
 * Memory-based rate limiter for API routes.
 *
 * Tracks request counts per IP within a sliding 1-minute window.
 * Entries are lazily cleaned up on each check to prevent memory leaks.
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

const WINDOW_MS = 60_000
const store = new Map<string, RateLimitEntry>()

/**
 * Check if a request from the given IP is within the rate limit.
 * @param ip - Client IP address
 * @param limit - Maximum requests per window (default: 10)
 * @returns Object with allowed status and remaining request count
 */
export function checkRateLimit(
  ip: string,
  limit: number = 10,
): { allowed: boolean; remaining: number } {
  const now = Date.now()

  cleanupExpiredEntries(now)

  const entry = store.get(ip)

  if (!entry || now >= entry.resetAt) {
    store.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return { allowed: true, remaining: limit - 1 }
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0 }
  }

  store.set(ip, { ...entry, count: entry.count + 1 })
  return { allowed: true, remaining: limit - entry.count - 1 }
}

function cleanupExpiredEntries(now: number): void {
  for (const [key, entry] of store) {
    if (now >= entry.resetAt) {
      store.delete(key)
    }
  }
}
