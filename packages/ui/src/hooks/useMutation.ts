'use client'

import { useState, useCallback, useRef } from 'react'
import { useQueryCache } from './QueryProvider'

/** Options for `useMutation`. */
export interface UseMutationOptions<TData, TVariables> {
  /** Called on successful mutation. */
  readonly onSuccess?: (data: TData, variables: TVariables) => void
  /** Called when the mutation throws. */
  readonly onError?: (error: Error, variables: TVariables) => void
  /**
   * Query keys (strings) or patterns (RegExp) to invalidate on success.
   * This triggers automatic refetch for any active `useQuery` with a
   * matching key.
   */
  readonly invalidateKeys?: ReadonlyArray<string | RegExp>
}

export interface UseMutationReturn<TData, TVariables> {
  readonly data: TData | undefined
  readonly error: Error | null
  readonly isLoading: boolean
  readonly mutate: (variables: TVariables) => Promise<TData>
  readonly reset: () => void
}

/**
 * Hook for mutations (POST / PUT / DELETE).
 *
 * Automatically invalidates related query-cache entries on success so that
 * `useQuery` consumers refetch transparently.
 *
 * Must be used inside a `<QueryProvider>`.
 */
export function useMutation<TData, TVariables = void>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: UseMutationOptions<TData, TVariables> = {},
): UseMutationReturn<TData, TVariables> {
  const { onSuccess, onError, invalidateKeys } = options

  const cache = useQueryCache()
  const mountedRef = useRef(true)
  const mutationFnRef = useRef(mutationFn)
  mutationFnRef.current = mutationFn
  const onSuccessRef = useRef(onSuccess)
  onSuccessRef.current = onSuccess
  const onErrorRef = useRef(onError)
  onErrorRef.current = onError

  const [data, setData] = useState<TData | undefined>(undefined)
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const mutate = useCallback(
    async (variables: TVariables): Promise<TData> => {
      if (!mountedRef.current) {
        throw new Error('Cannot mutate after unmount')
      }
      setIsLoading(true)
      setError(null)

      try {
        const result = await mutationFnRef.current(variables)

        if (mountedRef.current) {
          setData(result)
          setIsLoading(false)
          onSuccessRef.current?.(result, variables)

          // Invalidate related queries
          if (invalidateKeys) {
            invalidateKeys.forEach((k) => cache.invalidate(k))
          }
        }

        return result
      } catch (err) {
        const mutationError =
          err instanceof Error ? err : new Error(String(err))

        if (mountedRef.current) {
          setError(mutationError)
          setIsLoading(false)
          onErrorRef.current?.(mutationError, variables)
        }

        throw mutationError
      }
    },
    [cache, invalidateKeys],
  )

  const reset = useCallback(() => {
    setData(undefined)
    setError(null)
    setIsLoading(false)
  }, [])

  return { data, error, isLoading, mutate, reset }
}
