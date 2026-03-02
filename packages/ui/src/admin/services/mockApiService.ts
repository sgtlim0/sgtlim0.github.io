/**
 * Mock API Service Implementation
 *
 * This service provides mock data for development and testing.
 * All methods return Promises that resolve after a small delay to simulate network latency.
 */

import type { AdminApiService } from './apiService';
import type {
  DashboardSummary,
  UsageRecord,
  StatisticsData,
  User,
  AdminSettings,
  ProviderInfo,
  IncidentLog,
  ModelDef,
  MonthlyCost,
  FeatureUsageData,
  WeeklyTrend,
  AdoptionRate,
  PromptTemplate,
  PromptCategory,
  AgentInfo,
  AgentLog,
  DailyTrend,
} from './types';

// Simulate network delay
const delay = (ms: number = 100) => new Promise((resolve) => setTimeout(resolve, ms));

// ============= Mock Data =============

const DASHBOARD_SUMMARY: DashboardSummary = {
  stats: [
    { label: '총 대화 수', value: '1,247' },
    { label: '총 토큰 사용량', value: '2.4M' },
    { label: '활성 사용자', value: '38' },
    { label: '이번 달 비용', value: '₩127K' },
  ],
  recentUsage: [
    { date: '2026-03-02', user: 'user01', type: 'AI 채팅', model: 'Claude 3.5', tokens: '2,450', cost: '₩12', status: 'success' },
    { date: '2026-03-02', user: 'user03', type: '그룹 채팅', model: 'GPT-4', tokens: '8,900', cost: '₩45', status: 'success' },
    { date: '2026-03-01', user: 'user02', type: '도구 사용', model: 'Gemini', tokens: '1,200', cost: '₩6', status: 'error' },
  ],
  modelUsage: [
    { label: 'Claude 3.5', value: 45, color: 'bg-admin-teal' },
    { label: 'GPT-4', value: 30, color: 'bg-admin-blue' },
    { label: 'Gemini', value: 15, color: 'bg-admin-accent' },
    { label: '기타', value: 10, color: 'bg-admin-green' },
  ],
};

const ALL_USAGE_RECORDS: UsageRecord[] = [
  { date: '2026-03-02', user: 'user01', type: 'AI 채팅', model: 'Claude 3.5', tokens: '2,450', cost: '₩12', status: 'success' },
  { date: '2026-03-02', user: 'user03', type: '그룹 채팅', model: 'GPT-4', tokens: '8,900', cost: '₩45', status: 'success' },
  { date: '2026-03-01', user: 'user02', type: '도구 사용', model: 'Gemini', tokens: '1,200', cost: '₩6', status: 'error' },
  { date: '2026-03-01', user: 'user05', type: 'AI 채팅', model: 'Claude 3.5', tokens: '5,300', cost: '₩27', status: 'success' },
  { date: '2026-02-28', user: 'user04', type: '그룹 채팅', model: 'GPT-4', tokens: '4,200', cost: '₩21', status: 'success' },
  { date: '2026-02-28', user: 'user01', type: 'AI 채팅', model: 'Claude 3.5', tokens: '3,100', cost: '₩16', status: 'pending' },
];

const STATISTICS_DATA: StatisticsData = {
  monthlySummary: [
    { label: '이번 달 총 토큰', value: '892K', trend: '12% 증가', trendUp: true },
    { label: '이번 달 총 비용', value: '₩47K', trend: '8% 증가', trendUp: true },
  ],
  monthlyTrend: [
    { month: '10월', tokens: 320, cost: 160 },
    { month: '11월', tokens: 480, cost: 240 },
    { month: '12월', tokens: 640, cost: 320 },
    { month: '1월', tokens: 720, cost: 360 },
    { month: '2월', tokens: 640, cost: 320 },
    { month: '3월', tokens: 892, cost: 470 },
  ],
  modelBreakdown: [
    { label: 'Claude 3.5', value: 55, color: 'bg-admin-teal' },
    { label: 'GPT-4', value: 30, color: 'bg-admin-blue' },
    { label: 'Gemini', value: 10, color: 'bg-admin-accent' },
    { label: '기타', value: 5, color: 'bg-admin-green' },
  ],
  topUsers: [
    { name: '김철수', tokens: '125,000' },
    { name: '이영희', tokens: '98,400' },
    { name: '박민수', tokens: '87,200' },
    { name: '최수진', tokens: '65,800' },
    { name: '김민호', tokens: '54,100' },
  ],
};

