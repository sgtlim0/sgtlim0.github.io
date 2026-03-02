/**
 * Admin Services
 *
 * This module provides a service abstraction layer for the Admin app.
 * It allows swapping between mock and real API implementations without changing component code.
 *
 * @module admin/services
 *
 * @example
 * ```tsx
 * // Wrap your app with the provider
 * import { AdminServiceProvider } from '@hchat/ui/admin/services';
 *
 * export default function App() {
 *   return (
 *     <AdminServiceProvider>
 *       <AdminDashboard />
 *     </AdminServiceProvider>
 *   );
 * }
 *
 * // Use hooks in components
 * import { useDashboard } from '@hchat/ui/admin/services';
 *
 * function Dashboard() {
 *   const { data, loading, error } = useDashboard();
 *   if (loading) return <Spinner />;
 *   if (error) return <Error />;
 *   return <DashboardView data={data} />;
 * }
 * ```
 */

// Type definitions
export type {
  Provider,
  Feature,
  UsageStatus,
  UsageRecord,
  UsageRecordDetail,
  ModelTier,
  ModelDef,
  ModelUsage,
  UserStatus,
  User,
  ProviderStatus,
  IncidentSeverity,
  ProviderInfo,
  IncidentLog,
  DashboardStat,
  DashboardSummary,
  MonthlyTrend,
  TopUser,
  StatisticsData,
  ModelSetting,
  AdminSettings,
  MonthlyCost,
  FeatureUsageData,
  WeeklyTrend,
  AdoptionRate,
  PromptCategory,
  PromptTemplate,
  AgentStatus,
  ExecutionStatus,
  AgentInfo,
  AgentExecution,
  AgentLog,
  DailyTrend,
} from './types';

// Service interface
export type { AdminApiService } from './apiService';

// Mock implementation
export { MockApiService, mockApiService } from './mockApiService';

// Context provider
export { AdminServiceProvider, useAdminService } from './AdminServiceProvider';

// Hooks
export {
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
} from './hooks';
