'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUserService } from './UserServiceProvider';
import { useAsyncData } from '../../hooks/useAsyncData';
import type { AsyncDataResult } from '../../hooks/useAsyncData';
import type {
  Conversation,
  Assistant,
  ModelUsage,
  Subscription,
  TranslationJob,
  DocProject,
  OCRJob
} from './types';

type UseDataResult<T> = AsyncDataResult<T>;

/**
 * Hook for managing conversations with CRUD operations.
 * Uses useAsyncData for initial fetch; manages local state for mutations.
 */
export function useConversations() {
  const service = useUserService();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [mutationError, setMutationError] = useState<Error | null>(null);

  const { data, loading, error, refetch } = useAsyncData(
    () => service.getConversations(),
    [service],
  );

  // Sync fetched data into local state
  useEffect(() => {
    if (data) {
      setConversations(data);
    }
  }, [data]);

  const create = useCallback(async (assistantId: string) => {
    try {
      const newConv = await service.createConversation(assistantId);
      setConversations(prev => [newConv, ...prev]);
      return newConv;
    } catch (err) {
      const e = err instanceof Error ? err : new Error('대화 생성 실패');
      setMutationError(e);
      throw e;
    }
  }, [service]);

  const remove = useCallback(async (id: string) => {
    try {
      await service.deleteConversation(id);
      setConversations(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      const e = err instanceof Error ? err : new Error('대화 삭제 실패');
      setMutationError(e);
      throw e;
    }
  }, [service]);

  return {
    conversations,
    loading,
    error: error ?? mutationError,
    create,
    remove,
    refetch,
  };
}

/**
 * Hook for managing assistants (official + custom).
 * Uses useAsyncData for initial fetch; derives computed state from result.
 */
export function useAssistants() {
  const service = useUserService();

  const { data, loading, error, refetch } = useAsyncData(
    () => Promise.all([service.getAssistants(), service.getCustomAssistants()]),
    [service],
  );

  const assistants = data?.[0] ?? [];
  const customAssistants = data?.[1] ?? [];

  return {
    assistants,
    customAssistants,
    allAssistants: [...assistants, ...customAssistants],
    loading,
    error,
    refetch,
  };
}

/**
 * Hook for fetching usage statistics.
 */
export function useUsageStats(): UseDataResult<ModelUsage[]> {
  const service = useUserService();
  return useAsyncData(() => service.getUsageStats(), [service]);
}

/**
 * Hook for fetching subscription information.
 */
export function useSubscription(): UseDataResult<Subscription> {
  const service = useUserService();
  return useAsyncData(() => service.getSubscription(), [service]);
}

/**
 * Hook for fetching translation jobs.
 */
export function useTranslationJobs(): UseDataResult<TranslationJob[]> {
  const service = useUserService();
  return useAsyncData(() => service.getTranslationJobs(), [service]);
}

/**
 * Hook for fetching document projects.
 */
export function useDocProjects(): UseDataResult<DocProject[]> {
  const service = useUserService();
  return useAsyncData(() => service.getDocProjects(), [service]);
}

/**
 * Hook for fetching OCR jobs.
 */
export function useOCRJobs(): UseDataResult<OCRJob[]> {
  const service = useUserService();
  return useAsyncData(() => service.getOCRJobs(), [service]);
}
