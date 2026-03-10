'use client'

import { useState } from 'react'
import StatCard from './StatCard'
import RateLimitCard from './RateLimitCard'
import type { RateLimitEndpoint } from './RateLimitCard'

/** 429 error history entry */
export interface RateLimitIncident {
  time: string
  endpoint: string
  ip: string
  retryAfterMs: number
}

export interface RateLimitDashboardProps {
  /** Override default mock endpoints */
  endpoints?: RateLimitEndpoint[]
  /** Override default mock incidents */
  incidents?: RateLimitIncident[]
  /** Loading state */
  loading?: boolean
  /** Error message */
  error?: string
}

const now = Date.now()

const DEFAULT_ENDPOINTS: RateLimitEndpoint[] = [
  {
    name: 'login',
    label: 'Login',
    limit: 5,
    current: 3,
    windowMs: 60_000,
    resetAt: now + 42_000,
  },
  {
    name: 'chat',
    label: 'Chat',
    limit: 30,
    current: 22,
    windowMs: 60_000,
    resetAt: now + 28_000,
  },
  {
    name: 'stream',
    label: 'Stream',
    limit: 20,
    current: 20,
    windowMs: 60_000,
    resetAt: now + 15_000,
  },
  {
    name: 'research',
    label: 'Research',
    limit: 10,
    current: 7,
    windowMs: 60_000,
    resetAt: now + 35_000,
  },
]

const DEFAULT_INCIDENTS: RateLimitIncident[] = [
  {
    time: '2026-03-10 14:32:15',
    endpoint: 'stream',
    ip: '10.0.1.42',
    retryAfterMs: 15_000,
  },
  {
    time: '2026-03-10 14:30:02',
    endpoint: 'login',
    ip: '192.168.1.100',
    retryAfterMs: 45_000,
  },
  {
    time: '2026-03-10 13:55:48',
    endpoint: 'chat',
    ip: '10.0.2.88',
    retryAfterMs: 22_000,
  },
  {
    time: '2026-03-10 12:10:33',
    endpoint: 'research',
    ip: '10.0.3.15',
    retryAfterMs: 30_000,
  },
  {
    time: '2026-03-10 11:42:10',
    endpoint: 'stream',
    ip: '10.0.1.42',
    retryAfterMs: 18_000,
  },
]

function computeSummary(endpoints: RateLimitEndpoint[]) {
  const totalRequests = endpoints.reduce((sum, ep) => sum + ep.current, 0)
  const totalCapacity = endpoints.reduce((sum, ep) => sum + ep.limit, 0)
  const overLimitCount = endpoints.filter((ep) => ep.current >= ep.limit).length
  const avgUsage = totalCapacity > 0 ? Math.round((totalRequests / totalCapacity) * 100) : 0

  return { totalRequests, totalCapacity, overLimitCount, avgUsage }
}

export default function RateLimitDashboard({
  endpoints: endpointsProp,
  incidents: incidentsProp,
  loading = false,
  error,
}: RateLimitDashboardProps) {
  const endpoints = endpointsProp ?? DEFAULT_ENDPOINTS
  const incidents = incidentsProp ?? DEFAULT_INCIDENTS
  const [filter, setFilter] = useState<string>('all')
  const summary = computeSummary(endpoints)

  const filteredIncidents =
    filter === 'all' ? incidents : incidents.filter((inc) => inc.endpoint === filter)

  if (error) {
    return (
      <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
        <div className="p-8 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/20 text-center">
          <p className="text-[#EF4444] font-medium" data-testid="rate-limit-error">{error}</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
        <div className="animate-pulse flex flex-col gap-4" data-testid="rate-limit-loading">
          <div className="h-8 w-48 bg-bg-hover rounded" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-bg-hover rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Rate Limit 모니터링</h1>
        <p className="text-sm text-text-secondary mt-1">
          엔드포인트별 요청 제한 현황 및 429 에러 이력
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="총 요청 수"
          value={`${summary.totalRequests}건`}
          trend={`/ ${summary.totalCapacity} 용량`}
          trendUp
        />
        <StatCard
          label="평균 사용률"
          value={`${summary.avgUsage}%`}
          trend={summary.avgUsage >= 70 ? '주의' : '정상'}
          trendUp={summary.avgUsage < 70}
        />
        <StatCard
          label="제한 초과"
          value={`${summary.overLimitCount}개`}
          trend={`/ ${endpoints.length}개 엔드포인트`}
          trendUp={summary.overLimitCount === 0}
        />
        <StatCard
          label="429 에러 (최근)"
          value={`${incidents.length}건`}
        />
      </div>

      {/* Endpoint Usage Bar Chart */}
      <div className="rounded-xl bg-admin-bg-card border border-admin-border overflow-hidden">
        <div className="px-5 py-4 border-b border-admin-border">
          <h3 className="text-base font-bold text-text-primary">엔드포인트별 사용량</h3>
        </div>
        <div className="p-5 flex flex-col gap-3">
          {endpoints.map((ep) => {
            const pct = ep.limit > 0 ? Math.min(100, Math.round((ep.current / ep.limit) * 100)) : 0
            const barColor =
              pct >= 100 ? 'bg-[#EF4444]' : pct >= 70 ? 'bg-[#F59E0B]' : 'bg-[#10B981]'
            return (
              <div key={ep.name} className="flex items-center gap-4 py-1" data-testid={`usage-bar-${ep.name}`}>
                <span className="text-sm text-text-primary w-24 shrink-0 font-medium">
                  {ep.label}
                </span>
                <div className="flex-1 h-5 bg-bg-hover rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${barColor} transition-all duration-500`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-sm text-text-secondary w-20 text-right tabular-nums">
                  {ep.current}/{ep.limit}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Endpoint Cards */}
      <div>
        <h3 className="text-base font-bold text-text-primary mb-4">활성 제한 현황</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {endpoints.map((ep) => (
            <RateLimitCard key={ep.name} endpoint={ep} />
          ))}
        </div>
      </div>

      {/* 429 Error History */}
      <div className="rounded-xl bg-admin-bg-card border border-admin-border overflow-hidden">
        <div className="px-5 py-4 border-b border-admin-border flex items-center justify-between">
          <h3 className="text-base font-bold text-text-primary">429 에러 이력</h3>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="text-sm border border-admin-border rounded-lg px-3 py-1.5 bg-admin-bg-section text-text-primary"
            aria-label="엔드포인트 필터"
          >
            <option value="all">전체</option>
            {endpoints.map((ep) => (
              <option key={ep.name} value={ep.name}>
                {ep.label}
              </option>
            ))}
          </select>
        </div>
        <div className="divide-y divide-admin-border">
          {filteredIncidents.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-text-secondary">
              에러 이력이 없습니다.
            </div>
          ) : (
            filteredIncidents.map((inc, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3">
                <span className="w-2 h-2 rounded-full shrink-0 bg-[#EF4444]" />
                <span className="text-xs text-text-secondary tabular-nums w-40 shrink-0">
                  {inc.time}
                </span>
                <span className="text-sm font-medium text-text-primary w-24 shrink-0">
                  {inc.endpoint}
                </span>
                <span className="text-sm text-text-secondary w-32 shrink-0 tabular-nums">
                  {inc.ip}
                </span>
                <span className="text-sm text-[#EF4444] flex-1 tabular-nums">
                  Retry: {Math.ceil(inc.retryAfterMs / 1000)}초
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
