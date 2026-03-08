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

// Persist Storage (IndexedDB + localStorage)
export { createPersistStorage, persistStorage, _resetDB as _resetPersistDB } from './persistStorage'
export type { PersistStorage } from './persistStorage'
