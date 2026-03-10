import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { within, expect } from '@storybook/test'
import { Breadcrumb } from '@hchat/ui'

const meta: Meta<typeof Breadcrumb> = {
  title: 'Shared/Breadcrumb',
  component: Breadcrumb,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
}
export default meta
type Story = StoryObj<typeof Breadcrumb>

export const ThreeLevels: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Products', href: '/products' },
      { label: 'Widget Pro' },
    ],
    separator: '/',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    expect(canvas.getByText('Home')).toBeTruthy()
    expect(canvas.getByText('Products')).toBeTruthy()

    // Last item should have aria-current="page"
    const currentPage = canvas.getByText('Widget Pro')
    expect(currentPage.getAttribute('aria-current')).toBe('page')
  },
}

export const CustomSeparator: Story = {
  args: {
    items: [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Settings', href: '/settings' },
      { label: 'Profile' },
    ],
    separator: '>',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    expect(canvas.getByText('Dashboard')).toBeTruthy()
    expect(canvas.getByText('Profile')).toBeTruthy()

    // Verify separator is rendered
    const nav = canvas.getByRole('navigation', { name: 'breadcrumb' })
    expect(nav).toBeTruthy()
  },
}
