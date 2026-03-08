 
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import MessageBubble from '../src/user/components/MessageBubble'

type TestMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  compressionStats?: {
    originalTokens: number
    compressedTokens: number
    reductionPct: number
  }
  sources?: Array<{
    title: string
    url: string
    snippet?: string
  }>
  mode?: 'chat' | 'research'
}

const makeMessage = (overrides: Partial<TestMessage> = {}): TestMessage => ({
  id: 'msg-1',
  role: 'user',
  content: 'Hello',
  timestamp: new Date('2025-01-15T10:30:00').toISOString(),
  ...overrides,
})

describe('MessageBubble', () => {
  it('should render user message', () => {
    render(<MessageBubble message={makeMessage({ content: 'Hello World' })} />)
    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })

  it('should render assistant message', () => {
    render(<MessageBubble message={makeMessage({ role: 'assistant', content: 'Hi there' })} />)
    expect(screen.getByText('Hi there')).toBeInTheDocument()
  })

  it('should show streaming indicator for assistant messages', () => {
    const { container } = render(
      <MessageBubble message={makeMessage({ role: 'assistant' })} isStreaming />,
    )
    const cursor = container.querySelector('.animate-pulse')
    expect(cursor).toBeInTheDocument()
  })

  it('should not show streaming indicator for user messages', () => {
    const { container } = render(
      <MessageBubble message={makeMessage({ role: 'user' })} isStreaming />,
    )
    const cursor = container.querySelector('.animate-pulse')
    expect(cursor).not.toBeInTheDocument()
  })

  it('should display timestamp on hover area', () => {
    const { container } = render(<MessageBubble message={makeMessage()} />)
    const timestampEl = container.querySelector('.group-hover\\:opacity-100')
    expect(timestampEl).toBeInTheDocument()
  })
})

describe('MessageBubble - compression stats', () => {
  it('should display compression stats when compressionStats is present', () => {
    render(
      <MessageBubble
        message={makeMessage({
          role: 'assistant',
          content: 'Compressed response',
          compressionStats: {
            originalTokens: 100,
            compressedTokens: 60,
            reductionPct: 40,
          },
        })}
      />,
    )
    expect(screen.getByText(/40% 압축/)).toBeInTheDocument()
    expect(screen.getByText(/100/)).toBeInTheDocument()
    expect(screen.getByText(/60/)).toBeInTheDocument()
  })

  it('should not display compression stats when reductionPct is 0', () => {
    const { container } = render(
      <MessageBubble
        message={makeMessage({
          role: 'assistant',
          content: 'Not compressed',
          compressionStats: {
            originalTokens: 50,
            compressedTokens: 50,
            reductionPct: 0,
          },
        })}
      />,
    )
    expect(container.textContent).not.toContain('압축')
  })

  it('should not display compression stats when not provided', () => {
    const { container } = render(
      <MessageBubble
        message={makeMessage({
          role: 'assistant',
          content: 'Normal response',
        })}
      />,
    )
    expect(container.textContent).not.toContain('압축')
  })
})

describe('MessageBubble - sources', () => {
  const sampleSources = [
    { title: 'AI Strategy Report', url: 'https://example.com/ai-report', snippet: 'AI is...' },
    { title: 'Tech Blog Post', url: 'https://blog.example.com/post' },
  ]

  it('should display sources when present', () => {
    render(
      <MessageBubble
        message={makeMessage({
          role: 'assistant',
          content: 'Research result',
          sources: sampleSources,
        })}
      />,
    )
    expect(screen.getByText(/출처/)).toBeInTheDocument()
    expect(screen.getByText('AI Strategy Report')).toBeInTheDocument()
    expect(screen.getByText('Tech Blog Post')).toBeInTheDocument()
  })

  it('should not display sources section when sources is empty', () => {
    const { container } = render(
      <MessageBubble
        message={makeMessage({
          role: 'assistant',
          content: 'No sources',
          sources: [],
        })}
      />,
    )
    expect(container.textContent).not.toContain('출처')
  })

  it('should display Research mode badge', () => {
    render(
      <MessageBubble
        message={makeMessage({
          role: 'assistant',
          content: 'Research answer',
          mode: 'research',
          sources: sampleSources,
        })}
      />,
    )
    expect(screen.getByText('Research')).toBeInTheDocument()
  })
})

describe('MessageBubble - mode badge', () => {
  it('should show Research badge when mode is research', () => {
    render(
      <MessageBubble
        message={makeMessage({
          role: 'assistant',
          content: 'Answer',
          mode: 'research',
        })}
      />,
    )
    expect(screen.getByText('Research')).toBeInTheDocument()
  })

  it('should not show badge when mode is chat', () => {
    const { container } = render(
      <MessageBubble
        message={makeMessage({
          role: 'assistant',
          content: 'Answer',
          mode: 'chat',
        })}
      />,
    )
    expect(container.textContent).not.toContain('Research')
  })

  it('should not show badge for user messages even in research mode', () => {
    const { container } = render(
      <MessageBubble
        message={makeMessage({
          role: 'user',
          content: 'Question',
          mode: 'research',
        })}
      />,
    )
    expect(container.textContent).not.toContain('Research')
  })
})
