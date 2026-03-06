'use client'

import DesktopLayout from './DesktopLayout'

interface Agent {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly status: 'active' | 'idle' | 'offline'
  readonly model: string
  readonly icon: string
}

const MOCK_AGENTS: readonly Agent[] = [
  {
    id: 'a1',
    name: '코드 리뷰어',
    description: '코드 품질 분석 및 개선 제안을 제공하는 에이전트',
    status: 'active',
    model: 'Claude Sonnet 4.5',
    icon: '🔍',
  },
  {
    id: 'a2',
    name: '문서 작성자',
    description: '기술 문서와 보고서를 자동으로 작성하는 에이전트',
    status: 'active',
    model: 'Claude Opus 4.5',
    icon: '📝',
  },
  {
    id: 'a3',
    name: '데이터 분석가',
    description: '데이터 분석 및 시각화를 수행하는 에이전트',
    status: 'idle',
    model: 'GPT-4o',
    icon: '📊',
  },
  {
    id: 'a4',
    name: '보안 감사자',
    description: '코드 보안 취약점을 탐지하고 수정을 권고하는 에이전트',
    status: 'active',
    model: 'Claude Sonnet 4.5',
    icon: '🛡️',
  },
  {
    id: 'a5',
    name: '번역 전문가',
    description: '다국어 번역 및 현지화를 지원하는 에이전트',
    status: 'idle',
    model: 'GPT-4o',
    icon: '🌐',
  },
  {
    id: 'a6',
    name: '테스트 엔지니어',
    description: '자동화된 테스트 케이스 생성 및 실행 에이전트',
    status: 'offline',
    model: 'Claude Haiku 4.5',
    icon: '🧪',
  },
] as const

const STATUS_STYLES: Record<Agent['status'], string> = {
  active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  idle: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  offline: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
}

const STATUS_LABELS: Record<Agent['status'], string> = {
  active: '활성',
  idle: '대기',
  offline: '오프라인',
}

export default function AgentsPage() {
  return (
    <DesktopLayout activeItem="agents">
      <header className="flex h-14 items-center border-b border-dt-border px-6">
        <h1 className="text-base font-semibold text-dt-text">에이전트</h1>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MOCK_AGENTS.map((agent) => (
            <div
              key={agent.id}
              className="rounded-xl border border-dt-border bg-dt-sidebar p-5 transition-shadow hover:shadow-md"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-2xl">{agent.icon}</span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[agent.status]}`}
                >
                  {STATUS_LABELS[agent.status]}
                </span>
              </div>
              <h3 className="mb-1 text-sm font-semibold text-dt-text">{agent.name}</h3>
              <p className="mb-3 text-xs leading-relaxed text-dt-text-secondary">
                {agent.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-dt-text-secondary">{agent.model}</span>
                <button
                  type="button"
                  className="rounded-lg bg-dt-accent/10 px-3 py-1.5 text-xs font-medium text-dt-accent transition-colors hover:bg-dt-accent/20"
                >
                  실행
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DesktopLayout>
  )
}
