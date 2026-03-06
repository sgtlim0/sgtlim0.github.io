'use client'

import { useState } from 'react'
import type { MobileAssistant } from './types'

export interface MobileAssistantListProps {
  assistants: readonly MobileAssistant[]
  onStart: (id: string) => void
  onToggleFavorite: (id: string) => void
}

const categories = [
  { key: 'all', label: '전체' },
  { key: 'general', label: '일반' },
  { key: 'coding', label: '코딩' },
  { key: 'writing', label: '글쓰기' },
  { key: 'translation', label: '번역' },
  { key: 'analysis', label: '분석' },
] as const

export default function MobileAssistantList({
  assistants,
  onStart,
  onToggleFavorite,
}: MobileAssistantListProps) {
  const [activeCategory, setActiveCategory] = useState('all')

  const filtered = assistants.filter(
    (a) => activeCategory === 'all' || a.category === activeCategory,
  )

  const sorted = [...filtered].sort((a, b) => {
    if (a.isFavorite && !b.isFavorite) return -1
    if (!a.isFavorite && b.isFavorite) return 1
    return 0
  })

  return (
    <div className="flex flex-col h-full">
      {/* Category filter chips */}
      <div className="px-4 py-3 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {categories.map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => setActiveCategory(cat.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat.key
                  ? 'bg-[var(--primary)] text-white'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border)]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Assistant cards */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="flex flex-col gap-3">
          {sorted.map((assistant) => (
            <div
              key={assistant.id}
              className="flex items-start gap-3 p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border)]"
            >
              {/* Icon */}
              <span className="flex-shrink-0 w-10 h-10 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center text-lg">
                {assistant.icon}
              </span>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-[var(--text-primary)] truncate">
                    {assistant.name}
                  </span>
                  <span className="flex-shrink-0 px-1.5 py-0.5 rounded text-[10px] bg-[var(--bg-secondary)] text-[var(--text-secondary)]">
                    {assistant.category}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-[var(--text-secondary)] line-clamp-2">
                  {assistant.description}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => onStart(assistant.id)}
                    className="px-3 py-1 rounded-lg bg-[var(--primary)] text-white text-xs font-medium"
                  >
                    대화 시작
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggleFavorite(assistant.id)}
                    className={`px-2 py-1 rounded-lg text-xs font-medium border transition-colors ${
                      assistant.isFavorite
                        ? 'border-[var(--primary)] text-[var(--primary)]'
                        : 'border-[var(--border)] text-[var(--text-secondary)]'
                    }`}
                  >
                    {assistant.isFavorite ? '★' : '☆'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
