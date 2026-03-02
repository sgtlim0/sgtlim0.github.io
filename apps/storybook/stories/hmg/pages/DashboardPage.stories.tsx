import type { Meta, StoryObj } from '@storybook/react';
import HmgStatCard from '@hchat/ui/hmg/HmgStatCard';

const DashboardPage = () => {
  const stats = [
    { label: "AI 채팅", value: 128 },
    { label: "그룹 채팅", value: 42 },
    { label: "도구 사용", value: 89 },
    { label: "북마크", value: 15 },
  ];

  return (
    <div style={{ padding: "60px 80px" }}>
      <div style={{ marginBottom: "48px" }}>
        <h1
          className="text-hmg-text-title"
          style={{
            fontSize: "24px",
            fontWeight: "600",
            marginBottom: "8px",
          }}
        >
          Welcome, 사용자님
        </h1>
        <p
          className="text-hmg-text-caption"
          style={{
            fontSize: "14px",
          }}
        >
          H Chat v3.0.0 사용 현황 대시보드
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "24px",
          marginBottom: "48px",
        }}
      >
        {stats.map((stat, index) => (
          <HmgStatCard key={index} label={stat.label} value={stat.value} />
        ))}
      </div>

      <div style={{ marginBottom: "32px" }}>
        <input
          type="text"
          placeholder="검색어를 입력하세요"
          className="bg-hmg-input-bg border border-hmg-input-border text-hmg-text-body"
          style={{
            width: "100%",
            height: "48px",
            borderRadius: "8px",
            padding: "0 16px",
            fontSize: "14px",
          }}
        />
      </div>

      <div style={{ display: "flex", gap: "16px", marginBottom: "48px" }}>
        <button
          className="bg-hmg-navy text-white"
          style={{
            height: "48px",
            padding: "0 32px",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "500",
            border: "none",
            cursor: "pointer",
          }}
        >
          빠른 시작 가이드
        </button>
        <button
          className="bg-hmg-teal text-white"
          style={{
            height: "48px",
            padding: "0 32px",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "500",
            border: "none",
            cursor: "pointer",
          }}
        >
          문서 전체 보기
        </button>
      </div>

      <div
        className="bg-hmg-bg-section"
        style={{
          borderRadius: "10px",
          padding: "40px",
        }}
      >
        <h2
          className="text-hmg-text-title"
          style={{
            fontSize: "28px",
            fontWeight: "700",
            marginBottom: "16px",
          }}
        >
          H Chat v3 — 멀티 AI 어시스턴트
        </h2>
        <p
          className="text-hmg-text-body"
          style={{
            fontSize: "16px",
            lineHeight: "1.6",
          }}
        >
          ChatGPT, Claude, Gemini 등 다양한 AI 모델을 하나의 플랫폼에서 활용하고,
          크로스 모델 토론, YouTube 분석, PDF 채팅 등 강력한 기능을 경험하세요.
        </p>
      </div>
    </div>
  );
};

const meta: Meta<typeof DashboardPage> = {
  title: 'HMG/Pages/Dashboard',
  component: DashboardPage,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div style={{ width: 1440, minHeight: 800, overflow: 'auto' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof DashboardPage>;

export const Default: Story = {};
export const DarkMode: Story = { parameters: { themes: { themeOverride: 'Dark' } } };
