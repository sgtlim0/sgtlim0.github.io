import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { renderHook } from '@testing-library/react'
import { LogProvider, useLogger } from '../src/utils/LogProvider'
import { setTransport, resetLogger, getLogBuffer, type LogEntry } from '../src/utils/logger'
import type { ReactNode } from 'react'

vi.mock('../src/utils/errorMonitoring', () => ({
  captureError: vi.fn(),
}))

describe('LogProvider', () => {
  beforeEach(() => {
    resetLogger()
    vi.clearAllMocks()
    vi.spyOn(console, 'debug').mockImplementation(() => {})
    vi.spyOn(console, 'info').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
    resetLogger()
  })

  it('renders children', () => {
    render(
      <LogProvider>
        <div data-testid="child">Hello</div>
      </LogProvider>,
    )

    expect(screen.getByTestId('child')).toBeInTheDocument()
  })

  it('provides a logger via useLogger hook', () => {
    const entries: LogEntry[] = []
    setTransport((entry) => {
      entries.push(entry)
    })

    function TestComponent() {
      const log = useLogger('TestComponent')
      log.info('component rendered')
      return <div>Test</div>
    }

    render(
      <LogProvider>
        <TestComponent />
      </LogProvider>,
    )

    expect(entries.length).toBeGreaterThan(0)
    expect(entries[0].context).toBe('TestComponent')
    expect(entries[0].message).toBe('component rendered')
  })

  it('uses defaultContext when useLogger is called without argument', () => {
    const entries: LogEntry[] = []
    setTransport((entry) => {
      entries.push(entry)
    })

    function TestComponent() {
      const log = useLogger()
      log.info('no context provided')
      return <div>Test</div>
    }

    render(
      <LogProvider defaultContext="MyApp">
        <TestComponent />
      </LogProvider>,
    )

    expect(entries.some((e) => e.context === 'MyApp')).toBe(true)
  })

  it('falls back to "app" when no defaultContext is provided and useLogger has no argument', () => {
    const entries: LogEntry[] = []
    setTransport((entry) => {
      entries.push(entry)
    })

    function TestComponent() {
      const log = useLogger()
      log.info('fallback context')
      return <div>Test</div>
    }

    render(
      <LogProvider>
        <TestComponent />
      </LogProvider>,
    )

    expect(entries.some((e) => e.context === 'app')).toBe(true)
  })

  it('useLogger returns a logger with all four methods', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <LogProvider>{children}</LogProvider>
    )
    const { result } = renderHook(() => useLogger('Hook'), { wrapper })

    expect(typeof result.current.debug).toBe('function')
    expect(typeof result.current.info).toBe('function')
    expect(typeof result.current.warn).toBe('function')
    expect(typeof result.current.error).toBe('function')
  })

  it('useLogger works without LogProvider (uses default context)', () => {
    const entries: LogEntry[] = []
    setTransport((entry) => {
      entries.push(entry)
    })

    const { result } = renderHook(() => useLogger('Standalone'))
    result.current.info('outside provider')

    expect(entries[0].context).toBe('Standalone')
  })

  it('useLogger without context and without provider falls back to "app"', () => {
    const entries: LogEntry[] = []
    setTransport((entry) => {
      entries.push(entry)
    })

    const { result } = renderHook(() => useLogger())
    result.current.info('no provider, no context')

    expect(entries[0].context).toBe('app')
  })
})
