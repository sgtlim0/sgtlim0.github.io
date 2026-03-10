'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { useMarkdownEditor, MARKDOWN_SYNTAXES } from './hooks/useMarkdownEditor'
import type { UseMarkdownEditorReturn } from './hooks/useMarkdownEditor'

// ---- Simple markdown-to-JSX renderer (no dangerouslySetInnerHTML) ----

interface RenderedLine {
  readonly key: number
  readonly element: React.ReactNode
}

function parseInlineMarkdown(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = []
  let remaining = text
  let keyIdx = 0

  while (remaining.length > 0) {
    // Bold **text**
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/)
    // Italic *text* (not **)
    const italicMatch = remaining.match(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/)
    // Inline code `text`
    const codeMatch = remaining.match(/`(.+?)`/)
    // Link [text](url)
    const linkMatch = remaining.match(/\[(.+?)\]\((.+?)\)/)

    const matches = [
      boldMatch ? { type: 'bold' as const, match: boldMatch } : null,
      italicMatch ? { type: 'italic' as const, match: italicMatch } : null,
      codeMatch ? { type: 'code' as const, match: codeMatch } : null,
      linkMatch ? { type: 'link' as const, match: linkMatch } : null,
    ].filter(Boolean) as Array<{
      type: 'bold' | 'italic' | 'code' | 'link'
      match: RegExpMatchArray
    }>

    if (matches.length === 0) {
      nodes.push(remaining)
      break
    }

    // Pick the earliest match
    const earliest = matches.reduce((a, b) =>
      (a.match.index ?? 0) < (b.match.index ?? 0) ? a : b,
    )

    const idx = earliest.match.index ?? 0
    if (idx > 0) {
      nodes.push(remaining.slice(0, idx))
    }

    const k = keyIdx++
    switch (earliest.type) {
      case 'bold':
        nodes.push(
          <strong key={`b-${k}`} className="font-bold">
            {earliest.match[1]}
          </strong>,
        )
        break
      case 'italic':
        nodes.push(
          <em key={`i-${k}`} className="italic">
            {earliest.match[1]}
          </em>,
        )
        break
      case 'code':
        nodes.push(
          <code
            key={`c-${k}`}
            className="rounded bg-gray-100 px-1 py-0.5 font-mono text-sm dark:bg-gray-800"
          >
            {earliest.match[1]}
          </code>,
        )
        break
      case 'link':
        nodes.push(
          <a
            key={`a-${k}`}
            href={earliest.match[2]}
            className="text-blue-600 underline hover:text-blue-800 dark:text-blue-400"
            target="_blank"
            rel="noopener noreferrer"
          >
            {earliest.match[1]}
          </a>,
        )
        break
    }

    remaining = remaining.slice(idx + earliest.match[0].length)
  }

  return nodes
}

