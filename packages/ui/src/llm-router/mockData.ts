import type { LLMModel, APIKey, UsageStat, ModelUsage } from './types';
import modelsJson from './models.json';

export const models: LLMModel[] = modelsJson as LLMModel[];

export const providers = [
  '전체',
  'OpenAI',
  'Anthropic',
  'Google',
  'Meta',
  'Mistral',
  'Cohere',
  'DeepSeek',
  '기타',
];

export const categories = [
  '전체',
  'chat',
  'completion',
  'embedding',
  'image',
  'audio',
  'code',
];

export const mockAPIKeys: APIKey[] = [
  {
    id: 'key-1',
    name: 'Production API Key',
    key: 'sk-proj-abc...xyz',
    created: '2025-01-15',
    lastUsed: '2026-03-02',
    status: 'active',
  },
  {
    id: 'key-2',
    name: 'Development API Key',
    key: 'sk-proj-dev...123',
    created: '2025-02-01',
    lastUsed: '2026-03-01',
    status: 'active',
  },
  {
    id: 'key-3',
    name: 'Test API Key',
    key: 'sk-proj-test...789',
    created: '2025-02-20',
    lastUsed: '2026-02-28',
    status: 'active',
  },
  {
    id: 'key-4',
    name: 'Old API Key',
    key: 'sk-proj-old...456',
    created: '2024-11-10',
    lastUsed: '2025-12-25',
    status: 'revoked',
  },
];

export const mockUsageStats: UsageStat[] = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  const dateStr = date.toISOString().split('T')[0];

  return {
    date: dateStr,
    requests: Math.floor(Math.random() * 5000) + 1000,
    tokens: Math.floor(Math.random() * 10000000) + 2000000,
    cost: Math.floor(Math.random() * 500000) + 100000,
  };
});

export const mockMonthlyUsage = [
  { month: '2025-10', requests: 85000, tokens: 185000000, cost: 3200000 },
  { month: '2025-11', requests: 92000, tokens: 205000000, cost: 3800000 },
  { month: '2025-12', requests: 110000, tokens: 245000000, cost: 4500000 },
  { month: '2026-01', requests: 125000, tokens: 280000000, cost: 5200000 },
  { month: '2026-02', requests: 138000, tokens: 310000000, cost: 5800000 },
  { month: '2026-03', requests: 45000, tokens: 98000000, cost: 1850000 },
];

export const mockModelUsageBreakdown: ModelUsage[] = [
  { model: 'GPT-4o', requests: 35000, tokens: 78000000, cost: 850000 },
  { model: 'Claude Sonnet 4.5', requests: 28000, tokens: 62000000, cost: 720000 },
  { model: 'Gemini 2.5 Pro', requests: 22000, tokens: 48000000, cost: 580000 },
  { model: 'GPT-4.1 mini', requests: 18000, tokens: 40000000, cost: 320000 },
  { model: 'Claude Haiku 4.5', requests: 15000, tokens: 33000000, cost: 280000 },
];
