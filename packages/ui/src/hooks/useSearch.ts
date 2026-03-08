'use client'

import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import type { SearchableItem, SearchResult, SearchOptions, SearchIndex } from '../utils/searchEngine'
import { createSearchIndex, search } from '../utils/searchEngine'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UseSearchReturn {
  query: string
  setQuery: (q: string) => void
  results: SearchResult[]
  isSearching: boolean
  recentSearches: string[]
  clearRecentSearches: () => void
}

interface UseSearchConfig {
  /** Debounce delay in ms (default 300) */
  debounceMs?: number
  /** Search options forwarded to search() */
  options?: SearchOptions
  /** localStorage key for recent searches (default 'hchat-recent-searches') */
  storageKey?: string
  /** Max recent search entries (default 10) */
  maxRecent?: number
}

// ---------------------------------------------------------------------------
// localStorage helpers (SSR-safe)
// ---------------------------------------------------------------------------

function getStorage(key: string): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function setStorage(key: string, values: string[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(values))
  } catch {
    // storage full or unavailable — silently ignore
  }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useSearch(
  items: SearchableItem[],
  config: UseSearchConfig = {},
): UseSearchReturn {
  const {
    debounceMs = 300,
    options,
    storageKey = 'hchat-recent-searches',
    maxRecent = 10,
  } = config

  const [query, setQueryState] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>(() => getStorage(storageKey))

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Memoize index — rebuild only when items change
  const index: SearchIndex = useMemo(() => createSearchIndex(items), [items])

  // Perform search (debounced)
  const performSearch = useCallback(
    (q: string) => {
      if (!q.trim()) {
        setResults([])
        setIsSearching(false)
        return
      }

      const searchResults = search(index, q, options)
      setResults(searchResults)
      setIsSearching(false)
    },
    [index, options],
  )

  // Public setter with debounce
  const setQuery = useCallback(
    (q: string) => {
      setQueryState(q)

      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }

      if (!q.trim()) {
        setResults([])
        setIsSearching(false)
        return
      }

      setIsSearching(true)
      timerRef.current = setTimeout(() => performSearch(q), debounceMs)
    },
    [performSearch, debounceMs],
  )

  // Save to recent when a search is "committed" (user stops typing)
  useEffect(() => {
    if (!query.trim() || isSearching) return

    // Only save if there were results
    if (results.length === 0) return

    setRecentSearches((prev) => {
      const trimmed = query.trim()
      const filtered = prev.filter((s) => s !== trimmed)
      const next = [trimmed, ...filtered].slice(0, maxRecent)
      setStorage(storageKey, next)
      return next
    })
  }, [query, isSearching, results.length, maxRecent, storageKey])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([])
    setStorage(storageKey, [])
  }, [storageKey])

  return {
    query,
    setQuery,
    results,
    isSearching,
    recentSearches,
    clearRecentSearches,
  }
}
