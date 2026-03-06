import type { Meta, StoryObj } from '@storybook/react'
import { WidgetCatalogPanel } from '@hchat/ui/admin'
import type { WidgetCatalogItem } from '@hchat/ui/admin/services/widgetTypes'

const mockCatalog: WidgetCatalogItem[] = [
  {
    type: 'metric-card',
    name: '핵심 지표 카드',
    description: '주요 KPI를 숫자와 추세로 표시합니다',
    icon: 'KPI',
    defaultSize: 'sm',
    minSize: 'sm',
    maxSize: 'md',
    category: 'monitoring',
  },
  {
    type: 'line-chart',
    name: '추세 라인 차트',
    description: '시간별 데이터 추세를 라인 차트로 표시합니다',
    icon: 'LN',
    defaultSize: 'md',
    minSize: 'md',
    maxSize: 'xl',
    category: 'analytics',
  },
  {
    type: 'bar-chart',
    name: '막대 차트',
    description: '비교 데이터를 막대 차트로 표시합니다',
    icon: 'BAR',
    defaultSize: 'md',
    minSize: 'md',
    maxSize: 'xl',
    category: 'analytics',
  },
  {
    type: 'donut-chart',
    name: '도넛 차트',
    description: '비율 데이터를 도넛 차트로 표시합니다',
    icon: 'DNT',
    defaultSize: 'sm',
    minSize: 'sm',
    maxSize: 'lg',
    category: 'analytics',
  },
  {
    type: 'activity-feed',
    name: '활동 피드',
    description: '최근 시스템 활동 로그를 실시간으로 표시합니다',
    icon: 'ACT',
    defaultSize: 'md',
    minSize: 'sm',
    maxSize: 'lg',
    category: 'monitoring',
  },
  {
    type: 'model-distribution',
    name: '모델 사용 분포',
    description: 'AI 모델별 사용량 분포를 표시합니다',
    icon: 'MDL',
    defaultSize: 'md',
    minSize: 'sm',
    maxSize: 'xl',
    category: 'analytics',
  },
  {
    type: 'notification-summary',
    name: '알림 요약',
    description: '미확인 알림과 중요 공지를 요약합니다',
    icon: 'NTF',
    defaultSize: 'sm',
    minSize: 'sm',
    maxSize: 'md',
    category: 'system',
  },
  {
    type: 'user-stats',
    name: '사용자 통계',
    description: '활성 사용자 수와 사용 패턴을 표시합니다',
    icon: 'USR',
    defaultSize: 'md',
    minSize: 'sm',
    maxSize: 'lg',
    category: 'management',
  },
  {
    type: 'quick-actions',
    name: '빠른 작업',
    description: '자주 사용하는 관리 작업 바로가기입니다',
    icon: 'QCK',
    defaultSize: 'sm',
    minSize: 'sm',
    maxSize: 'md',
    category: 'system',
  },
  {
    type: 'status-overview',
    name: '시스템 상태 개요',
    description: '전체 시스템 및 서비스 상태를 표시합니다',
    icon: 'STS',
    defaultSize: 'lg',
    minSize: 'md',
    maxSize: 'xl',
    category: 'monitoring',
  },
]

const meta: Meta<typeof WidgetCatalogPanel> = {
  title: 'Admin/Customize/WidgetCatalogPanel',
  component: WidgetCatalogPanel,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ height: 600 }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    catalog: mockCatalog,
    onAdd: () => {},
  },
}
