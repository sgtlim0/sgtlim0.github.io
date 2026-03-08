'use client'

import { ErrorPage } from '@hchat/ui'

export default function WikiError({
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
      title="Wiki 페이지 오류"
      description="문서를 불러오는 중 문제가 발생했습니다."
    />
  )
}
