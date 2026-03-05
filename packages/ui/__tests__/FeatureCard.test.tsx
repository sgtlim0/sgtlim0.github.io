import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import FeatureCard from '../src/FeatureCard'

function MockIcon({ className }: { className?: string }) {
  return <svg data-testid="mock-icon" className={className} />
}

describe('FeatureCard', () => {
  const defaultProps = {
    title: 'Feature Title',
    description: 'Feature description text',
    href: '/feature',
    icon: MockIcon,
  }

  it('renders title and description', () => {
    render(<FeatureCard {...defaultProps} />)
    expect(screen.getByText('Feature Title')).toBeInTheDocument()
    expect(screen.getByText('Feature description text')).toBeInTheDocument()
  })

  it('renders icon', () => {
    render(<FeatureCard {...defaultProps} />)
    expect(screen.getByTestId('mock-icon')).toBeInTheDocument()
  })

  it('renders as anchor by default', () => {
    render(<FeatureCard {...defaultProps} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/feature')
  })

  it('uses custom link component when provided', () => {
    function CustomLink({
      href,
      className,
      children,
    }: {
      href: string
      className: string
      children: React.ReactNode
    }) {
      return (
        <a href={href} className={className} data-testid="custom-link">
          {children}
        </a>
      )
    }

    render(<FeatureCard {...defaultProps} linkComponent={CustomLink} />)
    expect(screen.getByTestId('custom-link')).toBeInTheDocument()
  })

  it('applies custom icon color', () => {
    render(<FeatureCard {...defaultProps} iconColor="text-red-500" />)
    const icon = screen.getByTestId('mock-icon')
    expect(icon).toHaveClass('text-red-500')
  })
})
