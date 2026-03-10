/**
 * Utils barrel export
 */

// CSRF Protection
export {
  generateCsrfToken,
  getCsrfToken,
  validateCsrfToken,
  clearCsrfToken,
  addCsrfHeader,
  useCsrf,
} from './csrf'

// Error Monitoring
export {
  initSentry,
  captureError,
  captureMessage,
  setUser,
  clearUser,
  addBreadcrumb,
  getBreadcrumbs,
  startTransaction,
  finishTransaction,
  getErrorBoundaryConfig,
  getMonitoringConfig,
} from './errorMonitoring'
export type {
  ErrorContext,
  BreadcrumbData,
  UserContext,
  TransactionContext,
  ErrorBoundaryConfig,
} from './errorMonitoring'

// Health Check
export { checkServiceHealth, getSystemHealth, getMonitoringStatus } from './healthCheck'
export type {
  ServiceHealth,
  HealthStatus,
  MonitoringStatus,
  ServiceEndpoint,
} from './healthCheck'

// Web Vitals
export {
  reportWebVitals,
  evaluateMetric,
  buildReport,
  getCollectedMetrics,
  clearCollectedMetrics,
  createMetric,
  WEB_VITAL_THRESHOLDS,
} from './webVitals'
export type { WebVitalMetric, WebVitalThresholds, WebVitalsReport } from './webVitals'

// Alert Configuration & Manager
export {
  DEFAULT_ALERT_RULES,
  getAlertSeverity,
  evaluateAlert,
  evaluateAllRules,
  createAlertRule,
  updateAlertRule,
  toggleAlertRule,
  AlertManager,
} from './alertConfig'
export type {
  AlertRule,
  AlertEvent,
  MetricData,
  NotificationChannel,
  AlertManagerConfig,
} from './alertConfig'

// Token Storage
export { tokenStorage } from './tokenStorage'

// PII Sanitization
export { sanitizePII, containsPII } from './sanitize'

// Text Processing
export { EN_STOPWORDS, KO_STOPWORDS, detectLanguage, encode, getCompressionStats } from './text'
export type { EncoderOptions, CompressionResult, CompressionStats } from './text'

// Blocklist (Extension content extraction guard)
export { isBlockedSite, isSensitivePattern, shouldBlockExtraction } from './blocklist'

// Performance Utilities
export { lazy, debounce, throttle } from './performance'

// Performance Profiler
export {
  recordRender,
  onRenderCallback,
  getProfile,
  getProfileResults,
  clearProfiles,
  clearProfile,
} from './performanceProfiler'
export type { ProfileMetrics } from './performanceProfiler'

// Accessibility Utilities
export { trapFocus, announceToScreenReader, getFocusableElements } from './a11y'

// Image Placeholder Utilities
export {
  generateBlurDataURL,
  getShimmerStyle,
  SHIMMER_KEYFRAMES,
  BLUR_PLACEHOLDERS,
} from './imagePlaceholder'

// Structured Logging
export {
  createLogger,
  setLogLevel,
  getLogLevel,
  getLogBuffer,
  clearLogBuffer,
  setBufferSize,
  getBufferSize,
  setTransport,
  resetLogger,
} from './logger'
export type { LogLevel, LogEntry, Logger } from './logger'
export { LogProvider, useLogger } from './LogProvider'

// Worker Utilities
export { supportsWorker, createWorkerClient, runWorkerTask } from './workerUtils'
export type { WorkerClient } from './workerUtils'

// Data Export
export {
  downloadBlob,
  buildCsvString,
  exportToCSV,
  exportToJSON,
  formatDataForExport,
} from './dataExport'
export type { ColumnConfig } from './dataExport'

