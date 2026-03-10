import React from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { within, userEvent, expect, waitFor } from '@storybook/test'
import Carousel from '@hchat/ui/Carousel'

const SLIDE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']

function SlideContent({ index, color }: { readonly index: number; readonly color: string }) {
  return (
    <div
      style={{
        height: '200px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: color,
        color: '#fff',
        fontSize: '24px',
        fontWeight: 700,
        borderRadius: '8px',
      }}
    >
      Slide {index + 1}
    </div>
  )
}

const meta: Meta<typeof Carousel> = {
  title: 'Shared/Carousel',
  component: Carousel,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
}
export default meta
type Story = StoryObj<typeof Carousel>

export const AutoPlay: Story = {
  render: () => (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <Carousel autoPlay interval={2000} loop ariaLabel="Auto-playing slides">
        {SLIDE_COLORS.map((color, i) => (
          <SlideContent key={color} index={i} color={color} />
        ))}
      </Carousel>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Carousel should render as a region
    const region = canvas.getByRole('region')
    await expect(region).toBeInTheDocument()

    // First slide should be visible
    const firstSlide = canvas.getByText('Slide 1')
    await expect(firstSlide).toBeInTheDocument()

    // Dot indicators should exist (4 slides)
    const dots = canvas.getAllByRole('tab')
    expect(dots.length).toBe(4)

    // First dot should be selected
    await expect(dots[0]).toHaveAttribute('aria-selected', 'true')
  },
}

export const ManualNavigation: Story = {
  render: () => (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <Carousel loop={false} ariaLabel="Manual navigation slides">
        {SLIDE_COLORS.map((color, i) => (
          <SlideContent key={color} index={i} color={color} />
        ))}
      </Carousel>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Prev button should be disabled on first slide (no loop)
    const prevBtn = canvas.getByLabelText('Previous slide')
    await expect(prevBtn).toBeDisabled()

    // Click next
    const nextBtn = canvas.getByLabelText('Next slide')
    await expect(nextBtn).not.toBeDisabled()
    await userEvent.click(nextBtn)

    // After clicking next, prev should be enabled
    await waitFor(() => {
      expect(prevBtn).not.toBeDisabled()
    })

    // Second dot should now be selected
    await waitFor(() => {
      const dots = canvas.getAllByRole('tab')
      expect(dots[1]).toHaveAttribute('aria-selected', 'true')
    })

    // Click a dot to jump to slide 4
    const dots = canvas.getAllByRole('tab')
    await userEvent.click(dots[3])

    await waitFor(() => {
      expect(dots[3]).toHaveAttribute('aria-selected', 'true')
    })

    // Next should be disabled on last slide (no loop)
    await waitFor(() => {
      expect(nextBtn).toBeDisabled()
    })
  },
}
