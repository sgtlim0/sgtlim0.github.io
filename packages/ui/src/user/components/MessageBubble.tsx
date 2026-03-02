'use client';

import type { ChatMessage } from '../services/types';

export interface MessageBubbleProps {
  message: ChatMessage;
  isStreaming?: boolean;
}

export default function MessageBubble({ message, isStreaming = false }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const timestamp = new Date(message.timestamp).toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  });

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
          <div className="whitespace-pre-wrap break-words">
            {message.content}
            {isStreaming && !isUser && (
              <span className="inline-block w-0.5 h-4 ml-1 bg-[var(--user-text-primary)] animate-pulse" />
            )}
          </div>
        </div>
        <div
          className={`text-xs text-[var(--user-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity px-2 ${
            isUser ? 'text-right' : 'text-left'
          }`}
        >
          {timestamp}
        </div>
      </div>
    </div>
  );
}
