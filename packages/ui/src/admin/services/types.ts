/**
 * Type definitions for Admin API services
 * Based on hchat-v2-extension data models
 */

// ============= Usage Records =============

export type Provider = 'bedrock' | 'openai' | 'gemini';
export type Feature = 'chat' | 'group' | 'tool' | 'agent' | 'debate' | 'report';
export type UsageStatus = 'success' | 'error' | 'pending';

export interface UsageRecord {
  date: string;
  user: string;
  type: string;
  model: string;
  tokens: string;
  cost: string;
  status: UsageStatus;
}

export interface UsageRecordDetail {
  date: string;
  provider: Provider;
  model: string;
  feature: Feature;
  inputTokens: number;
  outputTokens: number;
  requests: number;
  estimatedCost: number;
}

// ============= Models =============

export type ModelTier = 'premium' | 'standard' | 'economy';

export interface ModelDef {
  id: string;
  provider: string;
  name: string;
  label: string;
  contextWindow: string;
  inputCost: string;
  outputCost: string;
  tier: ModelTier;
  popular: boolean;
}

export interface ModelUsage {
  label: string;
  value: number;
  color: string;
}

// ============= Users =============

export type UserStatus = 'active' | 'inactive';

export interface User {
  userId: string;
  name: string;
  department: string;
  totalConversations: number;
  monthlyTokens: string;
  status: UserStatus;
}

// ============= Providers =============

export type ProviderStatus = 'online' | 'degraded' | 'offline';
export type IncidentSeverity = 'success' | 'warning' | 'info';

export interface ProviderInfo {
  name: string;
  status: ProviderStatus;
  latency: string;
  uptime: string;
  models: string[];
  lastChecked: string;
  region: string;
}

export interface IncidentLog {
  time: string;
  provider: string;
  event: string;
  severity: IncidentSeverity;
}

// ============= Dashboard =============

export interface DashboardStat {
  label: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
}

export interface DashboardSummary {
  stats: DashboardStat[];
  recentUsage: UsageRecord[];
  modelUsage: ModelUsage[];
}

// ============= Statistics =============

export interface MonthlyTrend {
  month: string;
  tokens: number;
  cost: number;
}

export interface TopUser {
  name: string;
  tokens: string;
}

export interface StatisticsData {
  monthlySummary: DashboardStat[];
  monthlyTrend: MonthlyTrend[];
  modelBreakdown: ModelUsage[];
  topUsers: TopUser[];
}

// ============= Settings =============

export interface ModelSetting {
  label: string;
  limit: string;
  enabled: boolean;
}

export interface AdminSettings {
  systemName: string;
  defaultLanguage: string;
  models: ModelSetting[];
  monthlyBudget: string;
  warningThreshold: string;
  dailyTokenLimit: string;
}

// ============= Model Pricing =============

export interface MonthlyCost {
  month: string;
  bedrock: number;
  openai: number;
  google: number;
}

// ============= Feature Usage =============

export interface FeatureUsageData {
  name: string;
  monthlyUsage: string;
  changePercent: string;
  changeUp: boolean;
  activeUsers: string;
  avgResponseTime: string;
  satisfaction: string;
  usagePercentage: number;
}

export interface WeeklyTrend {
  week: string;
  chat: number;
  groupChat: number;
  toolUse: number;
  agent: number;
  debate: number;
  report: number;
}

export interface AdoptionRate {
  name: string;
  rate: number;
  color: string;
}

// ============= Prompts =============

export type PromptCategory = '업무' | '개발' | '마케팅' | '분석';

export interface PromptTemplate {
  id: string;
  title: string;
  description: string;
  category: PromptCategory;
  author: string;
  usageCount: number;
  rating: number;
  tags: string[];
}

// ============= Agents =============

export type AgentStatus = 'running' | 'idle' | 'error';
export type ExecutionStatus = 'success' | 'failed' | 'running';

export interface AgentInfo {
  name: string;
  status: AgentStatus;
  lastRun: string;
  totalExecutions: number;
  successRate: string;
}

export interface AgentExecution {
  timestamp: string;
  agentName: string;
  task: string;
  status: ExecutionStatus;
  duration: string;
  tokenUsage: string;
}

export interface AgentLog {
  timestamp: string;
  agentName: string;
  task: string;
  status: ExecutionStatus;
  duration: string;
  tokenUsage: string;
}

export interface DailyTrend {
  time: string;
  executions: number;
}
