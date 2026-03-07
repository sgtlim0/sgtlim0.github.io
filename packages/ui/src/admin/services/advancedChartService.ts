/**
 * Advanced Chart Service — D3.js-ready data providers
 */
import type {
  TreemapNode,
  SankeyData,
  ScatterPoint,
  FunnelStep,
  GaugeConfig,
} from './advancedChartTypes'

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

export async function getTreemapData(): Promise<TreemapNode> {
  await delay(200)
  return {
    name: 'AI 사용량',
    value: 0,
    children: [
      {
        name: 'GPT-4o',
        value: 4500,
        children: [
          { name: '채팅', value: 2800 },
          { name: '번역', value: 1200 },
          { name: '요약', value: 500 },
        ],
      },
      {
        name: 'Claude 3.5',
        value: 3200,
        children: [
          { name: '코드 리뷰', value: 1800 },
          { name: '분석', value: 900 },
          { name: '기타', value: 500 },
        ],
      },
      {
        name: 'Gemini',
        value: 1800,
        children: [
          { name: '검색', value: 1000 },
          { name: '문서', value: 800 },
        ],
      },
      {
        name: '기타',
        value: 900,
        children: [
          { name: 'Mistral', value: 500 },
          { name: 'Ollama', value: 400 },
        ],
      },
    ],
  }
}

export async function getSankeyData(): Promise<SankeyData> {
  await delay(200)
  return {
    nodes: [
      { id: 'users', name: '사용자' },
      { id: 'chat', name: '채팅' },
      { id: 'translate', name: '번역' },
      { id: 'code', name: '코드' },
      { id: 'gpt4o', name: 'GPT-4o' },
      { id: 'claude', name: 'Claude' },
      { id: 'gemini', name: 'Gemini' },
      { id: 'success', name: '성공' },
      { id: 'retry', name: '재시도' },
    ],
    links: [
      { source: 'users', target: 'chat', value: 4500 },
      { source: 'users', target: 'translate', value: 2800 },
      { source: 'users', target: 'code', value: 1200 },
      { source: 'chat', target: 'gpt4o', value: 3000 },
      { source: 'chat', target: 'claude', value: 1500 },
      { source: 'translate', target: 'gpt4o', value: 1500 },
      { source: 'translate', target: 'gemini', value: 1300 },
      { source: 'code', target: 'claude', value: 1200 },
      { source: 'gpt4o', target: 'success', value: 4300 },
      { source: 'claude', target: 'success', value: 2500 },
      { source: 'gemini', target: 'success', value: 1200 },
      { source: 'gpt4o', target: 'retry', value: 200 },
      { source: 'claude', target: 'retry', value: 200 },
      { source: 'gemini', target: 'retry', value: 100 },
    ],
  }
}

export async function getScatterData(): Promise<ScatterPoint[]> {
  await delay(200)
  return [
    { x: 1.2, y: 92, label: 'GPT-4o', size: 45, group: 'OpenAI', color: '#10B981' },
    { x: 1.5, y: 94, label: 'Claude 3.5 Sonnet', size: 52, group: 'Anthropic', color: '#8B5CF6' },
    { x: 0.9, y: 88, label: 'Gemini Pro', size: 38, group: 'Google', color: '#3B82F6' },
    { x: 0.6, y: 82, label: 'GPT-4o Mini', size: 30, group: 'OpenAI', color: '#10B981' },
    { x: 0.5, y: 80, label: 'Claude 3.5 Haiku', size: 25, group: 'Anthropic', color: '#8B5CF6' },
    { x: 1.3, y: 85, label: 'Mistral Large', size: 40, group: 'Mistral', color: '#F59E0B' },
  ]
}

export async function getFunnelData(): Promise<FunnelStep[]> {
  await delay(150)
  return [
    { label: '방문', value: 10000, percentage: 100, color: '#3B82F6' },
    { label: '가입', value: 6500, percentage: 65, color: '#6366F1' },
    { label: '첫 대화', value: 4200, percentage: 42, color: '#8B5CF6' },
    { label: '활성 사용', value: 2800, percentage: 28, color: '#A855F7' },
    { label: '유료 전환', value: 800, percentage: 8, color: '#C084FC' },
  ]
}

export async function getGaugeData(): Promise<GaugeConfig[]> {
  await delay(150)
  return [
    {
      value: 87,
      min: 0,
      max: 100,
      label: 'API 가용성',
      thresholds: [
        { value: 95, color: '#22C55E', label: '정상' },
        { value: 80, color: '#F59E0B', label: '주의' },
        { value: 0, color: '#EF4444', label: '위험' },
      ],
    },
    {
      value: 72,
      min: 0,
      max: 100,
      label: '사용자 만족도',
      thresholds: [
        { value: 80, color: '#22C55E', label: '우수' },
        { value: 60, color: '#F59E0B', label: '보통' },
        { value: 0, color: '#EF4444', label: '개선 필요' },
      ],
    },
    {
      value: 45,
      min: 0,
      max: 100,
      label: '비용 효율성',
      thresholds: [
        { value: 70, color: '#22C55E', label: '효율' },
        { value: 40, color: '#F59E0B', label: '보통' },
        { value: 0, color: '#EF4444', label: '비효율' },
      ],
    },
  ]
}

export function exportChart(
  chartId: string,
  format: 'png' | 'svg' | 'pdf',
): { url: string; fileName: string } {
  return { url: `#mock-chart-${chartId}.${format}`, fileName: `chart-${chartId}.${format}` }
}
