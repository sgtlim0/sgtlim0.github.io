import type { ChatMessage } from '../services/types'
import CompressionBadge from './CompressionBadge'
import SourceAttribution from './SourceAttribution'
import CopyButton from '../../CopyButton'

export interface MessageBubbleProps {
  message: ChatMessage
  isStreaming?: boolean
}

export default function MessageBubble({ message, isStreaming = false }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const timestamp = new Date(message.timestamp).toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} group`}>
      <div className="flex flex-col gap-1 max-w-[70%]">
        <div
          className={`px-4 py-3 rounded-2xl ${
            isUser
              ? 'bg-[var(--user-primary)] text-white'
              : 'bg-[var(--user-bg-section)] text-[var(--user-text-primary)]'
          }`}
        >
          {message.mode === 'research' && !isUser && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-[var(--user-primary)]/10 text-[var(--user-primary)] mb-1">
              Research
            </span>
          )}
          <div className="whitespace-pre-wrap break-words">
            {message.content}
            {isStreaming && !isUser && (
              <span className="inline-block w-0.5 h-4 ml-1 bg-[var(--user-text-primary)] animate-pulse" />
            )}
          </div>
          {!isUser && message.compressionStats && (
            <CompressionBadge stats={message.compressionStats} />
          )}
          {!isUser && message.sources && message.sources.length > 0 && (
            <SourceAttribution sources={message.sources} />
          )}
        </div>
        {!isUser && !isStreaming && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 px-1">
            <CopyButton text={message.content} className="text-[var(--user-text-muted)]" />
          </div>
        )}
        <div
          className={`text-xs text-[var(--user-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity px-2 ${
            isUser ? 'text-right' : 'text-left'
          }`}
        >
          {timestamp}
        </div>
      </div>
    </div>
  )
}
