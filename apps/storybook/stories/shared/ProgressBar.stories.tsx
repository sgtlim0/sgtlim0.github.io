import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { within, expect } from '@storybook/test'
import { default as ProgressBar } from '@hchat/ui/ProgressBar'

const meta: Meta<typeof ProgressBar> = {
  title: 'Shared/ProgressBar',
  component: ProgressBar,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
}
export default meta
type Story = StoryObj<typeof ProgressBar>

export const Linear: Story = {
  render: () => (
    <div className="flex flex-col gap-6 max-w-lg mx-auto p-6">
      <div>
        <p className="text-sm text-gray-500 mb-2">Small (25%)</p>
        <ProgressBar value={25} size="sm" showLabel />
      </div>
      <div>
        <p className="text-sm text-gray-500 mb-2">Medium (60%)</p>
        <ProgressBar value={60} size="md" showLabel />
      </div>
      <div>
        <p className="text-sm text-gray-500 mb-2">Large (85%)</p>
        <ProgressBar value={85} size="lg" showLabel animated />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    // Should render 3 progress bars
    const bars = canvasElement.querySelectorAll('[role="progressbar"]')
    expect(bars.length).toBe(3)

    // Verify aria values
    expect(bars[0].getAttribute('aria-valuenow')).toBe('25')
    expect(bars[1].getAttribute('aria-valuenow')).toBe('60')
    expect(bars[2].getAttribute('aria-valuenow')).toBe('85')

    // Labels should be visible
    const labels = canvasElement.querySelectorAll('[data-testid="progress-label"]')
    expect(labels.length).toBe(3)
    expect(labels[0].textContent).toBe('25%')
    expect(labels[1].textContent).toBe('60%')
    expect(labels[2].textContent).toBe('85%')
  },
}

export const Circular: Story = {
  render: () => (
    <div className="flex gap-8 items-center justify-center p-6">
      <div className="text-center">
        <ProgressBar value={30} variant="circular" size="sm" showLabel />
        <p className="text-xs text-gray-500 mt-2">Small</p>
      </div>
      <div className="text-center">
        <ProgressBar value={65} variant="circular" size="md" showLabel />
        <p className="text-xs text-gray-500 mt-2">Medium</p>
      </div>
      <div className="text-center">
        <ProgressBar value={90} variant="circular" size="lg" showLabel color="#22c55e" />
        <p className="text-xs text-gray-500 mt-2">Large</p>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const bars = canvasElement.querySelectorAll('[role="progressbar"]')
    expect(bars.length).toBe(3)

    expect(bars[0].getAttribute('aria-valuenow')).toBe('30')
    expect(bars[1].getAttribute('aria-valuenow')).toBe('65')
    expect(bars[2].getAttribute('aria-valuenow')).toBe('90')

    // Circular should have SVG
    const svgs = canvasElement.querySelectorAll('svg')
    expect(svgs.length).toBeGreaterThanOrEqual(3)
  },
}

export const Indeterminate: Story = {
  render: () => (
    <div className="flex flex-col gap-8 max-w-lg mx-auto p-6">
      <div>
        <p className="text-sm text-gray-500 mb-2">Linear indeterminate</p>
        <ProgressBar value={0} indeterminate size="md" />
      </div>
      <div className="flex justify-center">
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-2">Circular indeterminate</p>
          <ProgressBar value={0} variant="circular" indeterminate size="lg" />
        </div>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const bars = canvasElement.querySelectorAll('[role="progressbar"]')
    expect(bars.length).toBe(2)

    // Indeterminate should not have aria-valuenow
    bars.forEach(bar => {
      expect(bar.hasAttribute('aria-valuenow')).toBe(false)
    })
  },
}
