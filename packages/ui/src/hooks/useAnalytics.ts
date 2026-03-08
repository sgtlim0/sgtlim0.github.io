'use client'

import { useCallback, useEffect, useRef } from 'react'
import {
  trackEvent as coreTrackEvent,
  trackPageView as coreTrackPageView,
  trackTiming as coreTrackTiming,
  type EventCategory,
} from '../utils/analytics'

/**
 * Return type for the useAnalytics hook.
 */
export interface UseAnalyticsReturn {
  trackEvent: (name: string, category: EventCategory, properties?: Record<string, unknown>) => void
  trackPageView: (path: string, title?: string) => void
  trackTiming: (name: string, durationMs: number) => void
}

/**
 * React hook for analytics tracking.
 *
 * - Wraps the core analytics functions in stable callbacks
 * - Optionally tracks page views automatically when `path` changes
 *
 * @param path - Current page path. When provided, triggers automatic page view tracking on change.
 * @param title - Optional page title for automatic page view tracking.
 */
export function useAnalytics(path?: string, title?: string): UseAnalyticsReturn {
  const prevPath = useRef<string | undefined>(undefined)

  const trackEvent = useCallback(
    (name: string, category: EventCategory, properties?: Record<string, unknown>) => {
      coreTrackEvent(name, category, properties)
    },
    [],
  )

  const trackPageView = useCallback((p: string, t?: string) => {
    coreTrackPageView(p, t)
  }, [])

  const trackTiming = useCallback((name: string, durationMs: number) => {
    coreTrackTiming(name, durationMs)
  }, [])

  // Automatic page view tracking on path change
  useEffect(() => {
    if (path !== undefined && path !== prevPath.current) {
      prevPath.current = path
      coreTrackPageView(path, title)
    }
  }, [path, title])

  return { trackEvent, trackPageView, trackTiming }
}
