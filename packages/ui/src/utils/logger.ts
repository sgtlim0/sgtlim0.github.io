/**
 * Structured Logging Service
 *
 * Provides environment-aware structured logging with JSON output (production),
 * console output (development), log buffering, and captureError integration.
 */

import { captureError } from './errorMonitoring'

/** Log severity levels ordered by priority. */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

/** A single structured log entry. */
export interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: string
  data?: Record<string, unknown>
  error?: Error
}

/** Logger instance returned by createLogger. */
export interface Logger {
  debug: (message: string, data?: Record<string, unknown>) => void
  info: (message: string, data?: Record<string, unknown>) => void
  warn: (message: string, data?: Record<string, unknown>) => void
  error: (message: string, error?: Error, data?: Record<string, unknown>) => void
}

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

const DEFAULT_BUFFER_SIZE = 50

let currentLogLevel: LogLevel = resolveDefaultLevel()
let logBuffer: LogEntry[] = []
let maxBufferSize: number = DEFAULT_BUFFER_SIZE
let customTransport: ((entry: LogEntry) => void) | null = null

function resolveDefaultLevel(): LogLevel {
  if (typeof process !== 'undefined' && process.env) {
    if (process.env.NEXT_PUBLIC_LOG_LEVEL) {
      const envLevel = process.env.NEXT_PUBLIC_LOG_LEVEL as LogLevel
      if (envLevel in LOG_LEVEL_PRIORITY) {
        return envLevel
      }
    }
    return process.env.NODE_ENV === 'production' ? 'warn' : 'debug'
  }
  return 'debug'
}

function isProduction(): boolean {
  if (typeof process !== 'undefined' && process.env) {
    return process.env.NODE_ENV === 'production'
  }
  return false
}

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[currentLogLevel]
}

function formatForConsole(entry: LogEntry): string {
  const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}]`
  const ctx = entry.context ? ` [${entry.context}]` : ''
  return `${prefix}${ctx} ${entry.message}`
}

function toJSON(entry: LogEntry): string {
  const serializable: Record<string, unknown> = {
    level: entry.level,
    message: entry.message,
    timestamp: entry.timestamp,
  }
  if (entry.context) {
    serializable.context = entry.context
  }
  if (entry.data && Object.keys(entry.data).length > 0) {
    serializable.data = entry.data
  }
  if (entry.error) {
    serializable.error = {
      name: entry.error.name,
      message: entry.error.message,
      stack: entry.error.stack,
    }
  }
  return JSON.stringify(serializable)
}

function addToBuffer(entry: LogEntry): void {
  if (logBuffer.length >= maxBufferSize) {
    logBuffer = logBuffer.slice(1)
  }
  logBuffer = [...logBuffer, entry]
}

function writeLog(entry: LogEntry): void {
  if (!shouldLog(entry.level)) return

  addToBuffer(entry)

  if (customTransport) {
    customTransport(entry)
  } else if (isProduction()) {
    const json = toJSON(entry)
    switch (entry.level) {
      case 'warn':
        // eslint-disable-next-line no-console
        console.warn(json)
        break
      case 'error':
        // eslint-disable-next-line no-console
        console.error(json)
        break
      default:
        // In production, debug/info are suppressed by default log level (warn)
        // but if explicitly enabled, output as JSON
        // eslint-disable-next-line no-console
        console.log(json)
    }
  } else {
    const formatted = formatForConsole(entry)
    switch (entry.level) {
      case 'debug':
        // eslint-disable-next-line no-console
        console.debug(formatted, entry.data ?? '')
        break
      case 'info':
        // eslint-disable-next-line no-console
        console.info(formatted, entry.data ?? '')
        break
      case 'warn':
        // eslint-disable-next-line no-console
        console.warn(formatted, entry.data ?? '')
        break
      case 'error':
        // eslint-disable-next-line no-console
        console.error(formatted, entry.error ?? '', entry.data ?? '')
        break
    }
  }

  // Auto-integrate with captureError for error-level logs
  if (entry.level === 'error' && entry.error) {
    captureError(entry.error, {
      component: entry.context,
      action: 'structured-log',
      extra: entry.data,
    })
  }
}

/**
 * Creates a logger instance bound to a specific context (component/service name).
 * @param context - Name identifying the source of log messages
 * @returns Logger with debug, info, warn, error methods
 */
export function createLogger(context: string): Logger {
  return {
    debug(message: string, data?: Record<string, unknown>): void {
      writeLog({
        level: 'debug',
        message,
        timestamp: new Date().toISOString(),
        context,
        data,
      })
    },

    info(message: string, data?: Record<string, unknown>): void {
      writeLog({
        level: 'info',
        message,
        timestamp: new Date().toISOString(),
        context,
        data,
      })
    },

    warn(message: string, data?: Record<string, unknown>): void {
      writeLog({
        level: 'warn',
        message,
        timestamp: new Date().toISOString(),
        context,
        data,
      })
    },

    error(message: string, error?: Error, data?: Record<string, unknown>): void {
      writeLog({
        level: 'error',
        message,
        timestamp: new Date().toISOString(),
        context,
        data,
        error,
      })
    },
  }
}

/**
 * Sets the minimum log level. Messages below this level are suppressed.
 * @param level - Minimum log level to output
 */
export function setLogLevel(level: LogLevel): void {
  currentLogLevel = level
}

/**
 * Returns the current minimum log level.
 */
export function getLogLevel(): LogLevel {
  return currentLogLevel
}

/**
 * Returns the buffered log entries (most recent N entries).
 * Useful for providing context when an error occurs.
 * @returns Readonly array of LogEntry
 */
export function getLogBuffer(): readonly LogEntry[] {
  return [...logBuffer]
}

/**
 * Clears all buffered log entries.
 */
export function clearLogBuffer(): void {
  logBuffer = []
}

/**
 * Configures the maximum number of entries retained in the log buffer.
 * @param size - Maximum buffer size (must be positive)
 */
export function setBufferSize(size: number): void {
  if (size <= 0) return
  maxBufferSize = size
  if (logBuffer.length > maxBufferSize) {
    logBuffer = logBuffer.slice(logBuffer.length - maxBufferSize)
  }
}

/**
 * Returns the current maximum buffer size.
 */
export function getBufferSize(): number {
  return maxBufferSize
}

/**
 * Sets a custom transport function for log output.
 * When set, all log output goes through this function instead of console.
 * Pass null to restore default console output.
 * @param transport - Custom transport function or null
 */
export function setTransport(transport: ((entry: LogEntry) => void) | null): void {
  customTransport = transport
}

/**
 * Resets all logger configuration to defaults.
 * Useful for test cleanup.
 */
export function resetLogger(): void {
  currentLogLevel = resolveDefaultLevel()
  logBuffer = []
  maxBufferSize = DEFAULT_BUFFER_SIZE
  customTransport = null
}
