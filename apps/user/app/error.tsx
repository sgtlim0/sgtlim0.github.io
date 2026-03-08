'use client'

import { ErrorPage } from '@hchat/ui'

export default function UserError({
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
      description="서비스 이용 중 문제가 발생했습니다. 다시 시도해 주세요."
    />
  )
}
