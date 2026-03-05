import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Badge from '../src/Badge'

describe('Badge', () => {
  it('renders the label text', () => {
    render(<Badge label="New" />)
    expect(screen.getByText('New')).toBeInTheDocument()
  })

  it('applies rounded-full class', () => {
    render(<Badge label="Test" />)
    const badge = screen.getByText('Test')
    expect(badge).toHaveClass('rounded-full')
  })

  it('renders as span element', () => {
    render(<Badge label="Status" />)
    const badge = screen.getByText('Status')
    expect(badge.tagName).toBe('SPAN')
  })

  it('renders different labels', () => {
    const { rerender } = render(<Badge label="Active" />)
    expect(screen.getByText('Active')).toBeInTheDocument()

    rerender(<Badge label="Inactive" />)
    expect(screen.getByText('Inactive')).toBeInTheDocument()
  })
})
