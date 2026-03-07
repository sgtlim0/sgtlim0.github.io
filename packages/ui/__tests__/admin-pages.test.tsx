import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'

// ── Mock: analyticsService ──────────────────────────────────────────
vi.mock('../src/admin/services/analyticsService', () => ({
  getMockAnalyticsData: vi.fn().mockResolvedValue({
    apiCalls: [
      { date: '2026-03-01', value: 100 },
      { date: '2026-03-02', value: 120 },
      { date: '2026-03-03', value: 110 },
    ],
    tokenUsage: [{ date: '2026-03-01', value: 5000 }],
    activeUsers: [{ date: '2026-03-01', value: 42 }],
    costData: [{ date: '2026-03-01', value: 3200 }],
  }),
  detectAnomalies: vi
    .fn()
    .mockReturnValue([
      {
        date: '2026-03-02',
        value: 120,
        expected: 105,
        zscore: 2.1,
        isAnomaly: true,
        type: 'spike',
      },
    ]),
  predictFuture: vi.fn().mockReturnValue([{ date: '2026-03-08', predicted: 130 }]),
  generateInsights: vi.fn().mockReturnValue([
    {
      id: 'ins-1',
      title: 'API 호출 급증',
      description: '전주 대비 20% 증가',
      severity: 'warning',
      suggestion: '스케일 아웃 권장',
    },
  ]),
}))

// ── Mock: ragService ────────────────────────────────────────────────
vi.mock('../src/admin/services/ragService', () => ({
  searchDocuments: vi.fn().mockResolvedValue({
    totalResults: 2,
    searchTimeMs: 45,
    model: 'text-embedding-3',
    chunks: [
      {
        id: 'c1',
        documentTitle: 'AI 가이드',
        section: '1.1',
        relevanceScore: 0.95,
        content: 'AI 모델 개요',
      },
      {
        id: 'c2',
        documentTitle: 'API 문서',
        section: '2.3',
        relevanceScore: 0.82,
        content: 'REST API 사용법',
      },
    ],
  }),
  getDocuments: vi.fn().mockResolvedValue([
    { id: 'd1', title: 'AI 가이드', type: 'pdf', chunkCount: 42, status: 'indexed' },
    { id: 'd2', title: 'API 문서', type: 'md', chunkCount: 18, status: 'processing' },
  ]),
}))

// ── Mock: benchmarkService ──────────────────────────────────────────
vi.mock('../src/admin/services/benchmarkService', () => ({
  getLatestResults: vi.fn().mockResolvedValue([
    {
      modelId: 'm1',
      modelName: 'GPT-4o',
      provider: 'OpenAI',
      rank: 1,
      scores: { quality: 95, speed: 88, cost: 72, safety: 91 },
      overallScore: 92,
      costPer1kTokens: 15,
    },
    {
      modelId: 'm2',
      modelName: 'Claude 3',
      provider: 'Anthropic',
      rank: 2,
      scores: { quality: 93, speed: 85, cost: 78, safety: 94 },
      overallScore: 90,
      costPer1kTokens: 12,
    },
  ]),
  getRecommendations: vi.fn().mockResolvedValue([
    { useCase: '번역', recommendedModel: 'Claude 3', reason: '다국어 성능 우수', confidence: 0.92 },
    {
      useCase: '코드 생성',
      recommendedModel: 'GPT-4o',
      reason: '코드 정확도 최고',
      confidence: 0.88,
    },
  ]),
}))

// ── Mock: feedbackService ───────────────────────────────────────────
vi.mock('../src/admin/services/feedbackService', () => ({
  getFeedbackSummary: vi.fn().mockResolvedValue({
    totalFeedback: 1234,
    positiveRate: 0.85,
    avgRating: 4.2,
    byModel: [
      { modelId: 'm1', modelName: 'GPT-4o', avgRating: 4.5, count: 600 },
      { modelId: 'm2', modelName: 'Claude 3', avgRating: 4.3, count: 400 },
    ],
  }),
  getFeedbackABTests: vi.fn().mockResolvedValue([
    {
      id: 'ab1',
      name: '요약 프롬프트 비교',
      status: 'completed',
      promptA: '간결하게 요약',
      promptB: '단계별 요약',
      positiveRateA: 0.72,
      positiveRateB: 0.85,
      winner: 'B',
    },
  ]),
  getPromptTuningSuggestions: vi.fn().mockResolvedValue([
    {
      id: 'sug1',
      originalPrompt: '요약해줘',
      suggestedPrompt: '3문장으로 요약해줘',
      reason: '구체적 지시가 효과적',
      expectedImprovement: 15,
      basedOnFeedbackCount: 200,
    },
  ]),
}))

