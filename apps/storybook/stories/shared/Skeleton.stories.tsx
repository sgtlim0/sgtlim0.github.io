import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { SkeletonPulse, SkeletonText, SkeletonCard, SkeletonTable, SkeletonChart } from '@hchat/ui'

const meta: Meta = {
  title: 'Shared/Skeleton',
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
}
export default meta

export const Pulse = () => <SkeletonPulse style={{ width: 200, height: 40 }} />
export const Text: StoryObj = { render: () => <SkeletonText lines={3} /> }
export const TextSingle = () => <SkeletonText lines={1} width="60%" />
export const Card = () => <SkeletonCard lines={3} />
export const CardCompact = () => <SkeletonCard lines={2} />
export const Table = () => <SkeletonTable rows={5} cols={4} />
export const TableSmall = () => <SkeletonTable rows={3} cols={3} />
export const Chart = () => <SkeletonChart height={300} />
export const ChartShort = () => <SkeletonChart height={180} />
