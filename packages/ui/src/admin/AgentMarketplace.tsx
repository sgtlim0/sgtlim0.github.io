'use client'

import { useState } from 'react'
import { useMarketplaceAgents, useMarketplaceStats } from './services/marketplaceHooks'
import type { MarketplaceFilters, MarketplaceAgent } from './services/marketplaceTypes'

const CATEGORIES = [
  { value: '', label: '전체' },
  { value: 'research', label: '리서치' },
  { value: 'coding', label: '코딩' },
  { value: 'writing', label: '글쓰기' },
  { value: 'data', label: '데이터' },
  { value: 'automation', label: '자동화' },
  { value: 'custom', label: '커스텀' },
] as const

const PRICING_OPTIONS = [
  { value: '', label: '전체' },
  { value: 'free', label: '무료' },
  { value: 'freemium', label: '프리미엄' },
  { value: 'paid', label: '유료' },
] as const

function AgentCard({ agent }: { readonly agent: MarketplaceAgent }) {
  const statusColors: Record<string, string> = {
    published: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    deprecated: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    reviewing: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  }

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow bg-white dark:bg-gray-800">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">{agent.name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{agent.provider} · v{agent.version}</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[agent.status] ?? ''}`}>
          {agent.status}
        </span>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">{agent.description}</p>

      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
        <span>{'★'.repeat(Math.round(agent.rating))} {agent.rating}</span>
        <span>{agent.downloads.toLocaleString()} 다운로드</span>
        <span className="ml-auto font-medium text-gray-900 dark:text-white">
          {agent.pricing === 'free' ? '무료' : agent.pricing === 'freemium' ? `$${agent.monthlyPrice}/월` : `$${agent.monthlyPrice}/월`}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5 mt-3">
        {agent.tags.map((tag) => (
          <span key={tag} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-xs rounded text-gray-600 dark:text-gray-300">
            {tag}
          </span>
        ))}
      </div>
    </div>
  )
}

function StatsBar({ stats }: { readonly stats: { totalAgents: number; publishedAgents: number; totalDownloads: number; averageRating: number } }) {
  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      {[
        { label: '전체 에이전트', value: stats.totalAgents },
        { label: '게시됨', value: stats.publishedAgents },
        { label: '총 다운로드', value: stats.totalDownloads.toLocaleString() },
        { label: '평균 평점', value: `★ ${stats.averageRating}` },
      ].map(({ label, value }) => (
        <div key={label} className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4 text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        </div>
      ))}
    </div>
  )
}

export function AgentMarketplace() {
  const [filters, setFilters] = useState<MarketplaceFilters>({ sortBy: 'downloads' })
  const { agents, loading, error } = useMarketplaceAgents(filters)
  const { stats } = useMarketplaceStats()

  const updateFilter = <K extends keyof MarketplaceFilters>(key: K, value: MarketplaceFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value || undefined }))
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">에이전트 마켓플레이스</h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
          + 에이전트 등록
        </button>
      </div>

      {stats && <StatsBar stats={stats} />}

      <div className="flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="에이전트 검색..."
          className="px-3 py-2 border rounded-lg text-sm w-64 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          onChange={(e) => updateFilter('search', e.target.value)}
        />

        <select
          className="px-3 py-2 border rounded-lg text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          onChange={(e) => updateFilter('category', e.target.value as MarketplaceFilters['category'])}
          aria-label="카테고리 필터"
        >
          {CATEGORIES.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>

        <select
          className="px-3 py-2 border rounded-lg text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          onChange={(e) => updateFilter('pricing', e.target.value as MarketplaceFilters['pricing'])}
          aria-label="가격 필터"
        >
          {PRICING_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>

        <select
          className="px-3 py-2 border rounded-lg text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          value={filters.sortBy ?? 'downloads'}
          onChange={(e) => updateFilter('sortBy', e.target.value as MarketplaceFilters['sortBy'])}
          aria-label="정렬"
        >
          <option value="downloads">다운로드순</option>
          <option value="rating">평점순</option>
          <option value="newest">최신순</option>
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-lg border p-5 space-y-3">
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
          {agents.length === 0 && (
            <p className="col-span-full text-center text-gray-500 dark:text-gray-400 py-12">
              검색 결과가 없습니다
            </p>
          )}
        </div>
      )}
    </div>
  )
}
