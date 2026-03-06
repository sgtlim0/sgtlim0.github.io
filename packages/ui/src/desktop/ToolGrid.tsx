'use client'

import { useCallback } from 'react'
import type { DesktopTool } from './types'

const CATEGORY_STYLES: Record<DesktopTool['category'], { bg: string; text: string }> = {
  image: { bg: 'bg-pink-500/15', text: 'text-pink-600 dark:text-pink-400' },
  code: { bg: 'bg-blue-500/15', text: 'text-blue-600 dark:text-blue-400' },
  text: { bg: 'bg-emerald-500/15', text: 'text-emerald-600 dark:text-emerald-400' },
  data: { bg: 'bg-amber-500/15', text: 'text-amber-600 dark:text-amber-400' },
  search: { bg: 'bg-purple-500/15', text: 'text-purple-600 dark:text-purple-400' },
}

export interface ToolGridProps {
  tools: DesktopTool[]
  onSelect?: (tool: DesktopTool) => void
}

export default function ToolGrid({ tools, onSelect }: ToolGridProps) {
  const handleSelect = useCallback(
    (tool: DesktopTool) => () => {
      if (tool.isAvailable) {
        onSelect?.(tool)
      }
    },
    [onSelect],
  )

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {tools.map((tool) => {
        const style = CATEGORY_STYLES[tool.category]
        return (
          <button
            key={tool.id}
            onClick={handleSelect(tool)}
            disabled={!tool.isAvailable}
            className={`flex flex-col items-start gap-3 p-4 rounded-xl border border-[var(--dt-border)] bg-[var(--dt-bg-card)] text-left transition-all duration-200 ${
              tool.isAvailable
                ? 'hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20 hover:scale-[1.02] cursor-pointer'
                : 'opacity-40 cursor-not-allowed'
            }`}
          >
            {/* Icon */}
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[var(--dt-primary-light)] text-[var(--dt-primary)] text-base font-bold">
              {tool.icon}
            </div>

            {/* Name + category */}
            <div className="flex items-center gap-2 w-full">
              <h4 className="text-sm font-semibold text-[var(--dt-text-primary)] truncate">
                {tool.name}
              </h4>
              <span
                className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0 ${style.bg} ${style.text}`}
              >
                {tool.category}
              </span>
            </div>

            {/* Description */}
            <p className="text-xs text-[var(--dt-text-secondary)] leading-relaxed line-clamp-2">
              {tool.description}
            </p>
          </button>
        )
      })}

      {/* Empty state */}
      {tools.length === 0 && (
        <div className="col-span-full flex items-center justify-center py-10 text-sm text-[var(--dt-text-muted)]">
          사용 가능한 도구가 없습니다
        </div>
      )}
    </div>
  )
}
