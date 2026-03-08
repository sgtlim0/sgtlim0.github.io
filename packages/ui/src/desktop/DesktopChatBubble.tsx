import type { DesktopMessage } from './types'

function formatRelativeTime(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return '방금'
  if (minutes < 60) return `${minutes}분 전`
  if (hours < 24) return `${hours}시간 전`
  if (days < 7) return `${days}일 전`

  return new Date(timestamp).toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
  })
}

export interface DesktopChatBubbleProps {
  message: DesktopMessage
  modelName?: string
}

export default function DesktopChatBubble({ message, modelName }: DesktopChatBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} group`}>
      <div className="flex flex-col gap-1.5 max-w-[75%]">
        {/* Model badge for assistant */}
        {!isUser && modelName && (
          <span className="inline-flex self-start items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-[var(--dt-primary-light)] text-[var(--dt-primary)] border border-[var(--dt-border)]">
            {modelName}
          </span>
        )}

        {/* Message bubble */}
        <div
          className={`px-4 py-3 rounded-2xl ${
            isUser
              ? 'bg-[var(--dt-primary)] text-white rounded-br-md'
              : 'bg-[var(--dt-bg-section)] text-[var(--dt-text-primary)] border border-[var(--dt-border)] rounded-bl-md'
          }`}
        >
          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
            {message.content}
          </p>
        </div>

        {/* Footer: timestamp + tokens */}
        <div
          className={`flex items-center gap-2 px-1 opacity-0 group-hover:opacity-100 transition-opacity ${
            isUser ? 'justify-end' : 'justify-start'
          }`}
        >
          <span className="text-[11px] text-[var(--dt-text-muted)]">
            {formatRelativeTime(message.timestamp)}
          </span>
          {message.tokens != null && message.tokens > 0 && (
            <span className="text-[11px] text-[var(--dt-text-muted)]">
              {message.tokens.toLocaleString()} tokens
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
