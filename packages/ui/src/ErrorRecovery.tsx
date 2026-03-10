'use client'

import React, { useState, useCallback, type ReactNode } from 'react'

export interface ErrorRecoveryProps {
  /** The async operation to execute and recover from on failure */
  children: (args: { execute: () => Promise<void> }) => ReactNode
  /** Async function to retry on failure */
  onExecute: () => Promise<void>
  /** Maximum retry attempts before showing permanent error (default 3) */
  maxRetries?: number
  /** Custom render for the retrying state */
  retryingFallback?: (attempt: number) => ReactNode
  /** Custom render for when max retries are exceeded */
  errorFallback?: (error: Error, reset: () => void) => ReactNode
  /** Called on each retry attempt */
  onRetry?: (attempt: number, error: Error) => void
  /** Called when all retries are exhausted */
  onMaxRetriesExceeded?: (error: Error) => void
}

type RecoveryState =
  | { status: 'idle' }
  | { status: 'retrying'; attempt: number; error: Error }
  | { status: 'failed'; error: Error }

/**
 * Wrapper component that catches async errors and provides retry UI.
 *
 * Unlike ErrorBoundary (which catches render errors), ErrorRecovery
 * handles imperative async failures with a retry mechanism.
 *
 * ```tsx
 * <ErrorRecovery onExecute={() => fetchData()} maxRetries={3}>
 *   {({ execute }) => (
 *     <button onClick={execute}>Load Data</button>
 *   )}
 * </ErrorRecovery>
 * ```
 */
export function ErrorRecovery({
  children,
  onExecute,
  maxRetries = 3,
  retryingFallback,
  errorFallback,
  onRetry,
  onMaxRetriesExceeded,
}: ErrorRecoveryProps) {
  const [state, setState] = useState<RecoveryState>({ status: 'idle' })

  const reset = useCallback(() => {
    setState({ status: 'idle' })
  }, [])

  const execute = useCallback(async () => {
    let lastError: Error | undefined

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          setState({ status: 'retrying', attempt, error: lastError! })
          onRetry?.(attempt, lastError!)
        }
        await onExecute()
        setState({ status: 'idle' })
        return
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
      }
    }

    setState({ status: 'failed', error: lastError! })
    onMaxRetriesExceeded?.(lastError!)
  }, [onExecute, maxRetries, onRetry, onMaxRetriesExceeded])

  if (state.status === 'retrying') {
    if (retryingFallback) {
      return <>{retryingFallback(state.attempt)}</>
    }

    return (
      <div
        className="flex items-center justify-center p-6"
        role="status"
        aria-live="polite"
      >
        <div className="text-center space-y-3">
          <div
            className="w-8 h-8 mx-auto rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }}
          />
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Retrying... (attempt {state.attempt} of {maxRetries})
          </p>
        </div>
      </div>
    )
  }

  if (state.status === 'failed') {
    if (errorFallback) {
      return <>{errorFallback(state.error, reset)}</>
    }

    return (
      <div
        className="flex items-center justify-center p-6"
        role="alert"
      >
        <div className="max-w-sm w-full text-center space-y-4">
          <div
            className="w-12 h-12 mx-auto rounded-full flex items-center justify-center"
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '2px solid var(--danger)',
            }}
          >
            <svg
              className="w-6 h-6"
              style={{ color: 'var(--danger)' }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>

          <div>
            <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
              Operation failed
            </p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              {state.error.message}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
              All {maxRetries} retry attempts exhausted
            </p>
          </div>

          <button
            onClick={() => {
              reset()
              void execute()
            }}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
            style={{
              backgroundColor: 'var(--primary)',
              color: 'var(--text-white)',
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return <>{children({ execute })}</>
}