// ── Mock: alertRuleService ──────────────────────────────────────────
vi.mock('../src/admin/services/alertRuleService', () => ({
  getAlertRules: vi.fn().mockResolvedValue([
    {
      id: 'rule1',
      name: 'API 에러율 초과',
      description: '5분간 에러율 5% 초과',
      severity: 'critical',
      enabled: true,
      triggerCount: 3,
      channels: [{ type: 'slack', target: '#alerts', enabled: true }],
    },
    {
      id: 'rule2',
      name: '비용 한도 임박',
      description: '월 비용 90% 초과',
      severity: 'high',
      enabled: false,
      triggerCount: 0,
      channels: [{ type: 'email', target: 'admin@hchat.ai', enabled: true }],
    },
  ]),
  toggleAlertRule: vi.fn().mockResolvedValue(undefined),
  getAlertHistory: vi.fn().mockResolvedValue([
    {
      id: 'h1',
      ruleName: 'API 에러율 초과',
      status: 'active',
      details: '에러율 7.2%',
      triggeredAt: '2026-03-07T10:00:00Z',
    },
    {
      id: 'h2',
      ruleName: '비용 한도',
      status: 'resolved',
      details: '정상 복구',
      triggeredAt: '2026-03-06T15:00:00Z',
    },
  ]),
  getAlertPresets: vi.fn().mockReturnValue([
    { id: 'p1', name: '기본 모니터링', description: '에러율, 응답시간 등' },
    { id: 'p2', name: '비용 관리', description: '비용 한도, 사용량 알림' },
  ]),
}))

// ── Mock: teamChatService ───────────────────────────────────────────
vi.mock('../src/admin/services/teamChatService', () => ({
  getRooms: vi.fn().mockResolvedValue([
    {
      id: 'room1',
      name: 'AI 개발팀',
      type: 'team',
      unreadCount: 3,
      members: [
        { userId: 'u1', name: '홍길동', status: 'online' },
        { userId: 'u2', name: '김철수', status: 'away' },
      ],
    },
    {
      id: 'room2',
      name: '데이터팀',
      type: 'project',
      unreadCount: 0,
      members: [{ userId: 'u3', name: '이영희', status: 'offline' }],
    },
  ]),
  getMessages: vi.fn().mockResolvedValue([
    {
      id: 'msg1',
      userName: '홍길동',
      content: '안녕하세요',
      type: 'user',
      createdAt: '2026-03-07T09:00:00Z',
      attachments: [],
      reactions: [],
    },
    {
      id: 'msg2',
      userName: 'AI 어시스턴트',
      content: '도움이 필요하신가요?',
      type: 'ai-response',
      createdAt: '2026-03-07T09:01:00Z',
      attachments: [],
      reactions: [{ emoji: '👍', userIds: ['u1'] }],
    },
  ]),
  sendMessage: vi.fn().mockResolvedValue({
    id: 'msg3',
    userName: '나',
    content: '테스트 메시지',
    type: 'user',
    createdAt: '2026-03-07T09:05:00Z',
    attachments: [],
    reactions: [],
  }),
}))

// ── Mock: finetunService ────────────────────────────────────────────
vi.mock('../src/admin/services/finetunService', () => ({
  getDatasets: vi.fn().mockResolvedValue([
    {
      id: 'ds1',
      name: '번역 데이터셋',
      description: '한영 번역 쌍',
      format: 'jsonl',
      rowCount: 50000,
      size: 12000000,
      status: 'ready',
    },
    {
      id: 'ds2',
      name: '요약 데이터셋',
      description: '문서 요약 쌍',
      format: 'csv',
      rowCount: 20000,
      size: 5000000,
      status: 'validating',
    },
  ]),
  getFineTuneJobs: vi.fn().mockResolvedValue([
    {
      id: 'job1',
      name: '번역 모델 v2',
      baseModel: 'GPT-4o-mini',
      status: 'running',
      progress: 65,
      currentEpoch: 2,
      epochs: 3,
      trainingLoss: [0.45, 0.32],
      validationLoss: [0.48, 0.35],
      estimatedCost: 45000,
    },
    {
      id: 'job2',
      name: '요약 모델 v1',
      baseModel: 'Claude 3 Haiku',
      status: 'completed',
      progress: 100,
      currentEpoch: 5,
      epochs: 5,
      trainingLoss: [0.3, 0.2, 0.15],
      validationLoss: [0.32, 0.22, 0.17],
      estimatedCost: 32000,
    },
  ]),
  getEvaluation: vi.fn().mockResolvedValue(null),
}))

