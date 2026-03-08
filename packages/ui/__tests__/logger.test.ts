import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  createLogger,
  setLogLevel,
  getLogLevel,
  getLogBuffer,
  clearLogBuffer,
  setBufferSize,
  getBufferSize,
  setTransport,
  resetLogger,
  type LogEntry,
  type LogLevel,
} from '../src/utils/logger'

// Mock captureError from errorMonitoring
vi.mock('../src/utils/errorMonitoring', () => ({
  captureError: vi.fn(),
}))

import { captureError } from '../src/utils/errorMonitoring'

const mockedCaptureError = vi.mocked(captureError)

describe('logger', () => {
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

  describe('createLogger', () => {
    it('creates a logger with all four methods', () => {
      const log = createLogger('TestContext')
      expect(typeof log.debug).toBe('function')
      expect(typeof log.info).toBe('function')
      expect(typeof log.warn).toBe('function')
      expect(typeof log.error).toBe('function')
    })

    it('binds the context to all log entries', () => {
      const entries: LogEntry[] = []
      setTransport((entry) => { entries.push(entry) })

      const log = createLogger('MyService')
      log.info('hello')

      expect(entries).toHaveLength(1)
      expect(entries[0].context).toBe('MyService')
    })
  })

  describe('log level filtering', () => {
    it('defaults to debug level in test environment', () => {
      expect(getLogLevel()).toBe('debug')
    })

    it('filters messages below the current log level', () => {
      const entries: LogEntry[] = []
      setTransport((entry) => { entries.push(entry) })

      setLogLevel('warn')
      const log = createLogger('Test')

      log.debug('should be suppressed')
      log.info('should be suppressed')
      log.warn('should pass')
      log.error('should pass')

      expect(entries).toHaveLength(2)
      expect(entries[0].level).toBe('warn')
      expect(entries[1].level).toBe('error')
    })

    it('allows all levels when set to debug', () => {
      const entries: LogEntry[] = []
      setTransport((entry) => { entries.push(entry) })

      setLogLevel('debug')
      const log = createLogger('Test')

      log.debug('d')
      log.info('i')
      log.warn('w')
      log.error('e')

      expect(entries).toHaveLength(4)
    })

    it('setLogLevel and getLogLevel are consistent', () => {
      const levels: LogLevel[] = ['debug', 'info', 'warn', 'error']
      for (const level of levels) {
        setLogLevel(level)
        expect(getLogLevel()).toBe(level)
      }
    })
  })

  describe('log entry structure', () => {
    it('includes timestamp in ISO format', () => {
      const entries: LogEntry[] = []
      setTransport((entry) => { entries.push(entry) })

      const log = createLogger('Test')
      log.info('hello')

      expect(entries[0].timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/)
    })

    it('includes optional data', () => {
      const entries: LogEntry[] = []
      setTransport((entry) => { entries.push(entry) })

      const log = createLogger('Test')
      log.info('with data', { userId: '123', action: 'login' })

      expect(entries[0].data).toEqual({ userId: '123', action: 'login' })
    })

    it('includes error object for error level', () => {
      const entries: LogEntry[] = []
      setTransport((entry) => { entries.push(entry) })

      const log = createLogger('Test')
      const err = new Error('something broke')
      log.error('failure', err, { retries: 3 })

      expect(entries[0].error).toBe(err)
      expect(entries[0].data).toEqual({ retries: 3 })
    })
  })

  describe('log buffer', () => {
    it('buffers log entries', () => {
      setTransport(() => {})
      const log = createLogger('Test')

      log.info('one')
      log.info('two')

      const buffer = getLogBuffer()
      expect(buffer).toHaveLength(2)
      expect(buffer[0].message).toBe('one')
      expect(buffer[1].message).toBe('two')
    })

    it('returns a copy of the buffer (immutable)', () => {
      setTransport(() => {})
      const log = createLogger('Test')
      log.info('entry')

      const buffer1 = getLogBuffer()
      const buffer2 = getLogBuffer()

      expect(buffer1).not.toBe(buffer2)
      expect(buffer1).toEqual(buffer2)
    })

    it('respects max buffer size', () => {
      setTransport(() => {})
      setBufferSize(3)

      const log = createLogger('Test')
      log.info('a')
      log.info('b')
      log.info('c')
      log.info('d')
      log.info('e')

      const buffer = getLogBuffer()
      expect(buffer).toHaveLength(3)
      expect(buffer[0].message).toBe('c')
      expect(buffer[2].message).toBe('e')
    })

    it('clearLogBuffer empties the buffer', () => {
      setTransport(() => {})
      const log = createLogger('Test')
      log.info('entry')

      clearLogBuffer()
      expect(getLogBuffer()).toHaveLength(0)
    })

    it('does not buffer filtered entries', () => {
      setTransport(() => {})
      setLogLevel('error')

      const log = createLogger('Test')
      log.debug('suppressed')
      log.info('suppressed')

      expect(getLogBuffer()).toHaveLength(0)
    })

    it('setBufferSize ignores non-positive values', () => {
      setBufferSize(0)
      expect(getBufferSize()).toBe(50) // default

      setBufferSize(-5)
      expect(getBufferSize()).toBe(50)
    })

    it('setBufferSize trims existing buffer when reduced', () => {
      setTransport(() => {})
      const log = createLogger('Test')
      log.info('a')
      log.info('b')
      log.info('c')
      log.info('d')
      log.info('e')

      setBufferSize(2)
      const buffer = getLogBuffer()
      expect(buffer).toHaveLength(2)
      expect(buffer[0].message).toBe('d')
      expect(buffer[1].message).toBe('e')
    })
  })

  describe('captureError integration', () => {
    it('calls captureError for error-level logs with an Error object', () => {
      setTransport(() => {})
      const log = createLogger('ErrorTest')
      const err = new Error('test error')

      log.error('something failed', err, { extra: 'data' })

      expect(mockedCaptureError).toHaveBeenCalledOnce()
      expect(mockedCaptureError).toHaveBeenCalledWith(err, {
        component: 'ErrorTest',
        action: 'structured-log',
        extra: { extra: 'data' },
      })
    })

    it('does not call captureError for error logs without Error object', () => {
      setTransport(() => {})
      const log = createLogger('Test')

      log.error('message only')

      expect(mockedCaptureError).not.toHaveBeenCalled()
    })

    it('does not call captureError for non-error levels', () => {
      setTransport(() => {})
      const log = createLogger('Test')

      log.debug('d')
      log.info('i')
      log.warn('w')

      expect(mockedCaptureError).not.toHaveBeenCalled()
    })
  })

  describe('custom transport', () => {
    it('routes all output through custom transport', () => {
      const transport = vi.fn()
      setTransport(transport)

      const log = createLogger('Custom')
      log.info('via transport')

      expect(transport).toHaveBeenCalledOnce()
      expect(transport.mock.calls[0][0].message).toBe('via transport')
    })

    it('restores console output when transport set to null', () => {
      setTransport(() => {})
      setTransport(null)

      const log = createLogger('Test')
      log.info('back to console')

      // eslint-disable-next-line no-console
      expect(console.info).toHaveBeenCalled()
    })
  })

  describe('console output (development)', () => {
    it('uses console.debug for debug level', () => {
      const log = createLogger('Test')
      log.debug('dbg message')
      // eslint-disable-next-line no-console
      expect(console.debug).toHaveBeenCalled()
    })

    it('uses console.info for info level', () => {
      const log = createLogger('Test')
      log.info('info message')
      // eslint-disable-next-line no-console
      expect(console.info).toHaveBeenCalled()
    })

    it('uses console.warn for warn level', () => {
      const log = createLogger('Test')
      log.warn('warn message')
      // eslint-disable-next-line no-console
      expect(console.warn).toHaveBeenCalled()
    })

    it('uses console.error for error level', () => {
      const log = createLogger('Test')
      log.error('err message')
      // eslint-disable-next-line no-console
      expect(console.error).toHaveBeenCalled()
    })
  })

  describe('resetLogger', () => {
    it('resets log level, buffer, buffer size, and transport', () => {
      setLogLevel('error')
      setBufferSize(10)
      setTransport(() => {})

      const log = createLogger('Pre')
      log.error('before reset')

      resetLogger()

      expect(getLogLevel()).toBe('debug')
      expect(getLogBuffer()).toHaveLength(0)
      expect(getBufferSize()).toBe(50)

      // Transport should be null (console output restored)
      const log2 = createLogger('Post')
      log2.info('after reset')
      // eslint-disable-next-line no-console
      expect(console.info).toHaveBeenCalled()
    })
  })
})
