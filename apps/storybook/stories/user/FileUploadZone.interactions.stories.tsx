import type { Meta, StoryObj } from '@storybook/react'
import { fn, expect, within } from '@storybook/test'
import FileUploadZone from '@hchat/ui/user/components/FileUploadZone'

const meta: Meta<typeof FileUploadZone> = {
  title: 'User/Molecules/FileUploadZone/Interactions',
  component: FileUploadZone,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof FileUploadZone>

export const RendersDropZone: Story = {
  args: {
    onUpload: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText(/파일을 드래그/i) || canvas.getByText(/업로드/i)).toBeTruthy()
  },
}

export const ShowsCustomDescription: Story = {
  args: {
    accept: '.pdf',
    maxFiles: 5,
    maxSize: '20MB',
    description: 'PDF 파일만 업로드 가능합니다. 최대 5개, 20MB 이하',
    onUpload: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText(/PDF 파일만 업로드 가능합니다/)).toBeInTheDocument()
  },
}
