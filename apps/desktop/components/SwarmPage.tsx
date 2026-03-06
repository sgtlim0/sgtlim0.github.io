'use client'

import DesktopLayout from './DesktopLayout'

interface SwarmAgent {
  readonly id: string
  readonly name: string
  readonly role: string
  readonly status: 'working' | 'waiting' | 'done'
}

interface SwarmMessage {
  readonly id: string
  readonly agentName: string
  readonly content: string
  readonly timestamp: string
}

const MOCK_SWARM_AGENTS: readonly SwarmAgent[] = [
  { id: 's1', name: 'Planner', role: '작업 분배', status: 'done' },
  { id: 's2', name: 'Coder', role: '코드 작성', status: 'working' },
  { id: 's3', name: 'Reviewer', role: '코드 리뷰', status: 'waiting' },
  { id: 's4', name: 'Tester', role: '테스트 작성', status: 'waiting' },
] as const

const MOCK_SWARM_MESSAGES: readonly SwarmMessage[] = [
  {
    id: 'm1',
    agentName: 'Planner',
    content:
      '작업을 3개 하위 태스크로 분할했습니다: API 엔드포인트 설계, 비즈니스 로직 구현, 테스트 작성.',
    timestamp: '10:30:01',
  },
  {
    id: 'm2',
    agentName: 'Coder',
    content: 'API 엔드포인트 설계를 시작합니다. REST 패턴으로 /api/v1/agents 경로를 생성합니다.',
    timestamp: '10:30:05',
  },
  {
    id: 'm3',
    agentName: 'Coder',
    content:
      '비즈니스 로직 구현 중입니다. Repository 패턴을 적용하여 데이터 접근 레이어를 분리합니다.',
    timestamp: '10:30:12',
  },
] as const

const STATUS_DOT: Record<SwarmAgent['status'], string> = {
  working: 'bg-green-500 animate-pulse',
  waiting: 'bg-yellow-500',
  done: 'bg-blue-500',
}

export default function SwarmPage() {
  return (
    <DesktopLayout activeItem="swarm">
      <header className="flex h-14 items-center border-b border-dt-border px-6">
        <h1 className="text-base font-semibold text-dt-text">스웜</h1>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Swarm Panel */}
        <aside className="w-64 border-r border-dt-border bg-dt-sidebar p-4">
          <h2 className="mb-4 text-sm font-semibold text-dt-text">에이전트 상태</h2>
          <div className="space-y-3">
            {MOCK_SWARM_AGENTS.map((agent) => (
              <div key={agent.id} className="rounded-lg border border-dt-border bg-dt-bg p-3">
                <div className="mb-1 flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${STATUS_DOT[agent.status]}`} />
                  <span className="text-sm font-medium text-dt-text">{agent.name}</span>
                </div>
                <p className="text-xs text-dt-text-secondary">{agent.role}</p>
              </div>
            ))}
          </div>
        </aside>

        {/* Conversation Area */}
        <div className="flex flex-1 flex-col">
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="space-y-4">
              {MOCK_SWARM_MESSAGES.map((msg) => (
                <div key={msg.id} className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-dt-accent/10 text-xs font-bold text-dt-accent">
                    {msg.agentName.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-sm font-medium text-dt-text">{msg.agentName}</span>
                      <span className="text-xs text-dt-text-secondary">{msg.timestamp}</span>
                    </div>
                    <p className="text-sm leading-relaxed text-dt-text-secondary">{msg.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-dt-border px-6 py-3">
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="스웜에 지시를 입력하세요..."
                className="flex-1 rounded-lg border border-dt-border bg-dt-sidebar px-4 py-2.5 text-sm text-dt-text placeholder:text-dt-text-secondary focus:outline-none focus:ring-2 focus:ring-dt-accent/40"
                readOnly
              />
              <button
                type="button"
                className="rounded-lg bg-dt-accent px-4 py-2.5 text-sm font-medium text-white"
              >
                실행
              </button>
            </div>
          </div>
        </div>
      </div>
    </DesktopLayout>
  )
}
