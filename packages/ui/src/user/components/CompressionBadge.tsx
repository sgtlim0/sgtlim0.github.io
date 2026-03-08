export interface CompressionBadgeProps {
  stats: {
    originalTokens: number
    compressedTokens: number
    reductionPct: number
  }
}

export default function CompressionBadge({ stats }: CompressionBadgeProps) {
  if (stats.reductionPct <= 0) return null

  return (
    <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-[var(--user-border)] opacity-60">
      <svg className="w-3 h-3 shrink-0" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 12.5a5.5 5.5 0 110-11 5.5 5.5 0 010 11z" />
      </svg>
      <span className="text-[10px] tabular-nums text-[var(--user-text-muted)]">
        {stats.reductionPct}% 압축 ({stats.originalTokens.toLocaleString()} →{' '}
        {stats.compressedTokens.toLocaleString()})
      </span>
    </div>
  )
}
