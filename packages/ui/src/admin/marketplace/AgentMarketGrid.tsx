'use client'

import { useState, useMemo } from 'react'
import type { MarketplaceAgent, AgentCategory, AgentSortBy } from './marketplaceTypes'
import { AGENT_CATEGORIES } from './marketplaceTypes'
import AgentMarketCard from './AgentMarketCard'

export interface AgentMarketGridProps {
  agents: MarketplaceAgent[]
  installedIds: string[]
  onInstall: (id: string) => void
  onDetail: (id: string) => void
}

const SORT_OPTIONS: { value: AgentSortBy; label: string }[] = [
  { value: 'popular', label: '인기순' },
  { value: 'rating', label: '평점순' },
  { value: 'newest', label: '최신순' },
  { value: 'name', label: '이름순' },
]

export default function AgentMarketGrid({
  agents,
  installedIds,
  onInstall,
  onDetail,
}: AgentMarketGridProps) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<AgentCategory | 'all'>('all')
  const [sortBy, setSortBy] = useState<AgentSortBy>('popular')

  const filtered = useMemo(() => {
    let result = [...agents]

    if (category !== 'all') {
      result = result.filter((a) => a.category === category)
    }

    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.tags.some((t) => t.toLowerCase().includes(q)),
      )
    }

    switch (sortBy) {
      case 'rating':
        result.sort((a, b) => b.rating - a.rating)
        break
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name))
        break
      default:
        result.sort((a, b) => b.installs - a.installs)
    }

    return result
  }, [agents, category, search, sortBy])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-text-primary">AI 에이전트 마켓플레이스</h2>
          <p className="text-sm text-text-secondary mt-1">
            {agents.length}개 에이전트 | {installedIds.length}개 설치됨
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="에이전트 검색..."
          aria-label="에이전트 검색"
          className="px-3 py-2 text-sm rounded-lg border border-border bg-admin-bg-card text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-admin-teal min-w-[200px]"
        />

        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setCategory('all')}
            className={[
              'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors',
              category === 'all'
                ? 'bg-admin-teal text-white'
                : 'bg-admin-bg-section text-text-secondary hover:text-text-primary',
            ].join(' ')}
          >
            전체
          </button>
          {(
            Object.entries(AGENT_CATEGORIES) as [AgentCategory, { label: string; icon: string }][]
          ).map(([key, val]) => (
            <button
              key={key}
              onClick={() => setCategory(key)}
              className={[
                'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors',
                category === key
                  ? 'bg-admin-teal text-white'
                  : 'bg-admin-bg-section text-text-secondary hover:text-text-primary',
              ].join(' ')}
            >
              {val.icon} {val.label}
            </button>
          ))}
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as AgentSortBy)}
          aria-label="정렬"
          className="px-3 py-2 text-xs rounded-lg border border-border bg-admin-bg-card text-text-primary"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((agent) => (
          <AgentMarketCard
            key={agent.id}
            agent={agent}
            installed={installedIds.includes(agent.id)}
            onInstall={onInstall}
            onDetail={onDetail}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-16 text-center text-text-secondary text-sm">검색 결과가 없습니다.</div>
      )}
    </div>
  )
}
