import type { Meta, StoryObj } from '@storybook/react'
import { ToolGrid } from '@hchat/ui/desktop'
import type { DesktopTool } from '@hchat/ui/desktop'

const meta: Meta<typeof ToolGrid> = {
  title: 'Desktop/ToolGrid',
  component: ToolGrid,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
}

export default meta
type Story = StoryObj<typeof meta>

const toolsWithInactive: DesktopTool[] = [
  {
    id: 'tool-001',
    name: '이미지 생성',
    description: 'DALL-E 3를 사용한 이미지 생성',
    icon: '🎨',
    category: 'image',
    isAvailable: true,
  },
  {
    id: 'tool-002',
    name: '코드 실행',
    description: 'Python/JavaScript 코드 실행 환경',
    icon: '▶️',
    category: 'code',
    isAvailable: true,
  },
  {
    id: 'tool-003',
    name: '웹 검색',
    description: '실시간 웹 검색 및 요약',
    icon: '🔍',
    category: 'search',
    isAvailable: true,
  },
  {
    id: 'tool-004',
    name: '문서 분석',
    description: 'PDF, Word 문서 분석 및 요약',
    icon: '📄',
    category: 'text',
    isAvailable: true,
  },
  {
    id: 'tool-005',
    name: '데이터 시각화',
    description: '차트 및 그래프 생성',
    icon: '📊',
    category: 'data',
    isAvailable: true,
  },
  {
    id: 'tool-006',
    name: '번역',
    description: '다국어 번역 (30개 언어 지원)',
    icon: '🌐',
    category: 'text',
    isAvailable: true,
  },
  {
    id: 'tool-007',
    name: 'OCR',
    description: '이미지에서 텍스트 추출 (점검 중)',
    icon: '👁️',
    category: 'image',
    isAvailable: false,
  },
  {
    id: 'tool-008',
    name: 'API 테스트',
    description: 'REST API 테스트 도구 (준비 중)',
    icon: '🔗',
    category: 'code',
    isAvailable: false,
  },
]

const allAvailableTools: DesktopTool[] = toolsWithInactive.map((tool) => ({
  ...tool,
  isAvailable: true,
}))

export const Default: Story = {
  args: {
    tools: toolsWithInactive,
  },
}

export const AllAvailable: Story = {
  args: {
    tools: allAvailableTools,
  },
}
