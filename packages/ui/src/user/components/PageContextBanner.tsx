'use client'

import React from 'react'
import { X, ExternalLink, FileText } from 'lucide-react'
import type { ExtensionPageContext } from '../hooks/useExtensionContext'

export interface PageContextBannerProps {
  context: ExtensionPageContext
  onDismiss: () => void
  onUseContext: (text: string) => void
}

export default function PageContextBanner({
  context,
  onDismiss,
  onUseContext,
}: PageContextBannerProps) {
  const truncatedText =
    context.text.length > 120 ? `${context.text.slice(0, 120)}...` : context.text
  const truncatedUrl =
    context.url.length > 60 ? `${context.url.slice(0, 60)}...` : context.url

  return (
    <div className="shrink-0 mx-4 md:mx-6 mt-3 p-3 rounded-lg border border-[var(--user-primary)]/20 bg-[var(--user-primary)]/5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 min-w-0 flex-1">
          <FileText className="w-4 h-4 mt-0.5 text-[var(--user-primary)] shrink-0" />
          <div className="min-w-0">
            {context.title && (
              <p className="text-xs font-medium text-[var(--user-text-primary)] truncate">
                {context.title}
              </p>
            )}
            {context.url && (
              <p className="text-xs text-[var(--user-text-muted)] truncate flex items-center gap-1">
                <ExternalLink className="w-3 h-3 shrink-0" />
                {truncatedUrl}
              </p>
            )}
            <p className="text-xs text-[var(--user-text-secondary)] mt-1 line-clamp-2">
              {truncatedText}
            </p>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="p-1 rounded text-[var(--user-text-muted)] hover:text-[var(--user-text-primary)] hover:bg-[var(--user-bg-section)] transition-colors shrink-0"
          aria-label="컨텍스트 닫기"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="mt-2 flex gap-2">
        <button
          onClick={() => onUseContext(context.text)}
          className="text-xs px-3 py-1.5 rounded-md bg-[var(--user-primary)] text-white hover:opacity-90 transition-opacity font-medium"
        >
          이 텍스트로 대화 시작
        </button>
      </div>
    </div>
  )
}
