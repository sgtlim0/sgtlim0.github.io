import React, { useEffect } from 'react'
import { SkeletonText } from '@hchat/ui'
import type { AnalysisMode, PageContext } from '../../types/context'
import { useExtensionChat } from '../hooks'

interface AnalyzePageProps {
  mode: AnalysisMode
  context: PageContext
  onBack: () => void
}

const MODE_LABELS: Record<AnalysisMode, string> = {
  summarize: '요약',
  explain: '설명',
  research: '조사',
  translate: '번역',
}

export function AnalyzePage({ mode, context, onBack }: AnalyzePageProps) {
  const { result, isStreaming, error, startAnalysis, reset } = useExtensionChat({
    mode,
    context,
  })

  useEffect(() => {
    startAnalysis()
    return () => reset()
  }, [startAnalysis, reset])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result)
      // TODO: Show toast notification
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleNewAnalysis = () => {
    reset()
    onBack()
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-ext-surface">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="p-1 rounded hover:bg-ext-surface transition-colors"
            aria-label="뒤로가기"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h2 className="text-base font-semibold text-ext-text">분석 결과</h2>
        </div>
        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-ext-primary/10 text-ext-primary text-xs font-semibold">
          {MODE_LABELS[mode]}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {error ? (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
            <div className="flex items-start gap-2">
              <svg
                className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <h3 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-1">
                  오류 발생
                </h3>
                <p className="text-xs text-red-600 dark:text-red-400">{error.message}</p>
              </div>
            </div>
          </div>
        ) : isStreaming && !result ? (
          <div className="space-y-2">
            <SkeletonText lines={4} />
          </div>
        ) : (
          <div className="prose prose-sm max-w-none">
            <div className="text-sm text-ext-text whitespace-pre-wrap leading-relaxed">
              {result}
              {isStreaming && (
                <span className="inline-block w-2 h-4 ml-1 bg-ext-primary animate-pulse" />
              )}
            </div>
          </div>
        )}

        {/* Context Info */}
        {context && !error && (
          <div className="mt-4 pt-4 border-t border-ext-surface">
            <h3 className="text-xs font-medium text-ext-text-secondary mb-2">분석 대상</h3>
            <div className="text-xs text-ext-text-secondary space-y-1">
              <div className="flex items-center gap-2">
                {context.favicon && <img src={context.favicon} alt="" className="w-3 h-3" />}
                <span className="truncate">{context.title}</span>
              </div>
              <div className="truncate">{context.url}</div>
              <div className="text-[10px]">
                텍스트 길이: {context.text.length.toLocaleString()}자
                {context.sanitized && ' · 새니타이즈됨'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-t border-ext-surface">
        <button
          type="button"
          onClick={handleNewAnalysis}
          className="px-3 py-1.5 text-sm font-medium text-ext-text-secondary hover:text-ext-text border border-ext-surface rounded-md hover:bg-ext-surface transition-colors"
        >
          새 분석
        </button>
        <button
          type="button"
          onClick={handleCopy}
          disabled={!result || isStreaming}
          className="px-3 py-1.5 text-sm font-medium text-white bg-ext-primary rounded-md hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          복사
        </button>
      </div>
    </div>
  )
}
