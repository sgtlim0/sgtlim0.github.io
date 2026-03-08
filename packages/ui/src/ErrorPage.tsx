'use client'

import { useEffect } from 'react'
import { captureError } from './utils/errorMonitoring'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
  title?: string
  description?: string
}

/**
 * Shared error page component for Next.js App Router error.tsx files.
 * Integrates with captureError() for monitoring and provides reset functionality.
 */
export function ErrorPage({
  error,
  reset,
  title = '문제가 발생했습니다',
  description,
}: ErrorPageProps) {
  useEffect(() => {
    captureError(error, {
      component: 'ErrorPage',
      action: 'route-error',
      extra: { digest: error.digest },
    })
  }, [error])

  return (
    <div
      className="min-h-[400px] flex items-center justify-center p-8"
      style={{ backgroundColor: 'var(--bg-page)' }}
    >
      <div className="max-w-md w-full text-center space-y-6">
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

        <h2 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          {title}
        </h2>

        {description && (
          <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
            {description}
          </p>
        )}

        <div
          className="rounded-lg p-4 text-left"
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border)',
          }}
        >
          <p className="text-sm font-mono break-words" style={{ color: 'var(--text-secondary)' }}>
            {error.message || '예기치 않은 오류가 발생했습니다'}
          </p>
        </div>

        <button
          onClick={reset}
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
          다시 시도
        </button>
      </div>
    </div>
  )
}

interface NotFoundPageProps {
  title?: string
  description?: string
  homeHref?: string
}

/**
 * Shared 404 page component for Next.js App Router not-found.tsx files.
 */
export function NotFoundPage({
  title = '페이지를 찾을 수 없습니다',
  description = '요청하신 페이지가 존재하지 않거나 이동되었습니다.',
  homeHref = '/',
}: NotFoundPageProps) {
  return (
    <div
      className="min-h-[400px] flex items-center justify-center p-8"
      style={{ backgroundColor: 'var(--bg-page)' }}
    >
      <div className="max-w-md w-full text-center space-y-6">
        <div
          className="w-20 h-20 mx-auto rounded-full flex items-center justify-center"
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '2px solid var(--border)',
          }}
        >
          <span className="text-3xl font-bold" style={{ color: 'var(--text-secondary)' }}>
            404
          </span>
        </div>

        <h2 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          {title}
        </h2>

        <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
          {description}
        </p>

        <a
          href={homeHref}
          className="inline-block px-6 py-3 rounded-lg font-medium transition-colors duration-200"
          style={{
            backgroundColor: 'var(--primary)',
            color: 'var(--text-white)',
          }}
        >
          홈으로 돌아가기
        </a>
      </div>
    </div>
  )
}
