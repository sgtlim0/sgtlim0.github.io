export interface SourceAttributionProps {
  sources: Array<{
    title: string
    url: string
    snippet?: string
  }>
}

function extractHostname(url: string): string {
  try {
    return new URL(url).hostname
  } catch {
    return url
  }
}

export default function SourceAttribution({ sources }: SourceAttributionProps) {
  if (sources.length === 0) return null

  return (
    <div className="mt-3 pt-2 border-t border-[var(--user-border)]">
      <p className="text-[11px] font-medium text-[var(--user-text-muted)] mb-1.5">
        출처 ({sources.length}건)
      </p>
      <ul className="flex flex-col gap-1">
        {sources.map((source, idx) => (
          <li key={`${source.url}-${idx}`}>
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              title={source.snippet ?? undefined}
              className="group/src flex items-start gap-1.5 px-2 py-1 rounded-md hover:bg-[var(--user-bg-hover)] transition-colors"
            >
              <span className="text-[10px] text-[var(--user-text-muted)] tabular-nums shrink-0 mt-0.5">
                [{idx + 1}]
              </span>
              <span className="flex flex-col min-w-0">
                <span className="text-xs text-[var(--user-text-primary)] group-hover/src:text-[var(--user-primary)] truncate">
                  {source.title}
                </span>
                <span className="text-[10px] text-[var(--user-text-muted)] truncate">
                  {extractHostname(source.url)}
                </span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
