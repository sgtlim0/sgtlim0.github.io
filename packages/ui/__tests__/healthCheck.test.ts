import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  checkServiceHealth,
  getSystemHealth,
  getMonitoringStatus,
} from '../src/utils/healthCheck'
import type { HealthStatus, MonitoringStatus } from '../src/utils/healthCheck'
import type { AlertEvent } from '../src/utils/alertConfig'
import type { WebVitalsReport } from '../src/utils/webVitals'

// ---------------------------------------------------------------------------
// Mock fetch
// ---------------------------------------------------------------------------

const mockFetch = vi.fn()

beforeEach(() => {
  vi.stubGlobal('fetch', mockFetch)
})

afterEach(() => {
  vi.restoreAllMocks()
})

// ---------------------------------------------------------------------------
// checkServiceHealth
// ---------------------------------------------------------------------------

describe('checkServiceHealth', () => {
  it('returns "up" for successful response', async () => {
    mockFetch.mockResolvedValue({ ok: true })
    const result = await checkServiceHealth('api', 'https://api.example.com/health')
    expect(result.name).toBe('api')
    expect(result.status).toBe('up')
    expect(result.latency).toBeGreaterThanOrEqual(0)
    expect(result.checkedAt).toBeTruthy()
    expect(result.error).toBeUndefined()
  })

  it('returns "degraded" for non-ok response', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 503 })
    const result = await checkServiceHealth('api', 'https://api.example.com/health')
    expect(result.status).toBe('degraded')
  })

  it('returns "down" on fetch error', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'))
    const result = await checkServiceHealth('api', 'https://api.example.com/health')
    expect(result.status).toBe('down')
    expect(result.error).toBe('Network error')
  })

  it('returns "down" on abort (timeout)', async () => {
    mockFetch.mockRejectedValue(new Error('The operation was aborted'))
    const result = await checkServiceHealth('api', 'https://api.example.com/health', 100)
    expect(result.status).toBe('down')
    expect(result.error).toContain('aborted')
  })

  it('includes latency measurement', async () => {
    mockFetch.mockResolvedValue({ ok: true })
    const result = await checkServiceHealth('api', 'https://api.example.com/health')
    expect(typeof result.latency).toBe('number')
    expect(result.latency).toBeGreaterThanOrEqual(0)
  })

  it('includes checkedAt ISO timestamp', async () => {
    mockFetch.mockResolvedValue({ ok: true })
    const result = await checkServiceHealth('api', 'https://api.example.com/health')
    const parsed = new Date(result.checkedAt)
    expect(parsed.toISOString()).toBe(result.checkedAt)
  })

  it('handles non-Error thrown objects', async () => {
    mockFetch.mockRejectedValue('string error')
    const result = await checkServiceHealth('api', 'https://api.example.com/health')
    expect(result.status).toBe('down')
    expect(result.error).toBe('Unknown')
  })
})

// ---------------------------------------------------------------------------
// getSystemHealth
// ---------------------------------------------------------------------------

describe('getSystemHealth', () => {
  it('returns "healthy" when all services are up', async () => {
    mockFetch.mockResolvedValue({ ok: true })
    const health = await getSystemHealth([
      { name: 'api', url: 'https://api.example.com/health' },
      { name: 'db', url: 'https://db.example.com/health' },
    ])
    expect(health.status).toBe('healthy')
    expect(health.services).toHaveLength(2)
    expect(health.timestamp).toBeTruthy()
  })

  it('returns "unhealthy" when any service is down', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true }).mockRejectedValueOnce(new Error('fail'))
    const health = await getSystemHealth([
      { name: 'api', url: 'https://api.example.com/health' },
      { name: 'db', url: 'https://db.example.com/health' },
    ])
    expect(health.status).toBe('unhealthy')
  })

  it('returns "degraded" when a service responds non-ok', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true }).mockResolvedValueOnce({ ok: false })
    const health = await getSystemHealth([
      { name: 'api', url: 'https://api.example.com/health' },
      { name: 'db', url: 'https://db.example.com/health' },
    ])
    expect(health.status).toBe('degraded')
  })

  it('returns "healthy" for empty services list', async () => {
    const health = await getSystemHealth([])
    expect(health.status).toBe('healthy')
    expect(health.services).toHaveLength(0)
  })

  it('passes custom timeoutMs to checkServiceHealth', async () => {
    mockFetch.mockResolvedValue({ ok: true })
    const health = await getSystemHealth([
      { name: 'api', url: 'https://api.example.com/health', timeoutMs: 2000 },
    ])
    expect(health.services[0].status).toBe('up')
  })
})

// ---------------------------------------------------------------------------
// getMonitoringStatus
// ---------------------------------------------------------------------------

