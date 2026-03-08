/**
 * Error Monitoring Service
 *
 * Sentry-ready error tracking with graceful fallback for non-production environments.
 * Provides error capture, breadcrumbs, user context, and transaction tracing.
 */

/** Context attached to captured errors for debugging. */
export interface ErrorContext {
  component?: string
  action?: string
  userId?: string
  extra?: Record<string, unknown>
}

/** A timestamped breadcrumb entry for tracing event sequences. */
export interface BreadcrumbData {
  category: string
  message: string
  level?: 'debug' | 'info' | 'warning' | 'error'
  data?: Record<string, unknown>
  timestamp?: number
}

/** User identity context for associating errors with users. */
export interface UserContext {
  id: string
  email: string
  role: string
}

/** Performance transaction context for measuring operation durations. */
export interface TransactionContext {
  name: string
  op: string
  startTime: number
  data?: Record<string, unknown>
}

interface SentryLike {
  captureException(error: Error, context?: { extra?: Record<string, unknown> }): void
  captureMessage(message: string, level: string): void
  setUser(user: UserContext | null): void
  addBreadcrumb(breadcrumb: BreadcrumbData): void
  startTransaction(context: { name: string; op: string }): {
    finish(): void
    setData(key: string, value: unknown): void
  }
}

let sentryInstance: SentryLike | null = null

function getDsn(): string | undefined {
  if (typeof process !== 'undefined' && process.env) {
    return process.env.NEXT_PUBLIC_SENTRY_DSN
  }
  return undefined
}

function isProduction(): boolean {
  if (typeof process !== 'undefined' && process.env) {
    return process.env.NODE_ENV === 'production'
  }
  return false
}

function getEnvironment(): string {
  if (typeof process !== 'undefined' && process.env) {
    return process.env.NEXT_PUBLIC_APP_ENV ?? process.env.NODE_ENV ?? 'development'
  }
  return 'development'
}

/**
 * Initializes the monitoring module with a Sentry-compatible instance.
 * Must be called before captureError/captureMessage will forward to Sentry.
 * @param sentry - Object implementing the SentryLike interface
 */
export function initSentry(sentry: SentryLike): void {
  sentryInstance = sentry
}

/**
 * Captures an error and sends it to Sentry (if configured) or logs it in production.
 * No-ops in non-production when Sentry is not initialized.
 * @param error - The Error to capture
 * @param context - Optional context (component, action, userId, extra data)
 */
export function captureError(error: Error, context?: ErrorContext): void {
  if (!isProduction() && !sentryInstance) return

  if (sentryInstance) {
    sentryInstance.captureException(error, { extra: context as Record<string, unknown> })
    return
  }

  // Fallback: structured logging for environments without Sentry
  // eslint-disable-next-line no-console
  console.error('[ErrorMonitoring]', error.message, context)
}

/**
 * Captures a message at the specified severity level.
 * @param message - Human-readable message to capture
 * @param level - Severity level (default: 'info')
 */
export function captureMessage(
  message: string,
  level: 'info' | 'warning' | 'error' = 'info',
): void {
  if (!isProduction() && !sentryInstance) return

  if (sentryInstance) {
    sentryInstance.captureMessage(message, level)
    return
  }
}

/**
 * Sets the current user context for associating subsequent errors with a user.
 * @param user - User identity (id, email, role)
 */
export function setUser(user: UserContext): void {
  if (sentryInstance) {
    sentryInstance.setUser(user)
    return
  }
}

/**
 * Clears the current user context (e.g., on logout).
 */
export function clearUser(): void {
  if (sentryInstance) {
    sentryInstance.setUser(null)
    return
  }
}

const breadcrumbs: BreadcrumbData[] = []
const MAX_BREADCRUMBS = 100

/**
 * Adds a breadcrumb entry for tracing the sequence of events leading to an error.
 * When Sentry is not available, stores up to 100 breadcrumbs in memory.
 * @param breadcrumb - Breadcrumb data (category, message, level, data)
 */
