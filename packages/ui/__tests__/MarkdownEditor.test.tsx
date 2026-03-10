import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { render, screen, fireEvent } from '@testing-library/react'
import { useMarkdownEditor, MARKDOWN_SYNTAXES } from '../src/hooks/useMarkdownEditor'
import MarkdownEditor from '../src/MarkdownEditor'
import type { EditorViewMode } from '../src/MarkdownEditor'

// ---------------------------------------------------------------------------
// useMarkdownEditor hook tests
// ---------------------------------------------------------------------------

describe('useMarkdownEditor', () => {
  it('initializes with default empty string', () => {
    const { result } = renderHook(() => useMarkdownEditor())
    expect(result.current.value).toBe('')
    expect(result.current.wordCount).toBe(0)
    expect(result.current.charCount).toBe(0)
  })

  it('initializes with provided initial value', () => {
    const { result } = renderHook(() => useMarkdownEditor('hello world'))
    expect(result.current.value).toBe('hello world')
    expect(result.current.wordCount).toBe(2)
    expect(result.current.charCount).toBe(11)
  })

  it('setValue updates value and counts', () => {
    const { result } = renderHook(() => useMarkdownEditor())

    act(() => {
      result.current.setValue('one two three')
    })

    expect(result.current.value).toBe('one two three')
    expect(result.current.wordCount).toBe(3)
    expect(result.current.charCount).toBe(13)
  })

  it('undo reverts to previous value', () => {
    const { result } = renderHook(() => useMarkdownEditor('initial'))

    act(() => {
      result.current.setValue('changed')
    })
    expect(result.current.value).toBe('changed')
    expect(result.current.canUndo).toBe(true)

    act(() => {
      result.current.undo()
    })
    expect(result.current.value).toBe('initial')
    expect(result.current.canUndo).toBe(false)
  })

  it('redo restores undone value', () => {
    const { result } = renderHook(() => useMarkdownEditor('a'))

    act(() => {
      result.current.setValue('b')
    })
    act(() => {
      result.current.undo()
    })
    expect(result.current.value).toBe('a')
    expect(result.current.canRedo).toBe(true)

    act(() => {
      result.current.redo()
    })
    expect(result.current.value).toBe('b')
    expect(result.current.canRedo).toBe(false)
  })

  it('undo does nothing when no history', () => {
    const { result } = renderHook(() => useMarkdownEditor('start'))
    expect(result.current.canUndo).toBe(false)

    act(() => {
      result.current.undo()
    })
    expect(result.current.value).toBe('start')
  })

  it('redo does nothing when no future', () => {
    const { result } = renderHook(() => useMarkdownEditor('start'))
    expect(result.current.canRedo).toBe(false)

    act(() => {
      result.current.redo()
    })
    expect(result.current.value).toBe('start')
  })

  it('setValue clears redo history', () => {
    const { result } = renderHook(() => useMarkdownEditor('a'))

    act(() => {
      result.current.setValue('b')
    })
    act(() => {
      result.current.undo()
    })
    expect(result.current.canRedo).toBe(true)

    act(() => {
      result.current.setValue('c')
    })
    expect(result.current.canRedo).toBe(false)
  })

  it('multiple undo/redo operations', () => {
    const { result } = renderHook(() => useMarkdownEditor('v1'))

    act(() => { result.current.setValue('v2') })
    act(() => { result.current.setValue('v3') })
    act(() => { result.current.setValue('v4') })

    expect(result.current.value).toBe('v4')

    act(() => { result.current.undo() })
    expect(result.current.value).toBe('v3')

    act(() => { result.current.undo() })
    expect(result.current.value).toBe('v2')

    act(() => { result.current.redo() })
    expect(result.current.value).toBe('v3')
  })

  it('word count handles whitespace-only text', () => {
    const { result } = renderHook(() => useMarkdownEditor('   '))
    expect(result.current.wordCount).toBe(0)
    expect(result.current.charCount).toBe(3)
  })

  it('word count handles multiline text', () => {
    const { result } = renderHook(() => useMarkdownEditor('hello\nworld foo'))
    expect(result.current.wordCount).toBe(3)
  })

  it('textareaRef is provided', () => {
    const { result } = renderHook(() => useMarkdownEditor())
    expect(result.current.textareaRef).toBeDefined()
    expect(result.current.textareaRef.current).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// MARKDOWN_SYNTAXES constants
// ---------------------------------------------------------------------------

describe('MARKDOWN_SYNTAXES', () => {
  it('defines bold as wrapping with **', () => {
    expect(MARKDOWN_SYNTAXES.bold).toEqual({
      prefix: '**',
      wrap: true,
      placeholder: 'bold text',
    })
  })

  it('defines italic as wrapping with *', () => {
    expect(MARKDOWN_SYNTAXES.italic.prefix).toBe('*')
    expect(MARKDOWN_SYNTAXES.italic.wrap).toBe(true)
  })

  it('defines heading as line prefix ## ', () => {
    expect(MARKDOWN_SYNTAXES.heading.prefix).toBe('## ')
    expect(MARKDOWN_SYNTAXES.heading.wrap).toBe(false)
  })

  it('defines link with prefix [ and suffix ](url)', () => {
    expect(MARKDOWN_SYNTAXES.link.prefix).toBe('[')
    expect(MARKDOWN_SYNTAXES.link.suffix).toBe('](url)')
    expect(MARKDOWN_SYNTAXES.link.wrap).toBe(true)
  })

  it('defines code as wrapping with `', () => {
    expect(MARKDOWN_SYNTAXES.code.prefix).toBe('`')
    expect(MARKDOWN_SYNTAXES.code.wrap).toBe(true)
  })

  it('defines list as line prefix - ', () => {
    expect(MARKDOWN_SYNTAXES.list.prefix).toBe('- ')
    expect(MARKDOWN_SYNTAXES.list.wrap).toBe(false)
  })

  it('defines quote as line prefix > ', () => {
    expect(MARKDOWN_SYNTAXES.quote.prefix).toBe('> ')
    expect(MARKDOWN_SYNTAXES.quote.wrap).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// MarkdownEditor component tests
// ---------------------------------------------------------------------------

describe('MarkdownEditor', () => {
  it('renders with default props', () => {
    render(<MarkdownEditor />)
    expect(screen.getByTestId('markdown-editor')).toBeInTheDocument()
    expect(screen.getByTestId('markdown-textarea')).toBeInTheDocument()
    expect(screen.getByTestId('markdown-preview')).toBeInTheDocument()
  })

  it('renders initial value in textarea', () => {
    render(<MarkdownEditor initialValue="# Hello" />)
    const textarea = screen.getByTestId('markdown-textarea') as HTMLTextAreaElement
    expect(textarea.value).toBe('# Hello')
  })

  it('shows placeholder text', () => {
    render(<MarkdownEditor placeholder="Type here..." />)
    const textarea = screen.getByTestId('markdown-textarea') as HTMLTextAreaElement
    expect(textarea.placeholder).toBe('Type here...')
  })

  it('displays word and character count', () => {
    render(<MarkdownEditor initialValue="hello world" />)
    const counter = screen.getByTestId('word-char-count')
    expect(counter.textContent).toContain('2 words')
    expect(counter.textContent).toContain('11 chars')
  })

  it('updates count on typing', () => {
    render(<MarkdownEditor />)
    const textarea = screen.getByTestId('markdown-textarea')

    fireEvent.change(textarea, { target: { value: 'one two three' } })

    const counter = screen.getByTestId('word-char-count')
    expect(counter.textContent).toContain('3 words')
    expect(counter.textContent).toContain('13 chars')
  })

  it('calls onChange when textarea changes', () => {
    const onChange = vi.fn()
    render(<MarkdownEditor onChange={onChange} />)
    const textarea = screen.getByTestId('markdown-textarea')

    fireEvent.change(textarea, { target: { value: 'new value' } })

    expect(onChange).toHaveBeenCalledWith('new value')
  })

  // --- Mode toggling ---

  it('defaults to split mode showing both editor and preview', () => {
    render(<MarkdownEditor />)
    expect(screen.getByTestId('markdown-textarea')).toBeInTheDocument()
    expect(screen.getByTestId('markdown-preview')).toBeInTheDocument()
  })

  it('switches to edit mode hiding preview', () => {
    render(<MarkdownEditor />)
    const editButton = screen.getByText('Edit')

    fireEvent.click(editButton)

    expect(screen.getByTestId('markdown-textarea')).toBeInTheDocument()
    expect(screen.queryByTestId('markdown-preview')).not.toBeInTheDocument()
  })

  it('switches to preview mode hiding textarea', () => {
    render(<MarkdownEditor />)
    const previewButton = screen.getByText('Preview')

    fireEvent.click(previewButton)

    expect(screen.queryByTestId('markdown-textarea')).not.toBeInTheDocument()
    expect(screen.getByTestId('markdown-preview')).toBeInTheDocument()
  })

  it('switches back to split mode', () => {
    render(<MarkdownEditor />)

    fireEvent.click(screen.getByText('Edit'))
    expect(screen.queryByTestId('markdown-preview')).not.toBeInTheDocument()

    fireEvent.click(screen.getByText('Split'))
    expect(screen.getByTestId('markdown-textarea')).toBeInTheDocument()
    expect(screen.getByTestId('markdown-preview')).toBeInTheDocument()
  })

  it('respects defaultMode prop', () => {
    render(<MarkdownEditor defaultMode="edit" />)
    expect(screen.getByTestId('markdown-textarea')).toBeInTheDocument()
    expect(screen.queryByTestId('markdown-preview')).not.toBeInTheDocument()
  })

  it('mode buttons have aria-pressed attribute', () => {
    render(<MarkdownEditor defaultMode="split" />)
    const splitBtn = screen.getByText('Split')
    const editBtn = screen.getByText('Edit')

    expect(splitBtn).toHaveAttribute('aria-pressed', 'true')
    expect(editBtn).toHaveAttribute('aria-pressed', 'false')
  })

  // --- Toolbar ---

  it('renders all toolbar buttons with aria-labels', () => {
    render(<MarkdownEditor />)
    expect(screen.getByRole('button', { name: 'Bold' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Italic' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Heading' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Link' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Code' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'List' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Quote' })).toBeInTheDocument()
  })

  it('renders undo/redo buttons', () => {
    render(<MarkdownEditor />)
    expect(screen.getByRole('button', { name: 'Undo' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Redo' })).toBeInTheDocument()
  })

  it('undo button is disabled when no history', () => {
    render(<MarkdownEditor />)
    const undoBtn = screen.getByRole('button', { name: 'Undo' })
    expect(undoBtn).toBeDisabled()
  })

  it('redo button is disabled when no future', () => {
    render(<MarkdownEditor />)
    const redoBtn = screen.getByRole('button', { name: 'Redo' })
    expect(redoBtn).toBeDisabled()
  })

  it('toolbar has role=toolbar and aria-label', () => {
    render(<MarkdownEditor />)
    const toolbar = screen.getByRole('toolbar')
    expect(toolbar).toHaveAttribute('aria-label', 'Markdown formatting')
  })

  // --- Toolbar clicks (insertMarkdown) ---

  it('bold button inserts **bold text** when nothing selected', () => {
    render(<MarkdownEditor defaultMode="edit" />)
    const textarea = screen.getByTestId('markdown-textarea') as HTMLTextAreaElement
    const boldBtn = screen.getByRole('button', { name: 'Bold' })

    // Simulate cursor at position 0
    fireEvent.click(boldBtn)

    expect(textarea.value).toContain('**bold text**')
  })

  it('italic button inserts *italic text*', () => {
    render(<MarkdownEditor defaultMode="edit" />)
    const italicBtn = screen.getByRole('button', { name: 'Italic' })

    fireEvent.click(italicBtn)

    const textarea = screen.getByTestId('markdown-textarea') as HTMLTextAreaElement
    expect(textarea.value).toContain('*italic text*')
  })

  it('heading button inserts ## heading', () => {
    render(<MarkdownEditor defaultMode="edit" />)
    const headingBtn = screen.getByRole('button', { name: 'Heading' })

    fireEvent.click(headingBtn)

    const textarea = screen.getByTestId('markdown-textarea') as HTMLTextAreaElement
    expect(textarea.value).toContain('## heading')
  })

  it('link button inserts [link text](url)', () => {
    render(<MarkdownEditor defaultMode="edit" />)
    const linkBtn = screen.getByRole('button', { name: 'Link' })

    fireEvent.click(linkBtn)

    const textarea = screen.getByTestId('markdown-textarea') as HTMLTextAreaElement
    expect(textarea.value).toContain('[link text](url)')
  })

  it('code button inserts `code`', () => {
    render(<MarkdownEditor defaultMode="edit" />)
    const codeBtn = screen.getByRole('button', { name: 'Code' })

    fireEvent.click(codeBtn)

    const textarea = screen.getByTestId('markdown-textarea') as HTMLTextAreaElement
    expect(textarea.value).toContain('`code`')
  })

  it('list button inserts - list item', () => {
    render(<MarkdownEditor defaultMode="edit" />)
    const listBtn = screen.getByRole('button', { name: 'List' })

    fireEvent.click(listBtn)

    const textarea = screen.getByTestId('markdown-textarea') as HTMLTextAreaElement
    expect(textarea.value).toContain('- list item')
  })

  it('quote button inserts > quote', () => {
    render(<MarkdownEditor defaultMode="edit" />)
    const quoteBtn = screen.getByRole('button', { name: 'Quote' })

    fireEvent.click(quoteBtn)

    const textarea = screen.getByTestId('markdown-textarea') as HTMLTextAreaElement
    expect(textarea.value).toContain('> quote')
  })

  // --- Preview rendering ---

  it('renders heading in preview', () => {
    render(<MarkdownEditor initialValue="## Hello" defaultMode="preview" />)
    const preview = screen.getByTestId('markdown-preview')
    const heading = preview.querySelector('h2')
    expect(heading).toBeTruthy()
    expect(heading?.textContent).toBe('Hello')
  })

  it('renders bold text in preview', () => {
    render(<MarkdownEditor initialValue="**bold**" defaultMode="preview" />)
    const preview = screen.getByTestId('markdown-preview')
    const strong = preview.querySelector('strong')
    expect(strong).toBeTruthy()
    expect(strong?.textContent).toBe('bold')
  })

  it('renders italic text in preview', () => {
    render(<MarkdownEditor initialValue="*italic*" defaultMode="preview" />)
    const preview = screen.getByTestId('markdown-preview')
    const em = preview.querySelector('em')
    expect(em).toBeTruthy()
    expect(em?.textContent).toBe('italic')
  })

  it('renders inline code in preview', () => {
    render(<MarkdownEditor initialValue="`code`" defaultMode="preview" />)
    const preview = screen.getByTestId('markdown-preview')
    const code = preview.querySelector('code')
    expect(code).toBeTruthy()
    expect(code?.textContent).toBe('code')
  })

  it('renders link in preview', () => {
    render(<MarkdownEditor initialValue="[click](https://example.com)" defaultMode="preview" />)
    const preview = screen.getByTestId('markdown-preview')
    const link = preview.querySelector('a')
    expect(link).toBeTruthy()
    expect(link?.textContent).toBe('click')
    expect(link?.getAttribute('href')).toBe('https://example.com')
    expect(link?.getAttribute('target')).toBe('_blank')
    expect(link?.getAttribute('rel')).toContain('noopener')
  })

  it('renders blockquote in preview', () => {
    render(<MarkdownEditor initialValue="> quote text" defaultMode="preview" />)
    const preview = screen.getByTestId('markdown-preview')
    const bq = preview.querySelector('blockquote')
    expect(bq).toBeTruthy()
    expect(bq?.textContent).toBe('quote text')
  })

  it('renders list item in preview', () => {
    render(<MarkdownEditor initialValue="- item one" defaultMode="preview" />)
    const preview = screen.getByTestId('markdown-preview')
    const li = preview.querySelector('li')
    expect(li).toBeTruthy()
    expect(li?.textContent).toBe('item one')
  })

  it('renders empty lines as line breaks', () => {
    render(<MarkdownEditor initialValue={'line1\n\nline2'} defaultMode="preview" />)
    const preview = screen.getByTestId('markdown-preview')
    const brs = preview.querySelectorAll('br')
    expect(brs.length).toBeGreaterThanOrEqual(1)
  })

  // --- Custom className ---

  it('applies custom className', () => {
    render(<MarkdownEditor className="custom-class" />)
    const editor = screen.getByTestId('markdown-editor')
    expect(editor.className).toContain('custom-class')
  })

  // --- Textarea aria-label ---

  it('textarea has aria-label', () => {
    render(<MarkdownEditor />)
    const textarea = screen.getByTestId('markdown-textarea')
    expect(textarea).toHaveAttribute('aria-label', 'Markdown input')
  })
})