// Feature Flags
export {
  isFeatureEnabled,
  getFeatureFlags,
  setFeatureFlag,
  subscribe as subscribeFeatureFlags,
  getSnapshot as getFeatureFlagSnapshot,
  getServerSnapshot as getFeatureFlagServerSnapshot,
  resetFlags,
} from './featureFlags'
export type { FeatureFlag } from './featureFlags'
export { default as FeatureFlagProvider, useFeatureFlag, useFeatureFlags, FeatureGate } from './FeatureFlagProvider'

// Keyboard Utilities
export { parseKeyCombo, matchesKeyEvent, normalizeKeyCombo } from './keyboardUtils'
export type { KeyCombo } from './keyboardUtils'

// Search Engine
export {
  fuzzyMatch,
  createSearchIndex,
  search,
} from './searchEngine'
export type {
  SearchableItem,
  SearchResult,
  SearchOptions,
  FuzzyMatchResult,
  SearchIndex,
} from './searchEngine'

// Push Notification
export {
  isSupported as isPushNotificationSupported,
  getPermissionStatus,
  requestPermission as requestNotificationPermission,
  showNotification,
  wasPreviouslyDenied,
  clearDeniedFlag,
} from './pushNotification'

// Analytics / Telemetry
export {
  trackEvent,
  trackPageView,
  trackTiming,
  getEventHistory,
  clearEventHistory,
  setAnalyticsEnabled,
  isAnalyticsEnabled,
  registerProvider as registerAnalyticsProvider,
  removeAllProviders as removeAllAnalyticsProviders,
  flush as flushAnalytics,
  resetAnalytics,
  createConsoleProvider,
  createNoopProvider,
} from './analytics'
export type { AnalyticsEvent, AnalyticsProvider as AnalyticsProviderInterface, EventCategory } from './analytics'
export { AnalyticsProvider, useAnalyticsContext } from './AnalyticsProvider'
export { useAnalytics } from '../hooks/useAnalytics'
export type { UseAnalyticsReturn } from '../hooks/useAnalytics'
// Persist Storage (IndexedDB + localStorage)
export { createPersistStorage, persistStorage, _resetDB as _resetPersistDB } from './persistStorage'
export type { PersistStorage } from './persistStorage'

// Clipboard
export { copyToClipboard, readFromClipboard, isClipboardSupported } from './clipboard'

// Offline Queue
export { OfflineQueue, getOfflineQueue, resetOfflineQueue } from './offlineQueue'
export type { QueuedRequest, DeadLetterItem, OfflineQueueOptions } from './offlineQueue'

// Query Cache (SWR-like stale-while-revalidate)
export { createQueryCache } from './queryCache'
export type { CacheEntry, QueryCache } from './queryCache'

// Webhook Service
export { createWebhookManager, signPayload, WEBHOOK_EVENT_TYPES } from './webhookService'
export type {
  WebhookConfig,
  WebhookPayload,
  WebhookDelivery,
  WebhookResult,
  WebhookManager,
  WebhookEventType,
} from './webhookService'

// Request Deduplication
export { createRequestDedup } from './requestDedup'
export type { DedupOptions, DedupStats, RequestDedup } from './requestDedup'

// Circuit Breaker
export { createCircuitBreaker, CircuitBreakerError } from './circuitBreaker'
export type {
  CircuitState,
  CircuitBreakerOptions,
  CircuitBreakerStats,
  CircuitBreaker,
} from './circuitBreaker'

// Event Bus (Pub/Sub)
export { createEventBus } from './eventBus'
export type { EventBus, AppEvents } from './eventBus'

// Date Utilities
export {
  getDaysInMonth,
  getFirstDayOfMonth,
  formatDate,
  isSameDay,
  isSameMonth,
  isDateInRange,
  stripTime,
  isBefore,
  isAfter,
  WEEKDAY_LABELS_KO,
  MONTH_LABELS_KO,
} from './dateUtils'

// Benchmark Utilities
export { benchmark, benchmarkAsync, compareBenchmarks } from './benchmark'
export type { BenchmarkResult } from './benchmark'
