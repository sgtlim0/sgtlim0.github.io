'use client';

export interface ProviderBadgeProps {
  provider: string;
  size?: 'sm' | 'md';
}

const providerColorMap: Record<string, string> = {
  'OpenAI': '#10A37F',
  'Anthropic': '#D97757',
  'Google': '#4285F4',
  'Meta': '#0668E1',
  'Mistral': '#FF7000',
  'Cohere': '#39594D',
  'DeepSeek': '#4D6BFE',
};

export default function ProviderBadge({ provider, size = 'md' }: ProviderBadgeProps) {
  const color = providerColorMap[provider] || '#6B7280';
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${sizeClass} bg-lr-bg-section text-lr-text-primary border border-lr-border`}
    >
      <span
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: color }}
      />
      <span>{provider}</span>
    </span>
  );
}
