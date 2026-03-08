'use client'

import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react'
import {
  registerProvider,
  removeAllProviders,
  createConsoleProvider,
  createNoopProvider,
  setAnalyticsEnabled,
  type AnalyticsProvider as AnalyticsProviderInterface,
} from './analytics'
import { useAnalytics, type UseAnalyticsReturn } from '../hooks/useAnalytics'

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const AnalyticsContext = createContext<UseAnalyticsReturn>({
  trackEvent: () => {},
  trackPageView: () => {},
  trackTiming: () => {},
})

// ---------------------------------------------------------------------------
// Provider Props
// ---------------------------------------------------------------------------

export interface AnalyticsProviderProps {
  children: ReactNode
  /** When true, analytics events are collected and forwarded to providers. Defaults to true. */
  enabled?: boolean
  /**
   * Custom providers to register. If omitted, a default provider is chosen:
   * - development: ConsoleProvider
   * - production: NoopProvider (replace with real provider in production)
   */
  providers?: AnalyticsProviderInterface[]
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * React context provider for the analytics system.
 *
 * Wrap your app with this component to configure providers and expose
 * analytics helpers via the `useAnalyticsContext` hook.
 *
 * @example
 * ```tsx
 * <AnalyticsProvider enabled={!isDevMode}>
 *   <App />
 * </AnalyticsProvider>
 * ```
 */
export function AnalyticsProvider({
  children,
  enabled = true,
  providers: customProviders,
}: AnalyticsProviderProps) {
  // Register / unregister providers on mount / prop change
  useEffect(() => {
    setAnalyticsEnabled(enabled)

    if (!enabled) return

    const providerList =
      customProviders ??
      (process.env.NODE_ENV === 'production' ? [createNoopProvider()] : [createConsoleProvider()])

    for (const p of providerList) {
      registerProvider(p)
    }

    return () => {
      removeAllProviders()
    }
  }, [enabled, customProviders])

  const analytics = useAnalytics()

  const value = useMemo<UseAnalyticsReturn>(
    () => analytics,
    [analytics],
  )

  return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>
}

/**
 * Consume the analytics context.
 * Must be used within an `<AnalyticsProvider>`.
 */
export function useAnalyticsContext(): UseAnalyticsReturn {
  return useContext(AnalyticsContext)
}
