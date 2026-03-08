'use client'

import { ErrorPage } from '@hchat/ui'

export default function DesktopError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <ErrorPage
      error={error}
      reset={reset}
      title="Desktop 오류"
      description="데스크톱 앱에서 문제가 발생했습니다."
    />
  )
}
