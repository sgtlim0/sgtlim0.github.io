'use client'

import React from 'react'

export interface LoadingOverlayProps {
  /** Whether the overlay is visible */
  visible: boolean
  /** Fullscreen or contained within parent */
  fullscreen?: boolean
  /** Optional loading message */
  message?: string
  /** Custom className */
  className?: string
}

export function LoadingOverlay({
  visible,
  fullscreen = false,
  message,
  className = '',
}: LoadingOverlayProps) {
  if (!visible) return null

  const positionClass = fullscreen ? 'fixed inset-0 z-50' : 'absolute inset-0 z-10'

  return (
    <div
      className={`${positionClass} flex flex-col items-center justify-center ${className}`}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
      role="progressbar"
      aria-busy="true"
      aria-label={message || 'Loading'}
    >
      {/* Spinner */}
      <div
        className="h-10 w-10 rounded-full"
        style={{
          border: '3px solid rgba(255, 255, 255, 0.3)',
          borderTopColor: 'var(--accent, #3b82f6)',
          animation: 'loading-overlay-spin 0.8s linear infinite',
        }}
      />
      {message && (
        <p
          className="mt-3 text-sm font-medium"
          style={{ color: 'var(--text-primary, #ffffff)' }}
        >
          {message}
        </p>
      )}
      <style>{`
        @keyframes loading-overlay-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
