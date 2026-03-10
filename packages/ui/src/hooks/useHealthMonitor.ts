'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

import type { HealthStatus, ServiceHealth } from '../utils/healthCheck'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type OverallHealth = 'healthy' | 'degraded' | 'unhealthy'

export interface HealthEvent {
  id: string
  service: string
  previousStatus: ServiceHealth['status'] | null
  currentStatus: ServiceHealth['status']
  timestamp: string
  duration?: number
}

export interface HealthHistoryEntry {
  timestamp: string
  services: ServiceHealth[]
  overallStatus: OverallHealth
}

export interface UseHealthMonitorOptions {
  /** Polling interval in ms (default 30000) */
  intervalMs?: number
  /** Maximum history entries to keep (default 100) */
  maxHistory?: number
  /** Whether monitoring is enabled (default true) */
  enabled?: boolean
}

export interface UseHealthMonitorReturn {
  /** Current health status for all services */
  current: HealthStatus | null
  /** Overall system health */
  overallStatus: OverallHealth
  /** History of health snapshots */
  history: readonly HealthHistoryEntry[]
  /** Timeline of status change events */
  events: readonly HealthEvent[]
  /** Whether the first check is still loading */
  isLoading: boolean
  /** Manual refresh trigger */
  refresh: () => void
}

// ---------------------------------------------------------------------------
// Mock data generator
// ---------------------------------------------------------------------------

const SERVICE_NAMES = ['API Gateway', 'Database', 'Redis', 'AI Core'] as const

function randomLatency(base: number, variance: number): number {
  return Math.max(1, Math.round(base + (Math.random() - 0.5) * variance))
}

function randomServiceStatus(): ServiceHealth['status'] {
  const roll = Math.random()
  if (roll < 0.8) return 'up'
  if (roll < 0.95) return 'degraded'
  return 'down'
}

function generateMockHealth(): HealthStatus {
  const services: ServiceHealth[] = SERVICE_NAMES.map((name) => {
    const status = randomServiceStatus()
    return {
      name,
      status,
      latency: status === 'down' ? 0 : randomLatency(name === 'AI Core' ? 200 : 40, 60),
      checkedAt: new Date().toISOString(),
      ...(status === 'down' ? { error: 'Connection refused' } : {}),
    }
  })

  const hasDown = services.some((s) => s.status === 'down')
  const hasDegraded = services.some((s) => s.status === 'degraded')

  return {
    status: hasDown ? 'unhealthy' : hasDegraded ? 'degraded' : 'healthy',
    services,
    timestamp: new Date().toISOString(),
  }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useHealthMonitor(options?: UseHealthMonitorOptions): UseHealthMonitorReturn {
  const { intervalMs = 30_000, maxHistory = 100, enabled = true } = options ?? {}

  const [current, setCurrent] = useState<HealthStatus | null>(null)
  const [history, setHistory] = useState<HealthHistoryEntry[]>([])
  const [events, setEvents] = useState<HealthEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const previousServicesRef = useRef<Map<string, ServiceHealth['status']>>(new Map())
  const eventCounterRef = useRef(0)

  const deriveOverall = useCallback((health: HealthStatus | null): OverallHealth => {
    if (!health) return 'healthy'
    return health.status
  }, [])

  const performCheck = useCallback(() => {
    if (!enabled) return

    const health = generateMockHealth()
    setCurrent(health)
    setIsLoading(false)

    // Append to history (immutable)
    setHistory((prev) => {
      const entry: HealthHistoryEntry = {
        timestamp: health.timestamp,
        services: health.services,
        overallStatus: health.status,
      }
      const next = [...prev, entry]
      return next.length > maxHistory ? next.slice(next.length - maxHistory) : next
    })

    // Detect status changes → generate events
    const prevMap = previousServicesRef.current
    const newEvents: HealthEvent[] = []

    for (const svc of health.services) {
      const prev = prevMap.get(svc.name) ?? null
      if (prev !== null && prev !== svc.status) {
        eventCounterRef.current += 1
        newEvents.push({
          id: `evt-${eventCounterRef.current}`,
          service: svc.name,
          previousStatus: prev,
          currentStatus: svc.status,
          timestamp: health.timestamp,
        })
      }
    }

    if (newEvents.length > 0) {
      setEvents((prev) => {
        const next = [...prev, ...newEvents]
        return next.length > maxHistory ? next.slice(next.length - maxHistory) : next
      })
    }

    // Update previous map
    const nextMap = new Map<string, ServiceHealth['status']>()
    for (const svc of health.services) {
      nextMap.set(svc.name, svc.status)
    }
    previousServicesRef.current = nextMap
  }, [enabled, maxHistory])

  useEffect(() => {
    if (!enabled) return

    performCheck()

    if (intervalMs <= 0) return

    const id = setInterval(performCheck, intervalMs)
    return () => clearInterval(id)
  }, [performCheck, intervalMs, enabled])

  return {
    current,
    overallStatus: deriveOverall(current),
    history,
    events,
    isLoading,
    refresh: performCheck,
  }
}
