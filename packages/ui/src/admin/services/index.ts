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
} from './types'

// Service interface
export type { AdminApiService } from './apiService'

// Mock implementation
export { MockApiService, mockApiService } from './mockApiService'

// Context provider
export { AdminServiceProvider, useAdminService } from './AdminServiceProvider'

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
} from './hooks'

// Enterprise API types
export type {
  Department,
  DepartmentTreeNode,
  DepartmentBulkItem,
  DepartmentBulkResult,
  DepartmentBulkResultItem,
  EnterpriseUser,
  EnterpriseUserRole,
  UserBulkItem,
  UserBulkResult,
  UserBulkResultItem,
  UserActionLog,
  AuditEventType,
  AuditLogQuery,
  SSOConfig,
  BulkSummary,
  EnterpriseApiResponse,
  EnterpriseErrorResponse,
} from './types/enterprise'

// Enterprise API client
export { enterpriseApi } from './enterpriseApi'

// Enterprise mock data
export {
  mockDepartments,
  mockEnterpriseUsers,
  mockAuditLogs,
  mockSSOConfig,
} from './enterpriseMockData'

// Notification types
export type {
  NotificationType,
  NotificationChannel,
  NotificationPriority,
  Notification,
  NotificationPreference,
  NotificationFilter,
  NotificationStats,
  NotificationSubscription,
} from './notificationTypes'

// Notification service
export {
  subscribeNotifications,
  getNotifications,
  markAsRead,
  markAllAsRead,
  getNotificationStats,
  getPreferences,
  updatePreference,
} from './notificationService'

// Notification hooks
export { useNotifications, useNotificationBadge } from './notificationHooks'

// Widget types
export type {
  WidgetType,
  WidgetSize,
  WidgetConfig,
  DashboardLayout,
  WidgetCatalogItem,
} from './widgetTypes'

export { WIDGET_SIZE_MAP } from './widgetTypes'

// Widget service
export {
  WIDGET_CATALOG,
  getWidgetCatalog,
  getLayouts,
  getActiveLayout,
  saveLayout,
  createLayout,
  deleteLayout,
  setActiveLayout,
  addWidget,
  removeWidget,
  updateWidgetPosition,
  updateWidgetSize,
  updateWidgetSettings,
  toggleWidgetVisibility,
  resetToDefault,
} from './widgetService'

// Widget hooks
export { useDashboardLayout, useWidgetCatalog } from './widgetHooks'

// Workflow types
export type {
  NodeType,
  NodeStatus,
  WorkflowNode,
  WorkflowEdge,
  NodeConfigField,
  NodeCatalogItem,
  WorkflowTemplate,
  WorkflowExecutionResult,
  Workflow,
  WorkflowExecution,
} from './workflowTypes'

export {
  NODE_TYPE_COLORS,
  NODE_TYPE_BG_COLORS,
  NODE_STATUS_COLORS,
  NODE_WIDTH,
  NODE_HEIGHT,
} from './workflowTypes'

// Workflow service
export {
  NODE_CATALOG,
  WORKFLOW_TEMPLATES,
  getNodeCatalog,
  getWorkflowTemplates,
  getWorkflows,
  getWorkflow,
  createWorkflow,
  createFromTemplate,
  createWorkflowFromTemplate,
  createNode,
  saveWorkflow,
  deleteWorkflow,
  addNode,
  removeNode,
  updateNodePosition,
  updateNodeConfig,
  addEdge,
  removeEdge,
  executeWorkflow,
} from './workflowService'

// Workflow hooks
export { useWorkflowEditor, useWorkflowExecution } from './workflowHooks'
