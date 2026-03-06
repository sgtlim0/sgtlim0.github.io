'use client'

import { useState, useCallback } from 'react'
import DesktopLayout from './DesktopLayout'

interface ChatMessage {
  readonly id: string
  readonly role: 'user' | 'assistant'
  readonly content: string
  readonly timestamp: string
}

const MOCK_MESSAGES: readonly ChatMessage[] = [
  {
    id: '1',
    role: 'user',
    content: '현대자동차 2024년 매출 실적을 요약해줘.',
    timestamp: '오전 10:23',
  },
  {
    id: '2',
    role: 'assistant',
    content:
      '현대자동차의 2024년 연간 매출은 약 162.7조 원으로, 전년 대비 7.3% 증가했습니다. 주요 성장 동력은 전기차 라인업 확대와 북미 시장에서의 판매 호조입니다. 영업이익률은 9.1%를 기록했습니다.',
    timestamp: '오전 10:23',
  },
  {
    id: '3',
    role: 'user',
    content: '전기차 판매량은 어떻게 돼?',
    timestamp: '오전 10:24',
  },
  {
    id: '4',
    role: 'assistant',
    content:
      '2024년 현대자동차 전기차 판매량은 약 38만 대로, 전년 대비 24% 증가했습니다. 아이오닉 5, 아이오닉 6가 핵심 모델이며, 2025년 출시 예정인 아이오닉 7까지 포함하면 전기차 포트폴리오가 더욱 확대될 전망입니다.',
    timestamp: '오전 10:24',
  },
] as const

export default function DesktopChatPage() {
  const [inputValue, setInputValue] = useState('')

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value)
  }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      setInputValue('')
    }
  }, [])

  return (
    <DesktopLayout activeItem="chat">
      <header className="flex h-14 items-center border-b border-dt-border px-6">
        <h1 className="text-base font-semibold text-dt-text">새 대화</h1>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="mx-auto max-w-3xl space-y-4">
          {MOCK_MESSAGES.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user' ? 'bg-dt-accent text-white' : 'bg-dt-sidebar text-dt-text'
                }`}
              >
                <p className="text-sm leading-relaxed">{msg.content}</p>
                <span
                  className={`mt-1 block text-right text-xs ${
                    msg.role === 'user' ? 'text-white/70' : 'text-dt-text-secondary'
                  }`}
                >
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-dt-border px-6 py-4">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-end gap-3 rounded-2xl border border-dt-border bg-dt-sidebar px-4 py-3">
            <textarea
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="메시지를 입력하세요..."
              rows={1}
              className="flex-1 resize-none bg-transparent text-sm text-dt-text placeholder:text-dt-text-secondary focus:outline-none"
            />
            <button
              type="button"
              disabled={!inputValue.trim()}
              className="rounded-lg bg-dt-accent px-4 py-2 text-sm font-medium text-white transition-opacity disabled:opacity-40"
            >
              전송
            </button>
          </div>
        </div>
      </div>
    </DesktopLayout>
  )
}
