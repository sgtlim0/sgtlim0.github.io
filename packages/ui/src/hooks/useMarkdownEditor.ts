'use client'

import { useState, useCallback, useRef } from 'react'

interface HistoryEntry {
  readonly value: string
  readonly cursorStart: number
  readonly cursorEnd: number
}

const MAX_HISTORY = 100

export interface MarkdownSyntax {
  /** The syntax prefix (e.g. '**', '*', '`') */
  readonly prefix: string
  /** The syntax suffix — defaults to prefix if omitted */
  readonly suffix?: string
  /** Whether the syntax wraps selected text (true) or is prepended to the line (false) */
  readonly wrap: boolean
  /** Placeholder text when nothing is selected */
  readonly placeholder?: string
}

export const MARKDOWN_SYNTAXES: Record<string, MarkdownSyntax> = {
  bold: { prefix: '**', wrap: true, placeholder: 'bold text' },
  italic: { prefix: '*', wrap: true, placeholder: 'italic text' },
  heading: { prefix: '## ', wrap: false, placeholder: 'heading' },
  link: { prefix: '[', suffix: '](url)', wrap: true, placeholder: 'link text' },
  code: { prefix: '`', wrap: true, placeholder: 'code' },
  list: { prefix: '- ', wrap: false, placeholder: 'list item' },
  quote: { prefix: '> ', wrap: false, placeholder: 'quote' },
} as const

export interface UseMarkdownEditorReturn {
  /** Current editor value */
  readonly value: string
  /** Set the editor value directly */
  setValue: (v: string) => void
  /** Insert markdown syntax at the current cursor position */
  insertMarkdown: (syntaxKey: string) => void
  /** Undo the last change */
  undo: () => void
  /** Redo the last undone change */
  redo: () => void
  /** Whether undo is available */
  readonly canUndo: boolean
  /** Whether redo is available */
  readonly canRedo: boolean
  /** Number of words in the current value */
  readonly wordCount: number
  /** Number of characters in the current value */
  readonly charCount: number
  /** Ref to attach to the textarea element */
  readonly textareaRef: React.RefObject<HTMLTextAreaElement | null>
}

function countWords(text: string): number {
  const trimmed = text.trim()
  if (trimmed.length === 0) return 0
  return trimmed.split(/\s+/).length
}

/**
 * Hook for markdown editing with toolbar syntax insertion and undo/redo.
 *
 * Attach `textareaRef` to your `<textarea>` so that `insertMarkdown`
 * can read the selection range and update the cursor position.
 *
 * @param initialValue - Starting text content (default: '')
 * @returns Editor state, actions, and computed counts
 *
 * @example
 * ```tsx
 * const editor = useMarkdownEditor('# Hello')
 * // <textarea ref={editor.textareaRef} value={editor.value} onChange={e => editor.setValue(e.target.value)} />
 * // <button onClick={() => editor.insertMarkdown('bold')}>Bold</button>
 * ```
 */
export function useMarkdownEditor(
  initialValue: string = '',
): UseMarkdownEditorReturn {
  const [value, setValueRaw] = useState(initialValue)

  const pastRef = useRef<readonly HistoryEntry[]>([])
  const futureRef = useRef<readonly HistoryEntry[]>([])
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  const pushHistory = useCallback((entry: HistoryEntry) => {
    const past = pastRef.current
    pastRef.current =
      past.length >= MAX_HISTORY
        ? [...past.slice(1), entry]
        : [...past, entry]
    futureRef.current = []
  }, [])

  const getCursor = useCallback((): { start: number; end: number } => {
    const el = textareaRef.current
    if (!el) return { start: 0, end: 0 }
    return { start: el.selectionStart ?? 0, end: el.selectionEnd ?? 0 }
  }, [])

  const setCursor = useCallback((start: number, end: number) => {
    const el = textareaRef.current
    if (!el) return
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(start, end)
    })
  }, [])

  const setValue = useCallback(
    (v: string) => {
      const cursor = getCursor()
      pushHistory({ value, cursorStart: cursor.start, cursorEnd: cursor.end })
      setValueRaw(v)
    },
    [value, getCursor, pushHistory],
  )

  const insertMarkdown = useCallback(
    (syntaxKey: string) => {
      const syntax = MARKDOWN_SYNTAXES[syntaxKey]
      if (!syntax) return

      const cursor = getCursor()
      const selStart = cursor.start
      const selEnd = cursor.end
      const selectedText = value.slice(selStart, selEnd)
      const prefix = syntax.prefix
      const suffix = syntax.suffix ?? (syntax.wrap ? prefix : '')

      pushHistory({ value, cursorStart: selStart, cursorEnd: selEnd })

      let newValue: string
      let newCursorStart: number
      let newCursorEnd: number

      if (syntax.wrap) {
        const insertText = selectedText || syntax.placeholder || ''
        const before = value.slice(0, selStart)
        const after = value.slice(selEnd)
        newValue = `${before}${prefix}${insertText}${suffix}${after}`
        newCursorStart = selStart + prefix.length
        newCursorEnd = selStart + prefix.length + insertText.length
      } else {
        const insertText = selectedText || syntax.placeholder || ''
        const before = value.slice(0, selStart)
        const after = value.slice(selEnd)
        newValue = `${before}${prefix}${insertText}${after}`
        newCursorStart = selStart + prefix.length
        newCursorEnd = selStart + prefix.length + insertText.length
      }

      setValueRaw(newValue)
      setCursor(newCursorStart, newCursorEnd)
    },
    [value, getCursor, pushHistory, setCursor],
  )

  const undo = useCallback(() => {
    const past = pastRef.current
    if (past.length === 0) return

    const entry = past[past.length - 1]
    pastRef.current = past.slice(0, -1)

    const cursor = getCursor()
    futureRef.current = [
      { value, cursorStart: cursor.start, cursorEnd: cursor.end },
      ...futureRef.current,
    ]

    setValueRaw(entry.value)
    setCursor(entry.cursorStart, entry.cursorEnd)
  }, [value, getCursor, setCursor])

  const redo = useCallback(() => {
    const future = futureRef.current
    if (future.length === 0) return

    const [entry, ...rest] = future
    futureRef.current = rest

    const cursor = getCursor()
    pastRef.current = [
      ...pastRef.current,
      { value, cursorStart: cursor.start, cursorEnd: cursor.end },
    ]

    setValueRaw(entry.value)
    setCursor(entry.cursorStart, entry.cursorEnd)
  }, [value, getCursor, setCursor])

  return {
    value,
    setValue,
    insertMarkdown,
    undo,
    redo,
    canUndo: pastRef.current.length > 0,
    canRedo: futureRef.current.length > 0,
    wordCount: countWords(value),
    charCount: value.length,
    textareaRef,
  }
}
