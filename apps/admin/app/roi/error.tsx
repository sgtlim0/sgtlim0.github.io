'use client'

import { ErrorPage } from '@hchat/ui'

export default function ROIError({
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
      title="ROI 대시보드 오류"
      description="ROI 데이터를 불러오는 중 문제가 발생했습니다. 다시 시도해 주세요."
    />
  )
}
