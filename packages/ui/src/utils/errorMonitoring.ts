export interface ErrorContext {
  component?: string
  action?: string
  userId?: string
  extra?: Record<string, unknown>
}

export interface BreadcrumbData {
  category: string
  message: string
  level?: 'debug' | 'info' | 'warning' | 'error'
  data?: Record<string, unknown>
  timestamp?: number
}

export interface UserContext {
  id: string
  email: string
  role: string
}

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

export function initSentry(sentry: SentryLike): void {
  sentryInstance = sentry
}

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

export function setUser(user: UserContext): void {
  if (sentryInstance) {
    sentryInstance.setUser(user)
    return
  }
}

export function clearUser(): void {
  if (sentryInstance) {
    sentryInstance.setUser(null)
    return
  }
}

const breadcrumbs: BreadcrumbData[] = []
const MAX_BREADCRUMBS = 100

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

export function getBreadcrumbs(): readonly BreadcrumbData[] {
  return [...breadcrumbs]
}

const activeTransactions = new Map<string, TransactionContext>()

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

export interface ErrorBoundaryConfig {
  fallback: 'default' | 'minimal' | 'custom'
  onError: (error: Error, errorInfo: { componentStack?: string }) => void
  beforeCapture?: (error: Error) => ErrorContext
}

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
