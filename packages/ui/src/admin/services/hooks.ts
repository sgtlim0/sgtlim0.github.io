'use client';

/**
 * Custom hooks for Admin API data fetching
 *
 * These hooks provide a convenient way to fetch data with loading and error states.
 * All hooks use the AdminApiService from context.
 */

import { useState, useEffect } from 'react';
import { useAdminService } from './AdminServiceProvider';
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
 * Generic data fetching state
 */
interface DataState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Generic hook for data fetching
 */
function useData<T>(fetchFn: () => Promise<T>, deps: unknown[] = []): DataState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await fetchFn();
        if (mounted) {
          setData(result);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Unknown error'));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, deps);

  return { data, loading, error };
}

// ========== Dashboard Hooks ==========

/**
 * Hook to fetch dashboard summary data
 *
 * @returns Dashboard summary with loading and error states
 *
 * @example
 * ```tsx
 * function Dashboard() {
 *   const { data, loading, error } = useDashboard();
 *   if (loading) return <Spinner />;
 *   if (error) return <Error message={error.message} />;
 *   return <DashboardView data={data} />;
 * }
 * ```
 */
export function useDashboard(): DataState<DashboardSummary> {
  const service = useAdminService();
  return useData(() => service.getDashboardSummary());
}

// ========== Usage History Hooks ==========

/**
 * Hook to fetch usage history for a specific month
 *
 * @param year - Year (e.g., 2026)
 * @param month - Month (1-12)
 * @returns Usage records with loading and error states
 */
export function useUsageHistory(year: number, month: number): DataState<UsageRecord[]> {
  const service = useAdminService();
  return useData(() => service.getUsageHistory(year, month), [year, month]);
}

/**
 * Hook to fetch monthly usage statistics
 *
 * @param year - Year
 * @param month - Month
 * @returns Monthly stats with loading and error states
 */
export function useMonthlyUsageStats(year: number, month: number): DataState<{ totalTokens: string; totalCost: string }> {
  const service = useAdminService();
  return useData(() => service.getMonthlyUsageStats(year, month), [year, month]);
}

// ========== Statistics Hooks ==========

/**
 * Hook to fetch statistics data
 *
 * @param period - Time period (e.g., '6months', '1year')
 * @returns Statistics data with loading and error states
 */
export function useStatistics(period: string = '6months'): DataState<StatisticsData> {
  const service = useAdminService();
  return useData(() => service.getStatistics(period), [period]);
}

// ========== User Management Hooks ==========

/**
 * Hook to fetch all users
 *
 * @returns Users array with loading and error states
 */
export function useUsers(): DataState<User[]> {
  const service = useAdminService();
  return useData(() => service.getUsers());
}

/**
 * Hook to search users
 *
 * @param query - Search query
 * @returns Filtered users with loading and error states
 */
export function useUserSearch(query: string): DataState<User[]> {
  const service = useAdminService();
  return useData(() => (query ? service.searchUsers(query) : service.getUsers()), [query]);
}

// ========== Settings Hooks ==========

/**
 * Hook to fetch admin settings
 *
 * @returns Settings with loading and error states
 */
export function useSettings(): DataState<AdminSettings> {
  const service = useAdminService();
  return useData(() => service.getSettings());
}

// ========== Provider Status Hooks ==========

/**
 * Hook to fetch provider status information
 *
 * @returns Providers array with loading and error states
 */
export function useProviders(): DataState<ProviderInfo[]> {
  const service = useAdminService();
  return useData(() => service.getProviders());
}

/**
 * Hook to fetch provider incident logs
 *
 * @returns Incident logs with loading and error states
 */
export function useProviderIncidents(): DataState<IncidentLog[]> {
  const service = useAdminService();
  return useData(() => service.getProviderIncidents());
}

// ========== Model Pricing Hooks ==========

/**
 * Hook to fetch all models with pricing
 *
 * @returns Models array with loading and error states
 */
export function useModels(): DataState<ModelDef[]> {
  const service = useAdminService();
  return useData(() => service.getModels());
}

/**
 * Hook to fetch monthly cost breakdown
 *
 * @param months - Number of months to retrieve
 * @returns Monthly costs with loading and error states
 */
export function useMonthlyCosts(months: number = 6): DataState<MonthlyCost[]> {
  const service = useAdminService();
  return useData(() => service.getMonthlyCosts(months), [months]);
}

// ========== Feature Usage Hooks ==========

/**
 * Hook to fetch feature usage statistics
 *
 * @returns Feature usage data with loading and error states
 */
export function useFeatureUsage(): DataState<FeatureUsageData[]> {
  const service = useAdminService();
  return useData(() => service.getFeatureUsage());
}

/**
 * Hook to fetch weekly usage trend
 *
 * @param weeks - Number of weeks
 * @returns Weekly trend with loading and error states
 */
export function useWeeklyTrend(weeks: number = 4): DataState<WeeklyTrend[]> {
  const service = useAdminService();
  return useData(() => service.getWeeklyTrend(weeks), [weeks]);
}

/**
 * Hook to fetch feature adoption rates
 *
 * @returns Adoption rates with loading and error states
 */
export function useAdoptionRates(): DataState<AdoptionRate[]> {
  const service = useAdminService();
  return useData(() => service.getAdoptionRates());
}

// ========== Prompt Library Hooks ==========

/**
 * Hook to fetch prompt templates
 *
 * @param category - Optional category filter
 * @returns Prompts array with loading and error states
 */
export function usePrompts(category?: PromptCategory | '전체'): DataState<PromptTemplate[]> {
  const service = useAdminService();
  return useData(() => service.getPrompts(category), [category]);
}

/**
 * Hook to fetch a single prompt by ID
 *
 * @param id - Prompt ID
 * @returns Single prompt with loading and error states
 */
export function usePromptById(id: string): DataState<PromptTemplate> {
  const service = useAdminService();
  return useData(() => service.getPromptById(id), [id]);
}

// ========== Agent Monitoring Hooks ==========

/**
 * Hook to fetch agent status information
 *
 * @returns Agents array with loading and error states
 */
export function useAgentStatus(): DataState<AgentInfo[]> {
  const service = useAdminService();
  return useData(() => service.getAgentStatus());
}

/**
 * Hook to fetch agent execution logs
 *
 * @param limit - Maximum number of logs to return
 * @returns Agent logs with loading and error states
 */
export function useAgentLogs(limit: number = 10): DataState<AgentLog[]> {
  const service = useAdminService();
  return useData(() => service.getAgentLogs(limit), [limit]);
}

/**
 * Hook to fetch daily execution trend
 *
 * @returns Daily trend with loading and error states
 */
export function useDailyTrend(): DataState<DailyTrend[]> {
  const service = useAdminService();
  return useData(() => service.getDailyTrend());
}
