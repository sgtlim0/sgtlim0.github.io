import type { Meta, StoryObj } from '@storybook/react'
import {
  LiveMetricCard,
  LiveLineChart,
  LiveActivityFeed,
  LiveModelDistribution,
} from '@hchat/ui/admin'
import type {
  RealtimeMetric,
  RealtimeDataPoint,
  RealtimeActivity,
} from '@hchat/ui/admin/services/realtimeTypes'

// ============= Mock Data =============

const metricUp: RealtimeMetric = {
  id: 'active-users',
  label: '활성 사용자',
  value: 42,
  previousValue: 38,
  unit: '명',
  trend: 'up',
  changePercent: 10.5,
}

const metricDown: RealtimeMetric = {
  id: 'avg-response-time',
  label: '평균 응답 시간',
  value: 280,
  previousValue: 320,
  unit: 'ms',
  trend: 'down',
  changePercent: -12.5,
}

const metricStable: RealtimeMetric = {
  id: 'error-rate',
  label: '오류율',
  value: 1.5,
  previousValue: 1.5,
  unit: '%',
  trend: 'stable',
  changePercent: 0,
}

const now = Date.now()
const timeSeriesData: RealtimeDataPoint[] = Array.from({ length: 20 }, (_, i) => ({
  timestamp: now - (19 - i) * 3000,
  value: 30 + Math.round(Math.sin(i * 0.5) * 10 + Math.random() * 5),
}))

const activityTypes = ['query', 'login', 'error', 'model_switch', 'upload'] as const
const activityMessages: Record<string, string[]> = {
  query: ['문서 요약 요청', '코드 리뷰 질의', '번역 요청', '데이터 분석 질의'],
  login: ['대시보드 접속', '모바일 로그인', 'SSO 인증 완료'],
  error: ['토큰 한도 초과', 'API 타임아웃'],
  model_switch: ['GPT-4o → Claude 3.5', 'Gemini Pro → GPT-4o'],
  upload: ['PDF 문서 업로드', 'Excel 데이터 업로드'],
}
const names = [
  '김민수',
  '이서연',
  '박지훈',
  '최유진',
  '정도현',
  '강소영',
  '조현우',
  '윤지은',
  '임태호',
  '한예린',
]

const activities: RealtimeActivity[] = Array.from({ length: 10 }, (_, i) => {
  const type = activityTypes[i % activityTypes.length]
  return {
    id: `activity-${i}`,
    type,
    user: names[i],
    message: activityMessages[type][i % activityMessages[type].length],
    timestamp: now - i * 4000,
  }
})

const modelDistribution = [
  { model: 'GPT-4o', count: 245, percentage: 28.5 },
  { model: 'Claude 3.5 Sonnet', count: 198, percentage: 23.0 },
  { model: 'Gemini Pro', count: 167, percentage: 19.4 },
  { model: 'GPT-4o mini', count: 142, percentage: 16.5 },
  { model: 'Claude 3 Haiku', count: 108, percentage: 12.6 },
]

// ============= LiveMetricCard =============

const metricCardMeta: Meta<typeof LiveMetricCard> = {
  title: 'Admin/Realtime/LiveMetricCard',
  component: LiveMetricCard,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: 280 }}>
        <Story />
      </div>
    ),
  ],
}

export default metricCardMeta
type MetricCardStory = StoryObj<typeof LiveMetricCard>

export const Default: MetricCardStory = {
  args: { metric: metricUp },
}

export const DownTrend: MetricCardStory = {
  args: { metric: metricDown },
}

export const Stable: MetricCardStory = {
  args: { metric: metricStable },
}

// ============= LiveLineChart =============

export const LineChartDefault: StoryObj<typeof LiveLineChart> = {
  render: () => <LiveLineChart data={timeSeriesData} label="분당 질의 수" height={200} />,
}
LineChartDefault.storyName = 'Default'

export const LineChartCustomColor: StoryObj<typeof LiveLineChart> = {
  render: () => (
    <LiveLineChart data={timeSeriesData} color="#10B981" label="평균 응답 시간 (ms)" height={180} />
  ),
}
LineChartCustomColor.storyName = 'Custom Color'

// ============= LiveActivityFeed =============

export const ActivityFeedDefault: StoryObj<typeof LiveActivityFeed> = {
  render: () => <LiveActivityFeed activities={activities} />,
}
ActivityFeedDefault.storyName = 'Default'

export const ActivityFeedEmpty: StoryObj<typeof LiveActivityFeed> = {
  render: () => <LiveActivityFeed activities={[]} />,
}
ActivityFeedEmpty.storyName = 'Empty'

// ============= LiveModelDistribution =============

export const ModelDistributionDefault: StoryObj<typeof LiveModelDistribution> = {
  render: () => <LiveModelDistribution distribution={modelDistribution} />,
}
ModelDistributionDefault.storyName = 'Default'