function renderMarkdownLine(line: string, key: number): RenderedLine {
  // Heading
  const headingMatch = line.match(/^(#{1,6})\s+(.*)/)
  if (headingMatch) {
    const level = headingMatch[1].length
    const text = parseInlineMarkdown(headingMatch[2])
    const Tag = `h${level}` as keyof Pick<
      JSX.IntrinsicElements,
      'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
    >
    const sizes: Record<number, string> = {
      1: 'text-2xl font-bold',
      2: 'text-xl font-bold',
      3: 'text-lg font-semibold',
      4: 'text-base font-semibold',
      5: 'text-sm font-semibold',
      6: 'text-xs font-semibold',
    }
    return {
      key,
      element: (
        <Tag key={key} className={`${sizes[level]} mb-1`}>
          {text}
        </Tag>
      ),
    }
  }

  // Blockquote
  if (line.startsWith('> ')) {
    return {
      key,
      element: (
        <blockquote
          key={key}
          className="border-l-4 border-gray-300 pl-3 italic text-gray-600 dark:border-gray-600 dark:text-gray-400"
        >
          {parseInlineMarkdown(line.slice(2))}
        </blockquote>
      ),
    }
  }

  // Unordered list
  if (line.match(/^[-*+]\s+/)) {
    const text = line.replace(/^[-*+]\s+/, '')
    return {
      key,
      element: (
        <li key={key} className="ml-4 list-disc">
          {parseInlineMarkdown(text)}
        </li>
      ),
    }
  }

  // Empty line
  if (line.trim() === '') {
    return { key, element: <br key={key} /> }
  }

  // Plain paragraph
  return {
    key,
    element: (
      <p key={key} className="mb-1">
        {parseInlineMarkdown(line)}
      </p>
    ),
  }
}

function MarkdownPreview({ value }: { readonly value: string }) {
  const rendered = useMemo(() => {
    const lines = value.split('\n')
    return lines.map((line, idx) => renderMarkdownLine(line, idx))
  }, [value])

  return (
    <div className="prose prose-sm dark:prose-invert max-w-none" data-testid="markdown-preview">
      {rendered.map((r) => r.element)}
    </div>
  )
}

// ---- Toolbar ----

interface ToolbarButton {
  readonly key: string
  readonly label: string
  readonly icon: string
  readonly ariaLabel: string
}

const TOOLBAR_BUTTONS: readonly ToolbarButton[] = [
  { key: 'bold', label: 'B', icon: 'B', ariaLabel: 'Bold' },
  { key: 'italic', label: 'I', icon: 'I', ariaLabel: 'Italic' },
  { key: 'heading', label: 'H', icon: 'H', ariaLabel: 'Heading' },
  { key: 'link', label: 'Link', icon: 'Link', ariaLabel: 'Link' },
  { key: 'code', label: '<>', icon: '<>', ariaLabel: 'Code' },
  { key: 'list', label: 'List', icon: 'List', ariaLabel: 'List' },
  { key: 'quote', label: '"', icon: '"', ariaLabel: 'Quote' },
] as const

function Toolbar({
  onAction,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: {
  readonly onAction: (key: string) => void
  readonly onUndo: () => void
  readonly onRedo: () => void
  readonly canUndo: boolean
  readonly canRedo: boolean
}) {
  return (
    <div
      className="flex flex-wrap items-center gap-1 border-b border-gray-200 px-2 py-1 dark:border-gray-700"
      role="toolbar"
      aria-label="Markdown formatting"
    >
      {TOOLBAR_BUTTONS.map((btn) => (
        <button
          key={btn.key}
          type="button"
          aria-label={btn.ariaLabel}
          onClick={() => onAction(btn.key)}
          className="rounded px-2 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          {btn.icon}
        </button>
      ))}
      <span className="mx-1 h-5 w-px bg-gray-300 dark:bg-gray-600" />
      <button
        type="button"
        aria-label="Undo"
        onClick={onUndo}
        disabled={!canUndo}
        className="rounded px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-40 dark:text-gray-300 dark:hover:bg-gray-700"
      >
        Undo
      </button>
      <button
        type="button"
        aria-label="Redo"
        onClick={onRedo}
        disabled={!canRedo}
        className="rounded px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-40 dark:text-gray-300 dark:hover:bg-gray-700"
      >
        Redo
      </button>
    </div>
  )
}

// ---- View Mode ----

export type EditorViewMode = 'edit' | 'preview' | 'split'

// ---- Main Component ----

export interface MarkdownEditorProps {
  /** Initial markdown content */
  readonly initialValue?: string
  /** Placeholder for the textarea */
  readonly placeholder?: string
  /** Called whenever the value changes */
  readonly onChange?: (value: string) => void
  /** Default view mode (default: 'split') */
  readonly defaultMode?: EditorViewMode
  /** Additional CSS class */
  readonly className?: string
}

export default function MarkdownEditor({
  initialValue = '',
  placeholder = 'Write markdown here...',
  onChange,
  defaultMode = 'split',
  className = '',
}: MarkdownEditorProps) {
  const [mode, setMode] = useState<EditorViewMode>(defaultMode)
  const editor: UseMarkdownEditorReturn = useMarkdownEditor(initialValue)

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      editor.setValue(e.target.value)
      onChange?.(e.target.value)
    },
    [editor, onChange],
  )

  const handleInsert = useCallback(
    (key: string) => {
      editor.insertMarkdown(key)
    },
    [editor],
  )

  const modeButtons: Array<{ mode: EditorViewMode; label: string }> = [
    { mode: 'edit', label: 'Edit' },
    { mode: 'split', label: 'Split' },
    { mode: 'preview', label: 'Preview' },
  ]

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}
      data-testid="markdown-editor"
    >
      {/* Header: toolbar + mode toggle + word count */}
      <Toolbar
        onAction={handleInsert}
        onUndo={editor.undo}
        onRedo={editor.redo}
        canUndo={editor.canUndo}
        canRedo={editor.canRedo}
      />

      <div className="flex items-center justify-between border-b border-gray-200 px-2 py-1 dark:border-gray-700">
        <div className="flex gap-1">
          {modeButtons.map((m) => (
            <button
              key={m.mode}
              type="button"
              onClick={() => setMode(m.mode)}
              aria-pressed={mode === m.mode}
              className={`rounded px-2 py-0.5 text-xs font-medium ${
                mode === m.mode
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <span className="text-xs text-gray-500 dark:text-gray-400" data-testid="word-char-count">
          {editor.wordCount} words / {editor.charCount} chars
        </span>
      </div>

      {/* Editor body */}
      <div className="flex min-h-[200px] flex-1">
        {(mode === 'edit' || mode === 'split') && (
          <textarea
            ref={editor.textareaRef}
            value={editor.value}
            onChange={handleChange}
            placeholder={placeholder}
            className={`flex-1 resize-none bg-white p-3 font-mono text-sm outline-none dark:bg-gray-900 dark:text-gray-100 ${
              mode === 'split' ? 'border-r border-gray-200 dark:border-gray-700' : ''
            }`}
            data-testid="markdown-textarea"
            aria-label="Markdown input"
          />
        )}
        {(mode === 'preview' || mode === 'split') && (
          <div className="flex-1 overflow-auto bg-white p-3 dark:bg-gray-900 dark:text-gray-100">
            <MarkdownPreview value={editor.value} />
          </div>
        )}
      </div>
    </div>
  )
}

export { MarkdownPreview, TOOLBAR_BUTTONS }
