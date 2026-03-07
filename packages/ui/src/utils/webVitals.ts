export interface WebVitalMetric {
  name: 'FCP' | 'LCP' | 'CLS' | 'FID' | 'INP' | 'TTFB'
  value: number
  id: string
  delta: number
  rating: 'good' | 'needs-improvement' | 'poor'
}

export function reportWebVitals(metric: WebVitalMetric): void {
  if (process.env.NODE_ENV === 'production') {
    // Future: send to analytics endpoint
    // fetch('/api/analytics/vitals', { method: 'POST', body: JSON.stringify(metric) })
  }
}
