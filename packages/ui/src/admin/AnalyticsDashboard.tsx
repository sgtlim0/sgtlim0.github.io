'use client'

import { useState, useEffect } from 'react'
import {
  detectAnomalies,
  predictFuture,
  generateInsights,
  getMockAnalyticsData,
} from './services/analyticsService'
import type { TimeSeriesPoint } from './services/analyticsTypes'

export default function AnalyticsDashboard() {
  const [data, setData] = useState<{
    apiCalls: TimeSeriesPoint[]
    tokenUsage: TimeSeriesPoint[]
    activeUsers: TimeSeriesPoint[]
    costData: TimeSeriesPoint[]
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedMetric, setSelectedMetric] = useState<
    'apiCalls' | 'tokenUsage' | 'activeUsers' | 'costData'
  >('apiCalls')

  useEffect(() => {
    getMockAnalyticsData().then((d) => {
      setData(d)
      setLoading(false)
    })
  }, [])

  const METRIC_LABELS: Record<string, string> = {
    apiCalls: 'API 호출',
    tokenUsage: '토큰 사용량',
    activeUsers: '활성 사용자',
    costData: '비용',
  }
  const selected = data ? data[selectedMetric] : []
  const anomalies = selected.length > 0 ? detectAnomalies(selected) : []
  const predictions = selected.length > 0 ? predictFuture(selected, 7) : []
  const insights =
    selected.length > 0 ? generateInsights(selected, METRIC_LABELS[selectedMetric] ?? '사용량') : []

  if (loading)
    return <div className="p-8 text-center text-text-secondary">분석 데이터 로딩 중...</div>

  const anomalyCount = anomalies.filter((a) => a.isAnomaly).length
  const METRICS = [
    { key: 'apiCalls' as const, label: 'API 호출' },
    { key: 'tokenUsage' as const, label: '토큰 사용량' },
    { key: 'activeUsers' as const, label: '활성 사용자' },
    { key: 'costData' as const, label: '비용' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-text-primary">분석 엔진</h2>
          <p className="text-sm text-text-secondary mt-1">이상 탐지, 예측, 자동 인사이트</p>
        </div>
        <div className="flex gap-2">
          {METRICS.map((m) => (
            <button
              key={m.key}
              onClick={() => setSelectedMetric(m.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${selectedMetric === m.key ? 'bg-admin-teal text-white' : 'bg-admin-bg-section text-text-secondary'}`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-admin-bg-card border border-border">
          <p className="text-xs text-text-secondary">이상치 감지</p>
          <p className="text-2xl font-bold text-text-primary mt-1">{anomalyCount}건</p>
          <span className={`text-xs ${anomalyCount > 0 ? 'text-red-500' : 'text-green-500'}`}>
            {anomalyCount > 0 ? '주의 필요' : '정상'}
          </span>
        </div>
        <div className="p-4 rounded-xl bg-admin-bg-card border border-border">
          <p className="text-xs text-text-secondary">7일 예측</p>
          <p className="text-2xl font-bold text-text-primary mt-1">
            {predictions.length > 0
              ? predictions[predictions.length - 1].predicted.toLocaleString()
              : '-'}
          </p>
          <span className="text-xs text-text-secondary">예상 값</span>
        </div>
        <div className="p-4 rounded-xl bg-admin-bg-card border border-border">
          <p className="text-xs text-text-secondary">인사이트</p>
          <p className="text-2xl font-bold text-text-primary mt-1">{insights.length}건</p>
          <span className="text-xs text-text-secondary">자동 생성</span>
        </div>
      </div>

      {/* Anomaly List */}
      {anomalyCount > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800 p-4">
          <h3 className="text-sm font-bold text-red-700 dark:text-red-400 mb-3">
            이상치 감지 ({anomalyCount}건)
          </h3>
          <div className="space-y-2">
            {anomalies
              .filter((a) => a.isAnomaly)
              .map((a, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="text-text-secondary">{a.date}</span>
                  <span className={a.type === 'spike' ? 'text-red-600' : 'text-blue-600'}>
                    {a.type === 'spike' ? '▲ 급증' : '▼ 급감'} (z-score: {a.zscore})
                  </span>
                  <span className="text-text-primary font-medium">
                    {a.value.toLocaleString()} (예상: {a.expected.toLocaleString()})
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Insights */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-text-primary">자동 인사이트</h3>
        {insights.map((insight) => (
          <div
            key={insight.id}
            className={`p-4 rounded-xl border ${
              insight.severity === 'critical'
                ? 'border-red-300 bg-red-50 dark:bg-red-900/10'
                : insight.severity === 'warning'
                  ? 'border-yellow-300 bg-yellow-50 dark:bg-yellow-900/10'
                  : 'border-border bg-admin-bg-card'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-text-primary">{insight.title}</p>
                <p className="text-xs text-text-secondary mt-1">{insight.description}</p>
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  insight.severity === 'critical'
                    ? 'bg-red-100 text-red-700'
                    : insight.severity === 'warning'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-blue-100 text-blue-700'
                }`}
              >
                {insight.severity}
              </span>
            </div>
            {insight.suggestion && (
              <p className="text-xs text-admin-teal mt-2">💡 {insight.suggestion}</p>
            )}
          </div>
        ))}
        {insights.length === 0 && (
          <p className="text-sm text-text-secondary">인사이트가 없습니다.</p>
        )}
      </div>
    </div>
  )
}
