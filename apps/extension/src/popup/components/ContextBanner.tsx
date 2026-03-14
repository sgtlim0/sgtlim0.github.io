import React from 'react'
import type { PageContext } from '../../types/context'

interface ContextBannerProps {
  context: PageContext
  onClear: () => void
}

export function ContextBanner({ context, onClear }: ContextBannerProps) {
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength) + '...'
  }

  return (
    <div className="mx-4 mt-4 p-3 rounded-lg bg-ext-surface border border-ext-surface">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {context.favicon && (
              <img src={context.favicon} alt="" className="w-4 h-4 flex-shrink-0" />
            )}
            <h3 className="text-sm font-medium text-ext-text truncate">{context.title}</h3>
          </div>
          <p className="text-xs text-ext-text-secondary truncate mb-2">{context.url}</p>
          <p className="text-xs text-ext-text line-clamp-2">{truncateText(context.text, 120)}</p>
          <div className="flex items-center gap-3 mt-2 text-[10px] text-ext-text-secondary">
            <span>{context.text.length.toLocaleString()}자</span>
            {context.sanitized && (
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                새니타이즈됨
              </span>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="flex-shrink-0 p-1 rounded hover:bg-ext-bg transition-colors"
          aria-label="컨텍스트 지우기"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}
