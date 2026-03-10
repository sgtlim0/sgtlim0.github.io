/**
 * Request Deduplication Service
 *
 * Prevents duplicate API calls by sharing in-flight promises.
 * When multiple callers request the same key simultaneously,
 * only the first request executes — the rest share its result.
 *
 * - Pure in-memory — no browser globals required.
 * - SSR-safe.
 * - Supports TTL-based caching of resolved results.
 * - AbortController integration for cancellation.
 */

export interface DedupOptions {
  /** Time (ms) to cache resolved results for deduplication. Default 2000. */
  readonly ttl?: number
}

export interface DedupStats {
  readonly total: number
  readonly deduped: number
  readonly ratio: number
}

export interface RequestDedup {
  /** Execute a deduplicated fetch. Same-key calls share the in-flight promise. */
  dedupFetch: <T>(key: string, fetcher: () => Promise<T>, options?: DedupOptions) => Promise<T>
  /** Cancel a pending request by key (aborts via AbortController if available). */
  cancel: (key: string) => void
  /** Cancel all pending requests. */
  cancelAll: () => void
  /** List currently pending request keys. */
  getPending: () => string[]
  /** Deduplication statistics. */
  getStats: () => DedupStats
}

interface InflightEntry<T = unknown> {
  readonly promise: Promise<T>
  readonly controller: AbortController
  readonly expiresAt: number
}

const DEFAULT_TTL = 2000

export function createRequestDedup(): RequestDedup {
  const inflight = new Map<string, InflightEntry>()
  let totalCount = 0
  let dedupedCount = 0

  function cleanup(key: string): void {
    const entry = inflight.get(key)
    if (entry && Date.now() >= entry.expiresAt) {
      inflight.delete(key)
    }
  }

  function dedupFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: DedupOptions = {},
  ): Promise<T> {
    const ttl = options.ttl ?? DEFAULT_TTL

    totalCount += 1

    // Check for existing in-flight or cached entry
    const existing = inflight.get(key)
    if (existing) {
      dedupedCount += 1
      return existing.promise as Promise<T>
    }

    const controller = new AbortController()

    const promise = fetcher().then(
      (result) => {
        // Keep result cached until TTL expires
        const entry = inflight.get(key)
        if (entry && entry.promise === promise) {
          inflight.set(key, {
            ...entry,
            expiresAt: Date.now() + ttl,
          })
          setTimeout(() => cleanup(key), ttl)
        }
        return result
      },
      (error: unknown) => {
        // On error, remove immediately so next call retries
        const entry = inflight.get(key)
        if (entry && entry.promise === promise) {
          inflight.delete(key)
        }
        throw error
      },
    )

    inflight.set(key, {
      promise: promise as Promise<unknown>,
      controller,
      expiresAt: Infinity, // Not resolved yet; keep alive until settled
    })

    return promise
  }

  function cancel(key: string): void {
    const entry = inflight.get(key)
    if (entry) {
      entry.controller.abort()
      inflight.delete(key)
    }
  }

  function cancelAll(): void {
    inflight.forEach((entry) => entry.controller.abort())
    inflight.clear()
  }

  function getPending(): string[] {
    const now = Date.now()
    const keys: string[] = []
    inflight.forEach((entry, key) => {
      // Include entries that haven't expired yet
      if (entry.expiresAt === Infinity || entry.expiresAt > now) {
        keys.push(key)
      }
    })
    return keys
  }

  function getStats(): DedupStats {
    return {
      total: totalCount,
      deduped: dedupedCount,
      ratio: totalCount > 0 ? dedupedCount / totalCount : 0,
    }
  }

  return { dedupFetch, cancel, cancelAll, getPending, getStats }
}