export function addBreadcrumb(breadcrumb: BreadcrumbData): void {
  const entry: BreadcrumbData = {
    ...breadcrumb,
    timestamp: breadcrumb.timestamp ?? Date.now(),
  }

  if (sentryInstance) {
    sentryInstance.addBreadcrumb(entry)
    return
  }

  // In-memory breadcrumb buffer when Sentry is not available
  if (breadcrumbs.length >= MAX_BREADCRUMBS) {
    breadcrumbs.shift()
  }
  breadcrumbs.push(entry)
}

/**
 * Returns the in-memory breadcrumb buffer (when Sentry is not available).
 * @returns Readonly array of BreadcrumbData entries
 */
export function getBreadcrumbs(): readonly BreadcrumbData[] {
  return [...breadcrumbs]
}

const activeTransactions = new Map<string, TransactionContext>()

/**
 * Starts a performance transaction for measuring operation duration.
 * @param name - Transaction name (e.g., 'loadDashboard')
 * @param op - Operation type (e.g., 'navigation', 'http.request')
 * @param data - Optional key-value data to attach to the transaction
 * @returns Unique transaction ID used to finish the transaction later
 */
export function startTransaction(name: string, op: string, data?: Record<string, unknown>): string {
  const id = `${name}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const context: TransactionContext = { name, op, startTime: Date.now(), data }

  if (sentryInstance) {
    const transaction = sentryInstance.startTransaction({ name, op })
    if (data) {
      Object.entries(data).forEach(([key, value]) => {
        transaction.setData(key, value)
      })
    }
    // Store reference for finishing
    activeTransactions.set(id, { ...context, data: { ...data, _sentryTx: transaction } })
  } else {
    activeTransactions.set(id, context)
  }

  return id
}

/**
 * Finishes an active transaction and returns the duration.
 * @param id - Transaction ID returned by startTransaction
 * @returns Object with duration in milliseconds, or null if the transaction was not found
 */
export function finishTransaction(id: string): { duration: number } | null {
  const context = activeTransactions.get(id)
  if (!context) return null

  activeTransactions.delete(id)
  const duration = Date.now() - context.startTime

  if (sentryInstance && context.data) {
    const sentryTx = (context.data as Record<string, unknown>)._sentryTx as
      | { finish(): void }
      | undefined
    if (sentryTx) {
      sentryTx.finish()
    }
  }

  return { duration }
}

/** Configuration for React error boundary integration. */
export interface ErrorBoundaryConfig {
  fallback: 'default' | 'minimal' | 'custom'
  onError: (error: Error, errorInfo: { componentStack?: string }) => void
  beforeCapture?: (error: Error) => ErrorContext
}

/**
 * Creates an ErrorBoundaryConfig with automatic error capture and breadcrumb logging.
 * @param componentName - Name of the component using the error boundary
 * @param options - Optional fallback type ('default' | 'minimal' | 'custom')
 * @returns ErrorBoundaryConfig with onError handler wired to captureError
 */
export function getErrorBoundaryConfig(
  componentName: string,
  options?: { fallback?: ErrorBoundaryConfig['fallback'] },
): ErrorBoundaryConfig {
  return {
    fallback: options?.fallback ?? 'default',
    onError: (error: Error, errorInfo: { componentStack?: string }) => {
      addBreadcrumb({
        category: 'error-boundary',
        message: `Error caught in ${componentName}`,
        level: 'error',
        data: { componentStack: errorInfo.componentStack },
      })

      captureError(error, {
        component: componentName,
        action: 'error-boundary',
        extra: { componentStack: errorInfo.componentStack },
      })
    },
  }
}

/**
 * Returns the current monitoring configuration derived from environment variables.
 * @returns Object with dsn, environment, and enabled flag
 */
export function getMonitoringConfig(): {
  dsn: string | undefined
  environment: string
  enabled: boolean
} {
  return {
    dsn: getDsn(),
    environment: getEnvironment(),
    enabled: isProduction() && !!getDsn(),
  }
}
