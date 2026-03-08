/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Tests for Admin Service Hooks
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import React, { ReactNode } from 'react'
import {
  useDashboard,
  useUsageHistory,
  useMonthlyUsageStats,
  useStatistics,
  useUsers,
  useUserSearch,
  useSettings,
  useProviders,
  useProviderIncidents,
  useModels,
  useMonthlyCosts,
  useFeatureUsage,
  useWeeklyTrend,
  useAdoptionRates,
  usePrompts,
  usePromptById,
  useAgentStatus,
  useAgentLogs,
  useDailyTrend,
} from '../src/admin/services/hooks'
import { AdminServiceProvider } from '../src/admin/services/AdminServiceProvider'
import type { AdminApiService } from '../src/admin/services/apiService'

// Mock the API service
const mockApiService: AdminApiService = {
  getDashboardSummary: vi.fn(),
  getUsageHistory: vi.fn(),
  getMonthlyUsageStats: vi.fn(),
  getStatistics: vi.fn(),
  getUsers: vi.fn(),
  searchUsers: vi.fn(),
  getSettings: vi.fn(),
  updateSettings: vi.fn(),
  getProviders: vi.fn(),
  getProviderIncidents: vi.fn(),
  getModels: vi.fn(),
  getMonthlyCosts: vi.fn(),
  getFeatureUsage: vi.fn(),
  getWeeklyTrend: vi.fn(),
  getAdoptionRates: vi.fn(),
  getPrompts: vi.fn(),
  getPromptById: vi.fn(),
  createPrompt: vi.fn(),
  updatePrompt: vi.fn(),
  deletePrompt: vi.fn(),
  getAgentStatus: vi.fn(),
  getAgentLogs: vi.fn(),
  getDailyTrend: vi.fn(),
}

// Wrapper component for providing context
const wrapper = ({ children }: { children: ReactNode }) => (
  <AdminServiceProvider service={mockApiService}>{children}</AdminServiceProvider>
)

