
export interface ResearchPanelProps {
  isSearching: boolean
  query?: string
}

export default function ResearchPanel({ isSearching, query }: ResearchPanelProps) {
  if (!isSearching) {
    return null
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3 mx-4 md:mx-6 mb-2 rounded-xl bg-[var(--user-bg-section)] border border-[var(--user-border)]">
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--user-primary)]/10">
        <svg
          className="w-4 h-4 text-[var(--user-primary)] animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium text-[var(--user-text-primary)]">검색 중...</span>
        {query && (
          <span className="text-xs text-[var(--user-text-muted)] truncate max-w-[300px]">
            {query}
          </span>
        )}
      </div>
    </div>
  )
}
