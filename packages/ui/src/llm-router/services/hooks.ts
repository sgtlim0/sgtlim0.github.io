'use client';

/**
 * Custom hooks for LLM Router API data fetching
 *
 * These hooks provide a convenient way to fetch data with loading and error states.
 * All hooks use the LlmRouterService from context.
 */

import { useState, useEffect, useCallback } from 'react';
import { useLlmRouterService } from './LlmRouterServiceProvider';
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

// ========== Model Hooks ==========

/**
 * Hook to fetch models with filtering and pagination
 *
 * @param params - Filter parameters
 * @returns Paginated models with loading and error states
 *
 * @example
 * ```tsx
 * function ModelList() {
 *   const { models, total, loading, error } = useModels({ provider: 'OpenAI', page: 1 });
 *   if (loading) return <Spinner />;
 *   if (error) return <Error message={error.message} />;
 *   return <Table data={models} total={total} />;
 * }
 * ```
 */
export function useModels(params?: ModelFilterParams) {
  const service = useLlmRouterService();
  const { data, loading, error } = useData<PaginatedResponse<LLMModel>>(
    () => service.getModels(params),
    [
      params?.provider,
      params?.category,
      params?.search,
      params?.page,
      params?.pageSize,
    ]
  );

  return {
    models: data?.data || [],
    total: data?.total || 0,
    page: data?.page || 1,
    pageSize: data?.pageSize || 20,
    loading,
    error,
  };
}

/**
 * Hook to fetch a single model by ID
 *
 * @param id - Model ID
 * @returns Model with loading and error states
 */
export function useModelById(id: string): DataState<LLMModel | null> {
  const service = useLlmRouterService();
  return useData(() => service.getModelById(id), [id]);
}

// ========== Dashboard Hooks ==========

/**
 * Hook to fetch dashboard statistics
 *
 * @returns Dashboard stats with loading and error states
 *
 * @example
 * ```tsx
 * function Dashboard() {
 *   const { stats, loading, error } = useDashboardStats();
 *   if (loading) return <Spinner />;
 *   if (error) return <Error message={error.message} />;
 *   return <StatsCards stats={stats} />;
 * }
 * ```
 */
export function useDashboardStats() {
  const service = useLlmRouterService();
  const { data, loading, error } = useData(() => service.getDashboardStats());

  return {
    stats: data,
    loading,
    error,
  };
}

// ========== Usage Statistics Hooks ==========

/**
 * Hook to fetch usage statistics for recent days
 *
 * @param days - Number of days to fetch (default: 30)
 * @returns Usage stats with loading and error states
 *
 * @example
 * ```tsx
 * function UsageChart() {
 *   const { stats, loading, error } = useUsageStats(7);
 *   if (loading) return <Spinner />;
 *   if (error) return <Error message={error.message} />;
 *   return <LineChart data={stats} />;
 * }
 * ```
 */
export function useUsageStats(days: number = 30) {
  const service = useLlmRouterService();
  const { data, loading, error } = useData(() => service.getUsageStats(days), [days]);

  return {
    stats: data || [],
    loading,
    error,
  };
}

/**
 * Hook to fetch monthly usage aggregates
 *
 * @returns Monthly usage with loading and error states
 */
export function useMonthlyUsage() {
  const service = useLlmRouterService();
  const { data, loading, error } = useData(() => service.getMonthlyUsage());

  return {
    monthlyUsage: data || [],
    loading,
    error,
  };
}

/**
 * Hook to fetch model usage breakdown
 *
 * @returns Model usage breakdown with loading and error states
 */
export function useModelUsageBreakdown() {
  const service = useLlmRouterService();
  const { data, loading, error } = useData(() => service.getModelUsageBreakdown());

  return {
    modelUsage: data || [],
    loading,
    error,
  };
}

// ========== API Key Hooks ==========

/**
 * Hook to fetch and manage API keys
 *
 * @returns API keys, loading state, error, and mutation functions
 *
 * @example
 * ```tsx
 * function APIKeyManager() {
 *   const { keys, loading, error, createKey, revokeKey } = useAPIKeys();
 *
 *   const handleCreate = async () => {
 *     await createKey('New Key');
 *   };
 *
 *   const handleRevoke = async (id: string) => {
 *     await revokeKey(id);
 *   };
 *
 *   if (loading) return <Spinner />;
 *   return <KeyList keys={keys} onRevoke={handleRevoke} />;
 * }
 * ```
 */
export function useAPIKeys() {
  const service = useLlmRouterService();
  const [keys, setKeys] = useState<APIKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch keys on mount
  useEffect(() => {
    let mounted = true;

    const fetchKeys = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await service.getAPIKeys();
        if (mounted) {
          setKeys(result);
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

    fetchKeys();

    return () => {
      mounted = false;
    };
  }, [service]);

  // Create key mutation
  const createKey = useCallback(
    async (name: string) => {
      try {
        setError(null);
        const newKey = await service.createAPIKey(name);
        setKeys((prev) => [...prev, newKey]);
        return newKey;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        throw error;
      }
    },
    [service]
  );

  // Revoke key mutation
  const revokeKey = useCallback(
    async (id: string) => {
      try {
        setError(null);
        await service.revokeAPIKey(id);
        setKeys((prev) => prev.map((k) => (k.id === id ? { ...k, status: 'revoked' as const } : k)));
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        throw error;
      }
    },
    [service]
  );

  return {
    keys,
    loading,
    error,
    createKey,
    revokeKey,
  };
}
