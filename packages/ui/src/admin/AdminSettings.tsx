'use client';

import { useState } from 'react';
import SettingsRow from './SettingsRow';

interface ModelSetting {
  label: string;
  limit: string;
  enabled: boolean;
}

const INITIAL_MODELS: ModelSetting[] = [
  { label: 'Claude 3.5 Sonnet', limit: '100,000', enabled: true },
  { label: 'GPT-4o', limit: '50,000', enabled: true },
  { label: 'Gemini Pro 1.5', limit: '80,000', enabled: true },
  { label: 'Claude Haiku 4.5', limit: '200,000', enabled: true },
  { label: 'GPT-4o mini', limit: '300,000', enabled: true },
];

export default function AdminSettings() {
  const [models, setModels] = useState(INITIAL_MODELS);

  const handleToggle = (index: number, enabled: boolean) => {
    setModels((prev) => prev.map((m, i) => (i === index ? { ...m, enabled } : m)));
  };

  return (
    <div className="flex flex-col gap-8 p-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-text-primary">관리 설정</h1>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-text-primary">일반 설정</h2>
        <div className="h-px bg-border" />
        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-text-secondary">시스템 이름</span>
          <input
            type="text"
            defaultValue="H Chat v3"
            className="w-72 px-4 py-2 text-sm rounded-md border border-admin-input-border bg-admin-input-bg text-text-primary outline-none focus:border-admin-teal"
          />
        </div>
        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-text-secondary">기본 언어</span>
          <input
            type="text"
            defaultValue="한국어"
            className="w-72 px-4 py-2 text-sm rounded-md border border-admin-input-border bg-admin-input-bg text-text-primary outline-none focus:border-admin-teal"
          />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-text-primary">모델 설정</h2>
        <div className="h-px bg-border" />
        {models.map((m, i) => (
          <SettingsRow
            key={m.label}
            label={m.label}
            description={`일일 한도: ${m.limit} 토큰`}
            enabled={m.enabled}
            onToggle={(enabled) => handleToggle(i, enabled)}
            onEdit={() => {}}
          />
        ))}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-text-primary">비용 설정</h2>
        <div className="h-px bg-border" />
        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-text-secondary">월 예산 한도 (USD)</span>
          <input
            type="text"
            defaultValue="$500.00"
            className="w-72 px-4 py-2 text-sm rounded-md border border-admin-input-border bg-admin-input-bg text-text-primary outline-none focus:border-admin-teal"
          />
        </div>
        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-text-secondary">경고 임계값 (%)</span>
          <input
            type="text"
            defaultValue="80%"
            className="w-72 px-4 py-2 text-sm rounded-md border border-admin-input-border bg-admin-input-bg text-text-primary outline-none focus:border-admin-teal"
          />
        </div>
        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-text-secondary">일일 토큰 한도</span>
          <input
            type="text"
            defaultValue="1,000,000"
            className="w-72 px-4 py-2 text-sm rounded-md border border-admin-input-border bg-admin-input-bg text-text-primary outline-none focus:border-admin-teal"
          />
        </div>
      </section>

      <div className="flex gap-4 justify-end pt-4">
        <button className="px-8 py-3 text-sm font-semibold text-white bg-admin-teal rounded-lg hover:opacity-90 transition-opacity">
          설정 저장
        </button>
        <button className="px-8 py-3 text-sm font-medium text-text-secondary border border-border rounded-lg hover:bg-bg-hover transition-colors">
          초기화
        </button>
      </div>
    </div>
  );
}
