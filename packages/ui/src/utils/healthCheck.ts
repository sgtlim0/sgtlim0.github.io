/**
 * Health Check Service
 *
 * Provides endpoint health verification, response time measurement,
 * and an aggregated monitoring status summary for dashboards.
 */

import type { AlertEvent } from './alertConfig'
import type { WebVitalsReport } from './webVitals'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ServiceHealth {
  name: string
  status: 'up' | 'down' | 'degraded'
  latency?: number
  error?: string
  checkedAt: string
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  services: ServiceHealth[]
  timestamp: string
}

/** Aggregated monitoring status for dashboards. */
export interface MonitoringStatus {
  health: HealthStatus
  vitals: WebVitalsReport | null
  activeAlerts: readonly AlertEvent[]
  summary: {
    servicesUp: number
    servicesDown: number
    servicesDegraded: number
    criticalAlerts: number
    warningAlerts: number
    vitalsRating: string
    overallStatus: 'healthy' | 'degraded' | 'unhealthy'
  }
  timestamp: string
}

export interface ServiceEndpoint {
  name: string
  url: string
  timeoutMs?: number
}

// ---------------------------------------------------------------------------
// Single Service Check
// ---------------------------------------------------------------------------

export async function checkServiceHealth(
  name: string,
  url: string,
  timeoutMs = 5000,
): Promise<ServiceHealth> {
  const start = Date.now()
  const checkedAt = new Date().toISOString()

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), timeoutMs)
    const response = await fetch(url, { signal: controller.signal })
    clearTimeout(timeout)

    const latency = Date.now() - start
    const status: ServiceHealth['status'] = response.ok
      ? latency > timeoutMs * 0.8
        ? 'degraded'
        : 'up'
      : 'degraded'

    return { name, status, latency, checkedAt }
  } catch (error) {
    return {
      name,
      status: 'down',
      latency: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown',
      checkedAt,
    }
  }
}

// ---------------------------------------------------------------------------
// System Health (multiple services)
// ---------------------------------------------------------------------------

export async function getSystemHealth(
  services: ServiceEndpoint[],
): Promise<HealthStatus> {
  const results = await Promise.all(
    services.map(({ name, url, timeoutMs }) => checkServiceHealth(name, url, timeoutMs)),
  )

  const hasDown = results.some((s) => s.status === 'down')
  const hasDegraded = results.some((s) => s.status === 'degraded')

  return {
    status: hasDown ? 'unhealthy' : hasDegraded ? 'degraded' : 'healthy',
    services: results,
    timestamp: new Date().toISOString(),
  }
}

// ---------------------------------------------------------------------------
// Aggregated Monitoring Status
// ---------------------------------------------------------------------------

function computeOverallStatus(
  health: HealthStatus,
  activeAlerts: readonly AlertEvent[],
  vitalsRating: string,
): MonitoringStatus['summary']['overallStatus'] {
  if (health.status === 'unhealthy') return 'unhealthy'
  const hasCritical = activeAlerts.some((a) => a.severity === 'critical')
  if (hasCritical) return 'unhealthy'
  if (health.status === 'degraded' || vitalsRating === 'poor') return 'degraded'
  const hasWarning = activeAlerts.some((a) => a.severity === 'warning')
  if (hasWarning || vitalsRating === 'needs-improvement') return 'degraded'
  return 'healthy'
}

/**
 * Builds an aggregated monitoring status from health, vitals, and alert data.
 * This is the primary function for dashboard consumption.
 */
export function getMonitoringStatus(
  health: HealthStatus,
  vitals: WebVitalsReport | null,
  activeAlerts: readonly AlertEvent[],
): MonitoringStatus {
  const servicesUp = health.services.filter((s) => s.status === 'up').length
  const servicesDown = health.services.filter((s) => s.status === 'down').length
  const servicesDegraded = health.services.filter((s) => s.status === 'degraded').length
  const criticalAlerts = activeAlerts.filter((a) => a.severity === 'critical').length
  const warningAlerts = activeAlerts.filter((a) => a.severity === 'warning').length
  const vitalsRating = vitals?.overallRating ?? 'good'

  return {
    health,
    vitals,
    activeAlerts,
    summary: {
      servicesUp,
      servicesDown,
      servicesDegraded,
      criticalAlerts,
      warningAlerts,
      vitalsRating,
      overallStatus: computeOverallStatus(health, activeAlerts, vitalsRating),
    },
    timestamp: new Date().toISOString(),
  }
}
