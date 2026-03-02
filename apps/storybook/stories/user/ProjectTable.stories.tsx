import type { Meta, StoryObj } from '@storybook/react';
import ProjectTable from '@hchat/ui/user/components/ProjectTable';
import { mockDocProjects } from '@hchat/ui/user/services/mockData';

const meta: Meta<typeof ProjectTable> = {
  title: 'User/Molecules/ProjectTable',
  component: ProjectTable,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof ProjectTable>;

export const WithProjects: Story = {
  args: {
    projects: mockDocProjects,
    onSelect: (project) => console.log('Selected:', project.name),
    onDelete: (id) => console.log('Delete:', id),
  },
};

export const EmptyState: Story = {
  args: {
    projects: [],
    onSelect: (project) => console.log('Selected:', project.name),
    onDelete: (id) => console.log('Delete:', id),
  },
};

export const ManyProjects: Story = {
  args: {
    projects: [
      ...mockDocProjects,
      { id: 'd3', name: 'Q1 마케팅 전략서', docType: 'DOCX', lastModified: '2026-02-27', step: 3 },
      { id: 'd4', name: '신입사원 교육 자료', docType: 'HWP', lastModified: '2026-02-25', step: 2 },
      { id: 'd5', name: '프로젝트 최종 보고서', docType: 'DOCX', lastModified: '2026-02-20', step: 5 },
    ],
    onSelect: (project) => console.log('Selected:', project.name),
    onDelete: (id) => console.log('Delete:', id),
  },
};
