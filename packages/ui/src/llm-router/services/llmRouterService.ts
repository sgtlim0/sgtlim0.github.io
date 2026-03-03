/**
 * LLM Router Service Interface
 *
 * Defines the contract for LLM Router API operations.
 * Implementations include MockLlmRouterService (development) and future real API service.
 */

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

/**
 * LLM Router API Service Interface
 */
export interface LlmRouterService {
  /**
   * Fetch models with optional filtering and pagination
   *
   * @param params - Filter parameters (provider, category, search, page, pageSize)
   * @returns Paginated list of models
   */
  getModels(params?: ModelFilterParams): Promise<PaginatedResponse<LLMModel>>;

  /**
   * Fetch a single model by ID
   *
   * @param id - Model ID
   * @returns Model or null if not found
   */
  getModelById(id: string): Promise<LLMModel | null>;

  /**
   * Fetch dashboard statistics summary
   *
   * @returns Dashboard stats including totals and averages
   */
  getDashboardStats(): Promise<DashboardStats>;

  /**
   * Fetch usage statistics for recent days
   *
   * @param days - Number of days to fetch (default: 30)
   * @returns Daily usage statistics
   */
  getUsageStats(days?: number): Promise<UsageStat[]>;

  /**
   * Fetch monthly usage aggregates
   *
   * @returns Monthly usage totals
   */
  getMonthlyUsage(): Promise<MonthlyUsage[]>;

  /**
   * Fetch model usage breakdown
   *
   * @returns Per-model usage statistics
   */
  getModelUsageBreakdown(): Promise<ModelUsage[]>;

  /**
   * Fetch all API keys
   *
   * @returns List of API keys
   */
  getAPIKeys(): Promise<APIKey[]>;

  /**
   * Create a new API key
   *
   * @param name - Name for the new API key
   * @returns Newly created API key
   */
  createAPIKey(name: string): Promise<APIKey>;

  /**
   * Revoke an API key
   *
   * @param id - API key ID to revoke
   */
  revokeAPIKey(id: string): Promise<void>;
}
