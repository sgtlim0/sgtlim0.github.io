/**
 * Performance benchmark utilities.
 *
 * Provides `benchmark` and `benchmarkAsync` for measuring function execution
 * time with statistical aggregation. `compareBenchmarks` produces a formatted
 * comparison table.
 *
 * Uses `performance.now()` for sub-millisecond precision.
 * Automatically disabled in production (`NODE_ENV === 'production'`).
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BenchmarkResult {
  readonly name: string
  readonly iterations: number
  readonly totalMs: number
  readonly avgMs: number
  readonly minMs: number
  readonly maxMs: number
  readonly opsPerSec: number
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

const IS_PRODUCTION = typeof process !== 'undefined' && process.env?.NODE_ENV === 'production'

function now(): number {
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    return performance.now()
  }
  return Date.now()
}

function buildResult(name: string, durations: readonly number[]): BenchmarkResult {
  const iterations = durations.length
  const totalMs = durations.reduce((sum, d) => sum + d, 0)
  const avgMs = totalMs / iterations
  const minMs = Math.min(...durations)
  const maxMs = Math.max(...durations)
  const opsPerSec = avgMs > 0 ? 1000 / avgMs : Infinity

  return Object.freeze({
    name,
    iterations,
    totalMs: Math.round(totalMs * 1000) / 1000,
    avgMs: Math.round(avgMs * 1000) / 1000,
    minMs: Math.round(minMs * 1000) / 1000,
    maxMs: Math.round(maxMs * 1000) / 1000,
    opsPerSec: Math.round(opsPerSec * 100) / 100,
  })
}

const NOOP_RESULT: BenchmarkResult = Object.freeze({
  name: 'noop',
  iterations: 0,
  totalMs: 0,
  avgMs: 0,
  minMs: 0,
  maxMs: 0,
  opsPerSec: 0,
})

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

const DEFAULT_ITERATIONS = 100

/**
 * Synchronously benchmark a function over multiple iterations.
 * Returns aggregated timing statistics.
 *
 * In production (`NODE_ENV === 'production'`), returns a zero-valued result
 * without executing the function.
 */
export function benchmark(
  name: string,
  fn: () => void,
  iterations: number = DEFAULT_ITERATIONS,
): BenchmarkResult {
  if (IS_PRODUCTION) {
    return { ...NOOP_RESULT, name }
  }

  if (iterations < 1) {
    throw new Error(`[benchmark] iterations must be >= 1, got ${iterations}`)
  }

  const durations: number[] = new Array(iterations)

  // Warm-up run (not measured)
  fn()

  for (let i = 0; i < iterations; i++) {
    const start = now()
    fn()
    durations[i] = now() - start
  }

  return buildResult(name, durations)
}

/**
 * Asynchronously benchmark a function over multiple iterations.
 * Each iteration awaits the returned promise before starting the next.
 *
 * In production, returns a zero-valued result immediately.
 */
export async function benchmarkAsync(
  name: string,
  fn: () => Promise<void>,
  iterations: number = DEFAULT_ITERATIONS,
): Promise<BenchmarkResult> {
  if (IS_PRODUCTION) {
    return { ...NOOP_RESULT, name }
  }

  if (iterations < 1) {
    throw new Error(`[benchmarkAsync] iterations must be >= 1, got ${iterations}`)
  }

  const durations: number[] = new Array(iterations)

  // Warm-up run
  await fn()

  for (let i = 0; i < iterations; i++) {
    const start = now()
    await fn()
    durations[i] = now() - start
  }

  return buildResult(name, durations)
}

/**
 * Format a comparison table from an array of benchmark results.
 *
 * Example output:
 * ```
 * Benchmark Comparison
 * ┌──────────────┬──────┬──────────┬──────────┬──────────┬──────────────┐
 * │ Name         │ Iter │ Avg (ms) │ Min (ms) │ Max (ms) │ Ops/sec      │
 * ├──────────────┼──────┼──────────┼──────────┼──────────┼──────────────┤
 * │ searchEngine │  100 │    0.152 │    0.100 │    0.520 │     6,578.95 │
 * └──────────────┴──────┴──────────┴──────────┴──────────┴──────────────┘
 * ```
 */
export function compareBenchmarks(results: readonly BenchmarkResult[]): string {
  if (results.length === 0) return 'No benchmark results to compare.'

  const headers = ['Name', 'Iter', 'Avg (ms)', 'Min (ms)', 'Max (ms)', 'Ops/sec']

  const rows = results.map((r) => [
    r.name,
    String(r.iterations),
    r.avgMs.toFixed(3),
    r.minMs.toFixed(3),
    r.maxMs.toFixed(3),
    r.opsPerSec.toLocaleString('en-US', { maximumFractionDigits: 2 }),
  ])

  // Calculate column widths
  const widths = headers.map((h, col) =>
    Math.max(h.length, ...rows.map((row) => row[col].length)),
  )

  const pad = (str: string, width: number) => str + ' '.repeat(Math.max(0, width - str.length))

  const headerRow = '| ' + headers.map((h, i) => pad(h, widths[i])).join(' | ') + ' |'
  const separator = '| ' + widths.map((w) => '-'.repeat(w)).join(' | ') + ' |'
  const dataRows = rows.map(
    (row) => '| ' + row.map((cell, i) => pad(cell, widths[i])).join(' | ') + ' |',
  )

  return ['Benchmark Comparison', '', headerRow, separator, ...dataRows].join('\n')
}
