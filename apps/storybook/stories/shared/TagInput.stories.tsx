import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { within, userEvent, expect, waitFor } from '@storybook/test'
import { default as TagInput } from '@hchat/ui/TagInput'

const techSuggestions = [
  'React', 'TypeScript', 'Next.js', 'Tailwind', 'Vite',
  'Node.js', 'Python', 'Docker', 'PostgreSQL', 'Redis',
]

const meta: Meta<typeof TagInput> = {
  title: 'Shared/TagInput',
  component: TagInput,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
}
export default meta
type Story = StoryObj<typeof TagInput>

export const AddAndRemove: Story = {
  render: () => (
    <div className="max-w-md mx-auto p-6">
      <label className="block text-sm font-medium mb-2">Skills</label>
      <TagInput
        initialTags={['React', 'TypeScript']}
        placeholder="Add a skill..."
        maxTags={8}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Initial tags should be rendered
    expect(canvas.getByText('React')).toBeTruthy()
    expect(canvas.getByText('TypeScript')).toBeTruthy()

    // Type and add a new tag via Enter
    const input = canvas.getByRole('combobox')
    await userEvent.type(input, 'Next.js{enter}')

    await waitFor(() => {
      expect(canvas.getByText('Next.js')).toBeTruthy()
    })

    // Remove a tag by clicking its remove button
    const reactTag = canvas.getByText('React')
    const removeBtn = reactTag.parentElement?.querySelector('button')
    if (removeBtn) {
      await userEvent.click(removeBtn)

      await waitFor(() => {
        expect(canvas.queryByText('React')).toBeNull()
      })
    }
  },
}

export const Autocomplete: Story = {
  render: () => (
    <div className="max-w-md mx-auto p-6">
      <label className="block text-sm font-medium mb-2">Technologies</label>
      <TagInput
        placeholder="Search technologies..."
        suggestions={techSuggestions}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Type to trigger suggestions
    const input = canvas.getByRole('combobox')
    await userEvent.type(input, 'Re')

    await waitFor(() => {
      // Suggestion dropdown should appear
      const listbox = canvasElement.querySelector('[role="listbox"]')
      expect(listbox).toBeTruthy()

      // Should show "React" and "Redis"
      const options = canvasElement.querySelectorAll('[role="option"]')
      expect(options.length).toBeGreaterThan(0)
    })

    // Click a suggestion
    await waitFor(async () => {
      const reactOption = canvas.getByText('React')
      await userEvent.click(reactOption)
    })

    await waitFor(() => {
      expect(canvas.getByText('React')).toBeTruthy()
    })
  },
}
