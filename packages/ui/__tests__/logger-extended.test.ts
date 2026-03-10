import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  createLogger,
  setLogLevel,
  setTransport,
  resetLogger,
  getLogBuffer,
  type LogEntry,
} from '../src/utils/logger'

vi.mock('../src/utils/errorMonitoring', () => ({
  captureError: vi.fn(),
}))

/**
 * Extended logger tests — cover production branches (toJSON, formatForConsole),
 * edge cases, and console output routing.
 */
describe('logger extended coverage', () => {
  beforeEach(() => {
    resetLogger()
    vi.clearAllMocks()
    vi.spyOn(console, 'debug').mockImplementation(() => {})
    vi.spyOn(console, 'info').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
    resetLogger()
  })

  describe('production JSON output', () => {
    it('outputs JSON for warn level in production', () => {
      // Temporarily mock NODE_ENV
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'

      // Reset to pick up production defaults
      resetLogger()
      setLogLevel('warn')

      const log = createLogger('ProdTest')
      log.warn('production warning')

      // eslint-disable-next-line no-console
      expect(console.warn).toHaveBeenCalled()
      const callArg = (console.warn as ReturnType<typeof vi.fn>).mock.calls[0][0]
      const parsed = JSON.parse(callArg)
      expect(parsed.level).toBe('warn')
      expect(parsed.message).toBe('production warning')
      expect(parsed.context).toBe('ProdTest')

      process.env.NODE_ENV = originalEnv
    })

    it('outputs JSON for error level in production', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'
      resetLogger()
      setLogLevel('error')

      const log = createLogger('ProdErr')
      const err = new Error('prod error')
      log.error('failure', err, { attempt: 3 })

      // eslint-disable-next-line no-console
      expect(console.error).toHaveBeenCalled()
      const callArg = (console.error as ReturnType<typeof vi.fn>).mock.calls[0][0]
      const parsed = JSON.parse(callArg)
      expect(parsed.level).toBe('error')
      expect(parsed.error).toBeDefined()
      expect(parsed.error.name).toBe('Error')
      expect(parsed.error.message).toBe('prod error')
      expect(parsed.data.attempt).toBe(3)

      process.env.NODE_ENV = originalEnv
    })

    it('outputs JSON via console.log for debug/info in production when enabled', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'
      resetLogger()
      setLogLevel('debug')

      const log = createLogger('ProdDebug')
      log.info('prod info')

      // eslint-disable-next-line no-console
      expect(console.log).toHaveBeenCalled()

      process.env.NODE_ENV = originalEnv
    })

    it('JSON output omits empty data and null context', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'
      resetLogger()
      setLogLevel('warn')

      const entries: LogEntry[] = []
      setTransport((entry) => { entries.push(entry) })

      const log = createLogger('Ctx')
      log.warn('no data')

      expect(entries[0].data).toBeUndefined()

      process.env.NODE_ENV = originalEnv
    })
  })

  describe('console formatting (development)', () => {
    it('includes context in formatted output', () => {
      const log = createLogger('MyService')
      log.debug('test message', { key: 'value' })

      // eslint-disable-next-line no-console
      expect(console.debug).toHaveBeenCalled()
      const firstArg = (console.debug as ReturnType<typeof vi.fn>).mock.calls[0][0]
      expect(firstArg).toContain('[MyService]')
      expect(firstArg).toContain('[DEBUG]')
      expect(firstArg).toContain('test message')
    })

    it('passes data as second arg in development', () => {
      const log = createLogger('Test')
      const data = { userId: '123' }
      log.info('with data', data)

      // eslint-disable-next-line no-console
      const calls = (console.info as ReturnType<typeof vi.fn>).mock.calls
      expect(calls[0][1]).toEqual(data)
    })

    it('passes empty string when no data in development', () => {
      const log = createLogger('Test')
      log.info('no data')

      // eslint-disable-next-line no-console
      const calls = (console.info as ReturnType<typeof vi.fn>).mock.calls
      expect(calls[0][1]).toBe('')
    })

    it('passes error and data for error level in development', () => {
      const log = createLogger('Test')
      const err = new Error('test')
      const data = { extra: 'info' }
      log.error('fail', err, data)

      // eslint-disable-next-line no-console
      const calls = (console.error as ReturnType<typeof vi.fn>).mock.calls
      expect(calls[0][1]).toBe(err)
      expect(calls[0][2]).toEqual(data)
    })

    it('passes empty string when error level has no error or data', () => {
      const log = createLogger('Test')
      log.error('just a message')

      // eslint-disable-next-line no-console
      const calls = (console.error as ReturnType<typeof vi.fn>).mock.calls
      expect(calls[0][1]).toBe('')
      expect(calls[0][2]).toBe('')
    })
  })

  describe('buffer edge cases', () => {
    it('buffer handles rapid logging correctly', () => {
      setTransport(() => {})
      const log = createLogger('Rapid')

      for (let i = 0; i < 100; i++) {
        log.info(`message-${i}`)
      }

      // Default buffer size is 50
      const buffer = getLogBuffer()
      expect(buffer).toHaveLength(50)
      expect(buffer[0].message).toBe('message-50')
      expect(buffer[49].message).toBe('message-99')
    })
  })

  describe('log level filtering edge cases', () => {
    it('error level only allows error messages', () => {
      const entries: LogEntry[] = []
      setTransport((entry) => { entries.push(entry) })
      setLogLevel('error')

      const log = createLogger('Test')
      log.debug('d')
      log.info('i')
      log.warn('w')
      log.error('e')

      expect(entries).toHaveLength(1)
      expect(entries[0].level).toBe('error')
    })

    it('info level allows info, warn, error', () => {
      const entries: LogEntry[] = []
      setTransport((entry) => { entries.push(entry) })
      setLogLevel('info')

      const log = createLogger('Test')
      log.debug('d')
      log.info('i')
      log.warn('w')
      log.error('e')

      expect(entries).toHaveLength(3)
      expect(entries.map(e => e.level)).toEqual(['info', 'warn', 'error'])
    })
  })
})