// ── Mock: promptVersionService ──────────────────────────────────────
vi.mock('../src/admin/services/promptVersionService', () => ({
  getPromptVersions: vi.fn().mockResolvedValue([
    {
      id: 'p1',
      name: '번역 프롬프트',
      description: '한영 번역용',
      currentVersion: 3,
      activeVersion: 2,
      tags: ['번역', '한영'],
      sharedWith: ['팀A', '팀B'],
      versions: [
        {
          id: 'v1',
          version: 1,
          content: '번역해줘',
          model: 'GPT-4o',
          createdBy: '홍길동',
          changeNote: '초기',
          createdAt: '2026-03-01',
        },
        {
          id: 'v2',
          version: 2,
          content: '한국어를 영어로 번역해줘',
          model: 'GPT-4o',
          createdBy: '김철수',
          changeNote: '개선',
          createdAt: '2026-03-03',
        },
        {
          id: 'v3',
          version: 3,
          content: '한국어를 영어로 자연스럽게 번역해줘',
          model: 'Claude 3',
          createdBy: '이영희',
          changeNote: '자연스러움 강화',
          createdAt: '2026-03-05',
        },
      ],
    },
    {
      id: 'p2',
      name: '요약 프롬프트',
      description: '문서 요약용',
      currentVersion: 2,
      activeVersion: 2,
      tags: ['요약'],
      sharedWith: ['팀A'],
      versions: [
        {
          id: 'v4',
          version: 1,
          content: '요약해줘',
          model: 'GPT-4o',
          createdBy: '홍길동',
          changeNote: '초기',
          createdAt: '2026-03-01',
        },
        {
          id: 'v5',
          version: 2,
          content: '3문장으로 요약해줘',
          model: 'GPT-4o',
          createdBy: '홍길동',
          changeNote: '구체화',
          createdAt: '2026-03-04',
        },
      ],
    },
  ]),
  diffVersions: vi.fn().mockReturnValue([
    { type: 'removed', content: '번역해줘' },
    { type: 'added', content: '한국어를 영어로 번역해줘' },
  ]),
}))

// ── Mock: rbacService ───────────────────────────────────────────────
vi.mock('../src/admin/services/rbacService', () => ({
  getRoles: vi.fn().mockResolvedValue([
    {
      id: 'r1',
      name: '관리자',
      description: '모든 권한',
      isSystem: true,
      permissions: ['p1', 'p2', 'p3'],
      userCount: 3,
    },
    {
      id: 'r2',
      name: '편집자',
      description: '콘텐츠 편집',
      isSystem: false,
      permissions: ['p1'],
      userCount: 12,
    },
    {
      id: 'r3',
      name: '뷰어',
      description: '읽기 전용',
      isSystem: false,
      permissions: [],
      userCount: 50,
    },
  ]),
  getPermissionGroups: vi.fn().mockReturnValue([
    {
      category: '콘텐츠',
      permissions: [
        { id: 'p1', label: '콘텐츠 읽기', description: '문서 열람' },
        { id: 'p2', label: '콘텐츠 편집', description: '문서 수정' },
      ],
    },
    {
      category: '설정',
      permissions: [{ id: 'p3', label: '시스템 설정', description: '시스템 구성 변경' }],
    },
  ]),
}))

// ── Mock: chatAnalyticsService ──────────────────────────────────────
vi.mock('../src/admin/services/chatAnalyticsService', () => ({
  getChatStats: vi.fn().mockResolvedValue({
    totalConversations: 15234,
    totalMessages: 89012,
    avgResponseTime: 1.8,
    peakHour: 14,
  }),
  getTopicClusters: vi.fn().mockResolvedValue([
    { id: 'tc1', name: '번역', percentage: 35, trend: 'up', keywords: ['번역', '한영', '영한'] },
    {
      id: 'tc2',
      name: '코드',
      percentage: 28,
      trend: 'stable',
      keywords: ['코드', 'Python', 'JS'],
    },
  ]),
  getUserBehaviors: vi.fn().mockResolvedValue([
    { feature: '채팅', usageCount: 5000, satisfactionRate: 0.88 },
    { feature: '번역', usageCount: 3200, satisfactionRate: 0.92 },
  ]),
  getHourlyDistribution: vi.fn().mockResolvedValue([
    { hour: 9, count: 120 },
    { hour: 10, count: 180 },
    { hour: 14, count: 200 },
  ]),
  getConversationQuality: vi.fn().mockResolvedValue(null),
}))

// ── Mock: voiceService ──────────────────────────────────────────────
vi.mock('../src/admin/services/voiceService', () => ({
  getVoiceModels: vi.fn().mockResolvedValue([
    { id: 'vm1', name: 'Whisper', type: 'stt', languages: ['ko', 'en'] },
    { id: 'vm2', name: 'TTS-1', type: 'tts', languages: ['ko'] },
    { id: 'vm3', name: 'TTS-HD', type: 'tts', languages: ['ko', 'en'] },
  ]),
  startListening: vi.fn().mockResolvedValue(undefined),
  stopListening: vi.fn().mockResolvedValue({ text: '테스트 음성 인식 결과' }),
  synthesizeSpeech: vi.fn().mockResolvedValue(undefined),
  summarizeMeeting: vi.fn().mockResolvedValue({
    summary: '벤치마크 및 비용 최적화 논의',
    actionItems: ['파인튜닝 진행', '비용 분석'],
    keyDecisions: ['Claude 3 도입'],
    participants: ['홍길동', '김철수', '이영희'],
  }),
  getTTSConfig: vi.fn().mockReturnValue({ voice: 'alloy', speed: 1.0 }),
}))