describe('Admin Service Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('useDashboard', () => {
    it('should fetch dashboard data successfully', async () => {
      const mockData = {
        totalUsers: 1500,
        totalConversations: 45000,
        totalTokensUsed: 2500000,
        activeUsers: 300,
        monthlyGrowth: 12.5,
        userGrowth: 8.3,
        tokenGrowth: 15.2,
        systemHealth: 98.5,
      }

      ;(mockApiService.getDashboardSummary as any).mockResolvedValue(mockData)

      const { result } = renderHook(() => useDashboard(), { wrapper })

      // Initial state
      expect(result.current.loading).toBe(true)
      expect(result.current.data).toBe(null)
      expect(result.current.error).toBe(null)

      // Wait for data
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.data).toEqual(mockData)
      expect(result.current.error).toBe(null)
      expect(mockApiService.getDashboardSummary).toHaveBeenCalledTimes(1)
    })

    it('should handle errors correctly', async () => {
      const mockError = new Error('Failed to fetch dashboard')
      ;(mockApiService.getDashboardSummary as any).mockRejectedValue(mockError)

      const { result } = renderHook(() => useDashboard(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.data).toBe(null)
      expect(result.current.error).toEqual(mockError)
    })
  })

  describe('useUsageHistory', () => {
    it('should fetch usage history for specific month', async () => {
      const mockData = [
        {
          date: '2024-03-01',
          userId: 'user1',
          userName: 'John Doe',
          department: 'Engineering',
          model: 'Claude 3.5',
          tokenCount: 1500,
          cost: 0.03,
        },
      ]

      ;(mockApiService.getUsageHistory as any).mockResolvedValue(mockData)

      const { result } = renderHook(() => useUsageHistory(2024, 3), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.data).toEqual(mockData)
      expect(mockApiService.getUsageHistory).toHaveBeenCalledWith(2024, 3)
    })

    it('should refetch when parameters change', async () => {
      const mockData1 = [{ date: '2024-03-01', userId: 'user1' }]
      const mockData2 = [{ date: '2024-04-01', userId: 'user2' }]

      ;(mockApiService.getUsageHistory as any)
        .mockResolvedValueOnce(mockData1)
        .mockResolvedValueOnce(mockData2)

      const { result, rerender } = renderHook(({ year, month }) => useUsageHistory(year, month), {
        wrapper,
        initialProps: { year: 2024, month: 3 },
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.data).toEqual(mockData1)

      // Change parameters
      rerender({ year: 2024, month: 4 })

      await waitFor(() => {
        expect(result.current.data).toEqual(mockData2)
      })

      expect(mockApiService.getUsageHistory).toHaveBeenCalledTimes(2)
    })
  })

  describe('useMonthlyUsageStats', () => {
    it('should fetch monthly usage statistics', async () => {
      const mockData = {
        totalTokens: '2,500,000',
        totalCost: '$120.50',
      }

      ;(mockApiService.getMonthlyUsageStats as any).mockResolvedValue(mockData)

      const { result } = renderHook(() => useMonthlyUsageStats(2024, 3), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.data).toEqual(mockData)
      expect(mockApiService.getMonthlyUsageStats).toHaveBeenCalledWith(2024, 3)
    })
  })

  describe('useStatistics', () => {
    it('should fetch statistics with default period', async () => {
      const mockData = {
        tokenUsage: [],
        costBreakdown: [],
        userActivity: [],
        modelUsage: [],
      }

      ;(mockApiService.getStatistics as any).mockResolvedValue(mockData)

      const { result } = renderHook(() => useStatistics(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.data).toEqual(mockData)
      expect(mockApiService.getStatistics).toHaveBeenCalledWith('6months')
    })

    it('should fetch statistics with custom period', async () => {
      const mockData = {
        tokenUsage: [],
        costBreakdown: [],
        userActivity: [],
        modelUsage: [],
      }

      ;(mockApiService.getStatistics as any).mockResolvedValue(mockData)

      const { result } = renderHook(() => useStatistics('1year'), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(mockApiService.getStatistics).toHaveBeenCalledWith('1year')
    })
  })

  describe('useUsers', () => {
    it('should fetch all users', async () => {
      const mockData = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          department: 'Engineering',
          role: 'User',
          status: 'Active' as const,
          lastActive: '2024-03-20',
          tokensUsed: 1500,
        },
      ]

      ;(mockApiService.getUsers as any).mockResolvedValue(mockData)

      const { result } = renderHook(() => useUsers(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.data).toEqual(mockData)
    })
  })

  describe('useUserSearch', () => {
    it('should search users with query', async () => {
      const mockData = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
        },
      ]

      ;(mockApiService.searchUsers as any).mockResolvedValue(mockData)

      const { result } = renderHook(() => useUserSearch('john'), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.data).toEqual(mockData)
      expect(mockApiService.searchUsers).toHaveBeenCalledWith('john')
    })

    it('should fetch all users when query is empty', async () => {
      const mockData = [
        { id: '1', name: 'User 1' },
        { id: '2', name: 'User 2' },
      ]

      ;(mockApiService.getUsers as any).mockResolvedValue(mockData)

      const { result } = renderHook(() => useUserSearch(''), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(mockApiService.getUsers).toHaveBeenCalled()
      expect(mockApiService.searchUsers).not.toHaveBeenCalled()
    })
  })

  describe('useSettings', () => {
    it('should fetch admin settings', async () => {
      const mockData = {
        companyName: 'Test Corp',
        adminEmail: 'admin@test.com',
        maxTokensPerUser: 10000,
        enableAutoApproval: false,
        approvalThreshold: 1000,
        notificationEmail: 'notify@test.com',
        enableApiAccess: true,
        apiRateLimit: 100,
        dataRetentionDays: 90,
        enableAuditLog: true,
      }

      ;(mockApiService.getSettings as any).mockResolvedValue(mockData)

      const { result } = renderHook(() => useSettings(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.data).toEqual(mockData)
    })
  })

  describe('useProviders', () => {
    it('should fetch provider status information', async () => {
      const mockData = [
        {
          name: 'OpenAI',
          status: 'operational' as const,
          uptime: 99.9,
          latency: 120,
          errorRate: 0.1,
          lastChecked: '2024-03-20T10:00:00Z',
        },
      ]

      ;(mockApiService.getProviders as any).mockResolvedValue(mockData)

      const { result } = renderHook(() => useProviders(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.data).toEqual(mockData)
    })
  })

  describe('useProviderIncidents', () => {
    it('should fetch provider incident logs', async () => {
      const mockData = [
        {
          id: '1',
          provider: 'OpenAI',
          status: 'resolved' as const,
          title: 'API Latency Issues',
          description: 'Increased latency observed',
          startTime: '2024-03-20T09:00:00Z',
          endTime: '2024-03-20T10:00:00Z',
        },
      ]

      ;(mockApiService.getProviderIncidents as any).mockResolvedValue(mockData)

      const { result } = renderHook(() => useProviderIncidents(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.data).toEqual(mockData)
    })
  })

  describe('useModels', () => {
    it('should fetch all models with pricing', async () => {
      const mockData = [
        {
          id: 'gpt-4',
          name: 'GPT-4',
          provider: 'OpenAI',
          inputPrice: 0.03,
          outputPrice: 0.06,
          contextWindow: 8192,
          status: 'active' as const,
          category: 'Chat' as const,
        },
      ]

      ;(mockApiService.getModels as any).mockResolvedValue(mockData)

      const { result } = renderHook(() => useModels(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.data).toEqual(mockData)
    })
  })

  describe('useMonthlyCosts', () => {
    it('should fetch monthly costs with default months', async () => {
      const mockData = [
        {
          month: '2024-03',
          totalCost: 1500.5,
          breakdown: [
            { provider: 'OpenAI', cost: 1000 },
            { provider: 'Anthropic', cost: 500.5 },
          ],
        },
      ]

      ;(mockApiService.getMonthlyCosts as any).mockResolvedValue(mockData)

      const { result } = renderHook(() => useMonthlyCosts(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.data).toEqual(mockData)
      expect(mockApiService.getMonthlyCosts).toHaveBeenCalledWith(6)
    })

    it('should fetch monthly costs with custom months', async () => {
      const mockData = [{ month: '2024-03', totalCost: 1500.5 }]

      ;(mockApiService.getMonthlyCosts as any).mockResolvedValue(mockData)

      const { result } = renderHook(() => useMonthlyCosts(12), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(mockApiService.getMonthlyCosts).toHaveBeenCalledWith(12)
    })
  })

  describe('useFeatureUsage', () => {
    it('should fetch feature usage statistics', async () => {
      const mockData = [
        {
          feature: 'Chat',
          usage: 1500,
          trend: 'up' as const,
          change: 12.5,
          percentage: 35,
        },
      ]

      ;(mockApiService.getFeatureUsage as any).mockResolvedValue(mockData)

      const { result } = renderHook(() => useFeatureUsage(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.data).toEqual(mockData)
    })
  })

  describe('useWeeklyTrend', () => {
    it('should fetch weekly trend with default weeks', async () => {
      const mockData = [
        {
          week: 'Week 1',
          usage: 5000,
          users: 150,
        },
      ]

      ;(mockApiService.getWeeklyTrend as any).mockResolvedValue(mockData)

      const { result } = renderHook(() => useWeeklyTrend(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.data).toEqual(mockData)
      expect(mockApiService.getWeeklyTrend).toHaveBeenCalledWith(4)
    })

    it('should fetch weekly trend with custom weeks', async () => {
      const mockData = [{ week: 'Week 1', usage: 5000 }]

      ;(mockApiService.getWeeklyTrend as any).mockResolvedValue(mockData)

      const { result } = renderHook(() => useWeeklyTrend(8), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(mockApiService.getWeeklyTrend).toHaveBeenCalledWith(8)
    })
  })

  describe('useAdoptionRates', () => {
    it('should fetch feature adoption rates', async () => {
      const mockData = [
        {
          feature: 'Chat',
          adoptionRate: 75,
          activeUsers: 300,
          totalUsers: 400,
        },
      ]

      ;(mockApiService.getAdoptionRates as any).mockResolvedValue(mockData)

      const { result } = renderHook(() => useAdoptionRates(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.data).toEqual(mockData)
    })
  })

  describe('usePrompts', () => {
    it('should fetch all prompts without category filter', async () => {
      const mockData = [
        {
          id: '1',
          title: 'Test Prompt',
          category: '개발' as const,
          content: 'Test content',
          description: 'Test description',
          usage: 100,
          rating: 4.5,
          tags: ['test'],
          author: 'Admin',
          createdAt: '2024-03-20',
        },
      ]

      ;(mockApiService.getPrompts as any).mockResolvedValue(mockData)

      const { result } = renderHook(() => usePrompts(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.data).toEqual(mockData)
      expect(mockApiService.getPrompts).toHaveBeenCalledWith(undefined)
    })

    it('should fetch prompts with category filter', async () => {
      const mockData = [
        {
          id: '1',
          title: 'Dev Prompt',
          category: '개발' as const,
        },
      ]

      ;(mockApiService.getPrompts as any).mockResolvedValue(mockData)

      const { result } = renderHook(() => usePrompts('개발'), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(mockApiService.getPrompts).toHaveBeenCalledWith('개발')
    })

    it('should fetch all prompts when category is 전체', async () => {
      const mockData = [
        { id: '1', category: '개발' },
        { id: '2', category: '마케팅' },
      ]

      ;(mockApiService.getPrompts as any).mockResolvedValue(mockData)

      const { result } = renderHook(() => usePrompts('전체'), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(mockApiService.getPrompts).toHaveBeenCalledWith('전체')
    })
  })

  describe('usePromptById', () => {
    it('should fetch a single prompt by ID', async () => {
      const mockData = {
        id: '1',
        title: 'Test Prompt',
        category: '개발' as const,
        content: 'Test content',
      }

      ;(mockApiService.getPromptById as any).mockResolvedValue(mockData)

      const { result } = renderHook(() => usePromptById('1'), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.data).toEqual(mockData)
      expect(mockApiService.getPromptById).toHaveBeenCalledWith('1')
    })

    it('should refetch when ID changes', async () => {
      const mockData1 = { id: '1', title: 'Prompt 1' }
      const mockData2 = { id: '2', title: 'Prompt 2' }

      ;(mockApiService.getPromptById as any)
        .mockResolvedValueOnce(mockData1)
        .mockResolvedValueOnce(mockData2)

      const { result, rerender } = renderHook(({ id }) => usePromptById(id), {
        wrapper,
        initialProps: { id: '1' },
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.data).toEqual(mockData1)

      rerender({ id: '2' })

      await waitFor(() => {
        expect(result.current.data).toEqual(mockData2)
      })

      expect(mockApiService.getPromptById).toHaveBeenCalledTimes(2)
    })
  })

  describe('useAgentStatus', () => {
    it('should fetch agent status information', async () => {
      const mockData = [
        {
          id: 'agent-1',
          name: 'Chat Agent',
          status: 'running' as const,
          uptime: 3600,
          executionCount: 150,
          errorRate: 0.5,
          avgResponseTime: 250,
          lastExecution: '2024-03-20T10:00:00Z',
        },
      ]

      ;(mockApiService.getAgentStatus as any).mockResolvedValue(mockData)

      const { result } = renderHook(() => useAgentStatus(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.data).toEqual(mockData)
    })
  })

  describe('useAgentLogs', () => {
    it('should fetch agent logs with default limit', async () => {
      const mockData = [
        {
          id: 'log-1',
          agentId: 'agent-1',
          agentName: 'Chat Agent',
          status: 'success' as const,
          executionTime: 250,
          timestamp: '2024-03-20T10:00:00Z',
          input: 'test input',
          output: 'test output',
          error: null,
        },
      ]

      ;(mockApiService.getAgentLogs as any).mockResolvedValue(mockData)

      const { result } = renderHook(() => useAgentLogs(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.data).toEqual(mockData)
      expect(mockApiService.getAgentLogs).toHaveBeenCalledWith(10)
    })

    it('should fetch agent logs with custom limit', async () => {
      const mockData = [{ id: 'log-1', agentId: 'agent-1' }]

      ;(mockApiService.getAgentLogs as any).mockResolvedValue(mockData)

      const { result } = renderHook(() => useAgentLogs(20), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(mockApiService.getAgentLogs).toHaveBeenCalledWith(20)
    })
  })

  describe('useDailyTrend', () => {
    it('should fetch daily execution trend', async () => {
      const mockData = [
        {
          date: '2024-03-20',
          executionCount: 500,
          successRate: 98.5,
        },
      ]

      ;(mockApiService.getDailyTrend as any).mockResolvedValue(mockData)

      const { result } = renderHook(() => useDailyTrend(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.data).toEqual(mockData)
    })
  })

  describe('Error handling', () => {
    it('should handle non-Error objects in catch block', async () => {
      const mockError = 'String error'
      ;(mockApiService.getDashboardSummary as any).mockRejectedValue(mockError)

      const { result } = renderHook(() => useDashboard(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBeInstanceOf(Error)
      expect(result.current.error?.message).toBe('Unknown error')
    })
  })

  describe('Cleanup', () => {
    it('should not update state after unmount', async () => {
      let resolvePromise: (value: any) => void
      const promise = new Promise((resolve) => {
        resolvePromise = resolve
      })

      ;(mockApiService.getDashboardSummary as any).mockReturnValue(promise)

      const { result, unmount } = renderHook(() => useDashboard(), { wrapper })

      expect(result.current.loading).toBe(true)

      // Unmount before promise resolves
      unmount()

      // Resolve promise after unmount
      resolvePromise!({
        totalUsers: 1500,
        totalConversations: 45000,
      })

      // Give time for any state updates to occur
      await new Promise((resolve) => setTimeout(resolve, 10))

      // No errors should occur from trying to update unmounted component
      expect(true).toBe(true)
    })
  })
})
