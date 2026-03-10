import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { within, userEvent, expect, waitFor } from '@storybook/test'
import { default as Rating } from '@hchat/ui/Rating'

const meta: Meta<typeof Rating> = {
  title: 'Shared/Rating',
  component: Rating,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
}
export default meta
type Story = StoryObj<typeof Rating>

export const StarRating: Story = {
  render: () => (
    <div className="flex flex-col gap-4 items-center p-6">
      <p className="text-sm text-gray-500">Click a star to rate</p>
      <Rating initialValue={0} max={5} size="lg" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Should render 5 stars
    const radiogroup = canvas.getByRole('radiogroup')
    expect(radiogroup).toBeTruthy()

    const stars = canvasElement.querySelectorAll('[role="radio"]')
    expect(stars.length).toBe(5)

    // Click 4th star
    const fourthStar = canvasElement.querySelector('[data-testid="rating-star-4"]')
    if (fourthStar) {
      await userEvent.click(fourthStar)

      await waitFor(() => {
        expect(fourthStar.getAttribute('aria-checked')).toBe('true')
      })
    }
  },
}

export const HalfStar: Story = {
  render: () => (
    <div className="flex flex-col gap-4 items-center p-6">
      <p className="text-sm text-gray-500">Half-star precision (click same star to toggle)</p>
      <Rating initialValue={3.5} max={5} precision={0.5} size="lg" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const stars = canvasElement.querySelectorAll('[role="radio"]')
    expect(stars.length).toBe(5)

    // Click 2nd star to change rating
    const secondStar = canvasElement.querySelector('[data-testid="rating-star-2"]')
    if (secondStar) {
      await userEvent.click(secondStar)

      await waitFor(() => {
        expect(secondStar.getAttribute('aria-checked')).toBe('true')
      })
    }
  },
}

export const ReadOnly: Story = {
  render: () => (
    <div className="flex flex-col gap-6 items-center p-6">
      <div className="flex items-center gap-3">
        <Rating initialValue={4} max={5} readOnly size="sm" />
        <span className="text-sm text-gray-500">Small</span>
      </div>
      <div className="flex items-center gap-3">
        <Rating initialValue={3} max={5} readOnly size="md" />
        <span className="text-sm text-gray-500">Medium</span>
      </div>
      <div className="flex items-center gap-3">
        <Rating initialValue={5} max={5} readOnly size="lg" />
        <span className="text-sm text-gray-500">Large</span>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    // Verify all three ratings are read-only (tabIndex -1)
    const radiogroups = canvasElement.querySelectorAll('[role="radiogroup"]')
    expect(radiogroups.length).toBe(3)

    radiogroups.forEach(group => {
      expect(group.getAttribute('tabindex')).toBe('-1')
    })
  },
}
