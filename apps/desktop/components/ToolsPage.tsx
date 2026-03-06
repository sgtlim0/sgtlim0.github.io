'use client'

import DesktopLayout from './DesktopLayout'

interface Tool {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly category: string
  readonly icon: string
}

const MOCK_TOOLS: readonly Tool[] = [
  {
    id: 't1',
    name: '코드 생성',
    description: '자연어로 코드를 생성합니다. 다양한 프로그래밍 언어를 지원합니다.',
    category: '개발',
    icon: '💻',
  },
  {
    id: 't2',
    name: '문서 요약',
    description: '긴 문서를 핵심 내용으로 자동 요약합니다.',
    category: '문서',
    icon: '📋',
  },
  {
    id: 't3',
    name: '이미지 분석',
    description: '이미지를 분석하여 텍스트, 객체, 패턴을 인식합니다.',
    category: '비전',
    icon: '🖼️',
  },
  {
    id: 't4',
    name: '데이터 변환',
    description: 'JSON, CSV, XML 등 다양한 데이터 포맷 간 변환을 수행합니다.',
    category: '데이터',
    icon: '🔄',
  },
  {
    id: 't5',
    name: 'API 테스트',
    description: 'REST/GraphQL API를 자동으로 테스트하고 결과를 분석합니다.',
    category: '개발',
    icon: '🔌',
  },
  {
    id: 't6',
    name: '번역',
    description: '다국어 텍스트 번역 및 현지화를 지원합니다.',
    category: '문서',
    icon: '🌍',
  },
  {
    id: 't7',
    name: 'SQL 생성',
    description: '자연어 질문을 SQL 쿼리로 변환합니다.',
    category: '데이터',
    icon: '🗄️',
  },
  {
    id: 't8',
    name: '보안 스캔',
    description: '코드 및 인프라의 보안 취약점을 자동으로 탐지합니다.',
    category: '보안',
    icon: '🔐',
  },
] as const

const CATEGORY_COLORS: Record<string, string> = {
  개발: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  문서: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  비전: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  데이터: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  보안: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

export default function ToolsPage() {
  return (
    <DesktopLayout activeItem="tools">
      <header className="flex h-14 items-center border-b border-dt-border px-6">
        <h1 className="text-base font-semibold text-dt-text">AI 도구</h1>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MOCK_TOOLS.map((tool) => (
            <div
              key={tool.id}
              className="group cursor-pointer rounded-xl border border-dt-border bg-dt-sidebar p-5 transition-all hover:border-dt-accent/40 hover:shadow-md"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-2xl">{tool.icon}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    CATEGORY_COLORS[tool.category] ?? 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {tool.category}
                </span>
              </div>
              <h3 className="mb-1.5 text-sm font-semibold text-dt-text">{tool.name}</h3>
              <p className="text-xs leading-relaxed text-dt-text-secondary">{tool.description}</p>
              <button
                type="button"
                className="mt-4 w-full rounded-lg border border-dt-border py-2 text-xs font-medium text-dt-text-secondary transition-colors group-hover:border-dt-accent group-hover:text-dt-accent"
              >
                실행하기
              </button>
            </div>
          ))}
        </div>
      </div>
    </DesktopLayout>
  )
}
