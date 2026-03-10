'use client'

import React from 'react'
import type { DiffResult, DiffLine } from './utils/contentDiff'

export type DiffViewMode = 'unified' | 'side-by-side'

export interface DiffViewerProps {
  /** The diff result to display. */
  readonly diff: DiffResult
  /** Display mode — 'unified' (default) or 'side-by-side'. */
  readonly viewMode?: DiffViewMode
  /** Optional class name for the root element. */
  readonly className?: string
}

const LINE_STYLES: Record<string, React.CSSProperties> = {
  added: {
    backgroundColor: 'var(--diff-added-bg, rgba(46, 160, 67, 0.15))',
    color: 'var(--diff-added-color, #2ea043)',
  },
  removed: {
    backgroundColor: 'var(--diff-removed-bg, rgba(248, 81, 73, 0.15))',
    color: 'var(--diff-removed-color, #f85149)',
  },
  unchanged: {
    backgroundColor: 'transparent',
    color: 'var(--diff-unchanged-color, inherit)',
  },
}

const PREFIX_MAP: Record<string, string> = {
  added: '+ ',
  removed: '- ',
  unchanged: '  ',
}

const rootStyle: React.CSSProperties = {
  fontFamily: 'monospace',
  fontSize: '13px',
  lineHeight: '1.5',
  overflow: 'auto',
  border: '1px solid var(--diff-border, #d0d7de)',
  borderRadius: '6px',
}

const lineNumberStyle: React.CSSProperties = {
  display: 'inline-block',
  width: '40px',
  textAlign: 'right',
  paddingRight: '8px',
  color: 'var(--diff-line-number-color, #6e7781)',
  userSelect: 'none',
  flexShrink: 0,
}

const lineContentStyle: React.CSSProperties = {
  whiteSpace: 'pre',
  flex: 1,
}

const lineRowStyle: React.CSSProperties = {
  display: 'flex',
  padding: '0 8px',
  minHeight: '20px',
}

function UnifiedLine({ line }: { readonly line: DiffLine }) {
  const style = LINE_STYLES[line.type]
  const prefix = PREFIX_MAP[line.type]
  const lineNum = line.type === 'removed' ? line.oldLineNumber : line.newLineNumber

  return (
    <div style={{ ...lineRowStyle, ...style }} data-diff-type={line.type}>
      <span style={lineNumberStyle}>{lineNum ?? ''}</span>
      <span style={lineContentStyle}>
        {prefix}
        {line.content}
      </span>
    </div>
  )
}

function UnifiedView({ changes }: { readonly changes: readonly DiffLine[] }) {
  return (
    <div>
      {changes.map((line, idx) => (
        <UnifiedLine key={idx} line={line} />
      ))}
    </div>
  )
}

function SideBySideView({ changes }: { readonly changes: readonly DiffLine[] }) {
  // Build left (old) and right (new) columns
  const left: (DiffLine | null)[] = []
  const right: (DiffLine | null)[] = []

  let i = 0
  while (i < changes.length) {
    const line = changes[i]
    if (line.type === 'unchanged') {
      left.push(line)
      right.push(line)
      i++
    } else if (line.type === 'removed') {
      // Check if next is 'added' to pair them
      const next = i + 1 < changes.length ? changes[i + 1] : null
      if (next && next.type === 'added') {
        left.push(line)
        right.push(next)
        i += 2
      } else {
        left.push(line)
        right.push(null)
        i++
      }
    } else {
      // added without preceding removed
      left.push(null)
      right.push(line)
      i++
    }
  }

  const halfStyle: React.CSSProperties = {
    flex: 1,
    overflow: 'hidden',
    borderRight: '1px solid var(--diff-border, #d0d7de)',
  }

  const emptyLineStyle: React.CSSProperties = {
    ...lineRowStyle,
    backgroundColor: 'var(--diff-empty-bg, rgba(128, 128, 128, 0.05))',
    minHeight: '20px',
  }

  return (
    <div style={{ display: 'flex' }}>
      <div style={halfStyle}>
        {left.map((line, idx) =>
          line ? (
            <div
              key={idx}
              style={{ ...lineRowStyle, ...LINE_STYLES[line.type] }}
              data-diff-type={line.type}
            >
              <span style={lineNumberStyle}>{line.oldLineNumber ?? ''}</span>
              <span style={lineContentStyle}>{line.content}</span>
            </div>
          ) : (
            <div key={idx} style={emptyLineStyle} />
          ),
        )}
      </div>
      <div style={{ flex: 1 }}>
        {right.map((line, idx) =>
          line ? (
            <div
              key={idx}
              style={{ ...lineRowStyle, ...LINE_STYLES[line.type] }}
              data-diff-type={line.type}
            >
              <span style={lineNumberStyle}>{line.newLineNumber ?? ''}</span>
              <span style={lineContentStyle}>{line.content}</span>
            </div>
          ) : (
            <div key={idx} style={emptyLineStyle} />
          ),
        )}
      </div>
    </div>
  )
}

/**
 * Component for displaying a line-based diff.
 *
 * Supports unified and side-by-side view modes.
 * Added lines are highlighted green, removed lines red.
 * Line numbers are displayed in the gutter.
 */
export function DiffViewer({ diff, viewMode = 'unified', className }: DiffViewerProps) {
  if (diff.changes.length === 0) {
    return (
      <div style={rootStyle} className={className}>
        <div style={{ padding: '16px', textAlign: 'center', color: '#6e7781' }}>
          No differences
        </div>
      </div>
    )
  }

  return (
    <div style={rootStyle} className={className} role="region" aria-label="Diff viewer">
      <div
        style={{
          padding: '8px 12px',
          borderBottom: '1px solid var(--diff-border, #d0d7de)',
          fontSize: '12px',
          color: 'var(--diff-summary-color, #6e7781)',
        }}
      >
        <span style={{ color: 'var(--diff-added-color, #2ea043)', marginRight: '12px' }}>
          +{diff.additions}
        </span>
        <span style={{ color: 'var(--diff-removed-color, #f85149)' }}>
          -{diff.deletions}
        </span>
      </div>
      {viewMode === 'side-by-side' ? (
        <SideBySideView changes={diff.changes} />
      ) : (
        <UnifiedView changes={diff.changes} />
      )}
    </div>
  )
}

export default DiffViewer
