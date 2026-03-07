import type { Meta, StoryObj } from '@storybook/react'
import { fn, expect, within, userEvent } from '@storybook/test'
import ChatSearchBar from '@hchat/ui/user/components/ChatSearchBar'

const meta: Meta<typeof ChatSearchBar> = {
  title: 'User/Atoms/ChatSearchBar/Interactions',
  component: ChatSearchBar,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
}

export default meta
type Story = StoryObj<typeof ChatSearchBar>

export const TypeAndSubmit: Story = {
  args: {
    onSubmit: fn(),
    onAttach: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByLabelText('검색 입력')

    await userEvent.type(input, 'Hello AI')

    const submitBtn = canvas.getByLabelText('전송')
    await userEvent.click(submitBtn)

    await expect(args.onSubmit).toHaveBeenCalledWith('Hello AI')
  },
}

export const SubmitButtonDisabledWhenEmpty: Story = {
  args: {
    onSubmit: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const submitBtn = canvas.getByLabelText('전송')
    await expect(submitBtn).toBeDisabled()
  },
}

export const SubmitButtonEnabledWithText: Story = {
  args: {
    onSubmit: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByLabelText('검색 입력')

    await userEvent.type(input, 'test')

    const submitBtn = canvas.getByLabelText('전송')
    await expect(submitBtn).not.toBeDisabled()
  },
}

export const AttachButtonClick: Story = {
  args: {
    onSubmit: fn(),
    onAttach: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const attachBtn = canvas.getByLabelText('파일 첨부')

    await userEvent.click(attachBtn)
    await expect(args.onAttach).toHaveBeenCalledTimes(1)
  },
}

export const ClearInputAfterSubmit: Story = {
  args: {
    onSubmit: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByLabelText('검색 입력') as HTMLTextAreaElement

    await userEvent.type(input, 'question')

    const submitBtn = canvas.getByLabelText('전송')
    await userEvent.click(submitBtn)

    await expect(input.value).toBe('')
  },
}
