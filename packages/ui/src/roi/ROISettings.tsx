'use client';

import { useState } from 'react';

interface SettingRowProps {
  label: string;
  children: React.ReactNode;
}

function SettingRow({ label, children }: SettingRowProps) {
  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-[var(--roi-text-primary)] w-44 shrink-0">{label}</span>
      {children}
    </div>
  );
}

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label={enabled ? '사용 중' : '비활성'}
      onClick={() => onChange(!enabled)}
      className="flex items-center gap-2"
    >
      <div className={`w-10 h-[22px] rounded-full flex items-center px-0.5 transition-colors ${enabled ? 'bg-[var(--roi-chart-1)] justify-end' : 'bg-gray-300 dark:bg-gray-600 justify-start'}`}>
        <div className="w-[18px] h-[18px] rounded-full bg-white transition-all" />
      </div>
      <span className={`text-xs ${enabled ? 'text-[var(--roi-positive)]' : 'text-[var(--roi-text-muted)]'}`}>
        {enabled ? '사용' : '비활성'}
      </span>
    </button>
  );
}

function InputField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      className="flex-1 px-3 py-2 text-sm rounded-lg border border-[var(--roi-divider)] bg-[var(--roi-body-bg)] text-[var(--roi-text-primary)]"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={value}
    />
  );
}

interface SectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

function Section({ title, description, children }: SectionProps) {
  return (
    <div className="p-6 rounded-xl bg-[var(--roi-card-bg)] border border-[var(--roi-card-border)]">
      <h3 className="text-sm font-semibold text-[var(--roi-text-primary)]">{title}</h3>
      {description && <p className="text-xs text-[var(--roi-text-secondary)] mt-1">{description}</p>}
      <div className="mt-4 flex flex-col gap-4">{children}</div>
    </div>
  );
}

export default function ROISettings() {
  const [hourlyCost, setHourlyCost] = useState('₩45,000');
  const [gradeDiff, setGradeDiff] = useState(true);
  const [currency, setCurrency] = useState('KRW (₩)');
  const [roiCycle, setRoiCycle] = useState('월간');
  const [apiConnected, setApiConnected] = useState(true);
  const [surveyCycle, setSurveyCycle] = useState('월 1회');
  const [modelPrice, setModelPrice] = useState('자동 (API 기반 실시간)');
  const [budgetLimit, setBudgetLimit] = useState('₩50,000,000');
  const [infraIncluded, setInfraIncluded] = useState(false);
  const [roiTarget, setRoiTarget] = useState('300%');
  const [inactiveAlert, setInactiveAlert] = useState('30일');
  const [budgetWarning, setBudgetWarning] = useState('80%');

  const handleSave = () => {
    window.alert('저장되었습니다');
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[var(--roi-text-primary)]">설정</h1>
        <button
          onClick={handleSave}
          aria-label="변경사항 저장"
          className="px-4 py-2 text-sm font-semibold rounded-lg bg-[var(--roi-chart-1)] text-white hover:opacity-90 transition-opacity"
        >
          변경사항 저장
        </button>
      </div>

      <Section title="ROI 파라미터" description="ROI 계산에 사용되는 기본 파라미터를 설정합니다.">
        <SettingRow label="시간당 평균 인건비"><InputField value={hourlyCost} onChange={setHourlyCost} /></SettingRow>
        <SettingRow label="직급별 인건비 차등"><Toggle enabled={gradeDiff} onChange={setGradeDiff} /></SettingRow>
        <SettingRow label="통화 단위"><InputField value={currency} onChange={setCurrency} /></SettingRow>
        <SettingRow label="ROI 계산 주기"><InputField value={roiCycle} onChange={setRoiCycle} /></SettingRow>
      </Section>

      <Section title="데이터 소스" description="데이터 수집 및 연동 설정을 관리합니다.">
        <SettingRow label="H Chat API 연결"><Toggle enabled={apiConnected} onChange={setApiConnected} /></SettingRow>
        <SettingRow label="CSV 수동 업로드">
          <button className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg border border-[var(--roi-divider)] text-[var(--roi-text-secondary)]">
            <span className="material-symbols-rounded text-sm">upload</span>
            파일 업로드
          </button>
        </SettingRow>
        <SettingRow label="설문 수집 주기"><InputField value={surveyCycle} onChange={setSurveyCycle} /></SettingRow>
      </Section>

      <Section title="비용 설정">
        <SettingRow label="모델별 단가"><InputField value={modelPrice} onChange={setModelPrice} /></SettingRow>
        <SettingRow label="월 예산 한도"><InputField value={budgetLimit} onChange={setBudgetLimit} /></SettingRow>
        <SettingRow label="인프라 비용 포함"><Toggle enabled={infraIncluded} onChange={setInfraIncluded} /></SettingRow>
      </Section>

      <Section title="알림">
        <SettingRow label="ROI 목표 달성 알림"><InputField value={roiTarget} onChange={setRoiTarget} /></SettingRow>
        <SettingRow label="비활성 사용자 알림"><InputField value={inactiveAlert} onChange={setInactiveAlert} /></SettingRow>
        <SettingRow label="예산 초과 경고"><InputField value={budgetWarning} onChange={setBudgetWarning} /></SettingRow>
      </Section>

      <Section title="권한 관리">
        <div className="flex flex-col gap-3">
          {[
            { role: '경영진', scope: '전사 데이터 — 모든 부서 조회', badge: 'Full Access', badgeBg: 'bg-[var(--roi-chart-1)]/10', badgeText: 'text-[var(--roi-chart-1)]' },
            { role: '부서장', scope: '소속 부서 — 자기 부서만 조회', badge: 'Department', badgeBg: 'bg-[var(--roi-chart-2)]/10', badgeText: 'text-[var(--roi-chart-2)]' },
            { role: '일반 사용자', scope: '본인 — 개인 통계만 조회', badge: 'Personal', badgeBg: 'bg-gray-100 dark:bg-gray-800', badgeText: 'text-[var(--roi-text-muted)]' },
          ].map((p) => (
            <div key={p.role} className="flex items-center gap-4">
              <span className="text-sm font-semibold text-[var(--roi-text-primary)] w-24">{p.role}</span>
              <span className="text-sm text-[var(--roi-text-secondary)] flex-1">{p.scope}</span>
              <span className={`text-xs font-semibold px-2 py-1 rounded ${p.badgeBg} ${p.badgeText}`}>{p.badge}</span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
