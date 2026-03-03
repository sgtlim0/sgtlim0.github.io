import type { Meta, StoryObj } from '@storybook/react';

const tokenGroups = [
  {
    name: 'Wiki',
    prefix: '--',
    tokens: [
      { name: '--primary', light: '#2563EB', dark: '#3B82F6' },
      { name: '--primary-hover', light: '#1D4ED8', dark: '#2563EB' },
      { name: '--accent-emerald', light: '#10B981', dark: '#10B981' },
      { name: '--accent-purple', light: '#8B5CF6', dark: '#8B5CF6' },
      { name: '--bg-page', light: '#FFFFFF', dark: '#111827' },
      { name: '--bg-sidebar', light: '#F8FAFC', dark: '#1F2937' },
      { name: '--bg-hero', light: '#EFF6FF', dark: '#1E3A5F' },
      { name: '--text-primary', light: '#0F172A', dark: '#F1F5F9' },
      { name: '--text-secondary', light: '#64748B', dark: '#94A3B8' },
      { name: '--border', light: '#E2E8F0', dark: '#374151' },
    ],
  },
  {
    name: 'HMG',
    prefix: '--hmg-',
    tokens: [
      { name: '--hmg-navy', light: '#002C5F', dark: '#002C5F' },
      { name: '--hmg-teal', light: '#00B4D8', dark: '#00B4D8' },
      { name: '--hmg-accent', light: '#E15C39', dark: '#E15C39' },
      { name: '--hmg-bg-card', light: '#FFFFFF', dark: '#2A2A2A' },
      { name: '--hmg-bg-section', light: '#F5F5F5', dark: '#1A1A1A' },
      { name: '--hmg-text-title', light: '#000000', dark: '#F1F1F1' },
    ],
  },
  {
    name: 'Admin',
    prefix: '--admin-',
    tokens: [
      { name: '--admin-teal', light: '#00AAC1', dark: '#00AAC1' },
      { name: '--admin-navy', light: '#002C5F', dark: '#002C5F' },
      { name: '--admin-status-success', light: '#4CAF50', dark: '#4CAF50' },
      { name: '--admin-status-error', light: '#E53935', dark: '#E53935' },
      { name: '--admin-bg-card', light: '#FFFFFF', dark: '#1E1E2E' },
      { name: '--admin-bg-section', light: '#FFFFFF', dark: '#1A1A2E' },
    ],
  },
  {
    name: 'ROI Dashboard',
    prefix: '--roi-',
    tokens: [
      { name: '--roi-sidebar-bg', light: '#0F172A', dark: '#020617' },
      { name: '--roi-body-bg', light: '#F1F5F9', dark: '#0F172A' },
      { name: '--roi-card-bg', light: '#FFFFFF', dark: '#1E293B' },
      { name: '--roi-positive', light: '#10B981', dark: '#10B981' },
      { name: '--roi-negative', light: '#EF4444', dark: '#EF4444' },
      { name: '--roi-chart-1', light: '#3763F4', dark: '#3763F4' },
      { name: '--roi-chart-2', light: '#00AAD2', dark: '#00AAD2' },
      { name: '--roi-chart-3', light: '#10B981', dark: '#10B981' },
      { name: '--roi-chart-4', light: '#F59E0B', dark: '#F59E0B' },
      { name: '--roi-chart-5', light: '#EC4899', dark: '#EC4899' },
    ],
  },
  {
    name: 'User',
    prefix: '--user-',
    tokens: [
      { name: '--user-primary', light: '#4F6EF7', dark: '#6B8AFF' },
      { name: '--user-accent', light: '#10B981', dark: '#34D399' },
      { name: '--user-bg', light: '#FFFFFF', dark: '#0F172A' },
      { name: '--user-bg-section', light: '#F8FAFC', dark: '#1E293B' },
      { name: '--user-text-primary', light: '#1E293B', dark: '#F1F5F9' },
    ],
  },
  {
    name: 'LLM Router',
    prefix: '--lr-',
    tokens: [
      { name: '--lr-primary', light: '#3B82F6', dark: '#3B82F6' },
      { name: '--lr-nav-bg', light: '#0F172A', dark: '#020617' },
      { name: '--lr-bg', light: '#FFFFFF', dark: '#0F172A' },
      { name: '--lr-bg-code', light: '#1F2937', dark: '#111827' },
      { name: '--lr-text-primary', light: '#0F172A', dark: '#F1F5F9' },
    ],
  },
];

function TokenSwatch({ name, light, dark }: { name: string; light: string; dark: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 0' }}>
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 6,
          backgroundColor: light,
          border: '1px solid #E2E8F0',
          flexShrink: 0,
        }}
        title={`Light: ${light}`}
      />
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 6,
          backgroundColor: dark,
          border: '1px solid #374151',
          flexShrink: 0,
        }}
        title={`Dark: ${dark}`}
      />
      <code style={{ fontSize: 13, color: '#334155', fontFamily: 'monospace' }}>{name}</code>
      <span style={{ fontSize: 12, color: '#94A3B8', marginLeft: 'auto' }}>{light} / {dark}</span>
    </div>
  );
}

function DesignTokensPage() {
  return (
    <div style={{ maxWidth: 800, padding: 32, fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, color: '#0F172A' }}>
        Design Tokens
      </h1>
      <p style={{ fontSize: 15, color: '#64748B', marginBottom: 32 }}>
        <code>packages/tokens/styles/tokens.css</code>에 정의된 80+ CSS 변수.
        각 앱별 네임스페이스로 라이트/다크 모드 자동 대응.
      </p>

      {tokenGroups.map((group) => (
        <div key={group.name} style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#0F172A', marginBottom: 4 }}>
            {group.name}
          </h2>
          <p style={{ fontSize: 13, color: '#94A3B8', marginBottom: 12 }}>
            prefix: <code>{group.prefix}*</code>
          </p>
          <div
            style={{
              padding: 16,
              borderRadius: 12,
              border: '1px solid #E2E8F0',
              background: '#FAFBFC',
            }}
          >
            <div style={{ display: 'flex', gap: 12, marginBottom: 8, paddingBottom: 8, borderBottom: '1px solid #E2E8F0' }}>
              <span style={{ width: 32, fontSize: 11, color: '#94A3B8', textAlign: 'center' }}>Light</span>
              <span style={{ width: 32, fontSize: 11, color: '#94A3B8', textAlign: 'center' }}>Dark</span>
              <span style={{ fontSize: 11, color: '#94A3B8' }}>Variable</span>
            </div>
            {group.tokens.map((t) => (
              <TokenSwatch key={t.name} name={t.name} light={t.light} dark={t.dark} />
            ))}
          </div>
        </div>
      ))}

      <div style={{ marginTop: 40, padding: 20, borderRadius: 12, background: '#EFF6FF', border: '1px solid #BFDBFE' }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1D4ED8', marginBottom: 8 }}>사용법</h3>
        <pre style={{ fontSize: 13, color: '#334155', background: '#FFFFFF', padding: 16, borderRadius: 8, overflow: 'auto' }}>
{`/* globals.css에서 토큰 import */
@import '../../../packages/tokens/styles/tokens.css';

/* Tailwind @theme inline 매핑 */
@theme inline {
  --color-primary: var(--primary);
  --color-bg-page: var(--bg-page);
}

/* 직접 CSS 변수 사용 */
.card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  color: var(--text-primary);
}`}
        </pre>
      </div>
    </div>
  );
}

const meta: Meta = {
  title: 'Design System/Tokens',
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj;

export const ColorPalette: Story = {
  render: () => <DesignTokensPage />,
};
