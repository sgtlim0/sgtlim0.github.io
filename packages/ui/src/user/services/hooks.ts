'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUserService } from './UserServiceProvider';
import type {
  Conversation,
  Assistant,
  ModelUsage,
  Subscription,
  TranslationJob,
  DocProject,
  OCRJob
} from './types';

interface UseDataResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for managing conversations with CRUD operations.
 */
export function useConversations() {
  const service = useUserService();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await service.getConversations();
      setConversations(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('대화 목록 로드 실패'));
    } finally {
      setLoading(false);
    }
  }, [service]);

  const create = useCallback(async (assistantId: string) => {
    try {
      const newConv = await service.createConversation(assistantId);
      setConversations(prev => [newConv, ...prev]);
      return newConv;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('대화 생성 실패');
      setError(error);
      throw error;
    }
  }, [service]);

  const remove = useCallback(async (id: string) => {
    try {
      await service.deleteConversation(id);
      setConversations(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      const error = err instanceof Error ? err : new Error('대화 삭제 실패');
      setError(error);
      throw error;
    }
  }, [service]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { conversations, loading, error, create, remove, refetch: fetch };
}

/**
 * Hook for managing assistants (official + custom).
 */
export function useAssistants() {
  const service = useUserService();
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [customAssistants, setCustomAssistants] = useState<Assistant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [official, custom] = await Promise.all([
        service.getAssistants(),
        service.getCustomAssistants()
      ]);
      setAssistants(official);
      setCustomAssistants(custom);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('어시스턴트 로드 실패'));
    } finally {
      setLoading(false);
    }
  }, [service]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return {
    assistants,
    customAssistants,
    allAssistants: [...assistants, ...customAssistants],
    loading,
    error,
    refetch: fetch
  };
}

/**
 * Hook for fetching usage statistics.
 */
export function useUsageStats(): UseDataResult<ModelUsage[]> {
  const service = useUserService();
  const [data, setData] = useState<ModelUsage[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const stats = await service.getUsageStats();
      setData(stats);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('사용량 통계 로드 실패'));
    } finally {
      setLoading(false);
    }
  }, [service]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

/**
 * Hook for fetching subscription information.
 */
export function useSubscription(): UseDataResult<Subscription> {
  const service = useUserService();
  const [data, setData] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const sub = await service.getSubscription();
      setData(sub);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('구독 정보 로드 실패'));
    } finally {
      setLoading(false);
    }
  }, [service]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

/**
 * Hook for fetching translation jobs.
 */
export function useTranslationJobs(): UseDataResult<TranslationJob[]> {
  const service = useUserService();
  const [data, setData] = useState<TranslationJob[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const jobs = await service.getTranslationJobs();
      setData(jobs);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('번역 작업 로드 실패'));
    } finally {
      setLoading(false);
    }
  }, [service]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

/**
 * Hook for fetching document projects.
 */
export function useDocProjects(): UseDataResult<DocProject[]> {
  const service = useUserService();
  const [data, setData] = useState<DocProject[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const projects = await service.getDocProjects();
      setData(projects);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('문서 프로젝트 로드 실패'));
    } finally {
      setLoading(false);
    }
  }, [service]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

/**
 * Hook for fetching OCR jobs.
 */
export function useOCRJobs(): UseDataResult<OCRJob[]> {
  const service = useUserService();
  const [data, setData] = useState<OCRJob[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const jobs = await service.getOCRJobs();
      setData(jobs);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('OCR 작업 로드 실패'));
    } finally {
      setLoading(false);
    }
  }, [service]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}
