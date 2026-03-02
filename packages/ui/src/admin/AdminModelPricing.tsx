'use client';

import StatCard from './StatCard';

interface Model {
  provider: string;
  name: string;
  contextWindow: string;
  inputCost: string;
  outputCost: string;
  tier: 'premium' | 'standard' | 'economy';
  popular: boolean;
}

const MODELS: Model[] = [
  { provider: 'Bedrock', name: 'Claude 3.5 Sonnet', contextWindow: '200K', inputCost: '$3.00', outputCost: '$15.00', tier: 'premium', popular: true },
  { provider: 'Bedrock', name: 'Claude 3 Opus', contextWindow: '200K', inputCost: '$15.00', outputCost: '$75.00', tier: 'premium', popular: false },
  { provider: 'Bedrock', name: 'Claude 3 Haiku', contextWindow: '200K', inputCost: '$0.25', outputCost: '$1.25', tier: 'economy', popular: true },
  { provider: 'OpenAI', name: 'GPT-4o', contextWindow: '128K', inputCost: '$2.50', outputCost: '$10.00', tier: 'premium', popular: true },
  { provider: 'OpenAI', name: 'GPT-4o-mini', contextWindow: '128K', inputCost: '$0.15', outputCost: '$0.60', tier: 'economy', popular: true },
  { provider: 'OpenAI', name: 'GPT-4 Turbo', contextWindow: '128K', inputCost: '$10.00', outputCost: '$30.00', tier: 'premium', popular: false },
  { provider: 'Google', name: 'Gemini 1.5 Pro', contextWindow: '2M', inputCost: '$1.25', outputCost: '$5.00', tier: 'standard', popular: true },
  { provider: 'Google', name: 'Gemini 1.5 Flash', contextWindow: '1M', inputCost: '$0.075', outputCost: '$0.30', tier: 'economy', popular: false },
];

const MONTHLY_COST = [
  { month: '2025.09', bedrock: 8.2, openai: 5.1, google: 2.4 },
  { month: '2025.10', bedrock: 10.5, openai: 6.3, google: 3.1 },
  { month: '2025.11', bedrock: 12.8, openai: 7.5, google: 3.8 },
  { month: '2025.12', bedrock: 14.2, openai: 8.1, google: 4.2 },
  { month: '2026.01', bedrock: 15.8, openai: 8.9, google: 4.8 },
  { month: '2026.02', bedrock: 15.2, openai: 12.1, google: 5.8 },
];

const tierConfig = {
  premium: { label: 'Premium', color: 'text-[#8B5CF6]', bg: 'bg-[#8B5CF6]/10' },
  standard: { label: 'Standard', color: 'text-[#3B82F6]', bg: 'bg-[#3B82F6]/10' },
  economy: { label: 'Economy', color: 'text-[#10B981]', bg: 'bg-[#10B981]/10' },
};

export default function AdminModelPricing() {
  const totalMonthly = MONTHLY_COST[MONTHLY_COST.length - 1];
  const totalCost = totalMonthly ? totalMonthly.bedrock + totalMonthly.openai + totalMonthly.google : 0;
  const maxCost = Math.max(...MONTHLY_COST.map((m) => m.bedrock + m.openai + m.google));

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">모델 가격 정보</h1>
        <p className="text-sm text-text-secondary mt-1">AI 모델별 요금 및 월별 비용 추이</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="활성 모델" value={`${MODELS.length}개`} />
        <StatCard label="이번 달 총 비용" value={`₩${Math.round(totalCost)}M`} trend="+8.2%" trendUp={false} />
        <StatCard label="가장 많이 사용" value="Claude 3.5" trend="45%" trendUp />
        <StatCard label="가장 경제적" value="Gemini Flash" trend="$0.075/1M" trendUp />
      </div>

      {/* Model Pricing Table */}
      <div className="rounded-xl bg-admin-bg-card border border-admin-border overflow-hidden">
        <div className="px-5 py-4 border-b border-admin-border">
          <h3 className="text-base font-bold text-text-primary">모델별 요금표</h3>
          <p className="text-xs text-text-secondary mt-1">가격은 1M 토큰 기준 (USD)</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-admin-bg-section">
                <th className="text-left py-3 px-4 text-xs font-medium text-text-secondary">제공자</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-text-secondary">모델</th>
                <th className="text-center py-3 px-4 text-xs font-medium text-text-secondary">컨텍스트</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-text-secondary">입력 비용</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-text-secondary">출력 비용</th>
                <th className="text-center py-3 px-4 text-xs font-medium text-text-secondary">등급</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border">
              {MODELS.map((model) => {
                const tier = tierConfig[model.tier];
                return (
                  <tr key={model.name} className="hover:bg-admin-bg-hover transition-colors">
                    <td className="py-3 px-4 text-sm text-text-secondary">{model.provider}</td>
                    <td className="py-3 px-4 text-sm font-medium text-text-primary">
                      {model.name}
                      {model.popular && (
                        <span className="ml-2 px-1.5 py-0.5 text-[10px] font-semibold rounded bg-admin-teal/10 text-admin-teal">
                          인기
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-text-secondary text-center tabular-nums">{model.contextWindow}</td>
                    <td className="py-3 px-4 text-sm text-text-primary text-right tabular-nums">{model.inputCost}</td>
                    <td className="py-3 px-4 text-sm text-text-primary text-right tabular-nums">{model.outputCost}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${tier.color} ${tier.bg}`}>
                        {tier.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Monthly Cost Chart */}
      <div className="rounded-xl bg-admin-bg-card border border-admin-border p-5">
        <h3 className="text-base font-bold text-text-primary mb-4">월별 비용 추이 (₩M)</h3>
        <div className="flex flex-col gap-3">
          {MONTHLY_COST.map((m) => {
            const total = m.bedrock + m.openai + m.google;
            const pct = maxCost > 0 ? (total / maxCost) * 100 : 0;
            return (
              <div key={m.month} className="flex items-center gap-4">
                <span className="text-sm text-text-secondary w-20 shrink-0 tabular-nums">{m.month}</span>
                <div className="flex-1 flex h-6 rounded-full overflow-hidden bg-admin-bg-section">
                  <div
                    className="h-full bg-admin-teal transition-all duration-500"
                    style={{ width: `${(m.bedrock / maxCost) * 100}%` }}
                    title={`Bedrock: ₩${m.bedrock}M`}
                  />
                  <div
                    className="h-full bg-[#3B82F6] transition-all duration-500"
                    style={{ width: `${(m.openai / maxCost) * 100}%` }}
                    title={`OpenAI: ₩${m.openai}M`}
                  />
                  <div
                    className="h-full bg-[#F59E0B] transition-all duration-500"
                    style={{ width: `${(m.google / maxCost) * 100}%` }}
                    title={`Google: ₩${m.google}M`}
                  />
                </div>
                <span className="text-sm font-medium text-text-primary w-16 text-right tabular-nums">
                  ₩{total.toFixed(1)}M
                </span>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-6 mt-4 pt-3 border-t border-admin-border">
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-admin-teal" /><span className="text-xs text-text-secondary">Bedrock</span></div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-[#3B82F6]" /><span className="text-xs text-text-secondary">OpenAI</span></div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-[#F59E0B]" /><span className="text-xs text-text-secondary">Google</span></div>
        </div>
      </div>
    </div>
  );
}
