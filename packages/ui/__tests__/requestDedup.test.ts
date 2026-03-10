import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createRequestDedup } from '../src/utils/requestDedup'

describe('createRequestDedup', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // ---------------------------------------------------------------------------
  // Core deduplication
  // ---------------------------------------------------------------------------

  describe('dedupFetch — concurrent dedup', () => {
    it('executes the fetcher only once for concurrent same-key calls', async () => {
      const dedup = createRequestDedup()
      const fetcher = vi.fn().mockResolvedValue('result')

      const p1 = dedup.dedupFetch('key', fetcher)
      const p2 = dedup.dedupFetch('key', fetcher)
      const p3 = dedup.dedupFetch('key', fetcher)

      const [r1, r2, r3] = await Promise.all([p1, p2, p3])

      expect(fetcher).toHaveBeenCalledTimes(1)
      expect(r1).toBe('result')
      expect(r2).toBe('result')
      expect(r3).toBe('result')
    })

    it('returns the same Promise instance for concurrent calls', () => {
      const dedup = createRequestDedup()
      const fetcher = vi.fn().mockReturnValue(new Promise(() => {})) // never resolves

      const p1 = dedup.dedupFetch('key', fetcher)
      const p2 = dedup.dedupFetch('key', fetcher)

      expect(p1).toBe(p2)
    })

    it('allows different keys to run independently', async () => {
      const dedup = createRequestDedup()
      const fetcherA = vi.fn().mockResolvedValue('a')
      const fetcherB = vi.fn().mockResolvedValue('b')

      const [ra, rb] = await Promise.all([
        dedup.dedupFetch('keyA', fetcherA),
        dedup.dedupFetch('keyB', fetcherB),
      ])

      expect(fetcherA).toHaveBeenCalledTimes(1)
      expect(fetcherB).toHaveBeenCalledTimes(1)
      expect(ra).toBe('a')
      expect(rb).toBe('b')
    })
  })

  // ---------------------------------------------------------------------------
  // TTL caching
  // ---------------------------------------------------------------------------

  describe('dedupFetch — TTL cache', () => {
    it('serves cached result within TTL window', async () => {
      const dedup = createRequestDedup()
      const fetcher = vi.fn().mockResolvedValue('cached')

      await dedup.dedupFetch('k', fetcher, { ttl: 5000 })
      expect(fetcher).toHaveBeenCalledTimes(1)

      // Within TTL — should reuse cached promise
      const result = await dedup.dedupFetch('k', fetcher, { ttl: 5000 })
      expect(fetcher).toHaveBeenCalledTimes(1)
      expect(result).toBe('cached')
    })

    it('re-fetches after TTL expires', async () => {
      const dedup = createRequestDedup()
      const fetcher = vi.fn().mockResolvedValue('fresh')

      await dedup.dedupFetch('k', fetcher, { ttl: 1000 })
      expect(fetcher).toHaveBeenCalledTimes(1)

      // Advance past TTL
      vi.advanceTimersByTime(1001)

      await dedup.dedupFetch('k', fetcher, { ttl: 1000 })
      expect(fetcher).toHaveBeenCalledTimes(2)
    })

    it('uses default TTL of 2000ms', async () => {
      const dedup = createRequestDedup()
      const fetcher = vi.fn().mockResolvedValue('ok')

      await dedup.dedupFetch('k', fetcher)

      // Within default TTL
      vi.advanceTimersByTime(1999)
      await dedup.dedupFetch('k', fetcher)
      expect(fetcher).toHaveBeenCalledTimes(1)

      // Past default TTL
      vi.advanceTimersByTime(2)
      await dedup.dedupFetch('k', fetcher)
      expect(fetcher).toHaveBeenCalledTimes(2)
    })
  })

  // ---------------------------------------------------------------------------
  // Error sharing
  // ---------------------------------------------------------------------------

  describe('dedupFetch — error sharing', () => {
    it('shares errors across concurrent callers', async () => {
      const dedup = createRequestDedup()
      const error = new Error('network failure')
      const fetcher = vi.fn().mockRejectedValue(error)

      const p1 = dedup.dedupFetch('err', fetcher)
      const p2 = dedup.dedupFetch('err', fetcher)

      await expect(p1).rejects.toThrow('network failure')
      await expect(p2).rejects.toThrow('network failure')
      expect(fetcher).toHaveBeenCalledTimes(1)
    })

    it('removes entry on error so next call retries', async () => {
      const dedup = createRequestDedup()
      const fetcher = vi
        .fn()
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValue('success')

      await expect(dedup.dedupFetch('retry', fetcher)).rejects.toThrow('fail')
      const result = await dedup.dedupFetch('retry', fetcher)

      expect(result).toBe('success')
      expect(fetcher).toHaveBeenCalledTimes(2)
    })
  })

  // ---------------------------------------------------------------------------
  // cancel / cancelAll
  // ---------------------------------------------------------------------------

  describe('cancel', () => {
    it('removes the inflight entry for a specific key', () => {
      const dedup = createRequestDedup()
      const fetcher = vi.fn().mockReturnValue(new Promise(() => {}))

      dedup.dedupFetch('a', fetcher)
      dedup.dedupFetch('b', fetcher)

      expect(dedup.getPending()).toContain('a')
      expect(dedup.getPending()).toContain('b')

      dedup.cancel('a')

      expect(dedup.getPending()).not.toContain('a')
      expect(dedup.getPending()).toContain('b')
    })

    it('aborts the AbortController on cancel', () => {
      const dedup = createRequestDedup()
      // We can verify indirectly: after cancel, fetching the same key runs a new fetcher
      const fetcher1 = vi.fn().mockReturnValue(new Promise(() => {}))
      const fetcher2 = vi.fn().mockReturnValue(new Promise(() => {}))

      dedup.dedupFetch('key', fetcher1)
      dedup.cancel('key')

      // New call should invoke a new fetcher
      dedup.dedupFetch('key', fetcher2)
      expect(fetcher2).toHaveBeenCalledTimes(1)
    })

    it('is a no-op for non-existent keys', () => {
      const dedup = createRequestDedup()
      expect(() => dedup.cancel('nonexistent')).not.toThrow()
    })
  })

  describe('cancelAll', () => {
    it('clears all inflight entries', () => {
      const dedup = createRequestDedup()
      const fetcher = vi.fn().mockReturnValue(new Promise(() => {}))

      dedup.dedupFetch('a', fetcher)
      dedup.dedupFetch('b', fetcher)
      dedup.dedupFetch('c', fetcher)

      expect(dedup.getPending().length).toBe(3)

      dedup.cancelAll()

      expect(dedup.getPending().length).toBe(0)
    })
  })

  // ---------------------------------------------------------------------------
  // getPending
  // ---------------------------------------------------------------------------

  describe('getPending', () => {
    it('returns empty array when no requests are pending', () => {
      const dedup = createRequestDedup()
      expect(dedup.getPending()).toEqual([])
    })

    it('lists inflight request keys', () => {
      const dedup = createRequestDedup()
      const fetcher = vi.fn().mockReturnValue(new Promise(() => {}))

      dedup.dedupFetch('x', fetcher)
      dedup.dedupFetch('y', fetcher)

      const pending = dedup.getPending()
      expect(pending).toContain('x')
      expect(pending).toContain('y')
      expect(pending.length).toBe(2)
    })

    it('excludes expired cached entries', async () => {
      const dedup = createRequestDedup()
      const fetcher = vi.fn().mockResolvedValue('done')

      await dedup.dedupFetch('expired', fetcher, { ttl: 500 })

      // Entry cached but not yet expired
      expect(dedup.getPending()).toContain('expired')

      // Advance past TTL
      vi.advanceTimersByTime(501)

      expect(dedup.getPending()).not.toContain('expired')
    })
  })

  // ---------------------------------------------------------------------------
  // getStats
  // ---------------------------------------------------------------------------

  describe('getStats', () => {
    it('starts with zero stats', () => {
      const dedup = createRequestDedup()
      expect(dedup.getStats()).toEqual({ total: 0, deduped: 0, ratio: 0 })
    })

    it('tracks total and deduped counts', async () => {
      const dedup = createRequestDedup()
      const fetcher = vi.fn().mockResolvedValue('v')

      // First call: total=1, deduped=0
      const p1 = dedup.dedupFetch('s', fetcher)
      // Second call (deduped): total=2, deduped=1
      const p2 = dedup.dedupFetch('s', fetcher)
      // Third call (deduped): total=3, deduped=2
      const p3 = dedup.dedupFetch('s', fetcher)

      await Promise.all([p1, p2, p3])

      const stats = dedup.getStats()
      expect(stats.total).toBe(3)
      expect(stats.deduped).toBe(2)
      expect(stats.ratio).toBeCloseTo(2 / 3)
    })

    it('counts different keys as non-deduped', async () => {
      const dedup = createRequestDedup()
      const fetcher = vi.fn().mockResolvedValue('v')

      await dedup.dedupFetch('a', fetcher)
      await dedup.dedupFetch('b', fetcher)

      // After TTL expiry
      vi.advanceTimersByTime(3000)

      await dedup.dedupFetch('c', fetcher)

      const stats = dedup.getStats()
      expect(stats.total).toBe(3)
      expect(stats.deduped).toBe(0)
      expect(stats.ratio).toBe(0)
    })

    it('calculates ratio as 0 when no requests made', () => {
      const dedup = createRequestDedup()
      expect(dedup.getStats().ratio).toBe(0)
    })
  })

  // ---------------------------------------------------------------------------
  // Edge cases
  // ---------------------------------------------------------------------------

  describe('edge cases', () => {
    it('handles fetcher that returns undefined', async () => {
      const dedup = createRequestDedup()
      const fetcher = vi.fn().mockResolvedValue(undefined)

      const result = await dedup.dedupFetch('undef', fetcher)
      expect(result).toBeUndefined()
    })

    it('handles fetcher that returns null', async () => {
      const dedup = createRequestDedup()
      const fetcher = vi.fn().mockResolvedValue(null)

      const result = await dedup.dedupFetch('null', fetcher)
      expect(result).toBeNull()
    })

    it('handles non-Error rejection', async () => {
      const dedup = createRequestDedup()
      const fetcher = vi.fn().mockRejectedValue('string error')

      await expect(dedup.dedupFetch('str-err', fetcher)).rejects.toBe('string error')
    })

    it('handles rapid sequential calls after TTL', async () => {
      const dedup = createRequestDedup()
      let callCount = 0
      const fetcher = vi.fn().mockImplementation(() => {
        callCount += 1
        return Promise.resolve(callCount)
      })

      const r1 = await dedup.dedupFetch('seq', fetcher, { ttl: 100 })
      expect(r1).toBe(1)

      vi.advanceTimersByTime(101)

      const r2 = await dedup.dedupFetch('seq', fetcher, { ttl: 100 })
      expect(r2).toBe(2)
      expect(fetcher).toHaveBeenCalledTimes(2)
    })

    it('supports generic type inference', async () => {
      const dedup = createRequestDedup()
      interface User {
        readonly id: number
        readonly name: string
      }
      const fetcher = vi.fn().mockResolvedValue({ id: 1, name: 'Alice' })

      const result = await dedup.dedupFetch<User>('user', fetcher)
      expect(result.id).toBe(1)
      expect(result.name).toBe('Alice')
    })
  })
})
