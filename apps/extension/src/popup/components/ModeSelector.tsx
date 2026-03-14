import React from 'react'
import type { AnalysisMode } from '../../types/context'

interface ModeSelectorProps {
  disabled?: boolean
  onSelect: (mode: AnalysisMode) => void
}

interface ModeOption {
  mode: AnalysisMode
  label: string
  description: string
  icon: React.ReactNode
  color: string
}

const MODE_OPTIONS: ModeOption[] = [
  {
    mode: 'summarize',
    label: '요약',
    description: '페이지 내용을 간단히 요약합니다',
    color: 'text-blue-500',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
  },
  {
    mode: 'explain',
    label: '설명',
    description: '내용을 자세히 설명합니다',
    color: 'text-green-500',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  {
    mode: 'research',
    label: '조사',
    description: '주제에 대해 심층 조사합니다',
    color: 'text-orange-500',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    ),
  },
  {
    mode: 'translate',
    label: '번역',
    description: '다른 언어로 번역합니다',
    color: 'text-purple-500',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
        />
      </svg>
    ),
  },
]

export function ModeSelector({ disabled = false, onSelect }: ModeSelectorProps) {
  return (
    <div className="p-4">
      <h2 className="text-sm font-medium text-ext-text-secondary mb-3">분석 모드 선택</h2>
      <div className="grid grid-cols-2 gap-3">
        {MODE_OPTIONS.map((option) => (
          <button
            key={option.mode}
            type="button"
            onClick={() => onSelect(option.mode)}
            disabled={disabled}
            className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-ext-surface hover:border-ext-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-ext-surface"
            aria-label={`${option.label} 모드`}
          >
            <div className={option.color}>{option.icon}</div>
            <div className="text-center">
              <div className="text-sm font-medium text-ext-text">{option.label}</div>
              <div className="text-xs text-ext-text-secondary mt-1">{option.description}</div>
            </div>
          </button>
        ))}
      </div>
      {disabled && (
        <p className="text-xs text-ext-text-secondary text-center mt-3">
          페이지 컨텍스트를 먼저 추출해주세요
        </p>
      )}
    </div>
  )
}
