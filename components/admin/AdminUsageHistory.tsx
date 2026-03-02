'use client';

import { useState } from 'react';
import StatCard from './StatCard';
import DataTable from './DataTable';
import MonthPicker from './MonthPicker';

const TABS = ['전체', 'AI 채팅', '그룹 채팅', '도구 사용'] as const;

const ALL_ROWS = [
  { date: '2026-03-02', user: 'user01', type: 'AI 채팅', model: 'Claude 3.5', tokens: '2,450', cost: '₩12', status: 'success' as const },
  { date: '2026-03-02', user: 'user03', type: '그룹 채팅', model: 'GPT-4', tokens: '8,900', cost: '₩45', status: 'success' as const },
  { date: '2026-03-01', user: 'user02', type: '도구 사용', model: 'Gemini', tokens: '1,200', cost: '₩6', status: 'error' as const },
  { date: '2026-03-01', user: 'user05', type: 'AI 채팅', model: 'Claude 3.5', tokens: '5,300', cost: '₩27', status: 'success' as const },
  { date: '2026-02-28', user: 'user04', type: '그룹 채팅', model: 'GPT-4', tokens: '4,200', cost: '₩21', status: 'success' as const },
  { date: '2026-02-28', user: 'user01', type: 'AI 채팅', model: 'Claude 3.5', tokens: '3,100', cost: '₩16', status: 'pending' as const },
];

export default function AdminUsageHistory() {
  const [activeTab, setActiveTab] = useState<string>('전체');
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(3);

  const filteredRows = activeTab === '전체'
    ? ALL_ROWS
    : ALL_ROWS.filter((r) => r.type === activeTab);

  return (
    <div className="flex flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">사용 내역</h1>
          <p className="text-sm text-text-secondary mt-1">모든 AI 대화 기록을 확인하세요</p>
        </div>
        <button className="px-4 py-2 text-sm font-medium text-white bg-admin-teal rounded-lg hover:opacity-90 transition-opacity">
          CSV 내보내기
        </button>
      </div>

      <div className="flex gap-5">
        <StatCard label="이번 달 토큰" value="892K" />
        <StatCard label="이번 달 비용" value="₩47K" />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-1 p-1 rounded-lg bg-bg-hover">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm rounded-md transition-colors ${
                activeTab === tab
                  ? 'bg-admin-teal text-white font-medium'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <MonthPicker year={year} month={month} onChange={(y, m) => { setYear(y); setMonth(m); }} />
      </div>

      <DataTable rows={filteredRows} />
    </div>
  );
}
