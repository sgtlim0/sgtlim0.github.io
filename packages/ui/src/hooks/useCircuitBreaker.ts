'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import {
  createCircuitBreaker,
  type CircuitState,
  type CircuitBreakerStats,
  type CircuitBreakerOptions,
  type CircuitBreaker,
} from '../utils/circuitBreaker'

export interface UseCircuitBreakerReturn {
  /** Execute a function through the circuit breaker */
  execute: <T>(fn: () => Promise<T>) => Promise<T>
  /** Current circuit state */
  state: CircuitState
  /** Current stats snapshot */
  stats: CircuitBreakerStats
  /** Reset the circuit to closed */
  reset: () => void
}

export function useCircuitBreaker(
  name: string,
  options?: Partial<CircuitBreakerOptions>,
): UseCircuitBreakerReturn {
  const [state, setState] = useState<CircuitState>('closed')

  const cbRef = useRef<CircuitBreaker | null>(null)

  if (cbRef.current === null) {
    cbRef.current = createCircuitBreaker(name, {
      ...options,
      onStateChange: (_from, to) => {
        setState(to)
        options?.onStateChange?.(_from, to)
      },
    })
  }

  useEffect(() => {
    return () => {
      cbRef.current?.reset()
    }
  }, [])

  const execute = useCallback(
    <T>(fn: () => Promise<T>): Promise<T> => {
      return cbRef.current!.execute(fn)
    },
    [],
  )

  const reset = useCallback(() => {
    cbRef.current!.reset()
  }, [])

  const stats = cbRef.current.getStats()

  return { execute, state, stats, reset }
}
