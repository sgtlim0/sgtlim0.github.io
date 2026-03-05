'use client'

import dynamic from 'next/dynamic'
import { SkeletonCard } from '@hchat/ui'
import { LRNavbar, mockModels } from '@hchat/ui/llm-router'

const ModelComparison = dynamic(
  () => import('@hchat/ui/llm-router').then((mod) => ({ default: mod.ModelComparison })),
  { loading: () => <SkeletonCard />, ssr: false },
)

export default function ComparePage() {
  return (
    <div className="min-h-screen">
      <LRNavbar isAuthenticated={false} />

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-lr-text-primary">모델 비교</h1>
          <p className="text-lg text-lr-text-secondary">최대 3개 모델을 나란히 비교하세요</p>
        </div>

        <ModelComparison models={mockModels} />

        <div className="mt-8 p-4 bg-lr-bg-section border border-lr-border rounded-lg">
          <p className="text-sm text-lr-text-muted text-center">
            가격은 KRW 기준이며, 환율에 따라 변동될 수 있습니다
          </p>
        </div>
      </div>
    </div>
  )
}
