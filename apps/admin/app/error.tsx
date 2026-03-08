'use client'

import { ErrorPage } from '@hchat/ui'

export default function AdminError({
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
      title="관리자 페이지 오류"
      description="관리자 패널에서 문제가 발생했습니다. 다시 시도해 주세요."
    />
  )
}
