'use client';

import { useState } from 'react';
import { ProviderBadge, mockUsageStats, mockMonthlyUsage, mockModelUsageBreakdown } from '@hchat/ui/llm-router';
import { BarChart3, TrendingUp, Zap, Clock } from 'lucide-react';

type DateFilter = '이번 달' | '지난 달' | '최근 3개월';

export default function UsagePage() {
  const [dateFilter, setDateFilter] = useState<DateFilter>('이번 달');

  const maxRequests = Math.max(...mockUsageStats.map((s) => s.requests));

  // Calculate totals from mockMonthlyUsage (use latest month)
  const latestMonth = mockMonthlyUsage[mockMonthlyUsage.length - 1];
  const totalRequests = latestMonth.requests;
  const totalTokens = latestMonth.tokens;
  const totalCost = latestMonth.cost;
  const avgLatency = 850; // Mock average latency in ms

  // Calculate total cost for percentage calculation
  const totalModelCost = mockModelUsageBreakdown.reduce((sum, model) => sum + model.cost, 0);

  return (
    <div className="max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-[var(--lr-text-primary)]">사용량 통계</h1>

        <div className="flex gap-2">
          {(['이번 달', '지난 달', '최근 3개월'] as DateFilter[]).map((filter) => (
            <button
              key={filter}
              onClick={() => setDateFilter(filter)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                dateFilter === filter
                  ? 'bg-[var(--lr-primary)] text-white'
                  : 'bg-[var(--lr-bg-section)] text-[var(--lr-text-secondary)] hover:bg-[var(--lr-border)]'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-[var(--lr-bg-section)] border border-[var(--lr-border)] rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-sm font-medium text-[var(--lr-text-secondary)]">총 요청 수</h3>
          </div>
          <p className="text-3xl font-bold text-[var(--lr-text-primary)]">
            {totalRequests.toLocaleString()}
          </p>
          <p className="text-sm text-[var(--lr-accent)] mt-1">+12.5% vs 지난 달</p>
        </div>

        <div className="bg-[var(--lr-bg-section)] border border-[var(--lr-border)] rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-sm font-medium text-[var(--lr-text-secondary)]">총 토큰 사용량</h3>
          </div>
          <p className="text-3xl font-bold text-[var(--lr-text-primary)]">
            {(totalTokens / 1000000).toFixed(1)}M
          </p>
          <p className="text-sm text-[var(--lr-accent)] mt-1">+8.3% vs 지난 달</p>
        </div>

        <div className="bg-[var(--lr-bg-section)] border border-[var(--lr-border)] rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-sm font-medium text-[var(--lr-text-secondary)]">총 비용</h3>
          </div>
          <p className="text-3xl font-bold text-[var(--lr-text-primary)]">
            ₩{totalCost.toLocaleString()}
          </p>
          <p className="text-sm text-[var(--lr-accent)] mt-1">+5.7% vs 지난 달</p>
        </div>

        <div className="bg-[var(--lr-bg-section)] border border-[var(--lr-border)] rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="text-sm font-medium text-[var(--lr-text-secondary)]">평균 레이턴시</h3>
          </div>
          <p className="text-3xl font-bold text-[var(--lr-text-primary)]">
            {avgLatency}ms
          </p>
          <p className="text-sm text-red-500 mt-1">+3.2% vs 지난 달</p>
        </div>
      </div>

      {/* Usage Chart */}
      <div className="bg-[var(--lr-bg-section)] border border-[var(--lr-border)] rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-[var(--lr-text-primary)] mb-6">일별 요청 수 (최근 14일)</h2>
        <div className="space-y-3">
          {mockUsageStats.map((stat) => (
            <div key={stat.date} className="flex items-center gap-4">
              <span className="text-sm text-[var(--lr-text-secondary)] w-20 font-mono">
                {stat.date.slice(5)}
              </span>
              <div className="flex-1 h-8 bg-[var(--lr-bg)] rounded-md overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[var(--lr-primary)] to-[var(--lr-accent)] flex items-center justify-end pr-3 transition-all"
                  style={{ width: `${(stat.requests / maxRequests) * 100}%` }}
                >
                  <span className="text-xs font-semibold text-white">
                    {stat.requests.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Model Usage Breakdown */}
      <div className="bg-[var(--lr-bg-section)] border border-[var(--lr-border)] rounded-lg p-6">
        <h2 className="text-xl font-semibold text-[var(--lr-text-primary)] mb-6">모델별 사용량</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--lr-border)]">
                <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--lr-text-secondary)]">
                  모델
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--lr-text-secondary)]">
                  프로바이더
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-[var(--lr-text-secondary)]">
                  요청 수
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-[var(--lr-text-secondary)]">
                  토큰
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-[var(--lr-text-secondary)]">
                  비용
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-[var(--lr-text-secondary)]">
                  비중
                </th>
              </tr>
            </thead>
            <tbody>
              {mockModelUsageBreakdown.map((model) => {
                // Derive provider from model name
                let provider = 'Unknown';
                if (model.model.includes('GPT')) provider = 'OpenAI';
                else if (model.model.includes('Claude')) provider = 'Anthropic';
                else if (model.model.includes('Gemini')) provider = 'Google';

                const percentage = (model.cost / totalModelCost) * 100;

                return (
                  <tr key={model.model} className="border-b border-[var(--lr-border)] last:border-0">
                    <td className="py-4 px-4">
                      <span className="font-medium text-[var(--lr-text-primary)]">{model.model}</span>
                    </td>
                    <td className="py-4 px-4">
                      <ProviderBadge provider={provider} size="sm" />
                    </td>
                    <td className="py-4 px-4 text-right text-[var(--lr-text-primary)]">
                      {model.requests.toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-right text-[var(--lr-text-primary)]">
                      {(model.tokens / 1000000).toFixed(1)}M
                    </td>
                    <td className="py-4 px-4 text-right text-[var(--lr-text-primary)]">
                      ₩{model.cost.toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="text-[var(--lr-text-primary)] font-semibold">
                        {percentage.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
