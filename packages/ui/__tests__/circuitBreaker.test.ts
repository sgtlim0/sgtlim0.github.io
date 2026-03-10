import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  createCircuitBreaker,
  CircuitBreakerError,
} from '../src/utils/circuitBreaker'
import type { CircuitState } from '../src/utils/circuitBreaker'

describe('createCircuitBreaker', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // ---------------------------------------------------------------------------
  // Initial state
  // ---------------------------------------------------------------------------
  it('starts in the closed state', () => {
    const cb = createCircuitBreaker('test')
    expect(cb.getState()).toBe('closed')
  })

  it('returns zeroed stats initially', () => {
    const cb = createCircuitBreaker('test')
    const stats = cb.getStats()
    expect(stats).toEqual({ failures: 0, successes: 0, state: 'closed' })
    expect(stats.lastFailure).toBeUndefined()
  })

  // ---------------------------------------------------------------------------
  // Successful execution
  // ---------------------------------------------------------------------------
  it('resolves the wrapped promise on success', async () => {
    const cb = createCircuitBreaker('test')
    const result = await cb.execute(() => Promise.resolve(42))
    expect(result).toBe(42)
  })

  it('resets failure count on a closed-state success', async () => {
    const cb = createCircuitBreaker('test', { failureThreshold: 3 })
    const fail = () => Promise.reject(new Error('fail'))

    await cb.execute(fail).catch(() => {})
    await cb.execute(fail).catch(() => {})
    expect(cb.getStats().failures).toBe(2)

    await cb.execute(() => Promise.resolve('ok'))
    expect(cb.getStats().failures).toBe(0)
  })

  // ---------------------------------------------------------------------------
  // Failure counting
  // ---------------------------------------------------------------------------
  it('tracks consecutive failures', async () => {
    const cb = createCircuitBreaker('test', { failureThreshold: 5 })
    const fail = () => Promise.reject(new Error('boom'))

    for (let i = 0; i < 3; i++) {
      await cb.execute(fail).catch(() => {})
    }

    expect(cb.getStats().failures).toBe(3)
    expect(cb.getState()).toBe('closed')
  })

  it('records lastFailure timestamp', async () => {
    vi.setSystemTime(new Date('2025-06-01T00:00:00Z'))
    const cb = createCircuitBreaker('test')
    await cb.execute(() => Promise.reject(new Error('err'))).catch(() => {})

    expect(cb.getStats().lastFailure).toBe(Date.now())
  })

  // ---------------------------------------------------------------------------
  // CLOSED → OPEN transition
  // ---------------------------------------------------------------------------
  it('opens after reaching the failure threshold', async () => {
    const onChange = vi.fn()
    const cb = createCircuitBreaker('test', {
      failureThreshold: 3,
      onStateChange: onChange,
    })

    const fail = () => Promise.reject(new Error('fail'))
    for (let i = 0; i < 3; i++) {
      await cb.execute(fail).catch(() => {})
    }

    expect(cb.getState()).toBe('open')
    expect(onChange).toHaveBeenCalledWith('closed', 'open')
  })

  it('throws CircuitBreakerError when open', async () => {
    const cb = createCircuitBreaker('api', { failureThreshold: 1 })
    await cb.execute(() => Promise.reject(new Error('fail'))).catch(() => {})

    await expect(cb.execute(() => Promise.resolve('ok'))).rejects.toThrow(
      CircuitBreakerError,
    )

    try {
      await cb.execute(() => Promise.resolve('ok'))
    } catch (e) {
      expect(e).toBeInstanceOf(CircuitBreakerError)
      expect((e as CircuitBreakerError).circuitName).toBe('api')
      expect((e as CircuitBreakerError).message).toContain('api')
    }
  })

  it('does not call the wrapped function when open', async () => {
    const cb = createCircuitBreaker('test', { failureThreshold: 1 })
    await cb.execute(() => Promise.reject(new Error('fail'))).catch(() => {})

    const spy = vi.fn(() => Promise.resolve('ok'))
    await cb.execute(spy).catch(() => {})

    expect(spy).not.toHaveBeenCalled()
  })

  // ---------------------------------------------------------------------------
  // OPEN → HALF-OPEN transition (resetTimeout)
  // ---------------------------------------------------------------------------
  it('transitions to half-open after resetTimeout', async () => {
    const onChange = vi.fn()
    const cb = createCircuitBreaker('test', {
      failureThreshold: 1,
      resetTimeout: 5000,
      onStateChange: onChange,
    })

    await cb.execute(() => Promise.reject(new Error('fail'))).catch(() => {})
    expect(cb.getState()).toBe('open')

    vi.advanceTimersByTime(4999)
    expect(cb.getState()).toBe('open')

    vi.advanceTimersByTime(1)
    expect(cb.getState()).toBe('half-open')
    expect(onChange).toHaveBeenCalledWith('open', 'half-open')
  })

  // ---------------------------------------------------------------------------
  // HALF-OPEN → CLOSED (success threshold)
  // ---------------------------------------------------------------------------
  it('closes after successThreshold successes in half-open', async () => {
    const onChange = vi.fn()
    const cb = createCircuitBreaker('test', {
      failureThreshold: 1,
      resetTimeout: 1000,
      successThreshold: 2,
      onStateChange: onChange,
    })

    await cb.execute(() => Promise.reject(new Error('fail'))).catch(() => {})
    vi.advanceTimersByTime(1000)
    expect(cb.getState()).toBe('half-open')

    await cb.execute(() => Promise.resolve('a'))
    expect(cb.getState()).toBe('half-open')

    await cb.execute(() => Promise.resolve('b'))
    expect(cb.getState()).toBe('closed')
    expect(onChange).toHaveBeenCalledWith('half-open', 'closed')
  })

  it('resets failure and success counters when closing from half-open', async () => {
    const cb = createCircuitBreaker('test', {
      failureThreshold: 1,
      resetTimeout: 1000,
      successThreshold: 1,
    })

    await cb.execute(() => Promise.reject(new Error('fail'))).catch(() => {})
    vi.advanceTimersByTime(1000)

    await cb.execute(() => Promise.resolve('ok'))
    const stats = cb.getStats()
    expect(stats.failures).toBe(0)
    expect(stats.successes).toBe(0)
    expect(stats.state).toBe('closed')
  })

  // ---------------------------------------------------------------------------
  // HALF-OPEN → OPEN (single failure)
  // ---------------------------------------------------------------------------
  it('reopens on a single failure in half-open', async () => {
    const onChange = vi.fn()
    const cb = createCircuitBreaker('test', {
      failureThreshold: 1,
      resetTimeout: 1000,
      successThreshold: 3,
      onStateChange: onChange,
    })

    // CLOSED → OPEN
    await cb.execute(() => Promise.reject(new Error('fail'))).catch(() => {})
    vi.advanceTimersByTime(1000)
    expect(cb.getState()).toBe('half-open')

    // HALF-OPEN → OPEN (one failure)
    await cb.execute(() => Promise.reject(new Error('again'))).catch(() => {})
    expect(cb.getState()).toBe('open')
    expect(onChange).toHaveBeenCalledWith('half-open', 'open')
  })

  it('schedules a new resetTimeout after reopening from half-open', async () => {
    const cb = createCircuitBreaker('test', {
      failureThreshold: 1,
      resetTimeout: 2000,
      successThreshold: 3,
    })

    // CLOSED → OPEN → HALF-OPEN → OPEN again
    await cb.execute(() => Promise.reject(new Error('1'))).catch(() => {})
    vi.advanceTimersByTime(2000)
    expect(cb.getState()).toBe('half-open')

    await cb.execute(() => Promise.reject(new Error('2'))).catch(() => {})
    expect(cb.getState()).toBe('open')

    // Should go half-open again after another resetTimeout
    vi.advanceTimersByTime(2000)
    expect(cb.getState()).toBe('half-open')
  })

  // ---------------------------------------------------------------------------
  // reset()
  // ---------------------------------------------------------------------------
  it('resets the circuit to closed from open', async () => {
    const onChange = vi.fn()
    const cb = createCircuitBreaker('test', {
      failureThreshold: 1,
      onStateChange: onChange,
    })

    await cb.execute(() => Promise.reject(new Error('fail'))).catch(() => {})
    expect(cb.getState()).toBe('open')

    cb.reset()
    expect(cb.getState()).toBe('closed')
    expect(cb.getStats()).toEqual({ failures: 0, successes: 0, state: 'closed' })
  })

  it('allows requests again after reset', async () => {
    const cb = createCircuitBreaker('test', { failureThreshold: 1 })
    await cb.execute(() => Promise.reject(new Error('fail'))).catch(() => {})

    cb.reset()
    const result = await cb.execute(() => Promise.resolve('ok'))
    expect(result).toBe('ok')
  })

  it('clears pending timers on reset', async () => {
    const cb = createCircuitBreaker('test', {
      failureThreshold: 1,
      resetTimeout: 5000,
    })

    await cb.execute(() => Promise.reject(new Error('fail'))).catch(() => {})
    cb.reset()

    // Advancing past the old resetTimeout should not change state
    vi.advanceTimersByTime(6000)
    expect(cb.getState()).toBe('closed')
  })

  // ---------------------------------------------------------------------------
  // Default options
  // ---------------------------------------------------------------------------
  it('uses default options when none provided', async () => {
    const cb = createCircuitBreaker('defaults')
    const fail = () => Promise.reject(new Error('fail'))

    // Default failureThreshold = 5
    for (let i = 0; i < 4; i++) {
      await cb.execute(fail).catch(() => {})
    }
    expect(cb.getState()).toBe('closed')

    await cb.execute(fail).catch(() => {})
    expect(cb.getState()).toBe('open')

    // Default resetTimeout = 30000
    vi.advanceTimersByTime(29999)
    expect(cb.getState()).toBe('open')

    vi.advanceTimersByTime(1)
    expect(cb.getState()).toBe('half-open')

    // Default successThreshold = 2
    await cb.execute(() => Promise.resolve(1))
    expect(cb.getState()).toBe('half-open')
    await cb.execute(() => Promise.resolve(2))
    expect(cb.getState()).toBe('closed')
  })

  // ---------------------------------------------------------------------------
  // onStateChange callback
  // ---------------------------------------------------------------------------
  it('fires onStateChange for every transition', async () => {
    const transitions: Array<[CircuitState, CircuitState]> = []
    const cb = createCircuitBreaker('test', {
      failureThreshold: 1,
      resetTimeout: 1000,
      successThreshold: 1,
      onStateChange: (from, to) => transitions.push([from, to]),
    })

    await cb.execute(() => Promise.reject(new Error('fail'))).catch(() => {})
    vi.advanceTimersByTime(1000)
    await cb.execute(() => Promise.resolve('ok'))

    expect(transitions).toEqual([
      ['closed', 'open'],
      ['open', 'half-open'],
      ['half-open', 'closed'],
    ])
  })

  it('does not fire onStateChange for no-op transitions', () => {
    const onChange = vi.fn()
    const cb = createCircuitBreaker('test', { onStateChange: onChange })

    cb.reset() // already closed → closed
    expect(onChange).not.toHaveBeenCalled()
  })

  // ---------------------------------------------------------------------------
  // Error propagation
  // ---------------------------------------------------------------------------
  it('propagates the original error on failure', async () => {
    const cb = createCircuitBreaker('test', { failureThreshold: 10 })
    const original = new Error('specific failure')

    await expect(cb.execute(() => Promise.reject(original))).rejects.toBe(original)
  })

  // ---------------------------------------------------------------------------
  // CircuitBreakerError
  // ---------------------------------------------------------------------------
  it('CircuitBreakerError has correct name and properties', () => {
    const error = new CircuitBreakerError('my-service')
    expect(error.name).toBe('CircuitBreakerError')
    expect(error.circuitName).toBe('my-service')
    expect(error.message).toContain('my-service')
    expect(error).toBeInstanceOf(Error)
  })

  // ---------------------------------------------------------------------------
  // Multiple independent circuit breakers
  // ---------------------------------------------------------------------------
  it('operates independently from other instances', async () => {
    const cb1 = createCircuitBreaker('cb1', { failureThreshold: 1 })
    const cb2 = createCircuitBreaker('cb2', { failureThreshold: 1 })

    await cb1.execute(() => Promise.reject(new Error('fail'))).catch(() => {})
    expect(cb1.getState()).toBe('open')
    expect(cb2.getState()).toBe('closed')

    const result = await cb2.execute(() => Promise.resolve('ok'))
    expect(result).toBe('ok')
  })
})
