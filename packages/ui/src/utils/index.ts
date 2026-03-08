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
export { initErrorMonitoring, logError } from './errorMonitoring'

// Health Check
export { checkHealth } from './healthCheck'

// Web Vitals
export { reportWebVitals } from './webVitals'

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