describe('getMonitoringStatus', () => {
  const healthyStatus: HealthStatus = {
    status: 'healthy',
    services: [
      { name: 'api', status: 'up', latency: 50, checkedAt: new Date().toISOString() },
      { name: 'db', status: 'up', latency: 30, checkedAt: new Date().toISOString() },
    ],
    timestamp: new Date().toISOString(),
  }

  const goodVitals: WebVitalsReport = {
    metrics: [],
    timestamp: new Date().toISOString(),
    url: 'https://example.com',
    overallRating: 'good',
  }

  it('returns healthy status when everything is fine', () => {
    const status = getMonitoringStatus(healthyStatus, goodVitals, [])
    expect(status.summary.overallStatus).toBe('healthy')
    expect(status.summary.servicesUp).toBe(2)
    expect(status.summary.servicesDown).toBe(0)
    expect(status.summary.servicesDegraded).toBe(0)
    expect(status.summary.criticalAlerts).toBe(0)
    expect(status.summary.warningAlerts).toBe(0)
    expect(status.summary.vitalsRating).toBe('good')
  })

  it('returns unhealthy when health is unhealthy', () => {
    const unhealthy: HealthStatus = {
      ...healthyStatus,
      status: 'unhealthy',
      services: [
        { name: 'api', status: 'down', latency: 5000, error: 'timeout', checkedAt: new Date().toISOString() },
      ],
    }
    const status = getMonitoringStatus(unhealthy, goodVitals, [])
    expect(status.summary.overallStatus).toBe('unhealthy')
    expect(status.summary.servicesDown).toBe(1)
  })

  it('returns unhealthy when there are critical alerts', () => {
    const criticalAlert: AlertEvent = {
      ruleId: 'err',
      metric: 'error_rate',
      value: 15,
      threshold: 5,
      timestamp: new Date().toISOString(),
      severity: 'critical',
    }
    const status = getMonitoringStatus(healthyStatus, goodVitals, [criticalAlert])
    expect(status.summary.overallStatus).toBe('unhealthy')
    expect(status.summary.criticalAlerts).toBe(1)
  })

  it('returns degraded when vitals are poor', () => {
    const poorVitals: WebVitalsReport = { ...goodVitals, overallRating: 'poor' }
    const status = getMonitoringStatus(healthyStatus, poorVitals, [])
    expect(status.summary.overallStatus).toBe('degraded')
  })

  it('returns degraded when there are warning alerts', () => {
    const warningAlert: AlertEvent = {
      ruleId: 'resp',
      metric: 'response_time',
      value: 4000,
      threshold: 3000,
      timestamp: new Date().toISOString(),
      severity: 'warning',
    }
    const status = getMonitoringStatus(healthyStatus, goodVitals, [warningAlert])
    expect(status.summary.overallStatus).toBe('degraded')
    expect(status.summary.warningAlerts).toBe(1)
  })

  it('returns degraded when vitals need improvement', () => {
    const needsImprovementVitals: WebVitalsReport = {
      ...goodVitals,
      overallRating: 'needs-improvement',
    }
    const status = getMonitoringStatus(healthyStatus, needsImprovementVitals, [])
    expect(status.summary.overallStatus).toBe('degraded')
  })

  it('returns degraded when health status is degraded', () => {
    const degraded: HealthStatus = {
      ...healthyStatus,
      status: 'degraded',
      services: [
        { name: 'api', status: 'degraded', latency: 4500, checkedAt: new Date().toISOString() },
      ],
    }
    const status = getMonitoringStatus(degraded, goodVitals, [])
    expect(status.summary.overallStatus).toBe('degraded')
    expect(status.summary.servicesDegraded).toBe(1)
  })

  it('handles null vitals gracefully', () => {
    const status = getMonitoringStatus(healthyStatus, null, [])
    expect(status.vitals).toBeNull()
    expect(status.summary.vitalsRating).toBe('good')
    expect(status.summary.overallStatus).toBe('healthy')
  })

  it('includes all input data in the response', () => {
    const alerts: AlertEvent[] = [
      {
        ruleId: 'err',
        metric: 'error_rate',
        value: 10,
        threshold: 5,
        timestamp: new Date().toISOString(),
        severity: 'critical',
      },
    ]
    const status = getMonitoringStatus(healthyStatus, goodVitals, alerts)
    expect(status.health).toBe(healthyStatus)
    expect(status.vitals).toBe(goodVitals)
    expect(status.activeAlerts).toBe(alerts)
    expect(status.timestamp).toBeTruthy()
  })

  it('counts mixed service statuses correctly', () => {
    const mixed: HealthStatus = {
      status: 'unhealthy',
      services: [
        { name: 'api', status: 'up', latency: 50, checkedAt: new Date().toISOString() },
        { name: 'db', status: 'down', error: 'timeout', checkedAt: new Date().toISOString() },
        { name: 'cache', status: 'degraded', latency: 4000, checkedAt: new Date().toISOString() },
      ],
      timestamp: new Date().toISOString(),
    }
    const status = getMonitoringStatus(mixed, goodVitals, [])
    expect(status.summary.servicesUp).toBe(1)
    expect(status.summary.servicesDown).toBe(1)
    expect(status.summary.servicesDegraded).toBe(1)
  })
})