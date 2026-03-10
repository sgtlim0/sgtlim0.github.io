import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import Avatar from '../src/Avatar'
import AvatarGroup from '../src/AvatarGroup'
import { getInitials, getAvatarColor } from '../src/utils/avatarUtils'

// ---------------------------------------------------------------------------
// getInitials
// ---------------------------------------------------------------------------
describe('getInitials', () => {
  it('returns empty string for undefined/null/empty', () => {
    expect(getInitials()).toBe('')
    expect(getInitials('')).toBe('')
    expect(getInitials('   ')).toBe('')
  })

  it('extracts first character for Korean names', () => {
    expect(getInitials('김철수')).toBe('김')
    expect(getInitials('박지영')).toBe('박')
    expect(getInitials('이 민호')).toBe('이')
  })

  it('extracts first and last initials for English multi-word names', () => {
    expect(getInitials('John Doe')).toBe('JD')
    expect(getInitials('Alice Bob Charlie')).toBe('AC')
    expect(getInitials('mary jane watson')).toBe('MW')
  })

  it('extracts single initial for single English word', () => {
    expect(getInitials('Admin')).toBe('A')
    expect(getInitials('z')).toBe('Z')
  })

  it('handles names with extra whitespace', () => {
    expect(getInitials('  John   Doe  ')).toBe('JD')
    expect(getInitials('  김철수  ')).toBe('김')
  })
})

// ---------------------------------------------------------------------------
// getAvatarColor
// ---------------------------------------------------------------------------
describe('getAvatarColor', () => {
  it('returns gray for undefined/empty name', () => {
    expect(getAvatarColor()).toBe('#9CA3AF')
    expect(getAvatarColor('')).toBe('#9CA3AF')
    expect(getAvatarColor('   ')).toBe('#9CA3AF')
  })

  it('returns a hex color string for valid names', () => {
    const color = getAvatarColor('John Doe')
    expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/)
  })

  it('is deterministic — same name always produces same color', () => {
    const color1 = getAvatarColor('Alice')
    const color2 = getAvatarColor('Alice')
    expect(color1).toBe(color2)
  })

  it('produces different colors for different names', () => {
    const colors = new Set([
      getAvatarColor('Alice'),
      getAvatarColor('Bob'),
      getAvatarColor('Charlie'),
      getAvatarColor('Diana'),
      getAvatarColor('Eve'),
    ])
    // At least 2 distinct colors among 5 names
    expect(colors.size).toBeGreaterThanOrEqual(2)
  })
})

// ---------------------------------------------------------------------------
// Avatar component
// ---------------------------------------------------------------------------
describe('Avatar', () => {
  describe('image rendering', () => {
    it('renders an image when src is provided', () => {
      const { container } = render(<Avatar src="/user.jpg" alt="User" />)
      const wrapper = container.querySelector('[role="img"]')
      expect(wrapper).toBeDefined()
      const imgEl = container.querySelector('img')
      expect(imgEl).toBeDefined()
      expect(imgEl?.getAttribute('src')).toBe('/user.jpg')
      expect(imgEl?.getAttribute('alt')).toBe('User')
    })

    it('falls back to initials on image error', () => {
      const { container } = render(<Avatar src="/broken.jpg" name="John Doe" />)
      const imgEl = container.querySelector('img')
      expect(imgEl).toBeDefined()

      fireEvent.error(imgEl!)

      // After error, initials should show
      expect(screen.getByText('JD')).toBeDefined()
      // Image should be gone
      expect(container.querySelector('img')).toBeNull()
    })
  })

  describe('initials rendering', () => {
    it('shows initials when no src is provided', () => {
      render(<Avatar name="김철수" />)
      expect(screen.getByText('김')).toBeDefined()
    })

    it('shows English initials correctly', () => {
      render(<Avatar name="Jane Smith" />)
      expect(screen.getByText('JS')).toBeDefined()
    })

    it('applies deterministic background color based on name', () => {
      const { container } = render(<Avatar name="Test User" />)
      const inner = container.querySelector('[style]')
      expect(inner).toBeDefined()
      const bgColor = inner?.getAttribute('style')
      expect(bgColor).toContain('background-color')
    })
  })

  describe('default icon fallback', () => {
    it('shows default SVG icon when no src or name', () => {
      const { container } = render(<Avatar />)
      const svg = container.querySelector('svg')
      expect(svg).toBeDefined()
    })

    it('shows custom fallback when provided', () => {
      render(<Avatar fallback={<span data-testid="custom">!</span>} />)
      expect(screen.getByTestId('custom')).toBeDefined()
    })
  })

  describe('sizes', () => {
    it.each(['xs', 'sm', 'md', 'lg', 'xl'] as const)('renders size "%s"', (size) => {
      const { container } = render(<Avatar name="A" size={size} />)
      const wrapper = container.firstElementChild
      expect(wrapper).toBeDefined()
    })

    it('defaults to md size', () => {
      const { container } = render(<Avatar name="A" />)
      const wrapper = container.firstElementChild
      expect(wrapper?.className).toContain('w-10')
      expect(wrapper?.className).toContain('h-10')
    })
  })

  describe('shapes', () => {
    it('renders circle shape by default', () => {
      const { container } = render(<Avatar name="A" />)
      const inner = container.querySelector('.rounded-full')
      expect(inner).toBeDefined()
    })

    it('renders square shape', () => {
      const { container } = render(<Avatar name="A" shape="square" />)
      const inner = container.querySelector('.rounded-lg')
      expect(inner).toBeDefined()
    })
  })

  describe('status indicator', () => {
    it('does not render status dot when no status provided', () => {
      render(<Avatar name="A" />)
      expect(screen.queryByTestId('avatar-status')).toBeNull()
    })

    it.each([
      ['online', 'bg-green-500'],
      ['offline', 'bg-gray-400'],
      ['away', 'bg-yellow-500'],
      ['busy', 'bg-red-500'],
    ] as const)('renders %s status with correct color class', (status, expectedClass) => {
      render(<Avatar name="A" status={status} />)
      const dot = screen.getByTestId('avatar-status')
      expect(dot).toBeDefined()
      expect(dot.className).toContain(expectedClass)
    })
  })

  describe('accessibility', () => {
    it('has role="img" on the container', () => {
      render(<Avatar name="John" />)
      expect(screen.getByRole('img')).toBeDefined()
    })

    it('uses alt prop as aria-label', () => {
      render(<Avatar alt="Profile picture" />)
      expect(screen.getByRole('img', { name: 'Profile picture' })).toBeDefined()
    })

    it('uses name prop as aria-label when alt is not provided', () => {
      render(<Avatar name="John Doe" />)
      expect(screen.getByRole('img', { name: 'John Doe' })).toBeDefined()
    })

    it('defaults aria-label to "Avatar" when neither alt nor name provided', () => {
      render(<Avatar />)
      expect(screen.getByRole('img', { name: 'Avatar' })).toBeDefined()
    })

    it('status indicator has aria-label', () => {
      render(<Avatar name="A" status="online" />)
      const dot = screen.getByTestId('avatar-status')
      expect(dot.getAttribute('aria-label')).toBe('online')
    })
  })

  describe('className pass-through', () => {
    it('applies custom className', () => {
      const { container } = render(<Avatar name="A" className="my-custom-class" />)
      expect(container.firstElementChild?.className).toContain('my-custom-class')
    })
  })
})

