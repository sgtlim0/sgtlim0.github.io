'use client'

import { useState, useEffect, useCallback } from 'react'

/**
 * Subscribes to a CSS media query and returns whether it currently matches.
 * SSR-safe: returns `false` on the server.
 */
export function useMediaQuery(query: string): boolean {
  const getMatches = useCallback((): boolean => {
    if (typeof window === 'undefined') return false
    return window.matchMedia(query).matches
  }, [query])

  const [matches, setMatches] = useState<boolean>(getMatches)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mql = window.matchMedia(query)
    setMatches(mql.matches)

    const handler = (e: MediaQueryListEvent) => {
      setMatches(e.matches)
    }

    mql.addEventListener('change', handler)
    return () => {
      mql.removeEventListener('change', handler)
    }
  }, [query])

  return matches
}
