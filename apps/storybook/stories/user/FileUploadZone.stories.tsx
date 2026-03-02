import type { Meta, StoryObj } from '@storybook/react';
import FileUploadZone from '@hchat/ui/user/components/FileUploadZone';

const meta: Meta<typeof FileUploadZone> = {
  title: 'User/Molecules/FileUploadZone',
  component: FileUploadZone,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof FileUploadZone>;

export const Default: Story = {
  args: {
    onUpload: (files) => console.log('Uploaded:', files.map(f => f.name)),
  },
};

export const PDFOnly: Story = {
  args: {
    accept: '.pdf',
    maxFiles: 5,
    maxSize: '20MB',
    description: 'PDF 파일만 업로드 가능합니다. 최대 5개, 20MB 이하',
    onUpload: (files) => console.log('Uploaded:', files.map(f => f.name)),
  },
};

export const ImageOnly: Story = {
  args: {
    accept: 'image/*',
    maxFiles: 10,
    maxSize: '10MB',
    description: '이미지 파일만 업로드 가능합니다. JPG, PNG, GIF 지원',
    onUpload: (files) => console.log('Uploaded:', files.map(f => f.name)),
  },
};

export const SingleFile: Story = {
  args: {
    maxFiles: 1,
    maxSize: '100MB',
    description: '파일 1개만 선택 가능합니다',
    onUpload: (files) => console.log('Uploaded:', files.map(f => f.name)),
  },
};
