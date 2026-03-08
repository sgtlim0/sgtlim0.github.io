'use client'

import { ErrorPage } from '@hchat/ui'

export default function MobileError({
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
      title="서비스 오류"
      description="모바일 서비스에서 문제가 발생했습니다."
    />
  )
}
