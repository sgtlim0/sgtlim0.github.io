'use client'

import type { ReactNode } from 'react'
import { ErrorRecovery } from '@hchat/ui'

interface ChatWithRecoveryProps {
  children: ReactNode
}

/**
 * Wraps the ChatPage with ErrorRecovery for SSE streaming error retry.
 * On failure, shows retry UI instead of a blank screen.
 */
export default function ChatWithRecovery({ children }: ChatWithRecoveryProps) {
  return (
    <ErrorRecovery
      onExecute={async () => {
        // The ChatPage handles its own SSE connection internally.
        // This wrapper catches render-time async errors and provides
        // a retry mechanism for connection failures.
      }}
      maxRetries={3}
      errorFallback={(error, reset) => (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="max-w-sm w-full text-center space-y-4 p-6">
            <div
              className="w-12 h-12 mx-auto rounded-full flex items-center justify-center"
              style={{
                backgroundColor: 'var(--user-bg-section)',
                border: '2px solid var(--user-danger, #ef4444)',
              }}
            >
              <svg
                className="w-6 h-6"
                style={{ color: 'var(--user-danger, #ef4444)' }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <div>
              <p className="font-medium text-user-text-primary">
                연결에 실패했습니다
              </p>
              <p className="text-sm mt-1 text-user-text-secondary">
                {error.message}
              </p>
            </div>
            <button
              onClick={reset}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-user-primary text-white hover:opacity-90"
            >
              다시 시도
            </button>
          </div>
        </div>
      )}
    >
      {() => <>{children}</>}
    </ErrorRecovery>
  )
}
