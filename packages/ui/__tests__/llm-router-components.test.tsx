import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ProviderBadge from '../src/llm-router/ProviderBadge'
import PriceCell from '../src/llm-router/PriceCell'
import CodeBlock from '../src/llm-router/CodeBlock'

describe('ProviderBadge', () => {
  it('should render provider name', () => {
    render(<ProviderBadge provider="OpenAI" />)
    expect(screen.getByText('OpenAI')).toBeDefined()
  })

  it('should render different providers', () => {
    const providers = ['OpenAI', 'Anthropic', 'Google', 'Mistral', 'Meta']
    providers.forEach((provider) => {
      const { unmount } = render(<ProviderBadge provider={provider} />)
      expect(screen.getByText(provider)).toBeDefined()
      unmount()
    })
  })
})

describe('PriceCell', () => {
  it('should render formatted price in KRW', () => {
    render(<PriceCell price={1500} />)
    expect(screen.getByText('₩1,500')).toBeDefined()
  })

  it('should render unit text', () => {
    render(<PriceCell price={500} unit="/ 1K 토큰" />)
    expect(screen.getByText('/ 1K 토큰')).toBeDefined()
  })

  it('should render zero price', () => {
    render(<PriceCell price={0} />)
    expect(screen.getByText('₩0')).toBeDefined()
  })

  it('should apply green color for low prices', () => {
    const { container } = render(<PriceCell price={100} />)
    const priceDiv = container.querySelector('.text-green-600')
    expect(priceDiv).toBeDefined()
  })

  it('should not apply green color for high prices', () => {
    const { container } = render(<PriceCell price={1000} />)
    const priceDiv = container.querySelector('.text-green-600')
    expect(priceDiv).toBeNull()
  })
})

describe('CodeBlock', () => {
  const examples = [
    { language: 'javascript', code: 'const x = 1;' },
    { language: 'python', code: "print('hello')" },
  ]

  it('should render code content', () => {
    render(<CodeBlock examples={examples} />)
    expect(screen.getByText('const x = 1;')).toBeDefined()
  })

  it('should render language tabs', () => {
    render(<CodeBlock examples={examples} />)
    expect(screen.getByText('javascript')).toBeDefined()
    expect(screen.getByText('python')).toBeDefined()
  })
})