const USERS: User[] = [
  { name: '김철수', userId: 'user01', department: 'AI혁신팀', totalConversations: 245, monthlyTokens: '125,000', status: 'active' },
  { name: '이영희', userId: 'user02', department: '개발팀', totalConversations: 189, monthlyTokens: '98,400', status: 'active' },
  { name: '박민수', userId: 'user03', department: '디자인팀', totalConversations: 156, monthlyTokens: '67,200', status: 'active' },
  { name: '최수진', userId: 'user04', department: '마케팅팀', totalConversations: 12, monthlyTokens: '3,200', status: 'inactive' },
  { name: '정대호', userId: 'user05', department: '기획팀', totalConversations: 203, monthlyTokens: '87,600', status: 'active' },
  { name: '한지민', userId: 'user06', department: '인사팀', totalConversations: 89, monthlyTokens: '45,100', status: 'active' },
];

const SETTINGS: AdminSettings = {
  systemName: 'H Chat v3',
  defaultLanguage: '한국어',
  models: [
    { label: 'Claude 3.5 Sonnet', limit: '100,000', enabled: true },
    { label: 'GPT-4o', limit: '50,000', enabled: true },
    { label: 'Gemini Pro 1.5', limit: '80,000', enabled: true },
    { label: 'Claude Haiku 4.5', limit: '200,000', enabled: true },
    { label: 'GPT-4o mini', limit: '300,000', enabled: true },
  ],
  monthlyBudget: '$500.00',
  warningThreshold: '80%',
  dailyTokenLimit: '1,000,000',
};

const PROVIDERS: ProviderInfo[] = [
  {
    name: 'Amazon Bedrock',
    status: 'online',
    latency: '120ms',
    uptime: '99.97%',
    models: ['Claude 3.5 Sonnet', 'Claude 3 Haiku', 'Claude 3 Opus'],
    lastChecked: '2분 전',
    region: 'ap-northeast-2',
  },
  {
    name: 'OpenAI',
    status: 'online',
    latency: '180ms',
    uptime: '99.91%',
    models: ['GPT-4o', 'GPT-4o-mini', 'GPT-4 Turbo'],
    lastChecked: '1분 전',
    region: 'US East',
  },
  {
    name: 'Google Gemini',
    status: 'degraded',
    latency: '350ms',
    uptime: '99.82%',
    models: ['Gemini 1.5 Pro', 'Gemini 1.5 Flash'],
    lastChecked: '3분 전',
    region: 'asia-northeast3',
  },
];

const INCIDENT_LOG: IncidentLog[] = [
  { time: '2026-03-03 14:22', provider: 'Google Gemini', event: '응답 지연 발생 (>500ms)', severity: 'warning' },
  { time: '2026-03-03 09:15', provider: 'Amazon Bedrock', event: '정상 복구', severity: 'success' },
  { time: '2026-03-02 22:40', provider: 'Amazon Bedrock', event: '일시적 타임아웃 (5건)', severity: 'warning' },
  { time: '2026-03-01 16:00', provider: 'OpenAI', event: 'Rate limit 임계치 도달 (80%)', severity: 'info' },
];

