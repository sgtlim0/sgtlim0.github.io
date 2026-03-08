import type { AdminApiService } from './apiService'
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
} from './types'
import type { ApiClient } from '../../client/apiClient'
import { getApiClient } from '../../client/serviceFactory'

export class RealAdminService implements AdminApiService {
  private client: ApiClient

  constructor(client: ApiClient) {
    this.client = client
  }

  // ========== Dashboard ==========

  async getDashboardSummary(): Promise<DashboardSummary> {
    try {
      return await this.client.get<DashboardSummary>('/admin/stats')
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : '대시보드 데이터를 불러오는데 실패했습니다.',
      )
    }
  }

  // ========== Usage History ==========

  async getUsageHistory(year: number, month: number): Promise<UsageRecord[]> {
    try {
      return await this.client.get<UsageRecord[]>(
        `/admin/usage?year=${year}&month=${month}`,
      )
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : '사용 이력을 불러오는데 실패했습니다.',
      )
    }
  }

  async getMonthlyUsageStats(
    year: number,
    month: number,
  ): Promise<{ totalTokens: string; totalCost: string }> {
    try {
      return await this.client.get<{ totalTokens: string; totalCost: string }>(
        `/admin/usage/stats?year=${year}&month=${month}`,
      )
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : '월별 사용 통계를 불러오는데 실패했습니다.',
      )
    }
  }

  // ========== Statistics ==========

  async getStatistics(period: string): Promise<StatisticsData> {
    try {
      return await this.client.get<StatisticsData>(
        `/admin/statistics?period=${encodeURIComponent(period)}`,
      )
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : '통계 데이터를 불러오는데 실패했습니다.',
      )
    }
  }

  // ========== User Management ==========

  async getUsers(): Promise<User[]> {
    try {
      return await this.client.get<User[]>('/admin/users')
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : '사용자 목록을 불러오는데 실패했습니다.',
      )
    }
  }

  async updateUser(userId: string, data: Partial<User>): Promise<User> {
    try {
      return await this.client.put<User>(`/admin/users/${userId}`, data)
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : '사용자 정보 수정에 실패했습니다.',
      )
    }
  }

  async searchUsers(query: string): Promise<User[]> {
    try {
      const encodedQuery = encodeURIComponent(query)
      return await this.client.get<User[]>(
        `/admin/users/search?q=${encodedQuery}`,
      )
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : '사용자 검색에 실패했습니다.',
      )
    }
  }

  // ========== Settings ==========

  async getSettings(): Promise<AdminSettings> {
    try {
      return await this.client.get<AdminSettings>('/admin/settings')
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : '설정을 불러오는데 실패했습니다.',
      )
    }
  }

  async updateSettings(data: Partial<AdminSettings>): Promise<AdminSettings> {
    try {
      return await this.client.put<AdminSettings>('/admin/settings', data)
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : '설정 저장에 실패했습니다.',
      )
    }
  }

  // ========== Provider Status ==========

  async getProviders(): Promise<ProviderInfo[]> {
    try {
      return await this.client.get<ProviderInfo[]>('/admin/providers')
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : 'AI 제공자 상태를 불러오는데 실패했습니다.',
      )
    }
  }

  async getProviderIncidents(): Promise<IncidentLog[]> {
    try {
      return await this.client.get<IncidentLog[]>('/admin/providers/incidents')
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : '장애 이력을 불러오는데 실패했습니다.',
      )
    }
  }

  // ========== Model Pricing ==========

  async getModels(): Promise<ModelDef[]> {
    try {
      return await this.client.get<ModelDef[]>('/admin/models')
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : '모델 목록을 불러오는데 실패했습니다.',
      )
    }
  }

  async getMonthlyCosts(months: number = 6): Promise<MonthlyCost[]> {
    try {
      return await this.client.get<MonthlyCost[]>(
        `/admin/models/costs?months=${months}`,
      )
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : '월별 비용 데이터를 불러오는데 실패했습니다.',
      )
    }
  }

  // ========== Feature Usage ==========

  async getFeatureUsage(): Promise<FeatureUsageData[]> {
    try {
      return await this.client.get<FeatureUsageData[]>('/admin/features')
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : '기능 사용 현황을 불러오는데 실패했습니다.',
      )
    }
  }

  async getWeeklyTrend(weeks: number = 4): Promise<WeeklyTrend[]> {
    try {
      return await this.client.get<WeeklyTrend[]>(
        `/admin/features/weekly?weeks=${weeks}`,
      )
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : '주간 트렌드를 불러오는데 실패했습니다.',
      )
    }
  }

  async getAdoptionRates(): Promise<AdoptionRate[]> {
    try {
      return await this.client.get<AdoptionRate[]>('/admin/features/adoption')
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : '도입률 데이터를 불러오는데 실패했습니다.',
      )
    }
  }

  // ========== Prompt Library ==========

  async getPrompts(
    category?: PromptCategory | '전체',
  ): Promise<PromptTemplate[]> {
    try {
      const params =
        category && category !== '전체'
          ? `?category=${encodeURIComponent(category)}`
          : ''
      return await this.client.get<PromptTemplate[]>(
        `/admin/prompts${params}`,
      )
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : '프롬프트 목록을 불러오는데 실패했습니다.',
      )
    }
  }

  async getPromptById(id: string): Promise<PromptTemplate> {
    try {
      return await this.client.get<PromptTemplate>(`/admin/prompts/${id}`)
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : '프롬프트를 불러오는데 실패했습니다.',
      )
    }
  }

  // ========== Agent Monitoring ==========

  async getAgentStatus(): Promise<AgentInfo[]> {
    try {
      return await this.client.get<AgentInfo[]>('/admin/agents')
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : '에이전트 상태를 불러오는데 실패했습니다.',
      )
    }
  }

  async getAgentLogs(limit: number = 10): Promise<AgentLog[]> {
    try {
      return await this.client.get<AgentLog[]>(
        `/admin/agents/logs?limit=${limit}`,
      )
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : '에이전트 로그를 불러오는데 실패했습니다.',
      )
    }
  }

  async getDailyTrend(): Promise<DailyTrend[]> {
    try {
      return await this.client.get<DailyTrend[]>('/admin/agents/trend')
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : '일별 실행 트렌드를 불러오는데 실패했습니다.',
      )
    }
  }
}

export function createRealAdminService(): RealAdminService {
  return new RealAdminService(getApiClient())
}
