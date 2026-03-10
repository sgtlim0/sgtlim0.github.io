/**
 * Circuit Breaker pattern implementation
 *
 * Prevents cascading failures by tracking consecutive errors and
 * temporarily blocking requests when a failure threshold is exceeded.
 *
 * State machine:
 *   CLOSED  → (failureThreshold failures) → OPEN
 *   OPEN    → (resetTimeout elapsed)      → HALF_OPEN
 *   HALF_OPEN → (successThreshold wins)   → CLOSED
 *   HALF_OPEN → (1 failure)               → OPEN
 */

export type CircuitState = 'closed' | 'open' | 'half-open'

export interface CircuitBreakerOptions {
  /** Consecutive failure count before opening the circuit (default 5) */
  failureThreshold: number
  /** Time in ms before an open circuit transitions to half-open (default 30 000) */
  resetTimeout: number
  /** Consecutive successes in half-open before closing the circuit (default 2) */
  successThreshold: number
  /** Called whenever the circuit changes state */
  onStateChange?: (from: CircuitState, to: CircuitState) => void
}

export interface CircuitBreakerStats {
  failures: number
  successes: number
  state: CircuitState
  lastFailure?: number
}

export interface CircuitBreaker {
  execute: <T>(fn: () => Promise<T>) => Promise<T>
  getState: () => CircuitState
  getStats: () => CircuitBreakerStats
  reset: () => void
}

export class CircuitBreakerError extends Error {
  public readonly circuitName: string

  constructor(name: string) {
    super(`Circuit breaker "${name}" is open — request blocked`)
    this.name = 'CircuitBreakerError'
    this.circuitName = name
  }
}

const DEFAULT_OPTIONS: CircuitBreakerOptions = {
  failureThreshold: 5,
  resetTimeout: 30_000,
  successThreshold: 2,
}

export function createCircuitBreaker(
  name: string,
  options?: Partial<CircuitBreakerOptions>,
): CircuitBreaker {
  const opts: CircuitBreakerOptions = { ...DEFAULT_OPTIONS, ...options }

  let state: CircuitState = 'closed'
  let failures = 0
  let successes = 0
  let lastFailure: number | undefined
  let resetTimer: ReturnType<typeof setTimeout> | undefined

  function transition(to: CircuitState): void {
    if (state === to) return
    const from = state
    state = to
    opts.onStateChange?.(from, to)
  }

  function scheduleReset(): void {
    if (resetTimer !== undefined) {
      clearTimeout(resetTimer)
    }
    resetTimer = setTimeout(() => {
      resetTimer = undefined
      transition('half-open')
    }, opts.resetTimeout)
  }

  function handleSuccess(): void {
    if (state === 'half-open') {
      successes += 1
      if (successes >= opts.successThreshold) {
        successes = 0
        failures = 0
        transition('closed')
      }
    } else if (state === 'closed') {
      failures = 0
    }
  }

  function handleFailure(): void {
    lastFailure = Date.now()

    if (state === 'half-open') {
      successes = 0
      failures = opts.failureThreshold
      transition('open')
      scheduleReset()
      return
    }

    failures += 1
    if (state === 'closed' && failures >= opts.failureThreshold) {
      transition('open')
      scheduleReset()
    }
  }

  async function execute<T>(fn: () => Promise<T>): Promise<T> {
    if (state === 'open') {
      throw new CircuitBreakerError(name)
    }

    try {
      const result = await fn()
      handleSuccess()
      return result
    } catch (error) {
      handleFailure()
      throw error
    }
  }

  function getState(): CircuitState {
    return state
  }

  function getStats(): CircuitBreakerStats {
    return {
      failures,
      successes,
      state,
      ...(lastFailure !== undefined ? { lastFailure } : {}),
    }
  }

  function reset(): void {
    if (resetTimer !== undefined) {
      clearTimeout(resetTimer)
      resetTimer = undefined
    }
    failures = 0
    successes = 0
    lastFailure = undefined
    transition('closed')
  }

  return { execute, getState, getStats, reset }
}
