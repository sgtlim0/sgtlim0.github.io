/**
 * Type definitions for LLM Router API services
 */

// Re-export existing types from parent
export type { LLMModel, APIKey, UsageStat, ModelUsage } from '../types';

/**
 * Dashboard statistics summary
 */
export interface DashboardStats {
  totalModels: number;
  totalRequests: number;
  totalTokens: number;
  totalCost: number;
  avgLatency: string;
}

/**
 * Monthly usage statistics
 */
export interface MonthlyUsage {
  month: string;
  requests: number;
  tokens: number;
  cost: number;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Parameters for model filtering
 */
export interface ModelFilterParams {
  provider?: string;
  category?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}
