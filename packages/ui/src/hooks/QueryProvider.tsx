'use client'

import { createContext, useContext, useRef, type ReactNode } from 'react'
import { createQueryCache, type QueryCache } from '../utils/queryCache'

const QueryCacheContext = createContext<QueryCache | null>(null)

export interface QueryProviderProps {
  readonly children: ReactNode
  /** Optional external cache instance (useful for testing). */
  readonly cache?: QueryCache
}

/**
 * Provides a shared QueryCache to all descendants via React context.
 *
 * Wrap your app (or a subtree) with `<QueryProvider>` so that `useQuery`
 * and `useMutation` share the same cache.
 */
export function QueryProvider({ children, cache }: QueryProviderProps) {
  const cacheRef = useRef<QueryCache>(cache ?? createQueryCache())

  return (
    <QueryCacheContext.Provider value={cacheRef.current}>
      {children}
    </QueryCacheContext.Provider>
  )
}

/**
 * Returns the nearest QueryCache from context.
 * Throws if called outside a `<QueryProvider>`.
 */
export function useQueryCache(): QueryCache {
  const cache = useContext(QueryCacheContext)
  if (!cache) {
    throw new Error('useQueryCache must be used within a <QueryProvider>')
  }
  return cache
}