// ---------------------------------------------------------------------------
// AvatarGroup component
// ---------------------------------------------------------------------------
describe('AvatarGroup', () => {
  const mockAvatars = [
    { name: 'Alice', src: '/alice.jpg' },
    { name: 'Bob', src: '/bob.jpg' },
    { name: 'Charlie' },
    { name: 'Diana' },
    { name: 'Eve' },
  ]

  it('renders all avatars when no max is set', () => {
    render(<AvatarGroup avatars={mockAvatars} />)
    const group = screen.getByRole('group')
    expect(group).toBeDefined()
    // 5 avatars, no overflow
    expect(screen.queryByTestId('avatar-group-overflow')).toBeNull()
  })

  it('limits visible avatars and shows overflow count', () => {
    render(<AvatarGroup avatars={mockAvatars} max={3} />)
    const overflow = screen.getByTestId('avatar-group-overflow')
    expect(overflow).toBeDefined()
    expect(overflow.textContent).toBe('+2')
  })

  it('does not show overflow when max >= avatars length', () => {
    render(<AvatarGroup avatars={mockAvatars} max={10} />)
    expect(screen.queryByTestId('avatar-group-overflow')).toBeNull()
  })

  it('does not show overflow when max equals avatars length', () => {
    render(<AvatarGroup avatars={mockAvatars} max={5} />)
    expect(screen.queryByTestId('avatar-group-overflow')).toBeNull()
  })

  it('applies size to all avatars', () => {
    const { container } = render(
      <AvatarGroup avatars={[{ name: 'A' }, { name: 'B' }]} size="lg" />
    )
    const avatarContainers = container.querySelectorAll('[role="img"]')
    avatarContainers.forEach((el) => {
      expect(el.className).toContain('w-12')
    })
  })

  it('has correct aria-label on group', () => {
    render(<AvatarGroup avatars={mockAvatars} />)
    expect(screen.getByRole('group', { name: '5 avatars' })).toBeDefined()
  })

  it('overflow indicator has aria-label', () => {
    render(<AvatarGroup avatars={mockAvatars} max={2} />)
    const overflow = screen.getByTestId('avatar-group-overflow')
    expect(overflow.getAttribute('aria-label')).toBe('3 more')
  })

  it('applies custom className', () => {
    const { container } = render(
      <AvatarGroup avatars={mockAvatars} className="custom-group" />
    )
    expect(container.firstElementChild?.className).toContain('custom-group')
  })

  it('renders empty group without errors', () => {
    render(<AvatarGroup avatars={[]} />)
    const group = screen.getByRole('group')
    expect(group).toBeDefined()
  })
})
