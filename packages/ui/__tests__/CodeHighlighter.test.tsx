import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  tokenizeLine,
  resolveLanguage,
  TOKEN_CLASS_MAP,
} from '../src/utils/codeTokenizer'
import type { Token, SupportedLanguage, TokenType } from '../src/utils/codeTokenizer'
import CodeHighlighter from '../src/CodeHighlighter'

// ---------------------------------------------------------------------------
// Mock useClipboard so CopyButton renders without real clipboard API
// ---------------------------------------------------------------------------

vi.mock('../src/hooks/useClipboard', () => ({
  useClipboard: () => ({ copy: vi.fn(), copied: false }),
}))

// ===========================================================================
// codeTokenizer unit tests
// ===========================================================================

describe('codeTokenizer', () => {
  // -------------------------------------------------------------------------
  // resolveLanguage
  // -------------------------------------------------------------------------

  describe('resolveLanguage', () => {
    it('returns javascript for undefined', () => {
      expect(resolveLanguage(undefined)).toBe('javascript')
    })

    it('returns javascript for empty string', () => {
      expect(resolveLanguage('')).toBe('javascript')
    })

    it('resolves js alias', () => {
      expect(resolveLanguage('js')).toBe('javascript')
    })

    it('resolves jsx alias', () => {
      expect(resolveLanguage('jsx')).toBe('javascript')
    })

    it('resolves ts alias', () => {
      expect(resolveLanguage('ts')).toBe('typescript')
    })

    it('resolves tsx alias', () => {
      expect(resolveLanguage('tsx')).toBe('typescript')
    })

    it('resolves py alias', () => {
      expect(resolveLanguage('py')).toBe('python')
    })

    it('resolves sh alias', () => {
      expect(resolveLanguage('sh')).toBe('bash')
    })

    it('resolves shell alias', () => {
      expect(resolveLanguage('shell')).toBe('bash')
    })

    it('resolves zsh alias', () => {
      expect(resolveLanguage('zsh')).toBe('bash')
    })

    it('resolves scss alias', () => {
      expect(resolveLanguage('scss')).toBe('css')
    })

    it('is case-insensitive', () => {
      expect(resolveLanguage('TypeScript')).toBe('typescript')
      expect(resolveLanguage('PYTHON')).toBe('python')
      expect(resolveLanguage('JSON')).toBe('json')
    })

    it('falls back to javascript for unknown language', () => {
      expect(resolveLanguage('rust')).toBe('javascript')
      expect(resolveLanguage('go')).toBe('javascript')
    })
  })

  // -------------------------------------------------------------------------
  // TOKEN_CLASS_MAP
  // -------------------------------------------------------------------------

  describe('TOKEN_CLASS_MAP', () => {
    it('maps all token types to ch-prefixed classes', () => {
      const types: TokenType[] = [
        'keyword', 'string', 'number', 'comment', 'operator', 'punctuation', 'plain',
      ]
      for (const t of types) {
        expect(TOKEN_CLASS_MAP[t]).toMatch(/^ch-/)
      }
    })
  })

  // -------------------------------------------------------------------------
  // tokenizeLine — JavaScript / TypeScript
  // -------------------------------------------------------------------------

  describe('tokenizeLine — JavaScript', () => {
    const lang: SupportedLanguage = 'javascript'

    it('tokenizes keywords', () => {
      const tokens = tokenizeLine('const x = 42', lang)
      expect(tokens[0]).toEqual({ type: 'keyword', value: 'const' })
    })

    it('tokenizes strings (double quotes)', () => {
      const tokens = tokenizeLine('"hello world"', lang)
      expect(tokens[0]).toEqual({ type: 'string', value: '"hello world"' })
    })

    it('tokenizes strings (single quotes)', () => {
      const tokens = tokenizeLine("'test'", lang)
      expect(tokens[0]).toEqual({ type: 'string', value: "'test'" })
    })

    it('tokenizes template literals', () => {
      const tokens = tokenizeLine('`template`', lang)
      expect(tokens[0]).toEqual({ type: 'string', value: '`template`' })
    })

    it('tokenizes numbers', () => {
      const tokens = tokenizeLine('42', lang)
      expect(tokens[0]).toEqual({ type: 'number', value: '42' })
    })

    it('tokenizes floating-point numbers', () => {
      const tokens = tokenizeLine('3.14', lang)
      expect(tokens[0]).toEqual({ type: 'number', value: '3.14' })
    })

    it('tokenizes single-line comments', () => {
      const tokens = tokenizeLine('// comment', lang)
      expect(tokens[0]).toEqual({ type: 'comment', value: '// comment' })
    })

    it('tokenizes multi-line comments on one line', () => {
      const tokens = tokenizeLine('/* block */', lang)
      expect(tokens[0]).toEqual({ type: 'comment', value: '/* block */' })
    })

    it('tokenizes operators', () => {
      const tokens = tokenizeLine('===', lang)
      expect(tokens[0]).toEqual({ type: 'operator', value: '===' })
    })

    it('tokenizes arrow operator', () => {
      const tokens = tokenizeLine('=>', lang)
      expect(tokens[0]).toEqual({ type: 'operator', value: '=>' })
    })

    it('tokenizes punctuation', () => {
      const tokens = tokenizeLine('{}', lang)
      expect(tokens[0]).toEqual({ type: 'punctuation', value: '{' })
      expect(tokens[1]).toEqual({ type: 'punctuation', value: '}' })
    })

    it('tokenizes identifiers as plain', () => {
      const tokens = tokenizeLine('myVariable', lang)
      expect(tokens[0]).toEqual({ type: 'plain', value: 'myVariable' })
    })

    it('preserves whitespace as plain tokens', () => {
      const tokens = tokenizeLine('  const', lang)
      expect(tokens[0]).toEqual({ type: 'plain', value: '  ' })
      expect(tokens[1]).toEqual({ type: 'keyword', value: 'const' })
    })

    it('tokenizes a full statement', () => {
      const tokens = tokenizeLine('const x = 42;', lang)
      const types = tokens.map((t) => t.type)
      expect(types).toContain('keyword')
      expect(types).toContain('number')
      expect(types).toContain('punctuation')
    })
  })

  // -------------------------------------------------------------------------
  // tokenizeLine — TypeScript extras
  // -------------------------------------------------------------------------

  describe('tokenizeLine — TypeScript', () => {
    const lang: SupportedLanguage = 'typescript'

    it('recognizes interface as keyword', () => {
      const tokens = tokenizeLine('interface Foo', lang)
      expect(tokens[0]).toEqual({ type: 'keyword', value: 'interface' })
    })

    it('recognizes type as keyword', () => {
      const tokens = tokenizeLine('type Bar', lang)
      expect(tokens[0]).toEqual({ type: 'keyword', value: 'type' })
    })

    it('recognizes readonly as keyword', () => {
      const tokens = tokenizeLine('readonly x', lang)
      expect(tokens[0]).toEqual({ type: 'keyword', value: 'readonly' })
    })
  })

  // -------------------------------------------------------------------------
  // tokenizeLine — Python
  // -------------------------------------------------------------------------

  describe('tokenizeLine — Python', () => {
    const lang: SupportedLanguage = 'python'

    it('tokenizes def as keyword', () => {
      const tokens = tokenizeLine('def foo():', lang)
      expect(tokens[0]).toEqual({ type: 'keyword', value: 'def' })
    })

    it('tokenizes hash comments', () => {
      const tokens = tokenizeLine('# comment', lang)
      expect(tokens[0]).toEqual({ type: 'comment', value: '# comment' })
    })

    it('tokenizes None as keyword', () => {
      const tokens = tokenizeLine('None', lang)
      expect(tokens[0]).toEqual({ type: 'keyword', value: 'None' })
    })

    it('tokenizes True and False as keywords', () => {
      expect(tokenizeLine('True', lang)[0].type).toBe('keyword')
      expect(tokenizeLine('False', lang)[0].type).toBe('keyword')
    })

    it('tokenizes Python operators', () => {
      const tokens = tokenizeLine('**', lang)
      expect(tokens[0]).toEqual({ type: 'operator', value: '**' })
    })
  })

  // -------------------------------------------------------------------------
  // tokenizeLine — CSS
  // -------------------------------------------------------------------------

  describe('tokenizeLine — CSS', () => {
    const lang: SupportedLanguage = 'css'

    it('tokenizes block comments', () => {
      const tokens = tokenizeLine('/* style */', lang)
      expect(tokens[0]).toEqual({ type: 'comment', value: '/* style */' })
    })

    it('tokenizes numbers with units', () => {
      const tokens = tokenizeLine('16px', lang)
      expect(tokens[0]).toEqual({ type: 'number', value: '16px' })
    })

    it('recognizes css keywords', () => {
      const tokens = tokenizeLine('none', lang)
      expect(tokens[0]).toEqual({ type: 'keyword', value: 'none' })
    })
  })

  // -------------------------------------------------------------------------
  // tokenizeLine — JSON
  // -------------------------------------------------------------------------

  describe('tokenizeLine — JSON', () => {
    const lang: SupportedLanguage = 'json'

    it('tokenizes JSON strings', () => {
      const tokens = tokenizeLine('"key"', lang)
      expect(tokens[0]).toEqual({ type: 'string', value: '"key"' })
    })

    it('tokenizes JSON booleans', () => {
      expect(tokenizeLine('true', lang)[0]).toEqual({ type: 'keyword', value: 'true' })
      expect(tokenizeLine('false', lang)[0]).toEqual({ type: 'keyword', value: 'false' })
    })

    it('tokenizes null', () => {
      expect(tokenizeLine('null', lang)[0]).toEqual({ type: 'keyword', value: 'null' })
    })

    it('tokenizes JSON punctuation', () => {
      const tokens = tokenizeLine('{', lang)
      expect(tokens[0]).toEqual({ type: 'punctuation', value: '{' })
    })

    it('tokenizes colon', () => {
      const tokens = tokenizeLine(':', lang)
      expect(tokens[0]).toEqual({ type: 'punctuation', value: ':' })
    })
  })

  // -------------------------------------------------------------------------
  // tokenizeLine — Bash
  // -------------------------------------------------------------------------

  describe('tokenizeLine — Bash', () => {
    const lang: SupportedLanguage = 'bash'

    it('tokenizes hash comments', () => {
      const tokens = tokenizeLine('# comment', lang)
      expect(tokens[0]).toEqual({ type: 'comment', value: '# comment' })
    })

    it('tokenizes echo as keyword', () => {
      const tokens = tokenizeLine('echo hello', lang)
      expect(tokens[0]).toEqual({ type: 'keyword', value: 'echo' })
    })

    it('tokenizes double-quoted strings', () => {
      const tokens = tokenizeLine('"test"', lang)
      expect(tokens[0]).toEqual({ type: 'string', value: '"test"' })
    })

    it('tokenizes pipe operator', () => {
      const tokens = tokenizeLine('|', lang)
      expect(tokens[0]).toEqual({ type: 'operator', value: '|' })
    })

    it('tokenizes && operator', () => {
      const tokens = tokenizeLine('&&', lang)
      expect(tokens[0]).toEqual({ type: 'operator', value: '&&' })
    })
  })

  // -------------------------------------------------------------------------
  // Edge cases
  // -------------------------------------------------------------------------

  describe('tokenizeLine — edge cases', () => {
    it('returns empty array for empty string', () => {
      expect(tokenizeLine('', 'javascript')).toEqual([])
    })

    it('handles string with escape characters', () => {
      const tokens = tokenizeLine('"hello \\"world\\""', 'javascript')
      expect(tokens[0].type).toBe('string')
    })

    it('handles negative numbers', () => {
      const tokens = tokenizeLine('-5', 'javascript')
      expect(tokens[0]).toEqual({ type: 'number', value: '-5' })
    })

    it('handles scientific notation', () => {
      const tokens = tokenizeLine('1e10', 'javascript')
      expect(tokens[0]).toEqual({ type: 'number', value: '1e10' })
    })

    it('handles unknown characters gracefully', () => {
      const tokens = tokenizeLine('@', 'javascript')
      expect(tokens).toHaveLength(1)
      expect(tokens[0].type).toBe('plain')
    })
  })
})

