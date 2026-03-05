'use client'

/**
 * Real-time Dashboard Hooks
 *
 * React hooks that wrap the real-time service subscriptions.
 * Each hook manages subscription lifecycle and provides immutable state updates.
 */

import { useState, useEffect } from 'react'
import {
  subscribeMetrics,
  subscribeTimeSeries,
  subscribeActivities,
  subscribeStats,
} from './realtimeService'
import type {
  RealtimeMetric,
  RealtimeDataPoint,
  RealtimeActivity,
  RealtimeStats,
} from './realtimeTypes'

/**
 * Hook for real-time dashboard metrics (activeUsers, QPM, responseTime, errorRate)
 *
 * @param intervalMs - Polling interval in milliseconds (default: 2000)
 * @returns Array of current metric values
 */
export function useRealtimeMetrics(intervalMs: number = 2000): RealtimeMetric[] {
  const [metrics, setMetrics] = useState<RealtimeMetric[]>([])

  useEffect(() => {
    const subscription = subscribeMetrics((newMetrics) => setMetrics(newMetrics), intervalMs)

    return () => subscription.unsubscribe()
  }, [intervalMs])

  return metrics
}

/**
 * Hook for real-time time-series data with sliding window
 *
 * @param intervalMs - Polling interval in milliseconds (default: 3000)
 * @param maxPoints - Maximum data points to retain (default: 20)
 * @returns Array of time-series data points
 */
export function useRealtimeTimeSeries(
  intervalMs: number = 3000,
  maxPoints: number = 20,
): RealtimeDataPoint[] {
  const [points, setPoints] = useState<RealtimeDataPoint[]>([])

  useEffect(() => {
    const subscription = subscribeTimeSeries(
      (point) =>
        setPoints((prev) => {
          const next = [...prev, point]
          return next.length > maxPoints ? next.slice(next.length - maxPoints) : next
        }),
      intervalMs,
    )

    return () => subscription.unsubscribe()
  }, [intervalMs, maxPoints])

  return points
}

/**
 * Hook for real-time activity feed with sliding window
 *
 * @param intervalMs - Polling interval in milliseconds (default: 4000)
 * @param maxItems - Maximum activity items to retain (default: 15)
 * @returns Array of recent activities (newest first)
 */
export function useRealtimeActivities(
  intervalMs: number = 4000,
  maxItems: number = 15,
): RealtimeActivity[] {
  const [activities, setActivities] = useState<RealtimeActivity[]>([])

  useEffect(() => {
    const subscription = subscribeActivities(
      (activity) =>
        setActivities((prev) => {
          const next = [activity, ...prev]
          return next.length > maxItems ? next.slice(0, maxItems) : next
        }),
      intervalMs,
    )

    return () => subscription.unsubscribe()
  }, [intervalMs, maxItems])

  return activities
}

/**
 * Hook for real-time overall stats with model distribution
 *
 * @param intervalMs - Polling interval in milliseconds (default: 5000)
 * @returns Current stats or null if not yet loaded
 */
export function useRealtimeStats(intervalMs: number = 5000): RealtimeStats | null {
  const [stats, setStats] = useState<RealtimeStats | null>(null)

  useEffect(() => {
    const subscription = subscribeStats((newStats) => setStats(newStats), intervalMs)

    return () => subscription.unsubscribe()
  }, [intervalMs])

  return stats
}
