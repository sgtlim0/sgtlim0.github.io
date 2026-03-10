import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { within, expect } from '@storybook/test'
import { Timeline } from '@hchat/ui'
import type { TimelineItem } from '@hchat/ui'

const baseDate = new Date('2026-03-10T09:00:00')

const verticalItems: TimelineItem[] = [
  {
    id: '1',
    title: 'Project Kickoff',
    description: 'Initial planning and team assembly completed.',
    timestamp: new Date(baseDate.getTime() - 7 * 24 * 60 * 60 * 1000),
    status: 'completed',
  },
  {
    id: '2',
    title: 'Design Phase',
    description: 'UI/UX design and prototyping in progress.',
    timestamp: new Date(baseDate.getTime() - 3 * 24 * 60 * 60 * 1000),
    status: 'completed',
  },
  {
    id: '3',
    title: 'Development Sprint 1',
    description: 'Core features implementation underway.',
    timestamp: baseDate,
    status: 'current',
  },
  {
    id: '4',
    title: 'QA Testing',
    description: 'Comprehensive testing and bug fixing.',
    timestamp: new Date(baseDate.getTime() + 7 * 24 * 60 * 60 * 1000),
    status: 'upcoming',
  },
  {
    id: '5',
    title: 'Production Release',
    description: 'Deploy to production environment.',
    timestamp: new Date(baseDate.getTime() + 14 * 24 * 60 * 60 * 1000),
    status: 'upcoming',
  },
]

const meta: Meta<typeof Timeline> = {
  title: 'Shared/Timeline',
  component: Timeline,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
}
export default meta
type Story = StoryObj<typeof Timeline>

export const Vertical: Story = {
  render: () => (
    <div className="max-w-lg mx-auto p-6">
      <Timeline items={verticalItems} orientation="vertical" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Should render all timeline items
    const list = canvas.getByRole('list', { name: 'Timeline' })
    expect(list).toBeTruthy()

    const items = canvasElement.querySelectorAll('li')
    expect(items.length).toBe(5)

    // Verify titles are rendered
    expect(canvas.getByText('Project Kickoff')).toBeTruthy()
    expect(canvas.getByText('Development Sprint 1')).toBeTruthy()
    expect(canvas.getByText('Production Release')).toBeTruthy()
  },
}

export const Horizontal: Story = {
  render: () => (
    <div className="max-w-4xl mx-auto p-6 overflow-x-auto">
      <Timeline items={verticalItems} orientation="horizontal" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Should render horizontal layout
    const list = canvas.getByRole('list', { name: 'Timeline' })
    expect(list).toBeTruthy()
    expect(list.classList.contains('flex-row')).toBe(true)

    // All items rendered
    const items = canvasElement.querySelectorAll('li')
    expect(items.length).toBe(5)
  },
}

export const StatusVariants: Story = {
  render: () => {
    const statusItems: TimelineItem[] = [
      { id: 'c', title: 'Completed Task', description: 'Done successfully.', timestamp: baseDate, status: 'completed' },
      { id: 'a', title: 'Active Task', description: 'Currently in progress.', timestamp: baseDate, status: 'current' },
      { id: 'u', title: 'Upcoming Task', description: 'Scheduled for later.', timestamp: baseDate, status: 'upcoming' },
    ]
    return (
      <div className="max-w-lg mx-auto p-6">
        <Timeline items={statusItems} orientation="vertical" />
      </div>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    expect(canvas.getByText('Completed Task')).toBeTruthy()
    expect(canvas.getByText('Active Task')).toBeTruthy()
    expect(canvas.getByText('Upcoming Task')).toBeTruthy()

    const items = canvasElement.querySelectorAll('li')
    expect(items.length).toBe(3)
  },
}