// ── Mock: knowledgeGraphService ─────────────────────────────────────
vi.mock('../src/admin/services/knowledgeGraphService', () => ({
  getKnowledgeGraph: vi.fn().mockResolvedValue({
    nodes: [
      { id: 'n1', label: 'H Chat', type: 'project', description: 'AI 챗봇 플랫폼' },
      { id: 'n2', label: 'GPT-4', type: 'concept', description: 'OpenAI LLM' },
      { id: 'n3', label: '홍길동', type: 'person', description: '개발팀장' },
    ],
    edges: [
      { source: 'n1', target: 'n2', label: 'uses' },
      { source: 'n3', target: 'n1', label: 'manages' },
    ],
  }),
  searchGraph: vi.fn().mockResolvedValue({
    nodes: [{ id: 'n1', label: 'H Chat', type: 'project', description: 'AI 챗봇' }],
  }),
  extractEntities: vi.fn().mockResolvedValue({
    entities: [
      { name: 'H Chat', type: 'project' },
      { name: 'GPT-4', type: 'concept' },
    ],
  }),
}))

// ── Imports ─────────────────────────────────────────────────────────
import AnalyticsDashboard from '../src/admin/AnalyticsDashboard'
import RAGSearchPage from '../src/admin/RAGSearchPage'
import BenchmarkDashboard from '../src/admin/BenchmarkDashboard'
import FeedbackDashboard from '../src/admin/FeedbackDashboard'
import AlertRuleBuilder from '../src/admin/AlertRuleBuilder'
import TeamChatRoom from '../src/admin/TeamChatRoom'
import FineTuneDashboard from '../src/admin/FineTuneDashboard'
import PromptVersionManager from '../src/admin/PromptVersionManager'
import RBACManager from '../src/admin/RBACManager'
import ChatAnalyticsPage from '../src/admin/ChatAnalyticsPage'
import VoiceInterface from '../src/admin/VoiceInterface'
import KnowledgeGraphView from '../src/admin/KnowledgeGraphView'

// ════════════════════════════════════════════════════════════════════
// 1. AnalyticsDashboard
// ════════════════════════════════════════════════════════════════════
describe('AnalyticsDashboard', () => {
  it('should show loading state initially', () => {
    render(<AnalyticsDashboard />)
    expect(screen.getByText('분석 데이터 로딩 중...')).toBeDefined()
  })

  it('should render header and metric buttons after load', async () => {
    render(<AnalyticsDashboard />)
    await waitFor(() => {
      expect(screen.getByText('분석 엔진')).toBeDefined()
    })
    expect(screen.getByText('API 호출')).toBeDefined()
    expect(screen.getByText('토큰 사용량')).toBeDefined()
    expect(screen.getByText('활성 사용자')).toBeDefined()
    expect(screen.getByText('비용')).toBeDefined()
  })

  it('should render summary cards', async () => {
    render(<AnalyticsDashboard />)
    await waitFor(() => {
      expect(screen.getByText('이상치 감지')).toBeDefined()
    })
    expect(screen.getByText('7일 예측')).toBeDefined()
    expect(screen.getByText('인사이트')).toBeDefined()
  })

  it('should show anomaly section when anomalies exist', async () => {
    render(<AnalyticsDashboard />)
    await waitFor(() => {
      expect(screen.getByText('이상치 감지')).toBeDefined()
    })
    expect(screen.getByText('주의 필요')).toBeDefined()
  })

  it('should render insight list', async () => {
    render(<AnalyticsDashboard />)
    await waitFor(() => {
      expect(screen.getByText('자동 인사이트')).toBeDefined()
    })
    expect(screen.getByText('API 호출 급증')).toBeDefined()
    expect(screen.getByText('warning')).toBeDefined()
  })

  it('should switch metric on button click', async () => {
    render(<AnalyticsDashboard />)
    await waitFor(() => {
      expect(screen.getByText('분석 엔진')).toBeDefined()
    })
    fireEvent.click(screen.getByText('토큰 사용량'))
    // The button should now be selected (metric changed)
    expect(screen.getByText('토큰 사용량')).toBeDefined()
  })
})

// ════════════════════════════════════════════════════════════════════
// 2. RAGSearchPage
// ════════════════════════════════════════════════════════════════════
describe('RAGSearchPage', () => {
  it('should render header and search bar', () => {
    render(<RAGSearchPage />)
    expect(screen.getByText('RAG 문서 검색')).toBeDefined()
    expect(screen.getByLabelText('RAG 검색')).toBeDefined()
    expect(screen.getByText('검색')).toBeDefined()
  })

  it('should render document management button', () => {
    render(<RAGSearchPage />)
    expect(screen.getByText('문서 관리')).toBeDefined()
  })

  it('should perform search and display results', async () => {
    render(<RAGSearchPage />)
    const input = screen.getByLabelText('RAG 검색')
    fireEvent.change(input, { target: { value: 'AI 모델' } })
    fireEvent.click(screen.getByText('검색'))

    await waitFor(() => {
      expect(screen.getByText('2건', { exact: false })).toBeDefined()
    })
    expect(screen.getByText('AI 가이드')).toBeDefined()
    expect(screen.getByText('API 문서')).toBeDefined()
    expect(screen.getByText('95% 관련')).toBeDefined()
  })

  it('should load documents on manage click', async () => {
    render(<RAGSearchPage />)
    fireEvent.click(screen.getByText('문서 관리'))

    await waitFor(() => {
      expect(screen.getByText('인덱싱된 문서 (2개)')).toBeDefined()
    })
    expect(screen.getByText('문서명')).toBeDefined()
  })

  it('should disable search button when input is empty', () => {
    render(<RAGSearchPage />)
    const btn = screen.getByText('검색')
    expect(btn.hasAttribute('disabled')).toBe(true)
  })
})

