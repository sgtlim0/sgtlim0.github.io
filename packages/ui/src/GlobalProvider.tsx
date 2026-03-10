'use client'

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from 'react'
import ThemeProvider from './ThemeProvider'
import FeatureFlagProvider from './utils/FeatureFlagProvider'
import { AnalyticsProvider } from './utils/AnalyticsProvider'
import { ToastQueueProvider } from './ToastQueueProvider'
import { ModalProvider } from './hooks/ModalProvider'
import { HotkeyProvider } from './hooks/HotkeyProvider'
import { EventBusProvider } from './hooks/EventBusProvider'
import { QueryProvider } from './hooks/QueryProvider'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface GlobalProviderConfig {
  /** Theme configuration. ThemeProvider is always rendered. */
  theme?: { defaultTheme?: 'light' | 'dark' }
  /** Enable AnalyticsProvider. @default true */
  analytics?: { enabled?: boolean }
  /** Enable FeatureFlagProvider. @default true */
  featureFlags?: boolean
  /** Enable HotkeyProvider. @default true */
  hotkeys?: boolean
  /** Enable ToastQueueProvider. @default true */
  toasts?: boolean
  /** Enable ModalProvider. @default true */
  modals?: boolean
  /** Enable EventBusProvider. @default true */
  eventBus?: boolean
  /** Enable QueryProvider. @default true */
  query?: boolean
}

export interface GlobalProviderProps extends GlobalProviderConfig {
  children: ReactNode
}

interface GlobalContextValue {
  readonly analytics: boolean
  readonly featureFlags: boolean
  readonly hotkeys: boolean
  readonly toasts: boolean
  readonly modals: boolean
  readonly eventBus: boolean
  readonly query: boolean
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const GlobalContext = createContext<GlobalContextValue>({
  analytics: true,
  featureFlags: true,
  hotkeys: true,
  toasts: true,
  modals: true,
  eventBus: true,
  query: true,
})

// ---------------------------------------------------------------------------
// Conditional wrapper helper
// ---------------------------------------------------------------------------

interface ConditionalWrapperProps {
  readonly condition: boolean
  readonly wrapper: (children: ReactNode) => ReactNode
  readonly children: ReactNode
}

function ConditionalWrapper({ condition, wrapper, children }: ConditionalWrapperProps) {
  return condition ? <>{wrapper(children)}</> : <>{children}</>
}

// ---------------------------------------------------------------------------
// GlobalProvider
// ---------------------------------------------------------------------------

/**
 * Unified wrapper that conditionally nests all optional providers.
 *
 * ThemeProvider is always rendered. Other providers default to enabled
 * and can be individually disabled via props.
 *
 * @example
 * ```tsx
 * <GlobalProvider analytics={{ enabled: false }} hotkeys={false}>
 *   <App />
 * </GlobalProvider>
 * ```
 */
export function GlobalProvider({
  children,
  theme,
  analytics = { enabled: true },
  featureFlags = true,
  hotkeys = true,
  toasts = true,
  modals = true,
  eventBus = true,
  query = true,
}: GlobalProviderProps) {
  const analyticsEnabled = typeof analytics === 'object' ? (analytics.enabled ?? true) : true

  const contextValue = useMemo<GlobalContextValue>(
    () => ({
      analytics: analyticsEnabled,
      featureFlags,
      hotkeys,
      toasts,
      modals,
      eventBus,
      query,
    }),
    [analyticsEnabled, featureFlags, hotkeys, toasts, modals, eventBus, query],
  )

  // Nest providers inside-out. ThemeProvider is always the outermost.
  // Order: Theme > FeatureFlags > Analytics > Query > EventBus > Hotkeys > Modals > Toasts > children
  let content: ReactNode = children

  content = (
    <ConditionalWrapper
      condition={toasts}
      wrapper={(c) => <ToastQueueProvider>{c}</ToastQueueProvider>}
    >
      {content}
    </ConditionalWrapper>
  )

  content = (
    <ConditionalWrapper
      condition={modals}
      wrapper={(c) => <ModalProvider>{c}</ModalProvider>}
    >
      {content}
    </ConditionalWrapper>
  )

  content = (
    <ConditionalWrapper
      condition={hotkeys}
      wrapper={(c) => <HotkeyProvider>{c}</HotkeyProvider>}
    >
      {content}
    </ConditionalWrapper>
  )

  content = (
    <ConditionalWrapper
      condition={eventBus}
      wrapper={(c) => <EventBusProvider>{c}</EventBusProvider>}
    >
      {content}
    </ConditionalWrapper>
  )

  content = (
    <ConditionalWrapper
      condition={query}
      wrapper={(c) => <QueryProvider>{c}</QueryProvider>}
    >
      {content}
    </ConditionalWrapper>
  )

  content = (
    <ConditionalWrapper
      condition={analyticsEnabled}
      wrapper={(c) => <AnalyticsProvider enabled={analytics?.enabled}>{c}</AnalyticsProvider>}
    >
      {content}
    </ConditionalWrapper>
  )

  content = (
    <ConditionalWrapper
      condition={featureFlags}
      wrapper={(c) => <FeatureFlagProvider>{c}</FeatureFlagProvider>}
    >
      {content}
    </ConditionalWrapper>
  )

  void theme // reserved for future defaultTheme support

  return (
    <ThemeProvider>
      <GlobalContext.Provider value={contextValue}>{content}</GlobalContext.Provider>
    </ThemeProvider>
  )
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Returns the current GlobalProvider configuration.
 * Useful for checking which providers are active.
 */
export function useGlobalContext(): GlobalContextValue {
  return useContext(GlobalContext)
}
