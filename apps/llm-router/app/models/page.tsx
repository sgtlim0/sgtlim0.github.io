'use client'

import dynamic from 'next/dynamic'
import { SkeletonTable } from '@hchat/ui'
import { LRNavbar, mockModels } from '@hchat/ui/llm-router'

const ModelTable = dynamic(
  () => import('@hchat/ui/llm-router').then(m => ({ default: m.ModelTable })),
  { loading: () => <SkeletonTable /> }
)

export default function ModelsPage() {
  return (
    <div className="min-h-screen">
      <LRNavbar isAuthenticated={false} />

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-lr-text-primary">
            AI 모델 가격표
          </h1>
          <p className="text-lg text-lr-text-secondary">
            86개 모델의 실시간 가격을 비교하세요
          </p>
        </div>

        {/* Model Table */}
        <ModelTable models={mockModels} />

        {/* Disclaimer */}
        <div className="mt-8 p-4 bg-lr-bg-section border border-lr-border rounded-lg">
          <p className="text-sm text-lr-text-muted text-center">
            가격은 KRW 기준이며, 환율에 따라 변동될 수 있습니다
          </p>
        </div>
      </div>
    </div>
  )
}