// ════════════════════════════════════════════════════════════════════
// 3. BenchmarkDashboard
// ════════════════════════════════════════════════════════════════════
describe('BenchmarkDashboard', () => {
  it('should show loading initially', () => {
    render(<BenchmarkDashboard />)
    expect(screen.getByText('벤치마크 로딩 중...')).toBeDefined()
  })

  it('should render header and model count', async () => {
    render(<BenchmarkDashboard />)
    await waitFor(() => {
      expect(screen.getByText('AI 모델 벤치마크')).toBeDefined()
    })
    expect(screen.getByText('2개 모델 비교 | 4개 카테고리')).toBeDefined()
  })

  it('should render ranking table with models', async () => {
    render(<BenchmarkDashboard />)
    await waitFor(() => {
      expect(screen.getAllByText('GPT-4o').length).toBeGreaterThanOrEqual(1)
    })
    expect(screen.getAllByText('Claude 3').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('#1')).toBeDefined()
    expect(screen.getByText('#2')).toBeDefined()
  })

  it('should render table headers', async () => {
    render(<BenchmarkDashboard />)
    await waitFor(() => {
      expect(screen.getByText('순위')).toBeDefined()
    })
    expect(screen.getByText('모델')).toBeDefined()
    expect(screen.getByText('품질')).toBeDefined()
    expect(screen.getByText('속도')).toBeDefined()
    expect(screen.getByText('안전')).toBeDefined()
    expect(screen.getByText('종합')).toBeDefined()
  })

  it('should render recommendations', async () => {
    render(<BenchmarkDashboard />)
    await waitFor(() => {
      expect(screen.getByText('용도별 추천')).toBeDefined()
    })
    expect(screen.getByText('번역')).toBeDefined()
    expect(screen.getByText('코드 생성')).toBeDefined()
    expect(screen.getByText('92%')).toBeDefined()
  })
})

// ════════════════════════════════════════════════════════════════════
// 4. FeedbackDashboard
// ════════════════════════════════════════════════════════════════════
describe('FeedbackDashboard', () => {
  it('should show loading initially', () => {
    render(<FeedbackDashboard />)
    expect(screen.getByText('피드백 로딩 중...')).toBeDefined()
  })

  it('should render header and period buttons', async () => {
    render(<FeedbackDashboard />)
    await waitFor(() => {
      expect(screen.getByText('피드백 대시보드')).toBeDefined()
    })
    expect(screen.getByText('7일')).toBeDefined()
    expect(screen.getByText('30일')).toBeDefined()
  })

  it('should render summary cards', async () => {
    render(<FeedbackDashboard />)
    await waitFor(() => {
      expect(screen.getByText('총 피드백')).toBeDefined()
    })
    expect(screen.getByText('1,234')).toBeDefined()
    expect(screen.getByText('긍정률')).toBeDefined()
    expect(screen.getAllByText('85%').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('평균 평점')).toBeDefined()
  })

  it('should render model breakdown', async () => {
    render(<FeedbackDashboard />)
    await waitFor(() => {
      expect(screen.getByText('모델별 평점')).toBeDefined()
    })
    expect(screen.getByText('600건')).toBeDefined()
    expect(screen.getByText('400건')).toBeDefined()
  })

  it('should render A/B tests section', async () => {
    render(<FeedbackDashboard />)
    await waitFor(() => {
      expect(screen.getByText('A/B 테스트')).toBeDefined()
    })
    expect(screen.getByText('요약 프롬프트 비교')).toBeDefined()
    expect(screen.getByText('완료')).toBeDefined()
  })

  it('should render prompt tuning suggestions', async () => {
    render(<FeedbackDashboard />)
    await waitFor(() => {
      expect(screen.getByText('프롬프트 튜닝 제안')).toBeDefined()
    })
    expect(screen.getByText('제안: 3문장으로 요약해줘')).toBeDefined()
  })
})

