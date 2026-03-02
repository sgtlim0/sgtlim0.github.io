import type { Meta, StoryObj } from '@storybook/react';
import { Zap, MessagesSquare, CirclePlay, FileText, PanelTop, Pencil } from 'lucide-react';
import FeatureCard from '@/components/FeatureCard';

const meta: Meta<typeof FeatureCard> = {
  title: 'Molecules/FeatureCard',
  component: FeatureCard,
  tags: ['autodocs'],
  decorators: [(Story) => <div style={{ width: 350 }}><Story /></div>],
};

export default meta;
type Story = StoryObj<typeof FeatureCard>;

export const Default: Story = {
  args: {
    title: '멀티 AI 프로바이더',
    description: 'AWS Bedrock Claude, OpenAI GPT, Google Gemini를 하나의 인터페이스에서 사용하세요.',
    href: '/settings/providers',
    icon: Zap,
    iconColor: 'text-primary',
    iconBg: 'bg-primary-light',
  },
};

export const EmeraldVariant: Story = {
  args: {
    title: '크로스 모델 토론',
    description: '서로 다른 AI 모델 간 3라운드 토론으로 최적의 답변을 도출합니다.',
    href: '/chat/debate',
    icon: MessagesSquare,
    iconColor: 'text-accent-emerald',
    iconBg: 'bg-[#F0FDF4] dark:bg-[#064E3B]',
  },
};

export const Grid: Story = {
  decorators: [(Story) => <div style={{ width: 1100 }}><Story /></div>],
  render: () => (
    <div className="grid grid-cols-3 gap-5">
      {[
        { icon: Zap, title: '멀티 AI', desc: 'Claude, GPT, Gemini 지원', color: 'text-primary', bg: 'bg-primary-light' },
        { icon: MessagesSquare, title: '크로스 모델 토론', desc: '3라운드 AI 토론', color: 'text-accent-emerald', bg: 'bg-[#F0FDF4]' },
        { icon: CirclePlay, title: 'YouTube 분석', desc: '자막 요약, 댓글 분석', color: 'text-accent-purple', bg: 'bg-[#F5F3FF]' },
        { icon: FileText, title: 'PDF 채팅', desc: 'PDF 기반 질의응답', color: 'text-warning', bg: 'bg-[#FFF7ED]' },
        { icon: PanelTop, title: 'AI 카드', desc: '검색 결과 AI 요약', color: 'text-danger', bg: 'bg-[#FEF2F2]' },
        { icon: Pencil, title: '글쓰기', desc: '7가지 AI 텍스트 변환', color: 'text-accent-emerald', bg: 'bg-[#ECFDF5]' },
      ].map((f) => (
        <FeatureCard
          key={f.title}
          title={f.title}
          description={f.desc}
          href="#"
          icon={f.icon}
          iconColor={f.color}
          iconBg={f.bg}
        />
      ))}
    </div>
  ),
};
