import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EmptyState from '../src/EmptyState'

describe('EmptyState', () => {
  it('renders title', () => {
    render(<EmptyState title="No results" />)
    expect(screen.getByText('No results')).toBeInTheDocument()
  })

  it('renders default icon', () => {
    render(<EmptyState title="Empty" />)
    expect(screen.getByText('\uD83D\uDCED')).toBeInTheDocument()
  })

  it('renders custom icon', () => {
    render(<EmptyState title="Empty" icon="X" />)
    expect(screen.getByText('X')).toBeInTheDocument()
  })

  it('renders description when provided', () => {
    render(<EmptyState title="Empty" description="Try a different search" />)
    expect(screen.getByText('Try a different search')).toBeInTheDocument()
  })

  it('does not render description when not provided', () => {
    render(<EmptyState title="Empty" />)
    const desc = screen.queryByText('Try a different search')
    expect(desc).not.toBeInTheDocument()
  })

  it('renders action button when provided', () => {
    const onClick = vi.fn()
    render(<EmptyState title="Empty" action={{ label: 'Add Item', onClick }} />)
    expect(screen.getByRole('button', { name: 'Add Item' })).toBeInTheDocument()
  })

  it('calls onClick when action button is clicked', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<EmptyState title="Empty" action={{ label: 'Retry', onClick }} />)

    await user.click(screen.getByRole('button', { name: 'Retry' }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('does not render action button when not provided', () => {
    render(<EmptyState title="Empty" />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
