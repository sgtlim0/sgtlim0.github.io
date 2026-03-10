import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { within, userEvent, expect, waitFor } from '@storybook/test'
import { Accordion } from '@hchat/ui'
import type { AccordionItemConfig } from '@hchat/ui'

const sampleItems: AccordionItemConfig[] = [
  {
    id: 'what',
    title: 'What is H Chat?',
    content: 'H Chat is an enterprise AI assistant platform for HMG employees.',
  },
  {
    id: 'how',
    title: 'How do I get started?',
    content: 'Log in with your company credentials and start a new conversation.',
  },
  {
    id: 'pricing',
    title: 'Is there a cost?',
    content: 'H Chat is provided free of charge for all HMG employees.',
  },
  {
    id: 'disabled',
    title: 'Coming Soon',
    content: 'This feature is not yet available.',
    disabled: true,
  },
]

const meta: Meta = {
  title: 'Shared/Accordion',
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
}
export default meta
type Story = StoryObj

export const SingleToggle: Story = {
  render: () => (
    <div className="max-w-lg mx-auto">
      <Accordion items={sampleItems} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Click first item to open
    const firstTrigger = canvas.getByText('What is H Chat?')
    await userEvent.click(firstTrigger)

    await waitFor(() => {
      const btn = firstTrigger.closest('button')
      expect(btn?.getAttribute('aria-expanded')).toBe('true')
    })

    // Click second item - first should close (single mode)
    const secondTrigger = canvas.getByText('How do I get started?')
    await userEvent.click(secondTrigger)

    await waitFor(() => {
      const btn = secondTrigger.closest('button')
      expect(btn?.getAttribute('aria-expanded')).toBe('true')
    })
  },
}

export const MultipleOpen: Story = {
  render: () => (
    <div className="max-w-lg mx-auto">
      <Accordion items={sampleItems} allowMultiple defaultOpen={['what']} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // First should be open by default
    const firstBtn = canvas.getByText('What is H Chat?').closest('button')
    expect(firstBtn?.getAttribute('aria-expanded')).toBe('true')

    // Open second as well (multiple mode)
    const secondTrigger = canvas.getByText('How do I get started?')
    await userEvent.click(secondTrigger)

    await waitFor(() => {
      const btn = secondTrigger.closest('button')
      expect(btn?.getAttribute('aria-expanded')).toBe('true')
    })

    // First should still be open
    expect(firstBtn?.getAttribute('aria-expanded')).toBe('true')

    // Disabled item should not be clickable
    const disabledBtn = canvas.getByText('Coming Soon').closest('button')
    expect(disabledBtn?.disabled).toBe(true)
  },
}
