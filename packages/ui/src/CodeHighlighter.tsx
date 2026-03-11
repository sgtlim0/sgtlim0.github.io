'use client'

import React, { useMemo } from 'react'
import CopyButton from './CopyButton'
import {
  tokenizeLine,
  resolveLanguage,
  TOKEN_CLASS_MAP,
} from './utils/codeTokenizer'
import type { SupportedLanguage } from './utils/codeTokenizer'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CodeHighlighterProps {
  /** Source code to highlight */
  readonly code: string
  /** Language for syntax highlighting (js, ts, python, css, json, bash) */
  readonly language?: string
  /** Show line numbers (default true) */
  readonly showLineNumbers?: boolean
  /** Line numbers to highlight with a background color (1-based) */
  readonly highlightLines?: readonly number[]
  /** Maximum height in pixels (enables vertical scroll) */
  readonly maxHeight?: number
  /** Show copy-to-clipboard button (default true) */
  readonly copyable?: boolean
  /** Color theme (default 'dark') */
  readonly theme?: 'light' | 'dark'
  /** Additional CSS class names on the outer wrapper */
  readonly className?: string
}

// ---------------------------------------------------------------------------
// Inline styles (no external CSS dependency)
// ---------------------------------------------------------------------------

const THEME_STYLES = {
  light: {
    bg: '#f8f9fa',
    border: '#e2e8f0',
    lineNumColor: '#94a3b8',
    lineNumBorder: '#e2e8f0',
    highlightBg: 'rgba(59, 130, 246, 0.1)',
    text: '#1e293b',
    keyword: '#7c3aed',
    string: '#059669',
    number: '#d97706',
    comment: '#94a3b8',
    operator: '#dc2626',
    punctuation: '#64748b',
  },
  dark: {
    bg: '#1e1e2e',
    border: '#313244',
    lineNumColor: '#585b70',
    lineNumBorder: '#313244',
    highlightBg: 'rgba(137, 180, 250, 0.1)',
    text: '#cdd6f4',
    keyword: '#cba6f7',
    string: '#a6e3a1',
    number: '#fab387',
    comment: '#585b70',
    operator: '#f38ba8',
    punctuation: '#6c7086',
  },
} as const

interface ThemeColors {
  readonly bg: string
  readonly border: string
  readonly lineNumColor: string
  readonly lineNumBorder: string
  readonly highlightBg: string
  readonly text: string
  readonly keyword: string
  readonly string: string
  readonly number: string
  readonly comment: string
  readonly operator: string
  readonly punctuation: string
}

function tokenColorKey(type: string): keyof ThemeColors {
  switch (type) {
    case 'keyword':
      return 'keyword'
    case 'string':
      return 'string'
    case 'number':
      return 'number'
    case 'comment':
      return 'comment'
    case 'operator':
      return 'operator'
    case 'punctuation':
      return 'punctuation'
    default:
      return 'text'
  }
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface LineProps {
  readonly tokens: readonly { type: string; value: string }[]
  readonly lineNumber: number
  readonly showLineNumbers: boolean
  readonly isHighlighted: boolean
  readonly colors: ThemeColors
}

const CodeLine = React.memo(function CodeLine({
  tokens,
  lineNumber,
  showLineNumbers,
  isHighlighted,
  colors,
}: LineProps) {
  return (
    <div
      style={{
        display: 'flex',
        backgroundColor: isHighlighted ? colors.highlightBg : 'transparent',
        minHeight: '1.5em',
      }}
    >
      {showLineNumbers && (
        <span
          aria-hidden="true"
          style={{
            display: 'inline-block',
            width: '3em',
            minWidth: '3em',
            textAlign: 'right',
            paddingRight: '1em',
            marginRight: '1em',
            color: colors.lineNumColor,
            borderRight: `1px solid ${colors.lineNumBorder}`,
            userSelect: 'none',
            flexShrink: 0,
          }}
        >
          {lineNumber}
        </span>
      )}
      <span style={{ flex: 1 }}>
        {tokens.map((token, i) => (
          <span
            key={i}
            className={TOKEN_CLASS_MAP[token.type as keyof typeof TOKEN_CLASS_MAP] ?? 'ch-plain'}
            style={{ color: colors[tokenColorKey(token.type)] }}
          >
            {token.value}
          </span>
        ))}
      </span>
    </div>
  )
})

// ---------------------------------------------------------------------------
// Header bar (language label + copy button)
// ---------------------------------------------------------------------------

interface HeaderProps {
  readonly language: string
  readonly copyable: boolean
  readonly code: string
  readonly colors: ThemeColors
}

function HeaderBar({ language, copyable, code, colors }: HeaderProps) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.375rem 0.75rem',
        borderBottom: `1px solid ${colors.border}`,
        fontSize: '0.75rem',
      }}
    >
      <span style={{ color: colors.lineNumColor, textTransform: 'uppercase', fontWeight: 600 }}>
        {language}
      </span>
      {copyable && <CopyButton text={code} />}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function CodeHighlighter({
  code,
  language,
  showLineNumbers = true,
  highlightLines = [],
  maxHeight,
  copyable = true,
  theme = 'dark',
  className = '',
}: CodeHighlighterProps) {
  const resolvedLang: SupportedLanguage = useMemo(
    () => resolveLanguage(language),
    [language],
  )

  const colors = THEME_STYLES[theme]

  const highlightSet = useMemo(
    () => new Set(highlightLines),
    [highlightLines],
  )

  const lines = useMemo(() => {
    const raw = code.endsWith('\n') ? code.slice(0, -1) : code
    return raw.split('\n')
  }, [code])

  const tokenizedLines = useMemo(
    () => lines.map((line) => tokenizeLine(line, resolvedLang)),
    [lines, resolvedLang],
  )

  return (
    <div
      role="region"
      aria-label={`${language ?? 'code'} code block`}
      data-testid="code-highlighter"
      className={className}
      style={{
        borderRadius: '0.5rem',
        border: `1px solid ${colors.border}`,
        backgroundColor: colors.bg,
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Menlo, Monaco, Consolas, monospace",
        fontSize: '0.875rem',
        lineHeight: '1.5',
        overflow: 'hidden',
      }}
    >
      <HeaderBar
        language={language ?? resolvedLang}
        copyable={copyable}
        code={code}
        colors={colors}
      />

      <div
        style={{
          padding: '0.75rem',
          overflowX: 'auto',
          overflowY: maxHeight ? 'auto' : 'visible',
          maxHeight: maxHeight ? `${maxHeight}px` : undefined,
        }}
      >
        <pre style={{ margin: 0, padding: 0, background: 'transparent' }}>
          <code style={{ color: colors.text }}>
            {tokenizedLines.map((tokens, idx) => (
              <CodeLine
                key={idx}
                tokens={tokens}
                lineNumber={idx + 1}
                showLineNumbers={showLineNumbers}
                isHighlighted={highlightSet.has(idx + 1)}
                colors={colors}
              />
            ))}
          </code>
        </pre>
      </div>
    </div>
  )
}
