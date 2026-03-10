'use client'

import React, { useState, useCallback } from 'react'
import type { ContentVersion } from './hooks/useContentVersion'
import type { DiffResult } from './utils/contentDiff'
import { DiffViewer } from './DiffViewer'
import type { DiffViewMode } from './DiffViewer'

export interface VersionHistoryProps {
  /** List of versions to display (newest first). */
  readonly versions: readonly ContentVersion[]
  /** Callback to compute diff between two versions. */
  readonly onDiff: (v1Id: string, v2Id: string) => DiffResult | null
  /** Callback when user clicks restore on a version. */
  readonly onRestore?: (versionId: string) => void
  /** Callback when user clicks delete on a version. */
  readonly onDelete?: (versionId: string) => void
  /** Optional class name for the root element. */
  readonly className?: string
}

const containerStyle: React.CSSProperties = {
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontSize: '14px',
  border: '1px solid var(--vh-border, #d0d7de)',
  borderRadius: '8px',
  overflow: 'hidden',
}

const headerStyle: React.CSSProperties = {
  padding: '12px 16px',
  fontWeight: 600,
  borderBottom: '1px solid var(--vh-border, #d0d7de)',
  backgroundColor: 'var(--vh-header-bg, #f6f8fa)',
}

const itemStyle: React.CSSProperties = {
  padding: '10px 16px',
  borderBottom: '1px solid var(--vh-border, #d0d7de)',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  cursor: 'pointer',
}

const itemSelectedStyle: React.CSSProperties = {
  backgroundColor: 'var(--vh-selected-bg, rgba(9, 105, 218, 0.08))',
}

const timestampStyle: React.CSSProperties = {
  fontSize: '12px',
  color: 'var(--vh-muted, #6e7781)',
}

const messageStyle: React.CSSProperties = {
  flex: 1,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}

const buttonStyle: React.CSSProperties = {
  padding: '4px 12px',
  fontSize: '12px',
  borderRadius: '4px',
  border: '1px solid var(--vh-border, #d0d7de)',
  backgroundColor: 'var(--vh-button-bg, #ffffff)',
  cursor: 'pointer',
  color: 'inherit',
  flexShrink: 0,
}

const restoreButtonStyle: React.CSSProperties = {
  ...buttonStyle,
  backgroundColor: 'var(--vh-restore-bg, #2ea043)',
  color: 'var(--vh-restore-color, #ffffff)',
  border: 'none',
}

const deleteButtonStyle: React.CSSProperties = {
  ...buttonStyle,
  color: 'var(--vh-delete-color, #cf222e)',
  borderColor: 'var(--vh-delete-border, #cf222e)',
}

const viewModeToggleStyle: React.CSSProperties = {
  display: 'flex',
  gap: '4px',
  padding: '8px 16px',
  borderBottom: '1px solid var(--vh-border, #d0d7de)',
}

const toggleButtonStyle: React.CSSProperties = {
  ...buttonStyle,
  fontSize: '11px',
  padding: '2px 8px',
}

const toggleActiveStyle: React.CSSProperties = {
  ...toggleButtonStyle,
  backgroundColor: 'var(--vh-toggle-active-bg, #0969da)',
  color: 'var(--vh-toggle-active-color, #ffffff)',
  border: 'none',
}

function formatTimestamp(ts: number): string {
  const date = new Date(ts)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

/**
 * Component for displaying and interacting with content version history.
 *
 * Features:
 * - Version list sorted by time (newest first)
 * - Click two versions to compare them with a diff viewer
 * - Restore and delete buttons per version
 * - Unified or side-by-side diff view toggle
 */
export function VersionHistory({
  versions,
  onDiff,
  onRestore,
  onDelete,
  className,
}: VersionHistoryProps) {
  const [selected, setSelected] = useState<readonly string[]>([])
  const [diffResult, setDiffResult] = useState<DiffResult | null>(null)
  const [viewMode, setViewMode] = useState<DiffViewMode>('unified')

  const handleSelect = useCallback(
    (id: string) => {
      setSelected((prev) => {
        if (prev.includes(id)) {
          // Deselect
          const next = prev.filter((s) => s !== id)
          if (next.length < 2) setDiffResult(null)
          return next
        }
        if (prev.length >= 2) {
          // Replace second selection
          const next = [prev[0], id]
          const result = onDiff(next[0], next[1])
          setDiffResult(result)
          return next
        }
        const next = [...prev, id]
        if (next.length === 2) {
          const result = onDiff(next[0], next[1])
          setDiffResult(result)
        }
        return next
      })
    },
    [onDiff],
  )

  const handleRestore = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.stopPropagation()
      onRestore?.(id)
    },
    [onRestore],
  )

  const handleDelete = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.stopPropagation()
      onDelete?.(id)
      setSelected((prev) => {
        const next = prev.filter((s) => s !== id)
        if (next.length < 2) setDiffResult(null)
        return next
      })
    },
    [onDelete],
  )

  if (versions.length === 0) {
    return (
      <div style={containerStyle} className={className}>
        <div style={headerStyle}>Version History</div>
        <div
          style={{
            padding: '24px 16px',
            textAlign: 'center',
            color: 'var(--vh-muted, #6e7781)',
          }}
        >
          No versions saved yet
        </div>
      </div>
    )
  }

  return (
    <div style={containerStyle} className={className} role="region" aria-label="Version history">
      <div style={headerStyle}>
        Version History ({versions.length})
        {selected.length > 0 && (
          <span style={{ fontWeight: 400, fontSize: '12px', marginLeft: '8px' }}>
            — Select 2 versions to compare
          </span>
        )}
      </div>

      <div style={{ maxHeight: '300px', overflow: 'auto' }}>
        {versions.map((version, index) => {
          const isSelected = selected.includes(version.id)
          return (
            <div
              key={version.id}
              style={{
                ...itemStyle,
                ...(isSelected ? itemSelectedStyle : {}),
                ...(index === versions.length - 1
                  ? { borderBottom: diffResult ? '1px solid var(--vh-border, #d0d7de)' : 'none' }
                  : {}),
              }}
              onClick={() => handleSelect(version.id)}
              role="button"
              tabIndex={0}
              aria-pressed={isSelected}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleSelect(version.id)
                }
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={messageStyle}>
                  {version.message ?? `Version ${versions.length - index}`}
                </div>
                <div style={timestampStyle}>
                  {formatTimestamp(version.timestamp)}
                  {version.author ? ` by ${version.author}` : ''}
                </div>
              </div>
              {onRestore && (
                <button
                  type="button"
                  style={restoreButtonStyle}
                  onClick={(e) => handleRestore(e, version.id)}
                  aria-label={`Restore version ${versions.length - index}`}
                >
                  Restore
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  style={deleteButtonStyle}
                  onClick={(e) => handleDelete(e, version.id)}
                  aria-label={`Delete version ${versions.length - index}`}
                >
                  Delete
                </button>
              )}
            </div>
          )
        })}
      </div>

      {diffResult && (
        <>
          <div style={viewModeToggleStyle}>
            <button
              type="button"
              style={viewMode === 'unified' ? toggleActiveStyle : toggleButtonStyle}
              onClick={() => setViewMode('unified')}
            >
              Unified
            </button>
            <button
              type="button"
              style={viewMode === 'side-by-side' ? toggleActiveStyle : toggleButtonStyle}
              onClick={() => setViewMode('side-by-side')}
            >
              Side by Side
            </button>
          </div>
          <DiffViewer diff={diffResult} viewMode={viewMode} />
        </>
      )}
    </div>
  )
}

export default VersionHistory
