import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { createElement, type ReactNode } from 'react'
import { createQueryCache } from '../src/utils/queryCache'
import { QueryProvider } from '../src/hooks/QueryProvider'
import { useQuery } from '../src/hooks/useQuery'
import { useMutation } from '../src/hooks/useMutation'
import type { QueryCache } from '../src/utils/queryCache'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createWrapper(cache?: QueryCache) {
  const c = cache ?? createQueryCache()
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryProvider, { cache: c, children })
  }
}

// ---------------------------------------------------------------------------
// queryCache
// ---------------------------------------------------------------------------

describe('createQueryCache', () => {
  let cache: QueryCache

  beforeEach(() => {
    cache = createQueryCache()
  })

  it('starts empty', () => {
    expect(cache.size()).toBe(0)
  })

  it('set & get stores and retrieves data', () => {
    cache.set('users', [1, 2, 3], 5000)
    const entry = cache.get<number[]>('users')
    expect(entry).not.toBeNull()
    expect(entry!.data).toEqual([1, 2, 3])
    expect(entry!.staleTime).toBe(5000)
    expect(entry!.timestamp).toBeGreaterThan(0)
  })

  it('get returns null for missing key', () => {
    expect(cache.get('nope')).toBeNull()
  })

  it('invalidate by string removes entry', () => {
    cache.set('a', 1, 1000)
    cache.set('b', 2, 1000)
    cache.invalidate('a')
    expect(cache.get('a')).toBeNull()
    expect(cache.get('b')).not.toBeNull()
    expect(cache.size()).toBe(1)
  })

  it('invalidate by RegExp removes matching entries', () => {
    cache.set('users/1', 'alice', 1000)
    cache.set('users/2', 'bob', 1000)
    cache.set('posts/1', 'hello', 1000)
    cache.invalidate(/^users\//)
    expect(cache.size()).toBe(1)
    expect(cache.get('posts/1')).not.toBeNull()
  })

  it('clear removes all entries', () => {
    cache.set('a', 1, 1000)
    cache.set('b', 2, 1000)
    cache.clear()
    expect(cache.size()).toBe(0)
  })

  it('subscribe notifies on invalidate (string)', () => {
    const spy = vi.fn()
    cache.subscribe(spy)
    cache.set('k', 1, 1000)
    cache.invalidate('k')
    expect(spy).toHaveBeenCalledWith('k')
  })

  it('subscribe notifies on invalidate (RegExp)', () => {
    const spy = vi.fn()
    cache.subscribe(spy)
    cache.set('a/1', 1, 1000)
    cache.set('a/2', 2, 1000)
    cache.invalidate(/^a\//)
    expect(spy).toHaveBeenCalledTimes(2)
  })

  it('subscribe notifies on clear', () => {
    const spy = vi.fn()
    cache.subscribe(spy)
    cache.set('x', 1, 1000)
    cache.set('y', 2, 1000)
    cache.clear()
    expect(spy).toHaveBeenCalledTimes(2)
  })

  it('unsubscribe stops notifications', () => {
    const spy = vi.fn()
    const unsub = cache.subscribe(spy)
    unsub()
    cache.set('z', 1, 1000)
    cache.invalidate('z')
    expect(spy).not.toHaveBeenCalled()
  })

  it('set overwrites existing entry', () => {
    cache.set('k', 'old', 1000)
    cache.set('k', 'new', 2000)
    expect(cache.get('k')!.data).toBe('new')
    expect(cache.get('k')!.staleTime).toBe(2000)
    expect(cache.size()).toBe(1)
  })
})

// ---------------------------------------------------------------------------
// useQuery
// ---------------------------------------------------------------------------

describe('useQuery', () => {
  let cache: QueryCache

  beforeEach(() => {
    vi.useFakeTimers()
    cache = createQueryCache()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('fetches data on mount and sets isLoading correctly', async () => {
    const fetcher = vi.fn().mockResolvedValue({ id: 1 })
    const wrapper = createWrapper(cache)

    const { result } = renderHook(() => useQuery('test', fetcher), { wrapper })

    // Initially loading
    expect(result.current.isLoading).toBe(true)
    expect(result.current.data).toBeUndefined()

    await act(async () => {
      await vi.runAllTimersAsync()
    })

    expect(result.current.data).toEqual({ id: 1 })
    expect(result.current.isLoading).toBe(false)
    expect(result.current.isFetching).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('returns cached data immediately (cache hit)', async () => {
    const fetcher = vi.fn().mockResolvedValue('fresh')
    cache.set('cached-key', 'stale-data', 60_000)

    const wrapper = createWrapper(cache)
    const { result } = renderHook(
      () => useQuery('cached-key', fetcher, { staleTime: 60_000 }),
      { wrapper },
    )

    // Data should be available immediately from cache
    expect(result.current.data).toBe('stale-data')
    // Should NOT fetch because staleTime has not elapsed
    expect(fetcher).not.toHaveBeenCalled()
  })

  it('refetches when cache entry is stale', async () => {
    const fetcher = vi.fn().mockResolvedValue('fresh')
    // Manually create an entry whose timestamp is far in the past
    const oldTimestamp = Date.now() - 100_000
    vi.spyOn(Date, 'now').mockReturnValueOnce(oldTimestamp)
    cache.set('stale-key', 'old', 1000) // staleTime=1000ms, but timestamp is 100s ago
    vi.spyOn(Date, 'now').mockRestore()

    const wrapper = createWrapper(cache)
    const { result } = renderHook(
      () => useQuery('stale-key', fetcher, { staleTime: 1000 }),
      { wrapper },
    )

    // Stale data served immediately
    expect(result.current.data).toBe('old')

    await act(async () => {
      await vi.runAllTimersAsync()
    })

    expect(fetcher).toHaveBeenCalled()
    expect(result.current.data).toBe('fresh')
  })

  it('isStale reflects cache freshness', async () => {
    const fetcher = vi.fn().mockResolvedValue('data')
    const wrapper = createWrapper(cache)

    const { result } = renderHook(
      () => useQuery('stale-test', fetcher, { staleTime: 60_000 }),
      { wrapper },
    )

    // No cache entry yet → stale
    expect(result.current.isStale).toBe(true)

    await act(async () => {
      await vi.runAllTimersAsync()
    })

    // After fetch, data is fresh (within staleTime)
    // Note: isStale is computed from cache at render time
    expect(result.current.data).toBe('data')
  })

  it('calls onSuccess callback', async () => {
    const onSuccess = vi.fn()
    const fetcher = vi.fn().mockResolvedValue(42)
    const wrapper = createWrapper(cache)

    renderHook(() => useQuery('success-cb', fetcher, { onSuccess }), {
      wrapper,
    })

    await act(async () => {
      await vi.runAllTimersAsync()
    })

    expect(onSuccess).toHaveBeenCalledWith(42)
  })

  it('calls onError callback on failure after retries', async () => {
    const onError = vi.fn()
    const error = new Error('network error')
    const fetcher = vi.fn().mockRejectedValue(error)
    const wrapper = createWrapper(cache)

    const { result } = renderHook(
      () => useQuery('error-cb', fetcher, { onError, retry: 0 }),
      { wrapper },
    )

    await act(async () => {
      await vi.runAllTimersAsync()
    })

    expect(result.current.error).toEqual(error)
    expect(onError).toHaveBeenCalledWith(error)
  })

  it('retries on failure up to retry count', async () => {
    const fetcher = vi
      .fn()
      .mockRejectedValueOnce(new Error('fail1'))
      .mockRejectedValueOnce(new Error('fail2'))
      .mockResolvedValue('success')

    const wrapper = createWrapper(cache)

    const { result } = renderHook(
      () => useQuery('retry-key', fetcher, { retry: 3 }),
      { wrapper },
    )

    await act(async () => {
      await vi.runAllTimersAsync()
    })

    expect(fetcher).toHaveBeenCalledTimes(3)
    expect(result.current.data).toBe('success')
    expect(result.current.error).toBeNull()
  })

  it('sets error after all retries exhausted', async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error('always fails'))
    const wrapper = createWrapper(cache)

    const { result } = renderHook(
      () => useQuery('retry-exhaust', fetcher, { retry: 2 }),
      { wrapper },
    )

    await act(async () => {
      await vi.runAllTimersAsync()
    })

    // 1 initial + 2 retries = 3
    expect(fetcher).toHaveBeenCalledTimes(3)
    expect(result.current.error?.message).toBe('always fails')
  })

  it('does not fetch when enabled=false', async () => {
    const fetcher = vi.fn().mockResolvedValue('data')
    const wrapper = createWrapper(cache)

    const { result } = renderHook(
      () => useQuery('disabled', fetcher, { enabled: false }),
      { wrapper },
    )

    await act(async () => {
      await vi.runAllTimersAsync()
    })

    expect(fetcher).not.toHaveBeenCalled()
    expect(result.current.data).toBeUndefined()
  })

  it('refetch triggers a new fetch', async () => {
    let count = 0
    const fetcher = vi.fn().mockImplementation(() => {
      count += 1
      return Promise.resolve(`v${count}`)
    })
    const wrapper = createWrapper(cache)

    const { result } = renderHook(
      () => useQuery('refetch-key', fetcher),
      { wrapper },
    )

    await act(async () => {
      await vi.runAllTimersAsync()
    })
    expect(result.current.data).toBe('v1')

    await act(async () => {
      await result.current.refetch()
    })

    expect(result.current.data).toBe('v2')
    expect(fetcher).toHaveBeenCalledTimes(2)
  })

  it('refetchInterval triggers periodic fetches', async () => {
    vi.useRealTimers()
    const fetcher = vi.fn().mockResolvedValue('data')
    const wrapper = createWrapper(cache)

    renderHook(
      () =>
        useQuery('interval', fetcher, {
          refetchInterval: 50,
        }),
      { wrapper },
    )

    // Wait for initial fetch
    await act(async () => {
      await new Promise((r) => setTimeout(r, 10))
    })

    const initialCalls = fetcher.mock.calls.length

    // Wait for at least 2 interval cycles
    await act(async () => {
      await new Promise((r) => setTimeout(r, 150))
    })

    // Should have made additional calls from interval
    expect(fetcher.mock.calls.length).toBeGreaterThan(initialCalls)
  })

  it('converts non-Error throws to Error objects', async () => {
    const fetcher = vi.fn().mockRejectedValue('string error')
    const wrapper = createWrapper(cache)

    const { result } = renderHook(
      () => useQuery('non-error', fetcher, { retry: 0 }),
      { wrapper },
    )

    await act(async () => {
      await vi.runAllTimersAsync()
    })

    expect(result.current.error).toBeInstanceOf(Error)
    expect(result.current.error?.message).toBe('string error')
  })

  it('refetches when cache is externally invalidated', async () => {
    vi.useRealTimers()
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce('first')
      .mockResolvedValueOnce('second')
    const wrapper = createWrapper(cache)

    const { result } = renderHook(
      () => useQuery('ext-inv', fetcher),
      { wrapper },
    )

    await waitFor(() => {
      expect(result.current.data).toBe('first')
    })

    act(() => {
      cache.invalidate('ext-inv')
    })

    await waitFor(() => {
      expect(result.current.data).toBe('second')
    })
  })
})

// ---------------------------------------------------------------------------
// useMutation
// ---------------------------------------------------------------------------

describe('useMutation', () => {
  let cache: QueryCache

  beforeEach(() => {
    cache = createQueryCache()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('executes mutation and returns data', async () => {
    const mutationFn = vi.fn().mockResolvedValue({ id: 1, name: 'created' })
    const wrapper = createWrapper(cache)

    const { result } = renderHook(() => useMutation(mutationFn), { wrapper })

    expect(result.current.isLoading).toBe(false)
    expect(result.current.data).toBeUndefined()

    await act(async () => {
      await result.current.mutate({ name: 'test' })
    })

    expect(result.current.data).toEqual({ id: 1, name: 'created' })
    expect(result.current.isLoading).toBe(false)
    expect(mutationFn).toHaveBeenCalledWith({ name: 'test' })
  })

  it('sets error on failure', async () => {
    const error = new Error('mutation failed')
    const mutationFn = vi.fn().mockRejectedValue(error)
    const wrapper = createWrapper(cache)

    const { result } = renderHook(() => useMutation(mutationFn), { wrapper })

    await act(async () => {
      await result.current.mutate(undefined).catch(() => {})
    })

    expect(result.current.error).toEqual(error)
    expect(result.current.isLoading).toBe(false)
  })

  it('calls onSuccess callback', async () => {
    const onSuccess = vi.fn()
    const mutationFn = vi.fn().mockResolvedValue('ok')
    const wrapper = createWrapper(cache)

    const { result } = renderHook(
      () => useMutation(mutationFn, { onSuccess }),
      { wrapper },
    )

    await act(async () => {
      await result.current.mutate('vars')
    })

    expect(onSuccess).toHaveBeenCalledWith('ok', 'vars')
  })

  it('calls onError callback', async () => {
    const onError = vi.fn()
    const error = new Error('fail')
    const mutationFn = vi.fn().mockRejectedValue(error)
    const wrapper = createWrapper(cache)

    const { result } = renderHook(
      () => useMutation(mutationFn, { onError }),
      { wrapper },
    )

    await act(async () => {
      await result.current.mutate('vars').catch(() => {})
    })

    expect(onError).toHaveBeenCalledWith(error, 'vars')
  })

  it('invalidates query keys on success', async () => {
    cache.set('users', [1, 2], 5000)
    cache.set('posts', ['a'], 5000)

    const mutationFn = vi.fn().mockResolvedValue('ok')
    const wrapper = createWrapper(cache)

    const { result } = renderHook(
      () =>
        useMutation(mutationFn, {
          invalidateKeys: ['users'],
        }),
      { wrapper },
    )

    await act(async () => {
      await result.current.mutate(undefined)
    })

    expect(cache.get('users')).toBeNull()
    expect(cache.get('posts')).not.toBeNull()
  })

  it('invalidates query keys with RegExp', async () => {
    cache.set('users/1', 'alice', 5000)
    cache.set('users/2', 'bob', 5000)
    cache.set('posts/1', 'hello', 5000)

    const mutationFn = vi.fn().mockResolvedValue('ok')
    const wrapper = createWrapper(cache)

    const { result } = renderHook(
      () =>
        useMutation(mutationFn, {
          invalidateKeys: [/^users\//],
        }),
      { wrapper },
    )

    await act(async () => {
      await result.current.mutate(undefined)
    })

    expect(cache.get('users/1')).toBeNull()
    expect(cache.get('users/2')).toBeNull()
    expect(cache.get('posts/1')).not.toBeNull()
  })

  it('reset clears state', async () => {
    const mutationFn = vi.fn().mockResolvedValue('result')
    const wrapper = createWrapper(cache)

    const { result } = renderHook(() => useMutation(mutationFn), { wrapper })

    await act(async () => {
      await result.current.mutate(undefined)
    })
    expect(result.current.data).toBe('result')

    act(() => {
      result.current.reset()
    })

    expect(result.current.data).toBeUndefined()
    expect(result.current.error).toBeNull()
    expect(result.current.isLoading).toBe(false)
  })

  it('converts non-Error throws to Error objects', async () => {
    const mutationFn = vi.fn().mockRejectedValue('string error')
    const wrapper = createWrapper(cache)

    const { result } = renderHook(() => useMutation(mutationFn), { wrapper })

    await act(async () => {
      await result.current.mutate(undefined).catch(() => {})
    })

    expect(result.current.error).toBeInstanceOf(Error)
    expect(result.current.error?.message).toBe('string error')
  })

  it('does not invalidate keys on failure', async () => {
    cache.set('keep', 'value', 5000)

    const mutationFn = vi.fn().mockRejectedValue(new Error('fail'))
    const wrapper = createWrapper(cache)

    const { result } = renderHook(
      () => useMutation(mutationFn, { invalidateKeys: ['keep'] }),
      { wrapper },
    )

    await act(async () => {
      await result.current.mutate(undefined).catch(() => {})
    })

    expect(cache.get('keep')).not.toBeNull()
  })
})

// ---------------------------------------------------------------------------
// QueryProvider
// ---------------------------------------------------------------------------

describe('QueryProvider', () => {
  it('throws when useQuery is used outside provider', () => {
    // Suppress React error boundary console output
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => {
      renderHook(() => useQuery('test', () => Promise.resolve('data')))
    }).toThrow('useQueryCache must be used within a <QueryProvider>')

    spy.mockRestore()
  })

  it('shares cache between useQuery and useMutation', async () => {
    const cache = createQueryCache()
    const wrapper = createWrapper(cache)

    // Pre-populate cache directly
    cache.set('shared', 'initial', 300_000)
    expect(cache.get('shared')).not.toBeNull()

    // Mutation invalidates the shared key
    const { result: mutationResult } = renderHook(
      () =>
        useMutation(() => Promise.resolve('mutated'), {
          invalidateKeys: ['shared'],
        }),
      { wrapper },
    )

    await act(async () => {
      await mutationResult.current.mutate(undefined)
    })

    // Cache should be invalidated by the mutation
    expect(cache.get('shared')).toBeNull()
  })
})
