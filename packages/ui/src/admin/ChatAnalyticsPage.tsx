'use client'

import { useState, useEffect } from 'react'
import type {
  ChatStats,
  TopicCluster,
  UserBehavior,
  HourlyDistribution,
} from './services/chatAnalyticsTypes'
import {
  getChatStats,
  getTopicClusters,
  getUserBehaviors,
  getHourlyDistribution,
  getConversationQuality,
} from './services/chatAnalyticsService'

export default function ChatAnalyticsPage() {
  const [stats, setStats] = useState<ChatStats | null>(null)
  const [clusters, setClusters] = useState<TopicCluster[]>([])
  const [behaviors, setBehaviors] = useState<UserBehavior[]>([])
  const [hourly, setHourly] = useState<HourlyDistribution[]>([])
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getChatStats(period),
      getTopicClusters(),
      getUserBehaviors(),
      getHourlyDistribution(),
    ]).then(([s, c, b, h]) => {
      setStats(s)
      setClusters(c)
      setBehaviors(b)
      setHourly(h)
      setLoading(false)
    })
  }, [period])

  if (loading || !stats)
    return <div className="p-8 text-center text-text-secondary">채팅 분석 로딩 중...</div>

  const maxHourly = Math.max(...hourly.map((h) => h.count))
  const TREND_ICONS: Record<string, string> = { up: '▲', down: '▼', stable: '—' }
  const TREND_COLORS: Record<string, string> = {
    up: 'text-green-600',
    down: 'text-red-600',
    stable: 'text-gray-500',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-text-primary">채팅 히스토리 분석</h2>
          <p className="text-sm text-text-secondary mt-1">
            대화 패턴, 주제 클러스터링, 사용자 행동
          </p>
        </div>
        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-xs rounded-lg ${period === p ? 'bg-admin-teal text-white' : 'bg-admin-bg-section text-text-secondary'}`}
            >
              {p === '7d' ? '7일' : p === '30d' ? '30일' : '90일'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats KPI */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: '총 대화', value: stats.totalConversations.toLocaleString() },
          { label: '총 메시지', value: stats.totalMessages.toLocaleString() },
          { label: '평균 응답 시간', value: `${stats.avgResponseTime}초` },
          { label: '피크 시간', value: `${stats.peakHour}시` },
        ].map((kpi) => (
          <div key={kpi.label} className="p-4 rounded-xl bg-admin-bg-card border border-border">
            <p className="text-xs text-text-secondary">{kpi.label}</p>
            <p className="text-2xl font-bold text-text-primary mt-1">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Topic Clusters */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-text-primary">주제 클러스터</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {clusters.map((c) => (
            <div key={c.id} className="p-3 rounded-xl border border-border bg-admin-bg-card">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-text-primary">{c.name}</span>
                <span className={`text-xs ${TREND_COLORS[c.trend]}`}>{TREND_ICONS[c.trend]}</span>
              </div>
              <p className="text-2xl font-bold text-admin-teal mt-1">{c.percentage}%</p>
              <div className="flex gap-1 mt-2 flex-wrap">
                {c.keywords.map((k) => (
                  <span
                    key={k}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-admin-bg-section text-text-secondary"
                  >
                    {k}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hourly Distribution */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-text-primary">시간대별 분포</h3>
        <div className="flex items-end gap-0.5 h-32 px-2">
          {hourly.map((h) => (
            <div key={h.hour} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full bg-admin-teal/80 rounded-t transition-all"
                style={{ height: `${(h.count / maxHourly) * 100}%` }}
                title={`${h.hour}시: ${h.count}건`}
              />
              <span className="text-[8px] text-text-tertiary">{h.hour}</span>
            </div>
          ))}
        </div>
      </div>

      {/* User Behaviors */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-text-primary">기능별 사용 패턴</h3>
        {behaviors.map((b) => (
          <div
            key={b.feature}
            className="flex items-center gap-4 p-3 rounded-lg border border-border bg-admin-bg-card"
          >
            <span className="text-sm font-medium text-text-primary w-24">{b.feature}</span>
            <div className="flex-1 h-2 bg-bg-hover rounded-full">
              <div
                className="h-full bg-admin-teal rounded-full"
                style={{ width: `${(b.usageCount / behaviors[0].usageCount) * 100}%` }}
              />
            </div>
            <span className="text-xs text-text-secondary w-16 text-right">
              {b.usageCount.toLocaleString()}
            </span>
            <span className="text-xs text-text-secondary w-12">
              만족 {Math.round(b.satisfactionRate * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
