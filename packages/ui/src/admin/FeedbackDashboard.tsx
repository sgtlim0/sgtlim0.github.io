'use client'

import { useState, useEffect } from 'react'
import type {
  FeedbackSummary,
  FeedbackABTest,
  PromptTuningSuggestion,
} from './services/feedbackTypes'
import {
  getFeedbackSummary,
  getFeedbackABTests,
  getPromptTuningSuggestions,
} from './services/feedbackService'

export default function FeedbackDashboard() {
  const [summary, setSummary] = useState<FeedbackSummary | null>(null)
  const [abTests, setAbTests] = useState<FeedbackABTest[]>([])
  const [suggestions, setSuggestions] = useState<PromptTuningSuggestion[]>([])
  const [period, setPeriod] = useState<'7d' | '30d'>('30d')

  useEffect(() => {
    Promise.all([
      getFeedbackSummary(period),
      getFeedbackABTests(),
      getPromptTuningSuggestions(),
    ]).then(([s, t, sg]) => {
      setSummary(s)
      setAbTests(t)
      setSuggestions(sg)
    })
  }, [period])

  if (!summary) return <div className="p-8 text-center text-text-secondary">피드백 로딩 중...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-text-primary">피드백 대시보드</h2>
          <p className="text-sm text-text-secondary mt-1">사용자 만족도 및 프롬프트 최적화</p>
        </div>
        <div className="flex gap-2">
          {(['7d', '30d'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-xs rounded-lg ${period === p ? 'bg-admin-teal text-white' : 'bg-admin-bg-section text-text-secondary'}`}
            >
              {p === '7d' ? '7일' : '30일'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-admin-bg-card border border-border">
          <p className="text-xs text-text-secondary">총 피드백</p>
          <p className="text-2xl font-bold text-text-primary">
            {summary.totalFeedback.toLocaleString()}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-admin-bg-card border border-border">
          <p className="text-xs text-text-secondary">긍정률</p>
          <p className="text-2xl font-bold text-green-600">
            {Math.round(summary.positiveRate * 100)}%
          </p>
        </div>
        <div className="p-4 rounded-xl bg-admin-bg-card border border-border">
          <p className="text-xs text-text-secondary">평균 평점</p>
          <p className="text-2xl font-bold text-text-primary">
            {'★'.repeat(Math.round(summary.avgRating))} {summary.avgRating}
          </p>
        </div>
      </div>

      {/* Model Breakdown */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-text-primary">모델별 평점</h3>
        {summary.byModel.map((m) => (
          <div
            key={m.modelId}
            className="flex items-center gap-4 p-3 rounded-lg bg-admin-bg-card border border-border"
          >
            <span className="text-sm font-medium text-text-primary w-40">{m.modelName}</span>
            <div className="flex-1 h-2 bg-bg-hover rounded-full">
              <div
                className="h-full bg-admin-teal rounded-full"
                style={{ width: `${(m.avgRating / 5) * 100}%` }}
              />
            </div>
            <span className="text-sm font-bold text-text-primary w-10">{m.avgRating}</span>
            <span className="text-xs text-text-secondary w-16 text-right">{m.count}건</span>
          </div>
        ))}
      </div>

      {/* A/B Tests */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-text-primary">A/B 테스트</h3>
        {abTests.map((t) => (
          <div key={t.id} className="p-4 rounded-xl border border-border bg-admin-bg-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-text-primary">{t.name}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${t.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}
              >
                {t.status === 'completed' ? '완료' : '진행 중'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div
                className={`p-2 rounded-lg ${t.winner === 'A' ? 'bg-green-50 border border-green-200' : 'bg-admin-bg-section'}`}
              >
                <p className="text-text-secondary">A: {t.promptA}</p>
                <p className="font-bold text-text-primary mt-1">
                  {Math.round(t.positiveRateA * 100)}%
                </p>
              </div>
              <div
                className={`p-2 rounded-lg ${t.winner === 'B' ? 'bg-green-50 border border-green-200' : 'bg-admin-bg-section'}`}
              >
                <p className="text-text-secondary">B: {t.promptB}</p>
                <p className="font-bold text-text-primary mt-1">
                  {Math.round(t.positiveRateB * 100)}%
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tuning Suggestions */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-text-primary">프롬프트 튜닝 제안</h3>
        {suggestions.map((s) => (
          <div key={s.id} className="p-4 rounded-xl border border-admin-teal/20 bg-admin-teal/5">
            <p className="text-xs text-text-secondary">
              기존: <span className="line-through">{s.originalPrompt}</span>
            </p>
            <p className="text-sm text-admin-teal font-medium mt-1">제안: {s.suggestedPrompt}</p>
            <p className="text-xs text-text-secondary mt-2">{s.reason}</p>
            <p className="text-xs text-green-600 mt-1">
              예상 개선: +{s.expectedImprovement}% ({s.basedOnFeedbackCount}건 피드백 기반)
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
