'use client'

import DesktopLayout from './DesktopLayout'

interface Participant {
  readonly id: string
  readonly name: string
  readonly role: string
  readonly color: string
}

interface DebateMessage {
  readonly id: string
  readonly participantId: string
  readonly content: string
  readonly timestamp: string
}

const MOCK_PARTICIPANTS: readonly Participant[] = [
  { id: 'p1', name: 'Claude', role: '찬성 측', color: 'bg-blue-500' },
  { id: 'p2', name: 'GPT-4o', role: '반대 측', color: 'bg-green-500' },
  { id: 'p3', name: 'Gemini', role: '중립 심판', color: 'bg-purple-500' },
] as const

const MOCK_DEBATE_MESSAGES: readonly DebateMessage[] = [
  {
    id: 'd1',
    participantId: 'p3',
    content:
      '오늘의 토론 주제: "AI 코드 리뷰는 인간 코드 리뷰를 대체할 수 있는가?" 찬성 측부터 발언해주세요.',
    timestamp: '11:00:00',
  },
  {
    id: 'd2',
    participantId: 'p1',
    content:
      'AI 코드 리뷰는 일관성, 속도, 커버리지 면에서 인간을 능가합니다. 24시간 작동하며 스타일 가이드 위반, 보안 취약점, 성능 이슈를 즉시 탐지할 수 있습니다. 인간 리뷰어의 피로도나 편향 없이 객관적인 분석을 제공합니다.',
    timestamp: '11:00:15',
  },
  {
    id: 'd3',
    participantId: 'p2',
    content:
      '기술적 패턴 매칭은 가능하지만, 코드 리뷰의 핵심은 비즈니스 맥락 이해입니다. AI는 "왜 이 로직이 필요한가"를 팀의 도메인 지식 없이 판단할 수 없습니다. 또한 주니어 개발자 멘토링 역할은 인간만이 할 수 있습니다.',
    timestamp: '11:00:30',
  },
  {
    id: 'd4',
    participantId: 'p1',
    content:
      '최근 LLM의 컨텍스트 윈도우 확장으로 프로젝트 전체 맥락을 이해할 수 있게 되었습니다. 또한 멘토링 측면에서도 AI는 일관된 교육적 피드백을 제공하며, 인간 리뷰어가 놓치기 쉬운 엣지 케이스까지 지적합니다.',
    timestamp: '11:00:45',
  },
  {
    id: 'd5',
    participantId: 'p3',
    content:
      '양측 모두 타당한 논점을 제시했습니다. AI 코드 리뷰는 보조 도구로서 매우 유용하나, 완전한 대체보다는 인간과의 협업 모델이 현실적입니다. 다음 라운드로 넘어가겠습니다.',
    timestamp: '11:01:00',
  },
] as const

function getParticipant(id: string): Participant {
  return (
    MOCK_PARTICIPANTS.find((p) => p.id === id) ?? {
      id: 'unknown',
      name: 'Unknown',
      role: '',
      color: 'bg-gray-500',
    }
  )
}

export default function DebatePage() {
  return (
    <DesktopLayout activeItem="debate">
      <header className="flex h-14 items-center border-b border-dt-border px-6">
        <h1 className="text-base font-semibold text-dt-text">토론</h1>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Participants Panel */}
        <aside className="w-56 border-r border-dt-border bg-dt-sidebar p-4">
          <h2 className="mb-4 text-sm font-semibold text-dt-text">참가자</h2>
          <div className="space-y-3">
            {MOCK_PARTICIPANTS.map((p) => (
              <div key={p.id} className="flex items-center gap-3">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white ${p.color}`}
                >
                  {p.name.charAt(0)}
                </span>
                <div>
                  <p className="text-sm font-medium text-dt-text">{p.name}</p>
                  <p className="text-xs text-dt-text-secondary">{p.role}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-lg border border-dt-border bg-dt-bg p-3">
            <h3 className="mb-2 text-xs font-semibold text-dt-text">토론 주제</h3>
            <p className="text-xs leading-relaxed text-dt-text-secondary">
              AI 코드 리뷰는 인간 코드 리뷰를 대체할 수 있는가?
            </p>
          </div>
        </aside>

        {/* Debate Arena */}
        <div className="flex flex-1 flex-col">
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="mx-auto max-w-3xl space-y-5">
              {MOCK_DEBATE_MESSAGES.map((msg) => {
                const participant = getParticipant(msg.participantId)
                return (
                  <div key={msg.id} className="flex gap-3">
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${participant.color}`}
                    >
                      {participant.name.charAt(0)}
                    </span>
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="text-sm font-medium text-dt-text">{participant.name}</span>
                        <span className="rounded bg-dt-border/30 px-1.5 py-0.5 text-xs text-dt-text-secondary">
                          {participant.role}
                        </span>
                        <span className="text-xs text-dt-text-secondary">{msg.timestamp}</span>
                      </div>
                      <p className="text-sm leading-relaxed text-dt-text-secondary">
                        {msg.content}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="border-t border-dt-border px-6 py-3">
            <div className="mx-auto flex max-w-3xl items-center gap-3">
              <input
                type="text"
                placeholder="새로운 토론 주제를 입력하세요..."
                className="flex-1 rounded-lg border border-dt-border bg-dt-sidebar px-4 py-2.5 text-sm text-dt-text placeholder:text-dt-text-secondary focus:outline-none focus:ring-2 focus:ring-dt-accent/40"
                readOnly
              />
              <button
                type="button"
                className="rounded-lg bg-dt-accent px-4 py-2.5 text-sm font-medium text-white"
              >
                시작
              </button>
            </div>
          </div>
        </div>
      </div>
    </DesktopLayout>
  )
}