const MODELS: ModelDef[] = [
  { id: '1', provider: 'Bedrock', name: 'Claude 3.5 Sonnet', label: 'Claude 3.5 Sonnet', contextWindow: '200K', inputCost: '$3.00', outputCost: '$15.00', tier: 'premium', popular: true },
  { id: '2', provider: 'Bedrock', name: 'Claude 3 Opus', label: 'Claude 3 Opus', contextWindow: '200K', inputCost: '$15.00', outputCost: '$75.00', tier: 'premium', popular: false },
  { id: '3', provider: 'Bedrock', name: 'Claude 3 Haiku', label: 'Claude 3 Haiku', contextWindow: '200K', inputCost: '$0.25', outputCost: '$1.25', tier: 'economy', popular: true },
  { id: '4', provider: 'OpenAI', name: 'GPT-4o', label: 'GPT-4o', contextWindow: '128K', inputCost: '$2.50', outputCost: '$10.00', tier: 'premium', popular: true },
  { id: '5', provider: 'OpenAI', name: 'GPT-4o-mini', label: 'GPT-4o-mini', contextWindow: '128K', inputCost: '$0.15', outputCost: '$0.60', tier: 'economy', popular: true },
  { id: '6', provider: 'OpenAI', name: 'GPT-4 Turbo', label: 'GPT-4 Turbo', contextWindow: '128K', inputCost: '$10.00', outputCost: '$30.00', tier: 'premium', popular: false },
  { id: '7', provider: 'Google', name: 'Gemini 1.5 Pro', label: 'Gemini 1.5 Pro', contextWindow: '2M', inputCost: '$1.25', outputCost: '$5.00', tier: 'standard', popular: true },
  { id: '8', provider: 'Google', name: 'Gemini 1.5 Flash', label: 'Gemini 1.5 Flash', contextWindow: '1M', inputCost: '$0.075', outputCost: '$0.30', tier: 'economy', popular: false },
];

const MONTHLY_COSTS: MonthlyCost[] = [
  { month: '2025.09', bedrock: 8.2, openai: 5.1, google: 2.4 },
  { month: '2025.10', bedrock: 10.5, openai: 6.3, google: 3.1 },
  { month: '2025.11', bedrock: 12.8, openai: 7.5, google: 3.8 },
  { month: '2025.12', bedrock: 14.2, openai: 8.1, google: 4.2 },
  { month: '2026.01', bedrock: 15.8, openai: 8.9, google: 4.8 },
  { month: '2026.02', bedrock: 15.2, openai: 12.1, google: 5.8 },
];

const FEATURES: FeatureUsageData[] = [
  { name: 'Chat', monthlyUsage: '19.0K', changePercent: '+8.5%', changeUp: true, activeUsers: '1,245', avgResponseTime: '1.2초', satisfaction: '4.7/5.0', usagePercentage: 42 },
  { name: 'Group Chat', monthlyUsage: '8.3K', changePercent: '+15.2%', changeUp: true, activeUsers: '542', avgResponseTime: '1.8초', satisfaction: '4.5/5.0', usagePercentage: 18 },
  { name: 'Tool Use', monthlyUsage: '7.1K', changePercent: '+22.1%', changeUp: true, activeUsers: '438', avgResponseTime: '2.4초', satisfaction: '4.6/5.0', usagePercentage: 16 },
  { name: 'Agent', monthlyUsage: '5.8K', changePercent: '+18.3%', changeUp: true, activeUsers: '321', avgResponseTime: '3.2초', satisfaction: '4.4/5.0', usagePercentage: 13 },
  { name: 'Debate', monthlyUsage: '3.2K', changePercent: '-5.2%', changeUp: false, activeUsers: '198', avgResponseTime: '4.1초', satisfaction: '4.2/5.0', usagePercentage: 7 },
  { name: 'Report', monthlyUsage: '1.8K', changePercent: '+12.4%', changeUp: true, activeUsers: '124', avgResponseTime: '5.3초', satisfaction: '4.3/5.0', usagePercentage: 4 },
];

const WEEKLY_TREND: WeeklyTrend[] = [
  { week: 'W1', chat: 4.2, groupChat: 1.8, toolUse: 1.5, agent: 1.2, debate: 0.7, report: 0.4 },
  { week: 'W2', chat: 4.5, groupChat: 1.9, toolUse: 1.6, agent: 1.3, debate: 0.8, report: 0.4 },
  { week: 'W3', chat: 4.8, groupChat: 2.1, toolUse: 1.8, agent: 1.4, debate: 0.8, report: 0.5 },
  { week: 'W4', chat: 5.5, groupChat: 2.5, toolUse: 2.2, agent: 1.9, debate: 0.9, report: 0.5 },
];

const ADOPTION_RATE: AdoptionRate[] = [
  { name: 'Chat', rate: 89, color: 'bg-admin-teal' },
  { name: 'Group Chat', rate: 42, color: 'bg-[#3B82F6]' },
  { name: 'Tool Use', rate: 35, color: 'bg-[#8B5CF6]' },
  { name: 'Agent', rate: 28, color: 'bg-[#F59E0B]' },
  { name: 'Debate', rate: 18, color: 'bg-[#EF4444]' },
  { name: 'Report', rate: 12, color: 'bg-[#10B981]' },
];

