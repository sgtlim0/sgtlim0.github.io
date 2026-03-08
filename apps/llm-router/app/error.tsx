'use client'

import { ErrorPage } from '@hchat/ui'

export default function LlmRouterError({
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
      title="LLM Router 오류"
      description="모델 정보를 불러오는 중 문제가 발생했습니다."
    />
  )
}