// ════════════════════════════════════════════════════════════════════
// 5. AlertRuleBuilder
// ════════════════════════════════════════════════════════════════════
describe('AlertRuleBuilder', () => {
  it('should show loading initially', () => {
    render(<AlertRuleBuilder />)
    expect(screen.getByText('알림 규칙 로딩 중...')).toBeDefined()
  })

  it('should render header with rule count', async () => {
    render(<AlertRuleBuilder />)
    await waitFor(() => {
      expect(screen.getByText('알림 규칙 엔진')).toBeDefined()
    })
    expect(screen.getByText('2개 규칙 | 1건 활성 알림')).toBeDefined()
  })

  it('should render rules with toggle switches', async () => {
    render(<AlertRuleBuilder />)
    await waitFor(() => {
      expect(screen.getAllByText('API 에러율 초과').length).toBeGreaterThanOrEqual(1)
    })
    expect(screen.getByText('비용 한도 임박')).toBeDefined()
    const switches = screen.getAllByRole('switch')
    expect(switches.length).toBe(2)
    expect(switches[0].getAttribute('aria-checked')).toBe('true')
    expect(switches[1].getAttribute('aria-checked')).toBe('false')
  })

  it('should render severity badges', async () => {
    render(<AlertRuleBuilder />)
    await waitFor(() => {
      expect(screen.getByText('critical')).toBeDefined()
    })
    expect(screen.getByText('high')).toBeDefined()
  })

  it('should render alert history', async () => {
    render(<AlertRuleBuilder />)
    await waitFor(() => {
      expect(screen.getByText('알림 히스토리')).toBeDefined()
    })
    expect(screen.getByText('active')).toBeDefined()
    expect(screen.getByText('resolved')).toBeDefined()
  })

  it('should render preset templates', async () => {
    render(<AlertRuleBuilder />)
    await waitFor(() => {
      expect(screen.getByText('프리셋 템플릿')).toBeDefined()
    })
    expect(screen.getByText('기본 모니터링')).toBeDefined()
    expect(screen.getByText('비용 관리')).toBeDefined()
  })
})

// ════════════════════════════════════════════════════════════════════
// 6. TeamChatRoom
// ════════════════════════════════════════════════════════════════════
describe('TeamChatRoom', () => {
  it('should show loading initially', () => {
    render(<TeamChatRoom />)
    expect(screen.getByText('채팅 로딩 중...')).toBeDefined()
  })

  it('should render room list', async () => {
    render(<TeamChatRoom />)
    await waitFor(() => {
      expect(screen.getByText('팀 채팅')).toBeDefined()
    })
    expect(screen.getAllByText('AI 개발팀').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('데이터팀')).toBeDefined()
    expect(screen.getByText('2개 채팅방')).toBeDefined()
  })

  it('should show unread badge for rooms', async () => {
    render(<TeamChatRoom />)
    await waitFor(() => {
      expect(screen.getByText('3')).toBeDefined()
    })
  })

  it('should render messages for active room', async () => {
    render(<TeamChatRoom />)
    await waitFor(() => {
      expect(screen.getByText('안녕하세요')).toBeDefined()
    })
    expect(screen.getByText('도움이 필요하신가요?')).toBeDefined()
  })

  it('should show AI badge on ai-response messages', async () => {
    render(<TeamChatRoom />)
    await waitFor(() => {
      expect(screen.getByText('AI')).toBeDefined()
    })
  })

  it('should render chat input with send button', async () => {
    render(<TeamChatRoom />)
    await waitFor(() => {
      expect(screen.getByLabelText('채팅 메시지')).toBeDefined()
    })
    expect(screen.getByText('전송')).toBeDefined()
  })

  it('should disable send button when input is empty', async () => {
    render(<TeamChatRoom />)
    await waitFor(() => {
      expect(screen.getByText('전송')).toBeDefined()
    })
    expect(screen.getByText('전송').hasAttribute('disabled')).toBe(true)
  })
})

// ════════════════════════════════════════════════════════════════════
// 7. FineTuneDashboard
// ════════════════════════════════════════════════════════════════════
describe('FineTuneDashboard', () => {
  it('should show loading initially', () => {
    render(<FineTuneDashboard />)
    expect(screen.getByText('파인튜닝 로딩 중...')).toBeDefined()
  })

  it('should render header with counts', async () => {
    render(<FineTuneDashboard />)
    await waitFor(() => {
      expect(screen.getByText('AI 모델 파인튜닝')).toBeDefined()
    })
    expect(screen.getByText('2개 데이터셋 | 2개 학습 작업')).toBeDefined()
  })

  it('should render training jobs', async () => {
    render(<FineTuneDashboard />)
    await waitFor(() => {
      expect(screen.getByText('학습 작업')).toBeDefined()
    })
    expect(screen.getByText('번역 모델 v2')).toBeDefined()
    expect(screen.getByText('(GPT-4o-mini)')).toBeDefined()
    expect(screen.getByText('요약 모델 v1')).toBeDefined()
    expect(screen.getByText('running')).toBeDefined()
    expect(screen.getByText('completed')).toBeDefined()
  })

  it('should render progress percentage', async () => {
    render(<FineTuneDashboard />)
    await waitFor(() => {
      expect(screen.getByText('65%')).toBeDefined()
    })
    expect(screen.getByText('100%')).toBeDefined()
  })

  it('should render dataset table', async () => {
    render(<FineTuneDashboard />)
    await waitFor(() => {
      expect(screen.getByText('학습 데이터셋')).toBeDefined()
    })
    expect(screen.getByText('번역 데이터셋')).toBeDefined()
    expect(screen.getByText('요약 데이터셋')).toBeDefined()
    expect(screen.getByText('ready')).toBeDefined()
    expect(screen.getByText('validating')).toBeDefined()
  })

  it('should render dataset table headers', async () => {
    render(<FineTuneDashboard />)
    await waitFor(() => {
      expect(screen.getByText('이름')).toBeDefined()
    })
    expect(screen.getByText('형식')).toBeDefined()
    expect(screen.getByText('행 수')).toBeDefined()
    expect(screen.getByText('크기')).toBeDefined()
  })
})

