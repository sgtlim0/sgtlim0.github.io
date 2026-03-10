import React from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { within, userEvent, expect, waitFor } from '@storybook/test'
import FileUploader from '@hchat/ui/FileUploader'

const meta: Meta<typeof FileUploader> = {
  title: 'Shared/FileUploader',
  component: FileUploader,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
}
export default meta
type Story = StoryObj<typeof FileUploader>

export const AddFiles: Story = {
  render: () => (
    <div style={{ maxWidth: '500px', margin: '0 auto' }}>
      <FileUploader
        options={{
          maxFileSize: 10 * 1024 * 1024,
          maxFiles: 5,
          acceptTypes: ['image/*', '.pdf', '.docx'],
        }}
        dropLabel="Drag & drop files here, or click to select"
        buttonLabel="Upload"
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Drop zone should render
    const dropZone = canvas.getByTestId('drop-zone')
    await expect(dropZone).toBeInTheDocument()

    // Drop zone should have descriptive text
    await expect(
      canvas.getByText('Drag & drop files here, or click to select'),
    ).toBeInTheDocument()

    // Hidden file input should exist
    const fileInput = canvas.getByTestId('file-input')
    await expect(fileInput).toBeInTheDocument()

    // Simulate file selection
    const testFile = new File(['test content'], 'document.pdf', {
      type: 'application/pdf',
    })
    await userEvent.upload(fileInput, testFile)

    // File should appear in the list
    await waitFor(() => {
      const fileList = canvas.getByTestId('file-list')
      expect(fileList).toBeInTheDocument()
    })

    // File name should be displayed
    await waitFor(() => {
      expect(canvas.getByText('document.pdf')).toBeInTheDocument()
    })
  },
}

export const FilePreview: Story = {
  render: () => (
    <div style={{ maxWidth: '500px', margin: '0 auto' }}>
      <FileUploader
        options={{
          maxFileSize: 5 * 1024 * 1024,
          maxFiles: 3,
          acceptTypes: ['image/*'],
          onUpload: async () => {
            // Mock upload delay
            await new Promise((resolve) => setTimeout(resolve, 1000))
          },
        }}
        dropLabel="Drop images here"
        buttonLabel="Upload Images"
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Drop zone renders
    await expect(canvas.getByText('Drop images here')).toBeInTheDocument()

    const fileInput = canvas.getByTestId('file-input')

    // Upload multiple files
    const file1 = new File(['img-data-1'], 'photo.png', { type: 'image/png' })
    const file2 = new File(['img-data-2'], 'screenshot.jpg', { type: 'image/jpeg' })
    await userEvent.upload(fileInput, [file1, file2])

    // Both files should appear
    await waitFor(() => {
      expect(canvas.getByText('photo.png')).toBeInTheDocument()
      expect(canvas.getByText('screenshot.jpg')).toBeInTheDocument()
    })

    // Clear All button should be visible
    await waitFor(() => {
      const clearBtn = canvas.getByTestId('clear-all-btn')
      expect(clearBtn).toBeInTheDocument()
    })

    // Click Clear All
    const clearBtn = canvas.getByTestId('clear-all-btn')
    await userEvent.click(clearBtn)

    // File list should be removed
    await waitFor(() => {
      expect(canvas.queryByTestId('file-list')).toBeNull()
    })
  },
}
