'use client'

import { useCallback, useRef } from 'react'

/**
 * Render / interaction timing result.
 */
export interface TimingResult {
  readonly name: string
  readonly durationMs: number
  readonly timestamp: number
}

export interface UseBenchmarkReturn {
  /** Measure synchronous rendering time of a callback. */
  measureRender: (name: string, renderFn: () => void) => TimingResult
  /** Measure asynchronous interaction time. */
  measureInteraction: (name: string, actionFn: () => Promise<void>) => Promise<TimingResult>
  /** All recorded measurements. */
  readonly results: readonly TimingResult[]
  /** Clear recorded results. */
  clearResults: () => void
}

const IS_PRODUCTION = typeof process !== 'undefined' && process.env?.NODE_ENV === 'production'

function now(): number {
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    return performance.now()
  }
  return Date.now()
}

/**
 * Hook for measuring React component render and interaction performance.
 *
 * Disabled in production — returns zero-duration results without executing.
 *
 * @example
 * ```tsx
 * const { measureRender, measureInteraction, results } = useBenchmark()
 *
 * const timing = measureRender('MyComponent', () => {
 *   render(<MyComponent data={largeDataset} />)
 * })
 * console.log(`Render took ${timing.durationMs}ms`)
 * ```
 */
export function useBenchmark(): UseBenchmarkReturn {
  const resultsRef = useRef<TimingResult[]>([])

  const measureRender = useCallback((name: string, renderFn: () => void): TimingResult => {
    if (IS_PRODUCTION) {
      const result: TimingResult = { name, durationMs: 0, timestamp: Date.now() }
      return result
    }

    const start = now()
    renderFn()
    const durationMs = Math.round((now() - start) * 1000) / 1000

    const result: TimingResult = Object.freeze({
      name,
      durationMs,
      timestamp: Date.now(),
    })

    resultsRef.current = [...resultsRef.current, result]
    return result
  }, [])

  const measureInteraction = useCallback(
    async (name: string, actionFn: () => Promise<void>): Promise<TimingResult> => {
      if (IS_PRODUCTION) {
        const result: TimingResult = { name, durationMs: 0, timestamp: Date.now() }
        return result
      }

      const start = now()
      await actionFn()
      const durationMs = Math.round((now() - start) * 1000) / 1000

      const result: TimingResult = Object.freeze({
        name,
        durationMs,
        timestamp: Date.now(),
      })

      resultsRef.current = [...resultsRef.current, result]
      return result
    },
    [],
  )

  const clearResults = useCallback(() => {
    resultsRef.current = []
  }, [])

  return {
    measureRender,
    measureInteraction,
    get results() {
      return resultsRef.current
    },
    clearResults,
  }
}
