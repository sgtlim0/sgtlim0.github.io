'use client'

import type { BenchmarkResult, ModelRecommendation } from './services/benchmarkTypes'
import { getLatestResults, getRecommendations } from './services/benchmarkService'
import { useAsyncData } from '../hooks/useAsyncData'

interface BenchmarkData {
  readonly results: BenchmarkResult[]
  readonly recommendations: ModelRecommendation[]
}

export default function BenchmarkDashboard() {
  const { data, loading } = useAsyncData<BenchmarkData>(async () => {
    const [results, recommendations] = await Promise.all([getLatestResults(), getRecommendations()])
    return { results, recommendations }
  }, [])

  if (loading || !data)
    return <div className="p-8 text-center text-text-secondary">벤치마크 로딩 중...</div>

  const { results, recommendations } = data

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-text-primary">AI 모델 벤치마크</h2>
        <p className="text-sm text-text-secondary mt-1">
          {results.length}개 모델 비교 | 4개 카테고리
        </p>
      </div>

      {/* Ranking Table */}
      <div className="rounded-xl border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-admin-bg-section border-b border-border">
              <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary">
                순위
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary">
                모델
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-text-secondary">
                품질
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-text-secondary">
                속도
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-text-secondary">
                비용
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-text-secondary">
                안전
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-text-secondary">
                종합
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary">
                ₩/1K 토큰
              </th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr
                key={r.modelId}
                className="border-b border-border-light hover:bg-admin-table-hover"
              >
                <td className="px-4 py-3 font-bold text-admin-teal">#{r.rank}</td>
                <td className="px-4 py-3">
                  <div className="font-medium text-text-primary">{r.modelName}</div>
                  <div className="text-xs text-text-tertiary">{r.provider}</div>
                </td>
                <td className="px-4 py-3 text-center">
                  <ScoreBadge score={r.scores.quality} />
                </td>
                <td className="px-4 py-3 text-center">
                  <ScoreBadge score={r.scores.speed} />
                </td>
                <td className="px-4 py-3 text-center">
                  <ScoreBadge score={r.scores.cost} />
                </td>
                <td className="px-4 py-3 text-center">
                  <ScoreBadge score={r.scores.safety} />
                </td>
                <td className="px-4 py-3 text-center font-bold text-text-primary">
                  {r.overallScore}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-text-primary">
                  ₩{r.costPer1kTokens}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Recommendations */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-text-primary">용도별 추천</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {recommendations.map((rec) => (
            <div key={rec.useCase} className="p-4 rounded-xl border border-border bg-admin-bg-card">
              <p className="text-xs text-text-secondary">{rec.useCase}</p>
              <p className="text-sm font-bold text-admin-teal mt-1">{rec.recommendedModel}</p>
              <p className="text-xs text-text-secondary mt-2">{rec.reason}</p>
              <div className="flex items-center gap-1 mt-2">
                <div className="flex-1 h-1.5 bg-bg-hover rounded-full">
                  <div
                    className="h-full bg-admin-teal rounded-full"
                    style={{ width: `${rec.confidence * 100}%` }}
                  />
                </div>
                <span className="text-[10px] text-text-tertiary">
                  {Math.round(rec.confidence * 100)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 90
      ? 'text-green-600 bg-green-50'
      : score >= 80
        ? 'text-blue-600 bg-blue-50'
        : score >= 70
          ? 'text-yellow-600 bg-yellow-50'
          : 'text-red-600 bg-red-50'
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${color}`}>
      {score}
    </span>
  )
}