const PROMPTS: PromptTemplate[] = [
  {
    id: '1',
    title: '회의록 작성 도우미',
    description: '회의 내용을 체계적으로 정리하고 액션 아이템을 추출합니다.',
    category: '업무',
    author: '김민수',
    usageCount: 342,
    rating: 4.5,
    tags: ['회의', '문서작성', '요약'],
  },
  {
    id: '2',
    title: '코드 리뷰 가이드',
    description: 'Pull Request를 분석하고 개선점과 보안 이슈를 찾아냅니다.',
    category: '개발',
    author: '박지원',
    usageCount: 278,
    rating: 4.8,
    tags: ['코드리뷰', 'PR', '보안'],
  },
  {
    id: '3',
    title: '마케팅 카피 생성기',
    description: '제품 특징을 바탕으로 매력적인 마케팅 문구를 생성합니다.',
    category: '마케팅',
    author: '이서연',
    usageCount: 195,
    rating: 4.2,
    tags: ['카피라이팅', '광고', 'SNS'],
  },
  {
    id: '4',
    title: '데이터 인사이트 추출',
    description: 'CSV 데이터를 분석하여 핵심 트렌드와 패턴을 찾아냅니다.',
    category: '분석',
    author: '정현우',
    usageCount: 156,
    rating: 4.6,
    tags: ['데이터분석', '통계', '시각화'],
  },
  {
    id: '5',
    title: '이메일 자동 답변',
    description: '고객 문의 이메일을 분석하고 적절한 답변 초안을 작성합니다.',
    category: '업무',
    author: '최유진',
    usageCount: 203,
    rating: 4.1,
    tags: ['이메일', '고객응대', 'CS'],
  },
  {
    id: '6',
    title: 'SQL 쿼리 최적화',
    description: '복잡한 SQL 쿼리를 분석하고 성능 개선 방안을 제안합니다.',
    category: '개발',
    author: '강태희',
    usageCount: 124,
    rating: 4.4,
    tags: ['SQL', '데이터베이스', '성능'],
  },
];

const AGENTS: AgentInfo[] = [
  {
    name: 'Code Reviewer',
    status: 'running',
    lastRun: '2분 전',
    totalExecutions: 1247,
    successRate: '98.5%',
  },
  {
    name: 'TDD Guide',
    status: 'idle',
    lastRun: '15분 전',
    totalExecutions: 892,
    successRate: '96.8%',
  },
  {
    name: 'Build Resolver',
    status: 'idle',
    lastRun: '1시간 전',
    totalExecutions: 543,
    successRate: '94.2%',
  },
  {
    name: 'Security Reviewer',
    status: 'running',
    lastRun: '방금 전',
    totalExecutions: 678,
    successRate: '99.1%',
  },
  {
    name: 'E2E Runner',
    status: 'error',
    lastRun: '10분 전',
    totalExecutions: 324,
    successRate: '91.4%',
  },
];

const AGENT_LOGS: AgentLog[] = [
  { timestamp: '2026-03-03 15:42', agentName: 'Code Reviewer', task: '코드 품질 분석', status: 'running', duration: '-', tokenUsage: '-' },
  { timestamp: '2026-03-03 15:40', agentName: 'Security Reviewer', task: '보안 취약점 스캔', status: 'success', duration: '8.2초', tokenUsage: '1,245' },
  { timestamp: '2026-03-03 15:38', agentName: 'TDD Guide', task: '단위 테스트 생성', status: 'success', duration: '12.4초', tokenUsage: '2,890' },
  { timestamp: '2026-03-03 15:30', agentName: 'E2E Runner', task: 'E2E 테스트 실행', status: 'failed', duration: '45.1초', tokenUsage: '3,422' },
  { timestamp: '2026-03-03 15:25', agentName: 'Build Resolver', task: '빌드 오류 해결', status: 'success', duration: '18.7초', tokenUsage: '4,105' },
  { timestamp: '2026-03-03 15:20', agentName: 'Code Reviewer', task: 'PR 리뷰', status: 'success', duration: '15.3초', tokenUsage: '3,678' },
  { timestamp: '2026-03-03 15:15', agentName: 'TDD Guide', task: '통합 테스트 검증', status: 'success', duration: '9.8초', tokenUsage: '1,987' },
  { timestamp: '2026-03-03 15:10', agentName: 'Security Reviewer', task: '의존성 취약점 검사', status: 'success', duration: '6.5초', tokenUsage: '1,123' },
];

