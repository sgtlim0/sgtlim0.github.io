'use client'

import { useCallback } from 'react'
import type { DesktopAgent } from './types'

const CATEGORY_STYLES: Record<DesktopAgent['category'], { bg: string; text: string }> = {
  general: { bg: 'bg-[var(--dt-text-muted)]/15', text: 'text-[var(--dt-text-secondary)]' },
  coding: { bg: 'bg-blue-500/15', text: 'text-blue-600 dark:text-blue-400' },
  writing: { bg: 'bg-purple-500/15', text: 'text-purple-600 dark:text-purple-400' },
  analysis: { bg: 'bg-amber-500/15', text: 'text-amber-600 dark:text-amber-400' },
  creative: { bg: 'bg-pink-500/15', text: 'text-pink-600 dark:text-pink-400' },
}

export interface AgentCardProps {
  agent: DesktopAgent
  onStart?: (id: string) => void
}

export default function AgentCard({ agent, onStart }: AgentCardProps) {
  const handleStart = useCallback(() => {
    onStart?.(agent.id)
  }, [agent.id, onStart])

  const categoryStyle = CATEGORY_STYLES[agent.category]

  return (
    <div
      className={`flex flex-col gap-3 p-5 rounded-xl border border-[var(--dt-border)] bg-[var(--dt-bg-card)] transition-all duration-200 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20 ${
        agent.isActive ? 'opacity-100' : 'opacity-50'
      }`}
    >
      {/* Header: icon + status */}
      <div className="flex items-start justify-between">
        <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-[var(--dt-primary-light)] text-[var(--dt-primary)] text-lg font-bold">
          {agent.icon}
        </div>
        <div
          className={`w-2.5 h-2.5 rounded-full ${
            agent.isActive ? 'bg-[var(--dt-accent)]' : 'bg-[var(--dt-text-muted)]'
          }`}
        />
      </div>

      {/* Name + category */}
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold text-[var(--dt-text-primary)] truncate">
          {agent.name}
        </h3>
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium shrink-0 ${categoryStyle.bg} ${categoryStyle.text}`}
        >
          {agent.category}
        </span>
      </div>

      {/* Description */}
      <p className="text-xs text-[var(--dt-text-secondary)] leading-relaxed line-clamp-2">
        {agent.description}
      </p>

      {/* Footer: model + start button */}
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-[var(--dt-border)]">
        <span className="text-[11px] text-[var(--dt-text-muted)] font-medium truncate mr-2">
          {agent.model}
        </span>
        {onStart && (
          <button
            onClick={handleStart}
            disabled={!agent.isActive}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--dt-primary)] text-white hover:bg-[var(--dt-primary-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            시작
          </button>
        )}
      </div>
    </div>
  )
}
