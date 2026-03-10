'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { getProfileResults, clearProfiles } from './utils/performanceProfiler'
import type { ProfileMetrics } from './utils/performanceProfiler'

function isDevEnvironment(): boolean {
  return typeof process !== 'undefined'
    ? process.env.NODE_ENV !== 'production'
    : true
}

export interface ProfilerOverlayProps {
  /** Polling interval in ms (default: 1000) */
  readonly refreshInterval?: number
  /** Initial visibility (default: false) */
  readonly defaultVisible?: boolean
  /** Position on screen */
  readonly position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
}

const positionStyles: Record<string, React.CSSProperties> = {
  'top-left': { top: 8, left: 8 },
  'top-right': { top: 8, right: 8 },
  'bottom-left': { bottom: 8, left: 8 },
  'bottom-right': { bottom: 8, right: 8 },
}

/**
 * Development overlay that displays render profiling metrics.
 * Toggle with Cmd+Shift+P (Mac) or Ctrl+Shift+P (Windows/Linux).
 * Automatically disabled in production.
 */
export function ProfilerOverlay({
  refreshInterval = 1000,
  defaultVisible = false,
  position = 'bottom-right',
}: ProfilerOverlayProps): React.ReactElement | null {
  const [visible, setVisible] = useState(defaultVisible)
  const [results, setResults] = useState<ReadonlyArray<ProfileMetrics>>([])

  const isDev = useMemo(() => isDevEnvironment(), [])

  // Keyboard shortcut: Cmd+Shift+P / Ctrl+Shift+P
  useEffect(() => {
    if (!isDev) return

    function handleKeyDown(e: KeyboardEvent): void {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'p') {
        e.preventDefault()
        setVisible((prev) => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isDev])

  // Polling for metrics
  useEffect(() => {
    if (!isDev || !visible) return

    function refresh(): void {
      setResults(getProfileResults())
    }

    refresh()
    const id = setInterval(refresh, refreshInterval)
    return () => clearInterval(id)
  }, [isDev, visible, refreshInterval])

  const handleClear = useCallback(() => {
    clearProfiles()
    setResults([])
  }, [])

  if (!isDev || !visible) return null

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    zIndex: 99999,
    background: 'rgba(0, 0, 0, 0.88)',
    color: '#e0e0e0',
    fontFamily: 'monospace',
    fontSize: 11,
    padding: 10,
    borderRadius: 6,
    maxWidth: 380,
    maxHeight: 320,
    overflow: 'auto',
    boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
    ...positionStyles[position],
  }

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    borderBottom: '1px solid #444',
    paddingBottom: 4,
  }

  const buttonStyle: React.CSSProperties = {
    background: '#555',
    color: '#fff',
    border: 'none',
    borderRadius: 3,
    padding: '2px 6px',
    cursor: 'pointer',
    fontSize: 10,
    marginLeft: 4,
  }

  return (
    <div style={overlayStyle} data-testid="profiler-overlay">
      <div style={headerStyle}>
        <strong style={{ color: '#4fc3f7' }}>Profiler</strong>
        <div>
          <button type="button" style={buttonStyle} onClick={handleClear}>
            Clear
          </button>
          <button type="button" style={buttonStyle} onClick={() => setVisible(false)}>
            Close
          </button>
        </div>
      </div>
      {results.length === 0 ? (
        <div style={{ color: '#999', padding: '8px 0' }}>No profiled components</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ color: '#aaa', textAlign: 'left' }}>
              <th style={{ padding: '2px 4px' }}>Component</th>
              <th style={{ padding: '2px 4px' }}>Renders</th>
              <th style={{ padding: '2px 4px' }}>Avg (ms)</th>
              <th style={{ padding: '2px 4px' }}>Max (ms)</th>
            </tr>
          </thead>
          <tbody>
            {results.map((m) => (
              <tr key={m.id} style={{ borderTop: '1px solid #333' }}>
                <td style={{ padding: '2px 4px', color: '#81c784' }}>{m.id}</td>
                <td style={{ padding: '2px 4px' }}>{m.renderCount}</td>
                <td style={{ padding: '2px 4px' }}>{m.averageRenderTime.toFixed(2)}</td>
                <td style={{ padding: '2px 4px', color: m.maxRenderTime > 16 ? '#ef5350' : '#e0e0e0' }}>
                  {m.maxRenderTime.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default ProfilerOverlay