const DAILY_TREND: DailyTrend[] = [
  { time: '00:00', executions: 12 },
  { time: '03:00', executions: 8 },
  { time: '06:00', executions: 15 },
  { time: '09:00', executions: 42 },
  { time: '12:00', executions: 38 },
  { time: '15:00', executions: 52 },
  { time: '18:00', executions: 45 },
  { time: '21:00', executions: 28 },
];

// ============= Mock Implementation =============

/**
 * Mock API Service implementation
 * Returns hardcoded data with simulated network delay
 */
export class MockApiService implements AdminApiService {
  async getDashboardSummary(): Promise<DashboardSummary> {
    await delay();
    return { ...DASHBOARD_SUMMARY };
  }

  async getUsageHistory(_year: number, _month: number): Promise<UsageRecord[]> {
    await delay();
    return [...ALL_USAGE_RECORDS];
  }

  async getMonthlyUsageStats(_year: number, _month: number): Promise<{ totalTokens: string; totalCost: string }> {
    await delay();
    return {
      totalTokens: '892K',
      totalCost: '₩47K',
    };
  }

  async getStatistics(_period: string): Promise<StatisticsData> {
    await delay();
    return { ...STATISTICS_DATA };
  }

  async getUsers(): Promise<User[]> {
    await delay();
    return [...USERS];
  }

  async updateUser(userId: string, data: Partial<User>): Promise<User> {
    await delay();
    const user = USERS.find((u) => u.userId === userId);
    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }
    return { ...user, ...data };
  }

  async searchUsers(query: string): Promise<User[]> {
    await delay();
    const lowerQuery = query.toLowerCase();
    return USERS.filter(
      (u) => u.name.toLowerCase().includes(lowerQuery) || u.userId.toLowerCase().includes(lowerQuery)
    );
  }

  async getSettings(): Promise<AdminSettings> {
    await delay();
    return { ...SETTINGS };
  }

  async updateSettings(data: Partial<AdminSettings>): Promise<AdminSettings> {
    await delay();
    return { ...SETTINGS, ...data };
  }

  async getProviders(): Promise<ProviderInfo[]> {
    await delay();
    return [...PROVIDERS];
  }

  async getProviderIncidents(): Promise<IncidentLog[]> {
    await delay();
    return [...INCIDENT_LOG];
  }

  async getModels(): Promise<ModelDef[]> {
    await delay();
    return [...MODELS];
  }

  async getMonthlyCosts(months: number = 6): Promise<MonthlyCost[]> {
    await delay();
    return MONTHLY_COSTS.slice(-months);
  }

  async getFeatureUsage(): Promise<FeatureUsageData[]> {
    await delay();
    return [...FEATURES];
  }

  async getWeeklyTrend(weeks: number = 4): Promise<WeeklyTrend[]> {
    await delay();
    return WEEKLY_TREND.slice(-weeks);
  }

  async getAdoptionRates(): Promise<AdoptionRate[]> {
    await delay();
    return [...ADOPTION_RATE];
  }

  async getPrompts(category?: PromptCategory | '전체'): Promise<PromptTemplate[]> {
    await delay();
    if (!category || category === '전체') {
      return [...PROMPTS];
    }
    return PROMPTS.filter((p) => p.category === category);
  }

  async getPromptById(id: string): Promise<PromptTemplate> {
    await delay();
    const prompt = PROMPTS.find((p) => p.id === id);
    if (!prompt) {
      throw new Error(`Prompt not found: ${id}`);
    }
    return { ...prompt };
  }

  async getAgentStatus(): Promise<AgentInfo[]> {
    await delay();
    return [...AGENTS];
  }

  async getAgentLogs(limit: number = 10): Promise<AgentLog[]> {
    await delay();
    return AGENT_LOGS.slice(0, limit);
  }

  async getDailyTrend(): Promise<DailyTrend[]> {
    await delay();
    return [...DAILY_TREND];
  }
}

export const mockApiService = new MockApiService();