// ════════════════════════════════════════════════════════════════════
// 8. PromptVersionManager
// ════════════════════════════════════════════════════════════════════
describe('PromptVersionManager', () => {
  it('should show loading initially', () => {
    render(<PromptVersionManager />)
    expect(screen.getByText('프롬프트 로딩 중...')).toBeDefined()
  })

  it('should render header with prompt count', async () => {
    render(<PromptVersionManager />)
    await waitFor(() => {
      expect(screen.getByText('프롬프트 버전 관리')).toBeDefined()
    })
    expect(screen.getByText('2개 프롬프트')).toBeDefined()
  })

  it('should render prompt cards', async () => {
    render(<PromptVersionManager />)
    await waitFor(() => {
      expect(screen.getByText('번역 프롬프트')).toBeDefined()
    })
    expect(screen.getByText('요약 프롬프트')).toBeDefined()
    expect(screen.getByText('v3')).toBeDefined()
    expect(screen.getByText('v2')).toBeDefined()
  })

  it('should render tags', async () => {
    render(<PromptVersionManager />)
    await waitFor(() => {
      expect(screen.getByText('번역')).toBeDefined()
    })
    expect(screen.getByText('한영')).toBeDefined()
    expect(screen.getByText('요약')).toBeDefined()
  })

  it('should show version history on prompt click', async () => {
    render(<PromptVersionManager />)
    await waitFor(() => {
      expect(screen.getByText('번역 프롬프트')).toBeDefined()
    })
    fireEvent.click(screen.getByText('번역 프롬프트'))
    expect(screen.getByText('번역 프롬프트 — 버전 히스토리')).toBeDefined()
    expect(screen.getByText('활성')).toBeDefined()
  })

  it('should show diff when A and B versions selected', async () => {
    render(<PromptVersionManager />)
    await waitFor(() => {
      expect(screen.getByText('번역 프롬프트')).toBeDefined()
    })
    fireEvent.click(screen.getByText('번역 프롬프트'))

    // Select version A and B buttons
    const aButtons = screen.getAllByText('A')
    const bButtons = screen.getAllByText('B')
    fireEvent.click(aButtons[0]) // v1
    fireEvent.click(bButtons[1]) // v2

    await waitFor(() => {
      expect(screen.getByText('v1 → v2 Diff')).toBeDefined()
    })
  })
})

// ════════════════════════════════════════════════════════════════════
// 9. RBACManager
// ════════════════════════════════════════════════════════════════════
describe('RBACManager', () => {
  it('should show loading initially', () => {
    render(<RBACManager />)
    expect(screen.getByText('권한 로딩 중...')).toBeDefined()
  })

  it('should render header with role and permission counts', async () => {
    render(<RBACManager />)
    await waitFor(() => {
      expect(screen.getByText('역할 및 권한 관리 (RBAC)')).toBeDefined()
    })
    expect(screen.getByText('3개 역할 | 3개 권한')).toBeDefined()
  })

  it('should render role cards', async () => {
    render(<RBACManager />)
    await waitFor(() => {
      expect(screen.getByText('관리자')).toBeDefined()
    })
    expect(screen.getByText('편집자')).toBeDefined()
    expect(screen.getByText('뷰어')).toBeDefined()
    expect(screen.getByText('시스템')).toBeDefined()
  })

  it('should render user counts in role cards', async () => {
    render(<RBACManager />)
    await waitFor(() => {
      expect(screen.getByText('3명')).toBeDefined()
    })
    expect(screen.getByText('12명')).toBeDefined()
    expect(screen.getByText('50명')).toBeDefined()
  })

  it('should show permission matrix on role click', async () => {
    render(<RBACManager />)
    await waitFor(() => {
      expect(screen.getByText('관리자')).toBeDefined()
    })
    fireEvent.click(screen.getByText('관리자'))

    expect(screen.getByText('관리자 — 권한 매트릭스')).toBeDefined()
    expect(screen.getByText('콘텐츠')).toBeDefined()
    expect(screen.getByText('설정')).toBeDefined()
    expect(screen.getByText('콘텐츠 읽기')).toBeDefined()
    expect(screen.getByText('시스템 설정')).toBeDefined()
  })
})

