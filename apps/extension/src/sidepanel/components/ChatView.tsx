import React, { useState, useRef, useEffect } from 'react'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

interface ChatViewProps {
  conversationId: string | null
  messages: Message[]
  isStreaming: boolean
  streamingContent: string
  onSendMessage: (content: string) => void
  onCopy?: (content: string) => void
}

export function ChatView({
  conversationId,
  messages,
  isStreaming,
  streamingContent,
  onSendMessage,
  onCopy,
}: ChatViewProps) {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isStreaming) return
    onSendMessage(input.trim())
    setInput('')
  }

  if (!conversationId) {
    return (
      <div className="flex items-center justify-center h-full bg-ext-bg">
        <div className="text-center text-ext-text-secondary">
          <div className="text-4xl mb-4">💬</div>
          <p className="text-sm">대화를 선택하거나 새 대화를 시작하세요.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-ext-bg">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !isStreaming ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-ext-text-secondary">
              <p className="text-sm">대화를 시작해보세요!</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} onCopy={onCopy} />
            ))}
            {isStreaming && streamingContent && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-ext-primary flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                  AI
                </div>
                <div className="flex-1 min-w-0">
                  <div className="inline-block px-4 py-3 rounded-lg bg-ext-surface text-ext-text text-sm">
                    {streamingContent}
                    <span className="inline-block w-2 h-4 ml-1 bg-ext-primary animate-pulse" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex-shrink-0 p-4 border-t border-ext-surface">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isStreaming}
            placeholder={isStreaming ? '답변 생성 중...' : '메시지를 입력하세요...'}
            className="flex-1 px-4 py-2 bg-ext-surface border border-ext-surface rounded-md text-ext-text placeholder:text-ext-text-secondary focus:outline-none focus:ring-2 focus:ring-ext-primary disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            className="px-4 py-2 bg-ext-primary text-white rounded-md hover:opacity-90 disabled:opacity-50 transition-opacity"
            aria-label="전송"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>
      </form>
    </div>
  )
}

interface MessageBubbleProps {
  message: Message
  onCopy?: (content: string) => void
}

function MessageBubble({ message, onCopy }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0 ${
          isUser ? 'bg-gray-500' : 'bg-ext-primary'
        }`}
      >
        {isUser ? 'U' : 'AI'}
      </div>
      <div className="flex-1 min-w-0 group">
        <div
          className={`inline-block max-w-full px-4 py-3 rounded-lg text-sm ${
            isUser ? 'bg-ext-primary/20 text-ext-text' : 'bg-ext-surface text-ext-text'
          }`}
        >
          <div className="whitespace-pre-wrap break-words">{message.content}</div>
        </div>
        {!isUser && onCopy && (
          <button
            type="button"
            onClick={() => onCopy(message.content)}
            className="mt-1 px-2 py-1 text-xs text-ext-text-secondary hover:text-ext-text opacity-0 group-hover:opacity-100 transition-opacity"
          >
            복사
          </button>
        )}
      </div>
    </div>
  )
}
