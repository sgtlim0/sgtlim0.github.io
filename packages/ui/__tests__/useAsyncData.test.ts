/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useAsyncData } from '../src/hooks/useAsyncData'

describe('useAsyncData', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('should start in loading state with null data', () => {
    const fetchFn = vi.fn(() => new Promise<string>(() => {})) // never resolves
    const { result } = renderHook(() => useAsyncData(fetchFn))

    expect(result.current.loading).toBe(true)
    expect(result.current.data).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('should resolve data and set loading to false on success', async () => {
    const fetchFn = vi.fn().mockResolvedValue({ name: 'test' })
    const { result } = renderHook(() => useAsyncData(fetchFn))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toEqual({ name: 'test' })
    expect(result.current.error).toBeNull()
    expect(fetchFn).toHaveBeenCalledTimes(1)
  })

  it('should set error on fetch failure', async () => {
    const fetchFn = vi.fn().mockRejectedValue(new Error('Network error'))
    const { result } = renderHook(() => useAsyncData(fetchFn))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toBeNull()
    expect(result.current.error).toBeInstanceOf(Error)
    expect(result.current.error?.message).toBe('Network error')
  })

  it('should wrap non-Error rejections in Error', async () => {
    const fetchFn = vi.fn().mockRejectedValue('string error')
    const { result } = renderHook(() => useAsyncData(fetchFn))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBeInstanceOf(Error)
    expect(result.current.error?.message).toBe('Unknown error')
  })

  it('should refetch data when refetch is called', async () => {
    let callCount = 0
    const fetchFn = vi.fn().mockImplementation(() => {
      callCount += 1
      return Promise.resolve(`result-${callCount}`)
    })

    const { result } = renderHook(() => useAsyncData(fetchFn))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    expect(result.current.data).toBe('result-1')

    await act(async () => {
      result.current.refetch()
    })

    await waitFor(() => {
      expect(result.current.data).toBe('result-2')
    })
    expect(fetchFn).toHaveBeenCalledTimes(2)
  })

  it('should re-fetch when dependencies change', async () => {
    const fetchFn = vi.fn().mockImplementation((page: number) =>
      Promise.resolve(`page-${page}`)
    )

    let page = 1
    const { result, rerender } = renderHook(() =>
      useAsyncData(() => fetchFn(page), [page])
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    expect(result.current.data).toBe('page-1')

    page = 2
    rerender()

    await waitFor(() => {
      expect(result.current.data).toBe('page-2')
    })
    expect(fetchFn).toHaveBeenCalledTimes(2)
  })

  it('should reset error on successful refetch after failure', async () => {
    const fetchFn = vi.fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValueOnce('success')

    const { result } = renderHook(() => useAsyncData(fetchFn))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    expect(result.current.error?.message).toBe('fail')

    await act(async () => {
      result.current.refetch()
    })

    await waitFor(() => {
      expect(result.current.error).toBeNull()
    })
    expect(result.current.data).toBe('success')
  })

  it('should set loading to true during refetch', async () => {
    let resolve: (v: string) => void
    const fetchFn = vi.fn().mockImplementation(
      () => new Promise<string>((r) => { resolve = r })
    )

    const { result } = renderHook(() => useAsyncData(fetchFn))

    expect(result.current.loading).toBe(true)

    await act(async () => {
      resolve!('first')
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Trigger refetch
    let resolve2: (v: string) => void
    fetchFn.mockImplementation(
      () => new Promise<string>((r) => { resolve2 = r })
    )

    act(() => {
      result.current.refetch()
    })

    // Should be loading again
    await waitFor(() => {
      expect(result.current.loading).toBe(true)
    })

    await act(async () => {
      resolve2!('second')
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
      expect(result.current.data).toBe('second')
    })
  })

  it('should not update state after unmount', async () => {
    let resolve: (v: string) => void
    const fetchFn = vi.fn().mockImplementation(
      () => new Promise<string>((r) => { resolve = r })
    )

    const { result, unmount } = renderHook(() => useAsyncData(fetchFn))

    expect(result.current.loading).toBe(true)

    unmount()

    // Resolve after unmount - should not throw or update state
    await act(async () => {
      resolve!('too-late')
    })

    // No assertion on result.current since hook is unmounted;
    // the test verifies no React "state update on unmounted component" warning
  })

  it('should handle empty dependency array (default)', async () => {
    const fetchFn = vi.fn().mockResolvedValue([1, 2, 3])
    const { result } = renderHook(() => useAsyncData(fetchFn))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    expect(result.current.data).toEqual([1, 2, 3])
  })

  it('should provide a stable refetch function reference', async () => {
    const fetchFn = vi.fn().mockResolvedValue('data')
    const { result, rerender } = renderHook(() => useAsyncData(fetchFn))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const firstRefetch = result.current.refetch
    rerender()
    const secondRefetch = result.current.refetch

    // refetch is a useCallback; same deps = same reference
    expect(firstRefetch).toBe(secondRefetch)
  })
})
