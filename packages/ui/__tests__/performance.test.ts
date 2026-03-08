import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { lazy, debounce, throttle } from '../src/utils/performance'

describe('lazy', () => {
  it('defers computation until first access', () => {
    const factory = vi.fn(() => 42)
    const getValue = lazy(factory)
    expect(factory).not.toHaveBeenCalled()
    getValue()
    expect(factory).toHaveBeenCalledTimes(1)
  })

  it('returns the computed value on first call', () => {
    const getValue = lazy(() => 'hello')
    expect(getValue()).toBe('hello')
  })

  it('caches the result and does not recompute', () => {
    const factory = vi.fn(() => ({ key: 'value' }))
    const getValue = lazy(factory)

    const first = getValue()
    const second = getValue()
    const third = getValue()

    expect(factory).toHaveBeenCalledTimes(1)
    expect(first).toBe(second)
    expect(second).toBe(third)
  })

  it('handles factory that returns undefined', () => {
    const factory = vi.fn(() => undefined)
    const getValue = lazy(factory)

    const result = getValue()
    getValue()

    expect(result).toBeUndefined()
    expect(factory).toHaveBeenCalledTimes(1)
  })

  it('handles factory that returns null', () => {
    const factory = vi.fn(() => null)
    const getValue = lazy(factory)

    expect(getValue()).toBeNull()
    expect(factory).toHaveBeenCalledTimes(1)
  })
})

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('delays function execution by the specified delay', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 200)

    debounced()
    expect(fn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(200)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('resets the timer on subsequent calls', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 200)

    debounced()
    vi.advanceTimersByTime(100)
    debounced()
    vi.advanceTimersByTime(100)

    expect(fn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('passes arguments to the underlying function', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 100)

    debounced('arg1', 'arg2')
    vi.advanceTimersByTime(100)

    expect(fn).toHaveBeenCalledWith('arg1', 'arg2')
  })

  it('uses the latest arguments when called multiple times', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 100)

    debounced('first')
    debounced('second')
    debounced('third')

    vi.advanceTimersByTime(100)

    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith('third')
  })

  it('can be called again after the delay has passed', () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 100)

    debounced()
    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledTimes(1)

    debounced()
    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledTimes(2)
  })
})

describe('throttle', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('executes immediately on the first call', () => {
    const fn = vi.fn()
    const throttled = throttle(fn, 200)

    throttled()
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('ignores calls within the throttle window', () => {
    const fn = vi.fn()
    const throttled = throttle(fn, 200)

    throttled()
    throttled()
    throttled()

    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('allows a call after the throttle window expires', () => {
    const fn = vi.fn()
    const throttled = throttle(fn, 200)

    throttled()
    expect(fn).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(200)

    throttled()
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('passes arguments to the underlying function', () => {
    const fn = vi.fn()
    const throttled = throttle(fn, 200)

    throttled('a', 'b')
    expect(fn).toHaveBeenCalledWith('a', 'b')
  })

  it('uses the first call arguments during the throttle window', () => {
    const fn = vi.fn()
    const throttled = throttle(fn, 200)

    throttled('first')
    throttled('second')
    throttled('third')

    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith('first')
  })

  it('allows multiple cycles of throttle', () => {
    const fn = vi.fn()
    const throttled = throttle(fn, 100)

    throttled()
    expect(fn).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(100)
    throttled()
    expect(fn).toHaveBeenCalledTimes(2)

    vi.advanceTimersByTime(100)
    throttled()
    expect(fn).toHaveBeenCalledTimes(3)
  })
})
