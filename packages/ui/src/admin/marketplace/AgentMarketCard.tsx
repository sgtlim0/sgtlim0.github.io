'use client'

import type { MarketplaceAgent } from './marketplaceTypes'
import { AGENT_CATEGORIES } from './marketplaceTypes'

export interface AgentMarketCardProps {
  agent: MarketplaceAgent
  installed?: boolean
  onInstall: (id: string) => void
  onDetail: (id: string) => void
}

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating)
  const hasHalf = rating - full >= 0.5
  return (
    <span className="flex items-center gap-0.5 text-yellow-500" aria-label={`평점 ${rating}`}>
      {'★'.repeat(full)}
      {hasHalf && '½'}
      <span className="text-xs text-text-secondary ml-1">{rating.toFixed(1)}</span>
    </span>
  )
}

export default function AgentMarketCard({
  agent,
  installed = false,
  onInstall,
  onDetail,
}: AgentMarketCardProps) {
  const category = AGENT_CATEGORIES[agent.category]

  return (
    <div className="flex flex-col gap-3 p-5 rounded-xl border border-border bg-admin-bg-card hover:shadow-md hover:border-admin-teal/30 transition-all">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
          style={{ backgroundColor: agent.iconColor + '20' }}
        >
          {agent.icon}
        </div>
        <div className="flex-1 min-w-0">
          <button
            onClick={() => onDetail(agent.id)}
            className="text-sm font-bold text-text-primary hover:text-admin-teal truncate block text-left"
          >
            {agent.name}
          </button>
          <span className="text-xs text-text-secondary">{agent.author}</span>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">
        {agent.description}
      </p>

      {/* Tags */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-admin-bg-section text-text-secondary">
          {category.icon} {category.label}
        </span>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-admin-bg-section text-text-secondary">
          {agent.model}
        </span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-border-light">
        <div className="flex items-center gap-3">
          <StarRating rating={agent.rating} />
          <span className="text-[10px] text-text-tertiary">
            {agent.installs.toLocaleString()} 설치
          </span>
        </div>
        <button
          onClick={() => onInstall(agent.id)}
          disabled={installed}
          className={[
            'px-3 py-1 rounded-lg text-xs font-medium transition-colors',
            installed
              ? 'bg-admin-bg-section text-text-tertiary cursor-default'
              : 'bg-admin-teal text-white hover:opacity-90',
          ].join(' ')}
        >
          {installed ? '설치됨' : '설치'}
        </button>
      </div>
    </div>
  )
}
