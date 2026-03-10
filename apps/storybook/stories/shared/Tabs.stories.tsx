import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { within, userEvent, expect } from '@storybook/test'
import { Tabs, TabPanel } from '@hchat/ui'
import type { TabConfig } from '@hchat/ui'

const sampleTabs: TabConfig[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'features', label: 'Features' },
  { id: 'pricing', label: 'Pricing' },
]

const meta: Meta = {
  title: 'Shared/Tabs',
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
}
export default meta
type Story = StoryObj

export const Underline: Story = {
  render: () => (
    <Tabs tabs={sampleTabs} variant="underline" className="max-w-lg">
      <TabPanel id="overview">
        <div className="p-4 text-sm">Overview content goes here.</div>
      </TabPanel>
      <TabPanel id="features">
        <div className="p-4 text-sm">Features content goes here.</div>
      </TabPanel>
      <TabPanel id="pricing">
        <div className="p-4 text-sm">Pricing content goes here.</div>
      </TabPanel>
    </Tabs>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // First tab should be active by default
    expect(canvas.getByText('Overview content goes here.')).toBeTruthy()

    // Click second tab
    await userEvent.click(canvas.getByRole('tab', { name: 'Features' }))
    expect(canvas.getByText('Features content goes here.')).toBeTruthy()

    // Click third tab
    await userEvent.click(canvas.getByRole('tab', { name: 'Pricing' }))
    expect(canvas.getByText('Pricing content goes here.')).toBeTruthy()
  },
}

export const Pill: Story = {
  render: () => (
    <Tabs tabs={sampleTabs} variant="pill" className="max-w-lg">
      <TabPanel id="overview">
        <div className="p-4 text-sm">Overview (pill variant)</div>
      </TabPanel>
      <TabPanel id="features">
        <div className="p-4 text-sm">Features (pill variant)</div>
      </TabPanel>
      <TabPanel id="pricing">
        <div className="p-4 text-sm">Pricing (pill variant)</div>
      </TabPanel>
    </Tabs>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await userEvent.click(canvas.getByRole('tab', { name: 'Features' }))
    expect(canvas.getByText('Features (pill variant)')).toBeTruthy()
  },
}

export const Bordered: Story = {
  render: () => (
    <Tabs tabs={sampleTabs} variant="bordered" className="max-w-lg">
      <TabPanel id="overview">
        <div className="p-4 text-sm">Overview (bordered variant)</div>
      </TabPanel>
      <TabPanel id="features">
        <div className="p-4 text-sm">Features (bordered variant)</div>
      </TabPanel>
      <TabPanel id="pricing">
        <div className="p-4 text-sm">Pricing (bordered variant)</div>
      </TabPanel>
    </Tabs>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await userEvent.click(canvas.getByRole('tab', { name: 'Pricing' }))
    expect(canvas.getByText('Pricing (bordered variant)')).toBeTruthy()
  },
}
