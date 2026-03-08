import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import SourceAttribution from '../src/user/components/SourceAttribution'

describe('SourceAttribution', () => {
  const makeSources = (
    overrides: Array<Partial<{ title: string; url: string; snippet?: string }>> = [],
  ) =>
    overrides.map((o, i) => ({
      title: o.title ?? `Source ${i + 1}`,
      url: o.url ?? `https://example${i}.com/page`,
      snippet: o.snippet,
    }))

  it('should render source list', () => {
    const sources = makeSources([
      { title: 'AI Report 2025', url: 'https://ai.example.com/report' },
      { title: 'Cloud Guide', url: 'https://cloud.example.com/guide' },
    ])

    render(<SourceAttribution sources={sources} />)

    expect(screen.getByText('AI Report 2025')).toBeInTheDocument()
    expect(screen.getByText('Cloud Guide')).toBeInTheDocument()
    expect(screen.getByText(/출처/)).toBeInTheDocument()
    expect(screen.getByText(/2건/)).toBeInTheDocument()
  })

  it('should open links in new tab with target="_blank"', () => {
    const sources = makeSources([{ title: 'Test Link', url: 'https://test.example.com/page' }])

    render(<SourceAttribution sources={sources} />)

    const link = screen.getByText('Test Link').closest('a')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    expect(link).toHaveAttribute('href', 'https://test.example.com/page')
  })

  it('should display domain only (hostname)', () => {
    const sources = makeSources([
      { title: 'Deep Article', url: 'https://www.example.com/deep/nested/path?q=1' },
    ])

    render(<SourceAttribution sources={sources} />)

    expect(screen.getByText('www.example.com')).toBeInTheDocument()
  })

  it('should render nothing when sources array is empty', () => {
    const { container } = render(<SourceAttribution sources={[]} />)
    expect(container.innerHTML).toBe('')
  })

  it('should handle invalid URL gracefully without error', () => {
    const sources = [{ title: 'Bad URL Source', url: 'not-a-valid-url' }]

    // Should not throw
    const { container } = render(<SourceAttribution sources={sources} />)

    expect(screen.getByText('Bad URL Source')).toBeInTheDocument()
    // extractHostname fallback returns the original string for invalid URLs
    expect(container.textContent).toContain('not-a-valid-url')
  })

  it('should show snippet as title attribute on hover', () => {
    const sources = makeSources([
      { title: 'With Snippet', url: 'https://a.com', snippet: 'This is a snippet' },
    ])

    render(<SourceAttribution sources={sources} />)

    const link = screen.getByText('With Snippet').closest('a')
    expect(link).toHaveAttribute('title', 'This is a snippet')
  })

  it('should render numbered indices for each source', () => {
    const sources = makeSources([{ title: 'First' }, { title: 'Second' }, { title: 'Third' }])

    render(<SourceAttribution sources={sources} />)

    expect(screen.getByText('[1]')).toBeInTheDocument()
    expect(screen.getByText('[2]')).toBeInTheDocument()
    expect(screen.getByText('[3]')).toBeInTheDocument()
  })
})
