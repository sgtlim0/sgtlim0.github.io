import type { DebateParticipant, DebateMessage } from './types'

const POSITION_CONFIG: Record<
  DebateParticipant['position'],
  { label: string; bg: string; text: string; border: string }
> = {
  for: {
    label: '찬성',
    bg: 'bg-emerald-500/15',
    text: 'text-[var(--dt-for)]',
    border: 'border-[var(--dt-for)]',
  },
  against: {
    label: '반대',
    bg: 'bg-red-500/15',
    text: 'text-[var(--dt-against)]',
    border: 'border-[var(--dt-against)]',
  },
  moderator: {
    label: '사회자',
    bg: 'bg-indigo-500/15',
    text: 'text-[var(--dt-moderator)]',
    border: 'border-[var(--dt-moderator)]',
  },
}

function ParticipantCard({ participant }: { participant: DebateParticipant }) {
  const config = POSITION_CONFIG[participant.position]

  return (
    <div
      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 bg-[var(--dt-bg-card)] ${config.border}`}
    >
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[var(--dt-bg-section)] text-lg font-bold text-[var(--dt-text-primary)]">
        {participant.avatar}
      </div>
      <h4 className="text-sm font-semibold text-[var(--dt-text-primary)] text-center truncate max-w-full">
        {participant.name}
      </h4>
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
      <span className="text-[10px] text-[var(--dt-text-muted)]">{participant.model}</span>
    </div>
  )
}

export interface DebateArenaProps {
  participants: DebateParticipant[]
  messages: DebateMessage[]
}

export default function DebateArena({ participants, messages }: DebateArenaProps) {
  const forParticipants = participants.filter((p) => p.position === 'for')
  const againstParticipants = participants.filter((p) => p.position === 'against')
  const moderators = participants.filter((p) => p.position === 'moderator')

  const participantMap = new Map(participants.map((p) => [p.id, p]))

  const rounds = messages.reduce<number[]>((acc, msg) => {
    if (!acc.includes(msg.round)) {
      return [...acc, msg.round]
    }
    return acc
  }, [])

  return (
    <div className="flex flex-col gap-5 p-5 rounded-xl border border-[var(--dt-border)] bg-[var(--dt-bg-card)]">
      {/* Participants row */}
      <div className="grid grid-cols-3 gap-4">
        {/* For column */}
        <div className="flex flex-col gap-2">
          {forParticipants.map((p) => (
            <ParticipantCard key={p.id} participant={p} />
          ))}
        </div>

        {/* Moderator column */}
        <div className="flex flex-col items-center gap-2">
          {moderators.map((p) => (
            <ParticipantCard key={p.id} participant={p} />
          ))}
        </div>

        {/* Against column */}
        <div className="flex flex-col gap-2">
          {againstParticipants.map((p) => (
            <ParticipantCard key={p.id} participant={p} />
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-[var(--dt-border)]" />

      {/* Message timeline */}
      <div className="flex flex-col gap-4">
        {rounds.map((round) => {
          const roundMessages = messages.filter((m) => m.round === round)
          return (
            <div key={round} className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-[var(--dt-text-muted)] uppercase tracking-wider">
                  Round {round}
                </span>
                <div className="flex-1 h-px bg-[var(--dt-border)]" />
              </div>
              {roundMessages.map((msg, idx) => {
                const participant = participantMap.get(msg.participantId)
                if (!participant) return null
                const posConfig = POSITION_CONFIG[participant.position]
                return (
                  <div
                    key={`${msg.participantId}-${round}-${idx}`}
                    className="flex gap-3 px-3 py-3 rounded-lg bg-[var(--dt-bg-section)]"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--dt-bg-card)] text-sm font-bold text-[var(--dt-text-primary)] shrink-0">
                      {participant.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-[var(--dt-text-primary)]">
                          {participant.name}
                        </span>
                        <span className={`text-[10px] font-medium ${posConfig.text}`}>
                          {posConfig.label}
                        </span>
                      </div>
                      <p className="text-sm text-[var(--dt-text-secondary)] leading-relaxed whitespace-pre-wrap">
                        {msg.content}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>

      {/* Empty state */}
      {messages.length === 0 && (
        <div className="flex items-center justify-center py-10 text-sm text-[var(--dt-text-muted)]">
          토론이 시작되지 않았습니다
        </div>
      )}
    </div>
  )
}
