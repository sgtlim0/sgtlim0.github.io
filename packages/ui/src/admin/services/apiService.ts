/**
 * Admin API Service Interface
 *
 * This interface defines all API methods for the Admin app.
 * Implementations can be swapped between mock and real API services.
 */

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

/**
 * Admin API Service interface
 * All methods return Promises to simulate async API calls
 */
export interface AdminApiService {
  // ========== Dashboard ==========

  /**
   * Get dashboard summary with stats, recent usage, and model breakdown
   */
  getDashboardSummary(): Promise<DashboardSummary>;

  // ========== Usage History ==========

  /**
   * Get usage history for a specific month
   * @param year - Year (e.g., 2026)
   * @param month - Month (1-12)
   */
  getUsageHistory(year: number, month: number): Promise<UsageRecord[]>;

  /**
   * Get monthly usage statistics
   * @param year - Year
   * @param month - Month
   */
  getMonthlyUsageStats(year: number, month: number): Promise<{
    totalTokens: string;
    totalCost: string;
  }>;

  // ========== Statistics ==========

  /**
   * Get statistics data for a time period
   * @param period - Time period (e.g., '6months', '1year')
   */
  getStatistics(period: string): Promise<StatisticsData>;

  // ========== User Management ==========

  /**
   * Get all users
   */
  getUsers(): Promise<User[]>;

  /**
   * Update user information
   * @param userId - User ID
   * @param data - Partial user data to update
   */
  updateUser(userId: string, data: Partial<User>): Promise<User>;

  /**
   * Search users by query
   * @param query - Search query (name or userId)
   */
  searchUsers(query: string): Promise<User[]>;

  // ========== Settings ==========

  /**
   * Get current admin settings
   */
  getSettings(): Promise<AdminSettings>;

  /**
   * Update admin settings
   * @param data - Partial settings to update
   */
  updateSettings(data: Partial<AdminSettings>): Promise<AdminSettings>;

  // ========== Provider Status ==========

  /**
   * Get AI provider status information
   */
  getProviders(): Promise<ProviderInfo[]>;

  /**
   * Get provider incident logs
   */
  getProviderIncidents(): Promise<IncidentLog[]>;

  // ========== Model Pricing ==========

  /**
   * Get all available models with pricing
   */
  getModels(): Promise<ModelDef[]>;

  /**
   * Get monthly cost breakdown by provider
   * @param months - Number of months to retrieve (default: 6)
   */
  getMonthlyCosts(months?: number): Promise<MonthlyCost[]>;

  // ========== Feature Usage ==========

  /**
   * Get feature usage statistics
   */
  getFeatureUsage(): Promise<FeatureUsageData[]>;

  /**
   * Get weekly usage trend
   * @param weeks - Number of weeks (default: 4)
   */
  getWeeklyTrend(weeks?: number): Promise<WeeklyTrend[]>;

  /**
   * Get feature adoption rates
   */
  getAdoptionRates(): Promise<AdoptionRate[]>;

  // ========== Prompt Library ==========

  /**
   * Get all prompt templates
   * @param category - Optional category filter
   */
  getPrompts(category?: PromptCategory | '전체'): Promise<PromptTemplate[]>;

  /**
   * Get a single prompt by ID
   * @param id - Prompt ID
   */
  getPromptById(id: string): Promise<PromptTemplate>;

  // ========== Agent Monitoring ==========

  /**
   * Get all agent status information
   */
  getAgentStatus(): Promise<AgentInfo[]>;

  /**
   * Get agent execution logs
   * @param limit - Maximum number of logs to return
   */
  getAgentLogs(limit?: number): Promise<AgentLog[]>;

  /**
   * Get daily execution trend
   */
  getDailyTrend(): Promise<DailyTrend[]>;
}
