export interface StreamingIndicatorProps {
  isStreaming: boolean
}

export default function StreamingIndicator({ isStreaming }: StreamingIndicatorProps) {
  if (!isStreaming) return null

  return (
    <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-[var(--user-bg-section)] max-w-fit">
      <span className="text-sm text-[var(--user-text-muted)]">응답 생성 중</span>
      <div className="flex gap-1">
        <div className="w-1.5 h-1.5 rounded-full bg-[var(--user-text-muted)] animate-bounce [animation-delay:0ms]" />
        <div className="w-1.5 h-1.5 rounded-full bg-[var(--user-text-muted)] animate-bounce [animation-delay:150ms]" />
        <div className="w-1.5 h-1.5 rounded-full bg-[var(--user-text-muted)] animate-bounce [animation-delay:300ms]" />
      </div>
    </div>
  )
}
