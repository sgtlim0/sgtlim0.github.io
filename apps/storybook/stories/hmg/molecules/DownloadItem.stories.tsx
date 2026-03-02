import type { Meta, StoryObj } from '@storybook/react';
import DownloadItem from '@hchat/ui/hmg/DownloadItem';

const meta: Meta<typeof DownloadItem> = {
  title: 'HMG/Molecules/DownloadItem',
  component: DownloadItem,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof DownloadItem>;

export const Default: Story = {
  args: {
    title: 'H Chat 사용자 가이드 v3.0',
    buttons: [
      { label: 'PDF', onClick: () => alert('PDF 다운로드') },
      { label: 'Markdown', onClick: () => alert('Markdown 다운로드') },
    ],
  },
};

export const Multiple: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <DownloadItem
        title="H Chat 사용자 가이드 v3.0"
        buttons={[
          { label: 'PDF', onClick: () => alert('PDF 다운로드') },
          { label: 'Markdown', onClick: () => alert('Markdown 다운로드') },
        ]}
      />
      <DownloadItem
        title="H Chat API 레퍼런스 v2.5"
        buttons={[
          { label: 'PDF', onClick: () => alert('PDF 다운로드') },
          { label: 'JSON', onClick: () => alert('JSON 다운로드') },
        ]}
      />
      <DownloadItem
        title="H Chat 릴리즈 노트 2025-Q1"
        buttons={[
          { label: 'PDF', onClick: () => alert('PDF 다운로드') },
          { label: 'HTML', onClick: () => alert('HTML 다운로드') },
        ]}
      />
    </div>
  ),
};
