'use client'

import { useState, useRef } from 'react'
import type { MobileChatMessage } from './types'

export interface MobileChatViewProps {
  modelName: string
  messages: MobileChatMessage[]
  onSend: (text: string) => void
  isStreaming?: boolean
  onBack: () => void
}

export default function MobileChatView({
  modelName,
  messages,
  onSend,
  isStreaming = false,
  onBack,
}: MobileChatViewProps) {
  const [input, setInput] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    const trimmed = input.trim()
    if (!trimmed || isStreaming) return
    onSend(trimmed)
    setInput('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    const el = e.target
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`
  }

  return (
    <div className="flex flex-col h-full bg-[var(--bg-primary)]">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 bg-[var(--bg-primary)] border-b border-[var(--border)]">
        <button
          type="button"
          onClick={onBack}
          className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-colors"
          aria-label="뒤로가기"
        >
          ←
        </button>
        <span className="flex-1 text-sm font-medium text-[var(--text-primary)] truncate">
          {modelName}
        </span>
        <button
          type="button"
          className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-colors"
          aria-label="메뉴"
        >
          ⋮
        </button>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user'
          return (
            <div key={idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap break-words ${
                  isUser
                    ? 'bg-[var(--primary)] text-white rounded-br-md'
                    : 'bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border)] rounded-bl-md'
                }`}
              >
                {msg.content}
              </div>
            </div>
          )
        })}

        {/* Streaming indicator */}
        {isStreaming && (
          <div className="flex justify-start">
            <div className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl rounded-bl-md bg-[var(--bg-card)] border border-[var(--border)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-secondary)] animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-secondary)] animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-secondary)] animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="px-4 py-3 bg-[var(--bg-primary)] border-t border-[var(--border)]">
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="메시지를 입력하세요..."
            rows={1}
            className="flex-1 resize-none rounded-xl px-3 py-2 text-sm bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] border border-[var(--border)] outline-none focus:border-[var(--primary)] transition-colors"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            className="flex-shrink-0 w-10 h-10 rounded-full bg-[var(--primary)] text-white flex items-center justify-center disabled:opacity-40 transition-opacity"
            aria-label="전송"
          >
            ↑
          </button>
        </div>
      </div>
    </div>
  )
}
