'use client'

import type { MobileChat } from './types'

export interface MobileChatListProps {
  chats: MobileChat[]
  onSelect: (id: string) => void
  onDelete: (id: string) => void
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

  if (diffHours < 1) return '방금 전'
  if (diffHours < 24) return `${diffHours}시간 전`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays}일 전`
  return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
}

export default function MobileChatList({ chats, onSelect, onDelete }: MobileChatListProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Search bar */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)]">
          <span className="text-[var(--text-secondary)] text-sm">Q</span>
          <input
            type="text"
            placeholder="대화 검색..."
            className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] outline-none"
            readOnly
          />
        </div>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto">
        {chats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-[var(--text-secondary)]">
            <span className="text-4xl">💬</span>
            <p className="text-sm">대화를 시작해보세요</p>
          </div>
        ) : (
          <ul className="divide-y divide-[var(--border)]">
            {chats.map((chat) => (
              <li key={chat.id} className="flex items-center gap-3 px-4 py-3">
                <button
                  type="button"
                  onClick={() => onSelect(chat.id)}
                  className="flex-1 flex items-center gap-3 text-left min-w-0"
                >
                  {/* Model icon */}
                  <span className="flex-shrink-0 w-10 h-10 rounded-full bg-[var(--primary)] text-white flex items-center justify-center text-sm font-semibold">
                    {chat.model.charAt(0).toUpperCase()}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-[var(--text-primary)] truncate">
                        {chat.title}
                      </span>
                      <span className="flex-shrink-0 text-xs text-[var(--text-secondary)]">
                        {formatTime(chat.timestamp)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-[var(--text-secondary)] truncate">
                        {chat.lastMessage}
                      </span>
                      {chat.unread && (
                        <span className="flex-shrink-0 w-2 h-2 rounded-full bg-[var(--primary)]" />
                      )}
                    </div>
                  </div>
                </button>
                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => onDelete(chat.id)}
                  className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--danger)] hover:bg-[var(--bg-secondary)] transition-colors"
                  aria-label={`${chat.title} 삭제`}
                >
                  <span className="text-sm font-bold">✕</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
