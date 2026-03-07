'use client'

import React, { Component, ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (process.env.NODE_ENV === 'development') {
       
      console.error('ErrorBoundary caught an error:', error, errorInfo)
    }
  }

  resetErrorBoundary = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }
      return <ErrorFallback error={this.state.error} onRetry={this.resetErrorBoundary} />
    }

    return this.props.children
  }
}

export default ErrorBoundary

interface ErrorFallbackProps {
  error?: Error
  onRetry?: () => void
  title?: string
}

export function ErrorFallback({
  error,
  onRetry,
  title = 'Something went wrong',
}: ErrorFallbackProps) {
  return (
    <div
      className="min-h-[400px] flex items-center justify-center p-8"
      style={{ backgroundColor: 'var(--bg-page)' }}
    >
      <div className="max-w-md w-full text-center space-y-6">
        {/* Error Icon */}
        <div
          className="w-20 h-20 mx-auto rounded-full flex items-center justify-center"
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '2px solid var(--danger)',
          }}
        >
          <svg
            className="w-10 h-10"
            style={{ color: 'var(--danger)' }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          {title}
        </h2>

        {/* Error Message */}
        {error && (
          <div
            className="rounded-lg p-4 text-left"
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border)',
            }}
          >
            <p className="text-sm font-mono break-words" style={{ color: 'var(--text-secondary)' }}>
              {error.message || 'An unexpected error occurred'}
            </p>
          </div>
        )}

        {/* Retry Button */}
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            style={{
              backgroundColor: 'var(--primary)',
              color: 'var(--text-white)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--primary-hover)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--primary)'
            }}
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  )
}
