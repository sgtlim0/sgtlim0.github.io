/**
 * SWR-like in-memory query cache.
 *
 * Stores fetched data with timestamps and stale-time metadata so consumers
 * (e.g. useQuery) can serve cached results while revalidating in the
 * background.
 *
 * - Pure in-memory — no localStorage / IndexedDB.
 * - SSR-safe — no browser globals required.
 */

export interface CacheEntry<T = unknown> {
  readonly data: T
  readonly timestamp: number
  readonly staleTime: number
}

export interface QueryCache {
  /** Retrieve an entry. Returns `null` when the key is absent. */
  get: <T>(key: string) => CacheEntry<T> | null
  /** Store data with a `staleTime` (ms). */
  set: <T>(key: string, data: T, staleTime: number) => void
  /** Invalidate one key (string) or all keys matching a pattern (RegExp). */
  invalidate: (key: string | RegExp) => void
  /** Remove **all** entries. */
  clear: () => void
  /** Current number of stored entries. */
  size: () => number
  /** Subscribe to invalidation events. Returns an unsubscribe function. */
  subscribe: (listener: (key: string) => void) => () => void
}

export function createQueryCache(): QueryCache {
  const store = new Map<string, CacheEntry>()
  const listeners = new Set<(key: string) => void>()

  function notify(key: string): void {
    listeners.forEach((fn) => fn(key))
  }

  return {
    get<T>(key: string): CacheEntry<T> | null {
      const entry = store.get(key)
      if (!entry) return null
      return entry as CacheEntry<T>
    },

    set<T>(key: string, data: T, staleTime: number): void {
      store.set(key, { data, timestamp: Date.now(), staleTime })
    },

    invalidate(key: string | RegExp): void {
      if (typeof key === 'string') {
        store.delete(key)
        notify(key)
      } else {
        const toDelete: string[] = []
        store.forEach((_, k) => {
          if (key.test(k)) {
            toDelete.push(k)
          }
        })
        toDelete.forEach((k) => {
          store.delete(k)
          notify(k)
        })
      }
    },

    clear(): void {
      const keys = Array.from(store.keys())
      store.clear()
      keys.forEach(notify)
    },

    size(): number {
      return store.size
    },

    subscribe(listener: (key: string) => void): () => void {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
  }
}
