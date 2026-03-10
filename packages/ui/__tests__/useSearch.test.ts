import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSearch } from '../src/hooks/useSearch'
import type { SearchableItem } from '../src/utils/searchEngine'

describe('useSearch', () => {
  const items: SearchableItem[] = [
    { id: '1', title: 'React Hooks Guide', content: 'Learn about React hooks and state management' },
    { id: '2', title: 'TypeScript Basics', content: 'Introduction to TypeScript type system' },
    { id: '3', title: 'Next.js Routing', content: 'App Router and dynamic routes in Next.js' },
    { id: '4', title: 'Testing with Vitest', content: 'Unit testing React components with Vitest' },
    { id: '5', title: 'CSS Tailwind Guide', content: 'Utility-first CSS framework Tailwind' },
  ]

  beforeEach(() => {
    vi.useFakeTimers()
    localStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns initial state with empty query', () => {
    const { result } = renderHook(() => useSearch(items))

    expect(result.current.query).toBe('')
    expect(result.current.results).toEqual([])
    expect(result.current.isSearching).toBe(false)
    expect(result.current.recentSearches).toEqual([])
  })

  it('performs debounced search when query is set', () => {
    const { result } = renderHook(() => useSearch(items, { debounceMs: 200 }))

    act(() => {
      result.current.setQuery('React')
    })

    // Should be searching (debounce pending)
    expect(result.current.isSearching).toBe(true)
    expect(result.current.results).toEqual([])

    // Advance timers past debounce
    act(() => {
      vi.advanceTimersByTime(200)
    })

    expect(result.current.isSearching).toBe(false)
    expect(result.current.results.length).toBeGreaterThan(0)
    expect(result.current.results.some((r) => r.id === '1')).toBe(true)
  })

  it('clears results when query is set to empty string', () => {
    const { result } = renderHook(() => useSearch(items, { debounceMs: 100 }))

    act(() => {
      result.current.setQuery('React')
    })
    act(() => {
      vi.advanceTimersByTime(100)
    })

    expect(result.current.results.length).toBeGreaterThan(0)

    act(() => {
      result.current.setQuery('')
    })

    expect(result.current.results).toEqual([])
    expect(result.current.isSearching).toBe(false)
  })

  it('clears results when query is whitespace only', () => {
    const { result } = renderHook(() => useSearch(items, { debounceMs: 100 }))

    act(() => {
      result.current.setQuery('   ')
    })

    expect(result.current.results).toEqual([])
    expect(result.current.isSearching).toBe(false)
  })

  it('cancels previous debounce timer on rapid input', () => {
    const { result } = renderHook(() => useSearch(items, { debounceMs: 300 }))

    act(() => {
      result.current.setQuery('Rea')
    })
    act(() => {
      vi.advanceTimersByTime(100)
    })

    // Change query before debounce completes
    act(() => {
      result.current.setQuery('TypeScript')
    })
    act(() => {
      vi.advanceTimersByTime(300)
    })

    // Should have results for TypeScript, not React
    expect(result.current.query).toBe('TypeScript')
    const hasTypescript = result.current.results.some((r) => r.id === '2')
    expect(hasTypescript).toBe(true)
  })

  it('saves to recent searches after search completes', () => {
    const { result } = renderHook(() =>
      useSearch(items, { debounceMs: 100, storageKey: 'test-recent' }),
    )

    act(() => {
      result.current.setQuery('React')
    })
    act(() => {
      vi.advanceTimersByTime(100)
    })

    // The useEffect for saving recent runs after isSearching becomes false
    expect(result.current.recentSearches).toContain('React')
  })

  it('clearRecentSearches empties the list', () => {
    const { result } = renderHook(() =>
      useSearch(items, { debounceMs: 100, storageKey: 'test-clear' }),
    )

    act(() => {
      result.current.setQuery('React')
    })
    act(() => {
      vi.advanceTimersByTime(100)
    })
    expect(result.current.recentSearches.length).toBeGreaterThan(0)

    act(() => {
      result.current.clearRecentSearches()
    })

    expect(result.current.recentSearches).toEqual([])
  })

  it('limits recent searches to maxRecent', () => {
    const { result } = renderHook(() =>
      useSearch(items, { debounceMs: 50, maxRecent: 2, storageKey: 'test-max' }),
    )

    const queries = ['React', 'TypeScript', 'Next.js']
    for (const q of queries) {
      act(() => {
        result.current.setQuery(q)
      })
      act(() => {
        vi.advanceTimersByTime(50)
      })
    }

    expect(result.current.recentSearches.length).toBeLessThanOrEqual(2)
  })

  it('deduplicates recent searches', () => {
    const { result } = renderHook(() =>
      useSearch(items, { debounceMs: 50, storageKey: 'test-dedup' }),
    )

    act(() => {
      result.current.setQuery('React')
    })
    act(() => {
      vi.advanceTimersByTime(50)
    })

    act(() => {
      result.current.setQuery('TypeScript')
    })
    act(() => {
      vi.advanceTimersByTime(50)
    })

    act(() => {
      result.current.setQuery('React')
    })
    act(() => {
      vi.advanceTimersByTime(50)
    })

    const reactCount = result.current.recentSearches.filter((s) => s === 'React').length
    expect(reactCount).toBe(1)
  })

  it('uses default config when none provided', () => {
    const { result } = renderHook(() => useSearch(items))

    act(() => {
      result.current.setQuery('Vitest')
    })
    act(() => {
      vi.advanceTimersByTime(300) // default debounceMs
    })

    expect(result.current.results.length).toBeGreaterThan(0)
  })

  it('handles empty items array', () => {
    const { result } = renderHook(() => useSearch([], { debounceMs: 50 }))

    act(() => {
      result.current.setQuery('anything')
    })
    act(() => {
      vi.advanceTimersByTime(50)
    })

    expect(result.current.results).toEqual([])
  })

  it('loads recent searches from localStorage on mount', () => {
    const key = 'test-load'
    localStorage.setItem(key, JSON.stringify(['previous search']))

    const { result } = renderHook(() => useSearch(items, { storageKey: key }))

    expect(result.current.recentSearches).toEqual(['previous search'])
  })

  it('cleans up timer on unmount', () => {
    const { result, unmount } = renderHook(() => useSearch(items, { debounceMs: 300 }))

    act(() => {
      result.current.setQuery('React')
    })

    // Unmount before debounce fires
    unmount()

    // Should not throw
    act(() => {
      vi.advanceTimersByTime(300)
    })
  })
})
