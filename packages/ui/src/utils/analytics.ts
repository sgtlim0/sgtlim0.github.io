/**
 * Analytics/Telemetry Service
 *
 * Provides event tracking, page view tracking, and timing metrics with:
 * - Pluggable provider system (Console, Noop, custom)
 * - Event buffering with batch flush (10 events or 5s interval)
 * - PII auto-removal via sanitizePII
 * - Opt-out support (setAnalyticsEnabled)
 * - SSR safe (all browser APIs guarded)
 */

import { sanitizePII } from './sanitize'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type EventCategory = 'navigation' | 'interaction' | 'error' | 'performance' | 'business'

export interface AnalyticsEvent {
  name: string
  category: EventCategory
  properties?: Record<string, unknown>
  timestamp: number
}

/** Provider interface — implement to send events to any backend. */
export interface AnalyticsProvider {
  name: string
  /** Called with a batch of events to send. */
  sendBatch(events: AnalyticsEvent[]): void
  /** Called once when the provider is registered. */
  init?(): void
  /** Called when analytics is shut down. */
  destroy?(): void
}

// ---------------------------------------------------------------------------
// State (module-scoped)
// ---------------------------------------------------------------------------

const BATCH_SIZE = 10
const FLUSH_INTERVAL_MS = 5_000
const MAX_HISTORY = 500

let enabled = true
let eventHistory: AnalyticsEvent[] = []
let eventBuffer: AnalyticsEvent[] = []
let providers: AnalyticsProvider[] = []
let flushTimer: ReturnType<typeof setInterval> | null = null

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

function sanitizeProperties(
  properties?: Record<string, unknown>,
): Record<string, unknown> | undefined {
  if (!properties) return undefined

  const sanitized: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(properties)) {
    if (typeof value === 'string') {
      const { sanitized: clean } = sanitizePII(value)
      sanitized[key] = clean
    } else {
      sanitized[key] = value
    }
  }
  return sanitized
}

function pushToHistory(event: AnalyticsEvent): void {
  eventHistory = [...eventHistory, event]
  if (eventHistory.length > MAX_HISTORY) {
    eventHistory = eventHistory.slice(-MAX_HISTORY)
  }
}

function flushBuffer(): void {
  if (eventBuffer.length === 0) return

  const batch = [...eventBuffer]
  eventBuffer = []

  for (const provider of providers) {
    try {
      provider.sendBatch(batch)
    } catch {
      // Swallow provider errors to avoid cascading failures
    }
  }
}

function startFlushTimer(): void {
  if (flushTimer !== null) return
  if (!isBrowser()) return

  flushTimer = setInterval(() => {
    flushBuffer()
  }, FLUSH_INTERVAL_MS)
}

function stopFlushTimer(): void {
  if (flushTimer !== null) {
    clearInterval(flushTimer)
    flushTimer = null
  }
}

function setupBeaconFlush(): void {
  if (!isBrowser()) return

  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      flushBuffer()
    }
  })
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Track a custom event.
 * Properties are automatically sanitized to remove PII.
 */
export function trackEvent(
  name: string,
  category: EventCategory,
  properties?: Record<string, unknown>,
): void {
  if (!enabled) return

  const event: AnalyticsEvent = {
    name,
    category,
    properties: sanitizeProperties(properties),
    timestamp: Date.now(),
  }

  pushToHistory(event)
  eventBuffer = [...eventBuffer, event]

  if (eventBuffer.length >= BATCH_SIZE) {
    flushBuffer()
  }
}

/**
 * Track a page view event.
 */
export function trackPageView(path: string, title?: string): void {
  trackEvent('page_view', 'navigation', { path, ...(title ? { title } : {}) })
}

/**
 * Track a timing/performance metric.
 */
export function trackTiming(name: string, durationMs: number): void {
  trackEvent(name, 'performance', { durationMs })
}

/**
 * Retrieve recent event history.
 * @param limit - Maximum number of events to return (default: all)
 */
export function getEventHistory(limit?: number): AnalyticsEvent[] {
  if (typeof limit === 'number' && limit > 0) {
    return eventHistory.slice(-limit)
  }
  return [...eventHistory]
}

/**
 * Clear all stored event history and the buffer.
 */
export function clearEventHistory(): void {
  eventHistory = []
  eventBuffer = []
}

/**
 * Enable or disable analytics collection.
 * When disabled, trackEvent/trackPageView/trackTiming become no-ops.
 */
export function setAnalyticsEnabled(value: boolean): void {
  enabled = value
  if (!enabled) {
    stopFlushTimer()
  } else {
    startFlushTimer()
  }
}

/**
 * Returns whether analytics is currently enabled.
 */
export function isAnalyticsEnabled(): boolean {
  return enabled
}

/**
 * Register an analytics provider.
 * Multiple providers can be registered simultaneously.
 */
export function registerProvider(provider: AnalyticsProvider): void {
  providers = [...providers, provider]

  if (provider.init) {
    try {
      provider.init()
    } catch {
      // Swallow init errors
    }
  }

  startFlushTimer()
  setupBeaconFlush()
}

/**
 * Remove all providers and flush remaining events.
 */
export function removeAllProviders(): void {
  flushBuffer()
  stopFlushTimer()

  for (const provider of providers) {
    if (provider.destroy) {
      try {
        provider.destroy()
      } catch {
        // Swallow destroy errors
      }
    }
  }

  providers = []
}

/**
 * Force-flush the event buffer immediately.
 */
export function flush(): void {
  flushBuffer()
}

/**
 * Reset all analytics state. Intended for testing only.
 */
export function resetAnalytics(): void {
  stopFlushTimer()
  enabled = true
  eventHistory = []
  eventBuffer = []
  providers = []
}

// ---------------------------------------------------------------------------
// Built-in Providers
// ---------------------------------------------------------------------------

/**
 * Console provider — logs batched events via console.debug.
 * Useful during development.
 */
export function createConsoleProvider(): AnalyticsProvider {
  return {
    name: 'console',
    sendBatch(events) {
      for (const event of events) {
        // eslint-disable-next-line no-console
        console.debug(`[analytics] ${event.category}/${event.name}`, event.properties ?? '')
      }
    },
  }
}

/**
 * No-op provider — silently discards events.
 * Useful when analytics should be structurally present but inactive.
 */
export function createNoopProvider(): AnalyticsProvider {
  return {
    name: 'noop',
    sendBatch() {
      // intentionally empty
    },
  }
}
