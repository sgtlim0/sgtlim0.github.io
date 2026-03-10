# Performance Benchmarks

Automated performance benchmarks for critical utility functions in `@hchat/ui`.

## Benchmark Suite

| Benchmark | Target | Iterations | Threshold |
|-----------|--------|------------|-----------|
| `searchEngine:index` | Index 1,000 items | 10 | < 100ms |
| `searchEngine:search` | Search 1,000-item index | 100 | < 100ms |
| `queryCache:set` | 1,000 set operations | 50 | < 100ms |
| `queryCache:get` | 1,000 get operations | 100 | < 100ms |
| `queryCache:mixed` | 1,000 set + get cycles | 50 | < 100ms |
| `eventBus:emit` | 1,000 emit operations | 100 | < 100ms |
| `eventBus:sub-unsub` | 1,000 subscribe/unsubscribe | 50 | < 100ms |
| `VirtualList:visibleRange` | 10,000 items, 5 scroll positions | 100 | < 100ms |
| `VirtualList:variableHeight` | 10,000 variable-height items | 100 | < 100ms |
| `fuzzyMatch:1000ops` | 1,000 fuzzy match operations | 100 | < 100ms |
| `fuzzyMatch:longText` | 1,000-char text matching | 50 | < 100ms |

## Running Benchmarks

```bash
# Run benchmark tests only
npx vitest run packages/ui/__tests__/benchmarks.test.ts

# Run with verbose output
npx vitest run packages/ui/__tests__/benchmarks.test.ts --reporter=verbose
```

## Utilities

### `benchmark(name, fn, iterations?)`

Synchronous benchmark. Runs `fn` for `iterations` (default 100) and returns:

```typescript
interface BenchmarkResult {
  name: string
  iterations: number
  totalMs: number
  avgMs: number
  minMs: number
  maxMs: number
  opsPerSec: number
}
```

### `benchmarkAsync(name, fn, iterations?)`

Same as `benchmark` but for async functions. Awaits each iteration sequentially.

### `compareBenchmarks(results)`

Formats an array of `BenchmarkResult` into a readable comparison table.

### `useBenchmark()` (React Hook)

For measuring component render and interaction performance:

- `measureRender(name, renderFn)` — measure synchronous render time
- `measureInteraction(name, actionFn)` — measure async interaction time
- `results` — all recorded measurements
- `clearResults()` — clear measurement history

## Production Safety

All benchmark utilities are **disabled in production** (`NODE_ENV === 'production'`).
Functions return zero-valued results without executing the measured code.

## CI Considerations

The 100ms threshold is generous to accommodate CI environment variability.
Typical local execution times are well under 10ms for most benchmarks.
