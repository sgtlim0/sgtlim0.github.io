import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import MarkdownRenderer from '../src/user/components/MarkdownRenderer'

describe('MarkdownRenderer', () => {
  it('renders a simple paragraph', () => {
    render(<MarkdownRenderer content="Hello world" />)
    expect(screen.getByText('Hello world')).toBeDefined()
  })

  it('applies custom className', () => {
    const { container } = render(
      <MarkdownRenderer content="text" className="custom-class" />,
    )
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('renders default className when none provided', () => {
    const { container } = render(<MarkdownRenderer content="text" />)
    expect(container.firstChild).toHaveClass('markdown-renderer')
  })

  describe('headings', () => {
    it('renders h1', () => {
      const { container } = render(<MarkdownRenderer content="# Title" />)
      const h1 = container.querySelector('h1')
      expect(h1).toBeDefined()
      expect(h1?.textContent).toBe('Title')
      expect(h1?.className).toContain('heading-1')
    })

    it('renders h2', () => {
      const { container } = render(<MarkdownRenderer content="## Subtitle" />)
      const h2 = container.querySelector('h2')
      expect(h2).toBeDefined()
      expect(h2?.textContent).toBe('Subtitle')
      expect(h2?.className).toContain('heading-2')
    })

    it('renders h3', () => {
      const { container } = render(<MarkdownRenderer content="### Section" />)
      const h3 = container.querySelector('h3')
      expect(h3).toBeDefined()
      expect(h3?.textContent).toBe('Section')
      expect(h3?.className).toContain('heading-3')
    })
  })

  describe('code blocks', () => {
    it('renders fenced code block', () => {
      const content = '```js\nconsole.log("hi")\n```'
      const { container } = render(<MarkdownRenderer content={content} />)
      const pre = container.querySelector('pre')
      expect(pre).toBeDefined()
      expect(pre?.className).toContain('code-block')
      const code = pre?.querySelector('code')
      expect(code?.textContent).toBe('console.log("hi")')
    })

    it('renders code block without language', () => {
      const content = '```\nplain code\n```'
      const { container } = render(<MarkdownRenderer content={content} />)
      const pre = container.querySelector('pre')
      expect(pre).toBeDefined()
      expect(pre?.querySelector('code')?.textContent).toBe('plain code')
    })

    it('renders multi-line code blocks', () => {
      const content = '```\nline1\nline2\nline3\n```'
      const { container } = render(<MarkdownRenderer content={content} />)
      const code = container.querySelector('pre code')
      expect(code?.textContent).toBe('line1\nline2\nline3')
    })
  })

  describe('horizontal rule', () => {
    it('renders hr for ---', () => {
      const { container } = render(<MarkdownRenderer content="---" />)
      const hr = container.querySelector('hr')
      expect(hr).toBeDefined()
      expect(hr?.className).toContain('horizontal-rule')
    })
  })

  describe('blockquote', () => {
    it('renders blockquote', () => {
      const { container } = render(<MarkdownRenderer content="> This is a quote" />)
      const bq = container.querySelector('blockquote')
      expect(bq).toBeDefined()
      expect(bq?.textContent).toBe('This is a quote')
      expect(bq?.className).toContain('blockquote')
    })
  })

  describe('lists', () => {
    it('renders unordered list', () => {
      const content = '- Item A\n- Item B\n- Item C'
      const { container } = render(<MarkdownRenderer content={content} />)
      const ul = container.querySelector('ul')
      expect(ul).toBeDefined()
      expect(ul?.className).toContain('unordered-list')
      const items = ul?.querySelectorAll('li')
      expect(items?.length).toBe(3)
      expect(items?.[0].textContent).toBe('Item A')
      expect(items?.[1].textContent).toBe('Item B')
      expect(items?.[2].textContent).toBe('Item C')
    })

    it('renders ordered list', () => {
      const content = '1. First\n2. Second\n3. Third'
      const { container } = render(<MarkdownRenderer content={content} />)
      const ol = container.querySelector('ol')
      expect(ol).toBeDefined()
      expect(ol?.className).toContain('ordered-list')
      const items = ol?.querySelectorAll('li')
      expect(items?.length).toBe(3)
      expect(items?.[0].textContent).toBe('First')
    })
  })

  describe('tables', () => {
    it('renders a table with header and body', () => {
      const content = '| Name | Age |\n| --- | --- |\n| Alice | 30 |\n| Bob | 25 |'
      const { container } = render(<MarkdownRenderer content={content} />)
      const table = container.querySelector('table')
      expect(table).toBeDefined()
      expect(table?.className).toContain('markdown-table')

      const ths = table?.querySelectorAll('th')
      expect(ths?.length).toBe(2)
      expect(ths?.[0].textContent).toBe('Name')
      expect(ths?.[1].textContent).toBe('Age')

      const tds = table?.querySelectorAll('td')
      expect(tds?.length).toBe(4)
      expect(tds?.[0].textContent).toBe('Alice')
    })

    it('returns null for empty table rows', () => {
      // Table with only separator row gets filtered, resulting in empty rows array
      const content = '| --- |'
      const { container } = render(<MarkdownRenderer content={content} />)
      // separator-only row produces an empty rows array -> returns null
      const table = container.querySelector('table')
      expect(table).toBeNull()
    })
  })

  describe('inline formatting', () => {
    it('renders inline code', () => {
      const { container } = render(<MarkdownRenderer content="Use `npm install` here" />)
      const code = container.querySelector('code.inline-code')
      expect(code).toBeDefined()
      expect(code?.textContent).toBe('npm install')
    })

    it('renders bold text', () => {
      const { container } = render(<MarkdownRenderer content="This is **bold** text" />)
      const strong = container.querySelector('strong')
      expect(strong).toBeDefined()
      expect(strong?.textContent).toBe('bold')
    })

    it('renders italic text', () => {
      const { container } = render(<MarkdownRenderer content="This is *italic* text" />)
      const em = container.querySelector('em')
      expect(em).toBeDefined()
      expect(em?.textContent).toBe('italic')
    })

    it('renders links', () => {
      const { container } = render(
        <MarkdownRenderer content="Visit [Google](https://google.com)" />,
      )
      const link = container.querySelector('a.link')
      expect(link).toBeDefined()
      expect(link?.textContent).toBe('Google')
      expect(link?.getAttribute('href')).toBe('https://google.com')
      expect(link?.getAttribute('target')).toBe('_blank')
      expect(link?.getAttribute('rel')).toContain('noopener')
    })

    it('renders mixed inline formatting', () => {
      const { container } = render(
        <MarkdownRenderer content="Use `code` and **bold** and *italic* together" />,
      )
      expect(container.querySelector('code.inline-code')).toBeDefined()
      expect(container.querySelector('strong')).toBeDefined()
      expect(container.querySelector('em')).toBeDefined()
    })

    it('renders plain text before and after inline elements', () => {
      render(<MarkdownRenderer content="before **bold** after" />)
      const p = screen.getByText((_, el) => el?.tagName === 'P' && el.textContent === 'before bold after')
      expect(p).toBeDefined()
    })
  })

  describe('escapeForRegex (HTML entities)', () => {
    it('renders heading with inline formatting using escape logic', () => {
      // heading content goes through renderInline which uses escapeForRegex indirectly
      const { container } = render(<MarkdownRenderer content="# Hello **world**" />)
      const h1 = container.querySelector('h1')
      expect(h1).toBeDefined()
      const strong = h1?.querySelector('strong')
      expect(strong?.textContent).toBe('world')
    })
  })

  describe('empty/whitespace content', () => {
    it('handles empty content', () => {
      const { container } = render(<MarkdownRenderer content="" />)
      expect(container.firstChild).toBeDefined()
    })

    it('handles content with only empty lines', () => {
      const { container } = render(<MarkdownRenderer content="\n\n\n" />)
      expect(container.firstChild).toBeDefined()
    })
  })

  describe('mixed content', () => {
    it('renders multiple block types together', () => {
      const content = [
        '# Title',
        '',
        'A paragraph.',
        '',
        '> A quote',
        '',
        '- item1',
        '- item2',
        '',
        '```',
        'code',
        '```',
        '',
        '---',
      ].join('\n')

      const { container } = render(<MarkdownRenderer content={content} />)
      expect(container.querySelector('h1')).toBeDefined()
      expect(container.querySelector('p')).toBeDefined()
      expect(container.querySelector('blockquote')).toBeDefined()
      expect(container.querySelector('ul')).toBeDefined()
      expect(container.querySelector('pre')).toBeDefined()
      expect(container.querySelector('hr')).toBeDefined()
    })
  })
})
