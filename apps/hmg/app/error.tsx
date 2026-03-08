'use client'

import { ErrorPage } from '@hchat/ui'

export default function HmgError({
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
      title="페이지 오류"
      description="현대자동차그룹 H Chat 페이지에서 문제가 발생했습니다."
    />
  )
}
