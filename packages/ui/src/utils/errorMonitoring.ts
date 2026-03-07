export interface ErrorContext {
  component?: string
  action?: string
  userId?: string
  extra?: Record<string, unknown>
}

export function captureError(error: Error, context?: ErrorContext): void {
  if (process.env.NODE_ENV !== 'production') return
  // Future: Sentry.captureException(error, { extra: context })
  void error
  void context
}

export function captureMessage(
  message: string,
  level: 'info' | 'warning' | 'error' = 'info',
): void {
  if (process.env.NODE_ENV !== 'production') return
  // Future: Sentry.captureMessage(message, level)
  void message
  void level
}

export function setUser(user: { id: string; email: string; role: string }): void {
  // Future: Sentry.setUser(user)
  void user
}

export function clearUser(): void {
  // Future: Sentry.setUser(null)
}
