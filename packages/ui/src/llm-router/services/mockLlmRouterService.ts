/**
 * Mock LLM Router Service Implementation
 *
 * This service provides mock data for development and testing.
 * All methods return Promises that resolve after a small delay to simulate network latency.
 */

import type { LlmRouterService } from './llmRouterService';
import type {
  LLMModel,
  APIKey,
  UsageStat,
  ModelUsage,
  DashboardStats,
  MonthlyUsage,
  PaginatedResponse,
  ModelFilterParams,
} from './types';
import { models, mockAPIKeys, mockUsageStats, mockMonthlyUsage, mockModelUsageBreakdown } from '../mockData';

// Simulate network delay (100-300ms)
const delay = (ms: number = Math.random() * 200 + 100) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Mock LLM Router Service
 */
export class MockLlmRouterService implements LlmRouterService {
  /**
   * Fetch models with optional filtering and pagination
   */
  async getModels(params: ModelFilterParams = {}): Promise<PaginatedResponse<LLMModel>> {
    await delay();

    const { provider, category, search, page = 1, pageSize = 20 } = params;

    let filtered = [...models];

    // Filter by provider
    if (provider && provider !== '전체') {
      if (provider === '기타') {
        const mainProviders = ['OpenAI', 'Anthropic', 'Google', 'Meta', 'Mistral', 'Cohere', 'DeepSeek'];
        filtered = filtered.filter((m) => !mainProviders.includes(m.provider));
      } else {
        filtered = filtered.filter((m) => m.provider === provider);
      }
    }

    // Filter by category
    if (category && category !== '전체') {
      filtered = filtered.filter((m) => m.category === category);
    }

    // Filter by search query
    if (search) {
      const query = search.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.name.toLowerCase().includes(query) ||
          m.provider.toLowerCase().includes(query) ||
          m.id.toLowerCase().includes(query)
      );
    }

    // Pagination
    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const data = filtered.slice(start, end);

    return {
      data,
      total,
      page,
      pageSize,
    };
  }

  /**
   * Fetch a single model by ID
   */
  async getModelById(id: string): Promise<LLMModel | null> {
    await delay();
    return models.find((m) => m.id === id) || null;
  }

  /**
   * Fetch dashboard statistics summary
   */
  async getDashboardStats(): Promise<DashboardStats> {
    await delay();

    const totalModels = models.length;
    const recentStats = mockUsageStats.slice(-30);
    const totalRequests = recentStats.reduce((sum, stat) => sum + stat.requests, 0);
    const totalTokens = recentStats.reduce((sum, stat) => sum + stat.tokens, 0);
    const totalCost = recentStats.reduce((sum, stat) => sum + stat.cost, 0);

    // Calculate average latency from popular models
    const popularModels = models.filter((m) => m.isPopular);
    const avgLatencyMs =
      popularModels.reduce((sum, m) => sum + parseFloat(m.latency), 0) / popularModels.length;
    const avgLatency = `${avgLatencyMs.toFixed(1)}초`;

    return {
      totalModels,
      totalRequests,
      totalTokens,
      totalCost,
      avgLatency,
    };
  }

  /**
   * Fetch usage statistics for recent days
   */
  async getUsageStats(days: number = 30): Promise<UsageStat[]> {
    await delay();
    return mockUsageStats.slice(-days);
  }

  /**
   * Fetch monthly usage aggregates
   */
  async getMonthlyUsage(): Promise<MonthlyUsage[]> {
    await delay();
    return mockMonthlyUsage;
  }

  /**
   * Fetch model usage breakdown
   */
  async getModelUsageBreakdown(): Promise<ModelUsage[]> {
    await delay();
    return mockModelUsageBreakdown;
  }

  /**
   * Fetch all API keys
   */
  async getAPIKeys(): Promise<APIKey[]> {
    await delay();
    return mockAPIKeys;
  }

  /**
   * Create a new API key
   */
  async createAPIKey(name: string): Promise<APIKey> {
    await delay();

    const newKey: APIKey = {
      id: `key-${Date.now()}`,
      name,
      key: `sk-proj-${Math.random().toString(36).substring(2, 15)}...`,
      created: new Date().toISOString().split('T')[0],
      lastUsed: '-',
      status: 'active',
    };

    mockAPIKeys.push(newKey);
    return newKey;
  }

  /**
   * Revoke an API key
   */
  async revokeAPIKey(id: string): Promise<void> {
    await delay();

    const key = mockAPIKeys.find((k) => k.id === id);
    if (key) {
      key.status = 'revoked';
    }
  }
}

/**
 * Singleton instance of MockLlmRouterService
 */
export const mockLlmRouterService = new MockLlmRouterService();