// ════════════════════════════════════════════════════════════════════
// 10. ChatAnalyticsPage
// ════════════════════════════════════════════════════════════════════
describe('ChatAnalyticsPage', () => {
  it('should show loading initially', () => {
    render(<ChatAnalyticsPage />)
    expect(screen.getByText('채팅 분석 로딩 중...')).toBeDefined()
  })

  it('should render header and period buttons', async () => {
    render(<ChatAnalyticsPage />)
    await waitFor(() => {
      expect(screen.getByText('채팅 히스토리 분석')).toBeDefined()
    })
    expect(screen.getByText('7일')).toBeDefined()
    expect(screen.getByText('30일')).toBeDefined()
    expect(screen.getByText('90일')).toBeDefined()
  })

  it('should render KPI cards', async () => {
    render(<ChatAnalyticsPage />)
    await waitFor(() => {
      expect(screen.getByText('총 대화')).toBeDefined()
    })
    expect(screen.getByText('15,234')).toBeDefined()
    expect(screen.getByText('총 메시지')).toBeDefined()
    expect(screen.getByText('89,012')).toBeDefined()
    expect(screen.getByText('1.8초')).toBeDefined()
    expect(screen.getByText('14시')).toBeDefined()
  })

  it('should render topic clusters', async () => {
    render(<ChatAnalyticsPage />)
    await waitFor(() => {
      expect(screen.getByText('주제 클러스터')).toBeDefined()
    })
    expect(screen.getByText('35%')).toBeDefined()
    expect(screen.getByText('28%')).toBeDefined()
  })

  it('should render hourly distribution section', async () => {
    render(<ChatAnalyticsPage />)
    await waitFor(() => {
      expect(screen.getByText('시간대별 분포')).toBeDefined()
    })
  })

  it('should render user behavior patterns', async () => {
    render(<ChatAnalyticsPage />)
    await waitFor(() => {
      expect(screen.getByText('기능별 사용 패턴')).toBeDefined()
    })
    expect(screen.getByText('채팅')).toBeDefined()
  })
})

// ════════════════════════════════════════════════════════════════════
// 11. VoiceInterface
// ════════════════════════════════════════════════════════════════════
describe('VoiceInterface', () => {
  it('should show loading initially', () => {
    render(<VoiceInterface />)
    expect(screen.getByText('음성 모듈 로딩 중...')).toBeDefined()
  })

  it('should render header with model counts', async () => {
    render(<VoiceInterface />)
    await waitFor(() => {
      expect(screen.getByText('음성 인터페이스')).toBeDefined()
    })
    expect(screen.getByText('STT 1개 | TTS 2개 모델')).toBeDefined()
  })

  it('should render STT section', async () => {
    render(<VoiceInterface />)
    await waitFor(() => {
      expect(screen.getByText('음성 → 텍스트 (STT)')).toBeDefined()
    })
  })

  it('should render TTS section', async () => {
    render(<VoiceInterface />)
    await waitFor(() => {
      expect(screen.getByText('텍스트 → 음성 (TTS)')).toBeDefined()
    })
  })

  it('should render meeting summary section', async () => {
    render(<VoiceInterface />)
    await waitFor(() => {
      expect(screen.getByText('회의 요약')).toBeDefined()
    })
    expect(screen.getByText('데모 회의 요약')).toBeDefined()
  })

  it('should show model names', async () => {
    render(<VoiceInterface />)
    await waitFor(() => {
      expect(screen.getByText('모델: Whisper', { exact: false })).toBeDefined()
    })
  })
})

// ════════════════════════════════════════════════════════════════════
// 12. KnowledgeGraphView
// ════════════════════════════════════════════════════════════════════
describe('KnowledgeGraphView', () => {
  it('should show loading initially', () => {
    render(<KnowledgeGraphView />)
    expect(screen.getByText('지식 그래프 로딩 중...')).toBeDefined()
  })

  it('should render header with node/edge counts', async () => {
    render(<KnowledgeGraphView />)
    await waitFor(() => {
      expect(screen.getByText('지식 그래프')).toBeDefined()
    })
    expect(screen.getByText('3개 노드, 2개 관계')).toBeDefined()
  })

  it('should render search input', async () => {
    render(<KnowledgeGraphView />)
    await waitFor(() => {
      expect(screen.getByLabelText('그래프 검색')).toBeDefined()
    })
  })

  it('should render graph nodes', async () => {
    render(<KnowledgeGraphView />)
    await waitFor(() => {
      expect(screen.getByText('H Chat')).toBeDefined()
    })
    expect(screen.getByText('GPT-4')).toBeDefined()
    expect(screen.getByText('홍길동')).toBeDefined()
  })

  it('should show node detail on click', async () => {
    render(<KnowledgeGraphView />)
    await waitFor(() => {
      expect(screen.getByText('H Chat')).toBeDefined()
    })
    fireEvent.click(screen.getByText('H Chat'))
    expect(screen.getByText('AI 챗봇 플랫폼')).toBeDefined()
    // 'project' appears in legend and node detail, so use getAllByText
    expect(screen.getAllByText('project').length).toBeGreaterThanOrEqual(2)
  })

  it('should render NER extraction section', async () => {
    render(<KnowledgeGraphView />)
    await waitFor(() => {
      expect(screen.getByText('NER 엔티티 추출')).toBeDefined()
    })
    expect(screen.getByText('추출')).toBeDefined()
  })

  it('should render legend with node types', async () => {
    render(<KnowledgeGraphView />)
    await waitFor(() => {
      expect(screen.getByText('concept')).toBeDefined()
    })
    expect(screen.getByText('person')).toBeDefined()
    expect(screen.getByText('document')).toBeDefined()
    expect(screen.getByText('tag')).toBeDefined()
  })
})
