export interface WebVitalMetric {
  name: 'FCP' | 'LCP' | 'CLS' | 'FID' | 'INP' | 'TTFB'
  value: number
  id: string
  delta: number
  rating: 'good' | 'needs-improvement' | 'poor'
}

export interface WebVitalThresholds {
  good: number
  poor: number
}

/**
 * Core Web Vitals threshold definitions.
 * Based on https://web.dev/articles/vitals
 */
export const WEB_VITAL_THRESHOLDS: Readonly<Record<WebVitalMetric['name'], WebVitalThresholds>> = {
  LCP: { good: 2500, poor: 4000 },
  FID: { good: 100, poor: 300 },
  CLS: { good: 0.1, poor: 0.25 },
  TTFB: { good: 800, poor: 1800 },
  INP: { good: 200, poor: 500 },
  FCP: { good: 1800, poor: 3000 },
} as const

export function evaluateMetric(
  name: WebVitalMetric['name'],
  value: number,
): WebVitalMetric['rating'] {
  const thresholds = WEB_VITAL_THRESHOLDS[name]
  if (value <= thresholds.good) return 'good'
  if (value <= thresholds.poor) return 'needs-improvement'
  return 'poor'
}

export interface WebVitalsReport {
  metrics: WebVitalMetric[]
  timestamp: string
  url: string
  overallRating: WebVitalMetric['rating']
}

function computeOverallRating(metrics: WebVitalMetric[]): WebVitalMetric['rating'] {
  if (metrics.length === 0) return 'good'
  const hasPoor = metrics.some((m) => m.rating === 'poor')
  if (hasPoor) return 'poor'
  const hasNeedsImprovement = metrics.some((m) => m.rating === 'needs-improvement')
  if (hasNeedsImprovement) return 'needs-improvement'
  return 'good'
}

const collectedMetrics: WebVitalMetric[] = []

export function reportWebVitals(metric: WebVitalMetric): void {
  // Evaluate the rating if not already set
  const enrichedMetric: WebVitalMetric = {
    ...metric,
    rating: metric.rating ?? evaluateMetric(metric.name, metric.value),
  }

  // Store metric for batch reporting
  const existingIndex = collectedMetrics.findIndex((m) => m.name === enrichedMetric.name)
  if (existingIndex >= 0) {
    collectedMetrics[existingIndex] = enrichedMetric
  } else {
    collectedMetrics.push(enrichedMetric)
  }

  // Development mode: log to console
  if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
    const ratingIcon =
      enrichedMetric.rating === 'good'
        ? '[GOOD]'
        : enrichedMetric.rating === 'needs-improvement'
          ? '[NEEDS IMPROVEMENT]'
          : '[POOR]'

    // eslint-disable-next-line no-console
    console.log(
      `[WebVitals] ${enrichedMetric.name}: ${enrichedMetric.value.toFixed(2)} ${ratingIcon}`,
    )
  }

  // Production mode: send to monitoring endpoint
  if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'production') {
    sendToEndpoint(enrichedMetric)
  }
}

let sendTimer: ReturnType<typeof setTimeout> | null = null
const BATCH_DELAY_MS = 5000

function sendToEndpoint(metric: WebVitalMetric): void {
  // Debounce batch sending
  if (sendTimer) {
    clearTimeout(sendTimer)
  }

  sendTimer = setTimeout(() => {
    const report = buildReport()
    const endpoint =
      typeof process !== 'undefined' ? process.env?.NEXT_PUBLIC_VITALS_ENDPOINT : undefined

    if (endpoint) {
      try {
        fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(report),
          keepalive: true,
        }).catch(() => {
          // Silently fail — monitoring should not break the app
        })
      } catch {
        // Silently fail
      }
    }

    sendTimer = null
  }, BATCH_DELAY_MS)

  void metric
}

export function buildReport(): WebVitalsReport {
  return {
    metrics: [...collectedMetrics],
    timestamp: new Date().toISOString(),
    url: typeof window !== 'undefined' ? window.location.href : '',
    overallRating: computeOverallRating(collectedMetrics),
  }
}

export function getCollectedMetrics(): readonly WebVitalMetric[] {
  return [...collectedMetrics]
}

export function clearCollectedMetrics(): void {
  collectedMetrics.length = 0
}

export function createMetric(
  name: WebVitalMetric['name'],
  value: number,
  delta?: number,
): WebVitalMetric {
  return {
    name,
    value,
    id: `v4-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    delta: delta ?? value,
    rating: evaluateMetric(name, value),
  }
}
