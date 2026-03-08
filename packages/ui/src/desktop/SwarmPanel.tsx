import type { SwarmAgent } from './types'

const STATUS_CONFIG: Record<SwarmAgent['status'], { label: string; dot: string; text: string }> = {
  idle: {
    label: '대기',
    dot: 'bg-[var(--dt-status-idle)]',
    text: 'text-[var(--dt-status-idle)]',
  },
  thinking: {
    label: '사고 중',
    dot: 'bg-[var(--dt-status-thinking)] animate-pulse',
    text: 'text-[var(--dt-status-thinking)]',
  },
  responding: {
    label: '응답 중',
    dot: 'bg-[var(--dt-status-responding)]',
    text: 'text-[var(--dt-status-responding)]',
  },
  done: {
    label: '완료',
    dot: 'bg-[var(--dt-status-done)]',
    text: 'text-[var(--dt-status-done)]',
  },
}

export interface SwarmPanelProps {
  agents: SwarmAgent[]
  progress?: number
}

export default function SwarmPanel({ agents, progress }: SwarmPanelProps) {
  const completedCount = agents.filter((a) => a.status === 'done').length
  const totalCount = agents.length
  const progressPercent = progress != null ? Math.min(100, Math.max(0, progress)) : null

  return (
    <div className="flex flex-col gap-4 p-5 rounded-xl border border-[var(--dt-border)] bg-[var(--dt-bg-card)]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--dt-text-primary)]">Swarm Agents</h3>
        <span className="text-xs text-[var(--dt-text-secondary)]">
          {completedCount} / {totalCount} 완료
        </span>
      </div>

      {/* Progress bar */}
      {progressPercent != null && (
        <div className="w-full h-2 rounded-full bg-[var(--dt-bg-section)] overflow-hidden">
          <div
            className="h-full rounded-full bg-[var(--dt-primary)] transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      {/* Agent list */}
      <ul className="flex flex-col gap-2">
        {agents.map((agent) => {
          const config = STATUS_CONFIG[agent.status]
          return (
            <li
              key={agent.id}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[var(--dt-bg-section)] border border-[var(--dt-border)]"
            >
              {/* Avatar */}
              <div className="flex items-center justify-center w-9 h-9 rounded-full bg-[var(--dt-primary-light)] text-[var(--dt-primary)] text-xs font-bold shrink-0">
                {agent.avatar}
              </div>

              {/* Name + Role */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--dt-text-primary)] truncate">
                  {agent.name}
                </p>
                <p className="text-[11px] text-[var(--dt-text-muted)] truncate">
                  {agent.role} — {agent.model}
                </p>
              </div>

              {/* Status */}
              <div className="flex items-center gap-1.5 shrink-0">
                <span className={`w-2 h-2 rounded-full ${config.dot}`} />
                <span className={`text-[11px] font-medium ${config.text}`}>{config.label}</span>
              </div>
            </li>
          )
        })}
      </ul>

      {/* Empty state */}
      {agents.length === 0 && (
        <div className="flex items-center justify-center py-8 text-sm text-[var(--dt-text-muted)]">
          에이전트가 없습니다
        </div>
      )}
    </div>
  )
}
