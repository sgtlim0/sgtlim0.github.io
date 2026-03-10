'use client'

import { useState, useCallback, useRef, useEffect } from 'react'

export interface RenderMetrics {
  readonly renderCount: number
  readonly lastRenderTime: number
  readonly averageRenderTime: number
  readonly maxRenderTime: number
  readonly totalRenderTime: number
}

export interface UseRenderProfilerReturn {
  readonly metrics: RenderMetrics
  readonly reset: () => void
  readonly isEnabled: boolean
  readonly enable: () => void
  readonly disable: () => void
}

const INITIAL_METRICS: RenderMetrics = {
  renderCount: 0,
  lastRenderTime: 0,
  averageRenderTime: 0,
  maxRenderTime: 0,
  totalRenderTime: 0,
}

function isDevEnvironment(): boolean {
  return typeof process !== 'undefined'
    ? process.env.NODE_ENV !== 'production'
    : true
}

/**
 * Hook that profiles render performance of the component it is used in.
 * Measures render time using performance.now() and tracks metrics.
 * Only active in development environment by default.
 */
export function useRenderProfiler(componentName: string): UseRenderProfilerReturn {
  const [enabled, setEnabled] = useState(() => isDevEnvironment())
  const metricsRef = useRef<{
    renderCount: number
    lastRenderTime: number
    maxRenderTime: number
    totalRenderTime: number
  }>({ renderCount: 0, lastRenderTime: 0, maxRenderTime: 0, totalRenderTime: 0 })
  const [metrics, setMetrics] = useState<RenderMetrics>(INITIAL_METRICS)
  const renderStartRef = useRef<number>(0)
  const nameRef = useRef(componentName)
  nameRef.current = componentName

  // Mark render start on each render (synchronous)
  if (enabled && typeof performance !== 'undefined') {
    renderStartRef.current = performance.now()
  }

  // Measure after render commits
  useEffect(() => {
    if (!enabled || renderStartRef.current === 0) return
    if (typeof performance === 'undefined') return

    const duration = performance.now() - renderStartRef.current
    renderStartRef.current = 0

    const prev = metricsRef.current
    const newCount = prev.renderCount + 1
    const newTotal = prev.totalRenderTime + duration
    const newMax = Math.max(prev.maxRenderTime, duration)

    metricsRef.current = {
      renderCount: newCount,
      lastRenderTime: duration,
      maxRenderTime: newMax,
      totalRenderTime: newTotal,
    }

    setMetrics({
      renderCount: newCount,
      lastRenderTime: duration,
      averageRenderTime: newCount > 0 ? newTotal / newCount : 0,
      maxRenderTime: newMax,
      totalRenderTime: newTotal,
    })
  })

  const reset = useCallback(() => {
    metricsRef.current = { renderCount: 0, lastRenderTime: 0, maxRenderTime: 0, totalRenderTime: 0 }
    setMetrics(INITIAL_METRICS)
  }, [])

  const enable = useCallback(() => setEnabled(true), [])
  const disable = useCallback(() => setEnabled(false), [])

  return { metrics, reset, isEnabled: enabled, enable, disable }
}
