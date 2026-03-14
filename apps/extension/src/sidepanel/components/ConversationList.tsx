import React from 'react'

export interface Conversation {
  id: string
  title: string
  timestamp: number
  preview: string
  mode: 'summarize' | 'explain' | 'research' | 'translate'
}

interface ConversationListProps {
  conversations: Conversation[]
  activeId: string | null
  onSelect: (id: string) => void
  onDelete: (id: string) => void
  onNew: () => void
}

function formatTimestamp(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(hours / 24)

  if (hours < 1) return '방금 전'
  if (hours < 24) return `${hours}시간 전`
  if (days < 7) return `${days}일 전`
  return new Date(timestamp).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
}

function getModeEmoji(mode: Conversation['mode']): string {
  const modeEmojis = {
    summarize: '📝',
    explain: '💡',
    research: '🔍',
    translate: '🌐',
  }
  return modeEmojis[mode]
}

export function ConversationList({
  conversations,
  activeId,
  onSelect,
  onDelete,
  onNew,
}: ConversationListProps) {
  return (
    <div className="flex flex-col h-full bg-ext-surface/30 border-r border-ext-surface">
      <div className="flex-shrink-0 p-4 border-b border-ext-surface">
        <button
          type="button"
          onClick={onNew}
          className="w-full px-4 py-2 text-sm font-medium text-white bg-ext-primary rounded-md hover:opacity-90 transition-opacity"
        >
          + 새 대화
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-6 text-center text-ext-text-secondary text-sm">
            대화 기록이 없습니다.
            <br />새 대화를 시작해보세요.
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {conversations.map((conv) => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                isActive={conv.id === activeId}
                onSelect={() => onSelect(conv.id)}
                onDelete={() => onDelete(conv.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

interface ConversationItemProps {
  conversation: Conversation
  isActive: boolean
  onSelect: () => void
  onDelete: () => void
}

function ConversationItem({ conversation, isActive, onSelect, onDelete }: ConversationItemProps) {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('이 대화를 삭제하시겠습니까?')) {
      onDelete()
    }
  }

  return (
    <div
      onClick={onSelect}
      className={`
        group relative p-3 rounded-md cursor-pointer transition-colors
        ${isActive ? 'bg-ext-primary/10 border border-ext-primary/30' : 'hover:bg-ext-surface/50'}
      `}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-lg flex-shrink-0">{getModeEmoji(conversation.mode)}</span>
          <h3 className="text-sm font-medium text-ext-text truncate">{conversation.title}</h3>
        </div>
        <button
          type="button"
          onClick={handleDelete}
          className="flex-shrink-0 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-500/10 transition-opacity"
          aria-label="대화 삭제"
        >
          <svg
            className="w-3.5 h-3.5 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
      <p className="text-xs text-ext-text-secondary line-clamp-2 mb-1">{conversation.preview}</p>
      <span className="text-xs text-ext-text-secondary">
        {formatTimestamp(conversation.timestamp)}
      </span>
    </div>
  )
}
