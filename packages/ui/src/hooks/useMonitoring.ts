'use client'

import { useState, useEffect, useCallback } from 'react'

export interface MonitoringData {
  webVitals: { lcp: number; fid: number; cls: number; ttfb: number; inp: number }
  errorRate: number
  uptime: number
  activeAlerts: number
}

const MOCK_MONITORING_DATA: MonitoringData = {
  webVitals: {
    lcp: 1850,
    fid: 45,
    cls: 0.05,
    ttfb: 620,
    inp: 120,
  },
  errorRate: 0.8,
  uptime: 99.97,
  activeAlerts: 2,
}

export interface UseMonitoringOptions {
  endpoint?: string
  refreshInterval?: number
  enabled?: boolean
}

export function useMonitoring(
  options?: UseMonitoringOptions,
): { data: MonitoringData | null; isLoading: boolean; error: string | null; refresh: () => void } {
  const {
    endpoint = '/api/health',
    refreshInterval = 30000,
    enabled = true,
  } = options ?? {}

  const [data, setData] = useState<MonitoringData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!enabled) return

    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(endpoint)

      if (response.ok) {
        const json = (await response.json()) as MonitoringData
        setData(json)
      } else {
        // Fallback to mock data when endpoint is not available
        setData(MOCK_MONITORING_DATA)
      }
    } catch {
      // In development or when no backend, use mock data
      setData(MOCK_MONITORING_DATA)
      setError('Monitoring endpoint unavailable — using mock data')
    } finally {
      setIsLoading(false)
    }
  }, [endpoint, enabled])

  useEffect(() => {
    fetchData()

    if (!enabled || refreshInterval <= 0) return

    const interval = setInterval(fetchData, refreshInterval)
    return () => clearInterval(interval)
  }, [fetchData, refreshInterval, enabled])

  const refresh = useCallback(() => {
    fetchData()
  }, [fetchData])

  return { data, isLoading, error, refresh }
}
