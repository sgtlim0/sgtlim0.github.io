import { describe, it, expect } from 'vitest'
import { benchmark, benchmarkAsync, compareBenchmarks, type BenchmarkResult } from '../src/utils/benchmark'
import { createSearchIndex, search, fuzzyMatch, type SearchableItem } from '../src/utils/searchEngine'
import { createQueryCache } from '../src/utils/queryCache'
import { createEventBus } from '../src/utils/eventBus'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** CI environments are slower — use a generous threshold. */
const THRESHOLD_MS = 100

function generateSearchItems(count: number): SearchableItem[] {
  const categories = ['docs', 'api', 'guide', 'tutorial', 'reference']
  return Array.from({ length: count }, (_, i) => ({
    id: `item-${i}`,
    title: `Document title number ${i} about topic ${i % 50}`,
    body: `This is the body content for document ${i}. It contains various keywords like performance, benchmark, testing, optimization, and item-specific term-${i}.`,
    category: categories[i % categories.length],
    url: `/docs/${i}`,
  }))
}

// ---------------------------------------------------------------------------
// Benchmark: searchEngine
// ---------------------------------------------------------------------------

describe('Performance Benchmarks', () => {
  describe('searchEngine', () => {
    it('should index 1000 items within threshold', () => {
      const items = generateSearchItems(1000)

      const result = benchmark('searchEngine:index', () => {
        createSearchIndex(items)
      }, 10)

      expect(result.avgMs).toBeLessThan(THRESHOLD_MS)
      expect(result.iterations).toBe(10)
      expect(result.opsPerSec).toBeGreaterThan(0)
    })

    it('should search 1000-item index within threshold', () => {
      const items = generateSearchItems(1000)
      const index = createSearchIndex(items)

      const result = benchmark('searchEngine:search', () => {
        search(index, 'performance benchmark')
      }, 100)

      expect(result.avgMs).toBeLessThan(THRESHOLD_MS)
    })
  })

  // ---------------------------------------------------------------------------
  // Benchmark: queryCache
  // ---------------------------------------------------------------------------

  describe('queryCache', () => {
    it('should handle 1000 set operations within threshold', () => {
      const result = benchmark('queryCache:set', () => {
        const cache = createQueryCache()
        for (let i = 0; i < 1000; i++) {
          cache.set(`key-${i}`, { data: i, nested: { value: i * 2 } }, 60_000)
        }
      }, 50)

      expect(result.avgMs).toBeLessThan(THRESHOLD_MS)
    })

    it('should handle 1000 get operations within threshold', () => {
      const cache = createQueryCache()
      for (let i = 0; i < 1000; i++) {
        cache.set(`key-${i}`, { data: i }, 60_000)
      }

      const result = benchmark('queryCache:get', () => {
        for (let i = 0; i < 1000; i++) {
          cache.get(`key-${i}`)
        }
      }, 100)

      expect(result.avgMs).toBeLessThan(THRESHOLD_MS)
    })

    it('should handle mixed get/set within threshold', () => {
      const result = benchmark('queryCache:mixed', () => {
        const cache = createQueryCache()
        for (let i = 0; i < 1000; i++) {
          cache.set(`key-${i}`, { value: i }, 30_000)
          cache.get(`key-${i}`)
        }
      }, 50)

      expect(result.avgMs).toBeLessThan(THRESHOLD_MS)
    })
  })

  // ---------------------------------------------------------------------------
  // Benchmark: eventBus
  // ---------------------------------------------------------------------------

  describe('eventBus', () => {
    interface BenchEvents {
      'test:event': { value: number }
    }

    it('should handle 1000 emit operations within threshold', () => {
      const bus = createEventBus<BenchEvents>()
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      const handler = () => {}
      bus.on('test:event', handler)

      const result = benchmark('eventBus:emit', () => {
        for (let i = 0; i < 1000; i++) {
          bus.emit('test:event', { value: i })
        }
      }, 100)

      expect(result.avgMs).toBeLessThan(THRESHOLD_MS)
    })

    it('should handle subscribe/unsubscribe cycle within threshold', () => {
      const result = benchmark('eventBus:sub-unsub', () => {
        const bus = createEventBus<BenchEvents>()
        const unsubs: Array<() => void> = []

        for (let i = 0; i < 1000; i++) {
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          unsubs.push(bus.on('test:event', () => {}))
        }
        for (const unsub of unsubs) {
          unsub()
        }
      }, 50)

      expect(result.avgMs).toBeLessThan(THRESHOLD_MS)
    })
  })

  // ---------------------------------------------------------------------------
  // Benchmark: VirtualList visible range calculation
  // ---------------------------------------------------------------------------

  describe('VirtualList', () => {
    it('should compute visible range for 10000 items within threshold', () => {
      const ITEM_COUNT = 10_000
      const ITEM_HEIGHT = 40
      const CONTAINER_HEIGHT = 500
      const OVERSCAN = 5

      const result = benchmark('VirtualList:visibleRange', () => {
        // Simulate buildOffsets + findStartIndex (the hot path)
        const offsets = new Array<number>(ITEM_COUNT)
        let cumulative = 0
        for (let i = 0; i < ITEM_COUNT; i++) {
          cumulative += ITEM_HEIGHT
          offsets[i] = cumulative
        }

        // Binary search for start index at multiple scroll positions
        const scrollPositions = [0, 5000, 50000, 200000, 395000]

        for (const scrollTop of scrollPositions) {
          // Binary search
          let low = 0
          let high = offsets.length - 1
          while (low < high) {
            const mid = (low + high) >>> 1
            if (offsets[mid] <= scrollTop) {
              low = mid + 1
            } else {
              high = mid
            }
          }
          const startIdx = low

          // Compute visible items
          const visibleStart = Math.max(0, startIdx - OVERSCAN)
          const viewBottom = scrollTop + CONTAINER_HEIGHT
          let endIdx = startIdx
          while (endIdx < ITEM_COUNT && (endIdx === 0 ? 0 : offsets[endIdx - 1]) < viewBottom) {
            endIdx++
          }
          const _visibleEnd = Math.min(ITEM_COUNT - 1, endIdx - 1 + OVERSCAN)
          void _visibleEnd
        }
      }, 100)

      expect(result.avgMs).toBeLessThan(THRESHOLD_MS)
    })

    it('should handle variable-height items for 10000 items', () => {
      const ITEM_COUNT = 10_000

      const result = benchmark('VirtualList:variableHeight', () => {
        const offsets = new Array<number>(ITEM_COUNT)
        let cumulative = 0
        for (let i = 0; i < ITEM_COUNT; i++) {
          cumulative += 30 + (i % 5) * 10 // Variable heights: 30, 40, 50, 60, 70
          offsets[i] = cumulative
        }

        // Binary search at mid-point
        const scrollTop = cumulative / 2
        let low = 0
        let high = offsets.length - 1
        while (low < high) {
          const mid = (low + high) >>> 1
          if (offsets[mid] <= scrollTop) {
            low = mid + 1
          } else {
            high = mid
          }
        }
        void low
      }, 100)

      expect(result.avgMs).toBeLessThan(THRESHOLD_MS)
    })
  })

  // ---------------------------------------------------------------------------
  // Benchmark: fuzzyMatch
  // ---------------------------------------------------------------------------

  describe('fuzzyMatch', () => {
    it('should handle 1000 fuzzy match operations within threshold', () => {
      const texts = Array.from({ length: 100 }, (_, i) =>
        `Document about performance optimization and testing number ${i}`,
      )
      const queries = ['perf', 'optim', 'test', 'benchmark', 'doc num', 'perf opt test', 'xyz', 'tion', 'about', 'number']

      const result = benchmark('fuzzyMatch:1000ops', () => {
        for (const text of texts) {
          for (const query of queries) {
            fuzzyMatch(text, query)
          }
        }
      }, 100)

      expect(result.avgMs).toBeLessThan(THRESHOLD_MS)
    })

    it('should handle long text fuzzy matching', () => {
      const longText = 'A'.repeat(500) + ' performance ' + 'B'.repeat(500)

      const result = benchmark('fuzzyMatch:longText', () => {
        for (let i = 0; i < 1000; i++) {
          fuzzyMatch(longText, 'performance')
        }
      }, 50)

      expect(result.avgMs).toBeLessThan(THRESHOLD_MS)
    })
  })

  // ---------------------------------------------------------------------------
  // Benchmark utilities
  // ---------------------------------------------------------------------------

  describe('benchmark utility', () => {
    it('should return correct statistics', () => {
      const result = benchmark('utility:noop', () => {
        // Minimal work
        Math.random()
      }, 50)

      expect(result.name).toBe('utility:noop')
      expect(result.iterations).toBe(50)
      expect(result.totalMs).toBeGreaterThanOrEqual(0)
      expect(result.avgMs).toBeGreaterThanOrEqual(0)
      expect(result.minMs).toBeGreaterThanOrEqual(0)
      expect(result.maxMs).toBeGreaterThanOrEqual(result.minMs)
      expect(result.opsPerSec).toBeGreaterThan(0)
    })

    it('should throw for invalid iterations', () => {
      expect(() => benchmark('invalid', () => {}, 0)).toThrow('iterations must be >= 1')
      expect(() => benchmark('invalid', () => {}, -1)).toThrow('iterations must be >= 1')
    })

    it('should support async benchmarks', async () => {
      const result = await benchmarkAsync('async:delay', async () => {
        await Promise.resolve()
      }, 20)

      expect(result.name).toBe('async:delay')
      expect(result.iterations).toBe(20)
      expect(result.avgMs).toBeGreaterThanOrEqual(0)
    })

    it('should throw for invalid async iterations', async () => {
      await expect(
        benchmarkAsync('invalid', async () => {}, 0),
      ).rejects.toThrow('iterations must be >= 1')
    })
  })

  // ---------------------------------------------------------------------------
  // compareBenchmarks
  // ---------------------------------------------------------------------------

  describe('compareBenchmarks', () => {
    it('should format comparison table', () => {
      const results: BenchmarkResult[] = [
        { name: 'fast', iterations: 100, totalMs: 10, avgMs: 0.1, minMs: 0.05, maxMs: 0.2, opsPerSec: 10000 },
        { name: 'slow', iterations: 100, totalMs: 500, avgMs: 5, minMs: 3, maxMs: 8, opsPerSec: 200 },
      ]

      const table = compareBenchmarks(results)

      expect(table).toContain('Benchmark Comparison')
      expect(table).toContain('fast')
      expect(table).toContain('slow')
      expect(table).toContain('Name')
      expect(table).toContain('Avg (ms)')
      expect(table).toContain('Ops/sec')
    })

    it('should handle empty results', () => {
      const table = compareBenchmarks([])
      expect(table).toBe('No benchmark results to compare.')
    })
  })

  // ---------------------------------------------------------------------------
  // Summary: run all benchmarks and print comparison
  // ---------------------------------------------------------------------------

  describe('summary', () => {
    it('should pass all benchmarks and print comparison', () => {
      const items = generateSearchItems(1000)
      const index = createSearchIndex(items)

      const results: BenchmarkResult[] = []

      results.push(
        benchmark('searchEngine:index', () => {
          createSearchIndex(items)
        }, 10),
      )

      results.push(
        benchmark('searchEngine:search', () => {
          search(index, 'performance benchmark')
        }, 100),
      )

      results.push(
        benchmark('queryCache:set-1000', () => {
          const cache = createQueryCache()
          for (let i = 0; i < 1000; i++) {
            cache.set(`key-${i}`, { data: i }, 60_000)
          }
        }, 50),
      )

      const bus = createEventBus<{ 'bench:evt': { v: number } }>()
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      bus.on('bench:evt', () => {})

      results.push(
        benchmark('eventBus:emit-1000', () => {
          for (let i = 0; i < 1000; i++) {
            bus.emit('bench:evt', { v: i })
          }
        }, 100),
      )

      results.push(
        benchmark('fuzzyMatch:1000', () => {
          for (let i = 0; i < 1000; i++) {
            fuzzyMatch(`Document about performance ${i}`, 'perf')
          }
        }, 50),
      )

      const table = compareBenchmarks(results)
      expect(table).toContain('Benchmark Comparison')

      // All should be under threshold
      for (const r of results) {
        expect(r.avgMs, `${r.name} exceeded threshold`).toBeLessThan(THRESHOLD_MS)
      }
    })
  })
})