// ===========================================================================
// CodeHighlighter component tests
// ===========================================================================

describe('CodeHighlighter', () => {
  const sampleCode = 'const x = 42;\nconsole.log(x);'

  // -------------------------------------------------------------------------
  // Rendering
  // -------------------------------------------------------------------------

  it('renders with role="region" and data-testid', () => {
    render(<CodeHighlighter code={sampleCode} />)
    const el = screen.getByTestId('code-highlighter')
    expect(el).toBeTruthy()
    expect(el.getAttribute('role')).toBe('region')
  })

  it('renders an aria-label with the language', () => {
    render(<CodeHighlighter code={sampleCode} language="typescript" />)
    const el = screen.getByTestId('code-highlighter')
    expect(el.getAttribute('aria-label')).toBe('typescript code block')
  })

  it('renders the code content', () => {
    render(<CodeHighlighter code="const a = 1" language="js" />)
    expect(screen.getByTestId('code-highlighter').textContent).toContain('const')
    expect(screen.getByTestId('code-highlighter').textContent).toContain('1')
  })

  // -------------------------------------------------------------------------
  // Line numbers
  // -------------------------------------------------------------------------

  it('shows line numbers by default', () => {
    render(<CodeHighlighter code={sampleCode} />)
    const el = screen.getByTestId('code-highlighter')
    expect(el.textContent).toContain('1')
    expect(el.textContent).toContain('2')
  })

  it('hides line numbers when showLineNumbers is false', () => {
    render(<CodeHighlighter code="hello" showLineNumbers={false} />)
    const el = screen.getByTestId('code-highlighter')
    // Should not have the line number "1" as a separate span with aria-hidden
    const ariaHiddenSpans = el.querySelectorAll('[aria-hidden="true"]')
    // Only the SVGs in CopyButton should have aria-hidden
    for (const span of ariaHiddenSpans) {
      expect(span.tagName.toLowerCase()).not.toBe('span')
    }
  })

  // -------------------------------------------------------------------------
  // Copy button
  // -------------------------------------------------------------------------

  it('renders a copy button by default', () => {
    render(<CodeHighlighter code={sampleCode} />)
    expect(screen.getByLabelText('복사')).toBeTruthy()
  })

  it('hides copy button when copyable is false', () => {
    render(<CodeHighlighter code={sampleCode} copyable={false} />)
    expect(screen.queryByLabelText('복사')).toBeNull()
  })

  // -------------------------------------------------------------------------
  // Language display
  // -------------------------------------------------------------------------

  it('displays the language label in the header', () => {
    render(<CodeHighlighter code={sampleCode} language="python" />)
    expect(screen.getByText('python')).toBeTruthy()
  })

  // -------------------------------------------------------------------------
  // Themes
  // -------------------------------------------------------------------------

  it('applies dark theme by default', () => {
    render(<CodeHighlighter code="x" />)
    const el = screen.getByTestId('code-highlighter')
    expect(el.style.backgroundColor).toBe('rgb(30, 30, 46)')
  })

  it('applies light theme', () => {
    render(<CodeHighlighter code="x" theme="light" />)
    const el = screen.getByTestId('code-highlighter')
    expect(el.style.backgroundColor).toBe('rgb(248, 249, 250)')
  })

  // -------------------------------------------------------------------------
  // Max height
  // -------------------------------------------------------------------------

  it('applies maxHeight style when provided', () => {
    render(<CodeHighlighter code={sampleCode} maxHeight={200} />)
    const el = screen.getByTestId('code-highlighter')
    // Second child is the scroll container (first is header)
    const scrollContainer = el.children[1] as HTMLElement
    expect(scrollContainer.style.maxHeight).toBe('200px')
    expect(scrollContainer.style.overflowY).toBe('auto')
  })

  it('does not set maxHeight when not provided', () => {
    render(<CodeHighlighter code={sampleCode} />)
    const el = screen.getByTestId('code-highlighter')
    const scrollContainer = el.children[1] as HTMLElement
    expect(scrollContainer.style.maxHeight).toBe('')
  })

  // -------------------------------------------------------------------------
  // Highlight lines
  // -------------------------------------------------------------------------

  it('highlights specified lines', () => {
    render(<CodeHighlighter code={sampleCode} highlightLines={[1]} />)
    const el = screen.getByTestId('code-highlighter')
    // The first code line div should have a non-transparent background
    const codeElement = el.querySelector('code')
    const firstLine = codeElement?.firstElementChild as HTMLElement
    expect(firstLine.style.backgroundColor).not.toBe('transparent')
  })

  it('does not highlight non-specified lines', () => {
    render(<CodeHighlighter code={sampleCode} highlightLines={[1]} />)
    const el = screen.getByTestId('code-highlighter')
    const codeElement = el.querySelector('code')
    const secondLine = codeElement?.children[1] as HTMLElement
    expect(secondLine.style.backgroundColor).toBe('transparent')
  })

  // -------------------------------------------------------------------------
  // className
  // -------------------------------------------------------------------------

  it('applies additional className', () => {
    render(<CodeHighlighter code="x" className="my-custom-class" />)
    const el = screen.getByTestId('code-highlighter')
    expect(el.classList.contains('my-custom-class')).toBe(true)
  })

  // -------------------------------------------------------------------------
  // Trailing newline
  // -------------------------------------------------------------------------

  it('strips trailing newline to avoid empty last line', () => {
    render(<CodeHighlighter code={'line1\nline2\n'} showLineNumbers={false} />)
    const el = screen.getByTestId('code-highlighter')
    const codeElement = el.querySelector('code')
    // Should only have 2 lines, not 3
    expect(codeElement?.children).toHaveLength(2)
  })

  // -------------------------------------------------------------------------
  // Multiple languages
  // -------------------------------------------------------------------------

  it('renders Python code without errors', () => {
    render(<CodeHighlighter code="def foo():\n  return None" language="python" />)
    expect(screen.getByTestId('code-highlighter')).toBeTruthy()
  })

  it('renders JSON code without errors', () => {
    render(<CodeHighlighter code='{"key": true}' language="json" />)
    expect(screen.getByTestId('code-highlighter')).toBeTruthy()
  })

  it('renders CSS code without errors', () => {
    render(<CodeHighlighter code=".btn { color: red; }" language="css" />)
    expect(screen.getByTestId('code-highlighter')).toBeTruthy()
  })

  it('renders Bash code without errors', () => {
    render(<CodeHighlighter code="echo hello && ls" language="bash" />)
    expect(screen.getByTestId('code-highlighter')).toBeTruthy()
  })
})
