import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { within, expect } from '@storybook/test'
import { Avatar, AvatarGroup } from '@hchat/ui'

const meta: Meta<typeof Avatar> = {
  title: 'Shared/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
}
export default meta
type Story = StoryObj<typeof Avatar>

export const Variants: Story = {
  render: () => (
    <div className="flex items-end gap-4 p-6">
      {/* With image */}
      <Avatar
        src="https://i.pravatar.cc/150?u=alice"
        name="Alice Kim"
        size="lg"
        status="online"
      />
      {/* With initials (Korean) */}
      <Avatar name="Kim Cheolsu" size="lg" status="away" />
      {/* With initials (English) */}
      <Avatar name="John Doe" size="md" status="busy" />
      {/* Default fallback icon */}
      <Avatar size="md" status="offline" />
      {/* Square shape */}
      <Avatar name="Park Jieun" size="md" shape="square" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Check that avatars render
    const avatars = canvas.getAllByRole('img')
    expect(avatars.length).toBeGreaterThanOrEqual(4)

    // Check status indicators exist
    const statusDots = canvasElement.querySelectorAll('[data-testid="avatar-status"]')
    expect(statusDots.length).toBeGreaterThanOrEqual(3)
  },
}

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-end gap-4 p-6">
      <Avatar name="XS" size="xs" />
      <Avatar name="SM" size="sm" />
      <Avatar name="MD" size="md" />
      <Avatar name="LG" size="lg" />
      <Avatar name="XL" size="xl" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const avatars = canvas.getAllByRole('img')
    expect(avatars.length).toBe(5)
  },
}

export const Group: Story = {
  render: () => (
    <div className="p-6 space-y-6">
      <div>
        <p className="text-sm text-gray-500 mb-2">max=3 (2 overflow)</p>
        <AvatarGroup
          avatars={[
            { name: 'Alice', src: 'https://i.pravatar.cc/150?u=a' },
            { name: 'Bob', src: 'https://i.pravatar.cc/150?u=b' },
            { name: 'Charlie', src: 'https://i.pravatar.cc/150?u=c' },
            { name: 'Diana' },
            { name: 'Eve' },
          ]}
          max={3}
          size="md"
        />
      </div>
      <div>
        <p className="text-sm text-gray-500 mb-2">All visible, size lg</p>
        <AvatarGroup
          avatars={[
            { name: 'Alpha' },
            { name: 'Beta' },
            { name: 'Gamma' },
          ]}
          size="lg"
        />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    // Check overflow indicator exists
    const overflow = canvasElement.querySelector('[data-testid="avatar-group-overflow"]')
    expect(overflow).toBeTruthy()
    expect(overflow?.textContent).toContain('+2')
  },
}
