'use client'

export default function LlmRouterGlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="ko">
      <body>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
          <div style={{ maxWidth: '28rem', width: '100%', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
              심각한 오류가 발생했습니다
            </h2>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
              {error.message || '앱을 로드하는 중 문제가 발생했습니다.'}
            </p>
            <button
              onClick={reset}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                backgroundColor: '#2563eb',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              다시 시도
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
