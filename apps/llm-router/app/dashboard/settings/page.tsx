'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';

interface ToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  label: string;
}

function Toggle({ enabled, onChange, label }: ToggleProps) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-[var(--lr-text-primary)]">{label}</span>
      <button
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--lr-primary)] focus:ring-offset-2 ${
          enabled ? 'bg-[var(--lr-primary)]' : 'bg-gray-300 dark:bg-gray-600'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const [orgName, setOrgName] = useState('Hyundai Motor Group');
  const [description, setDescription] = useState('LLM Router for internal AI services');
  const [defaultModel, setDefaultModel] = useState('gpt-4o');
  const [requestsPerMin, setRequestsPerMin] = useState(60);
  const [tokensPerMin, setTokensPerMin] = useState(100000);

  const [budgetAlert, setBudgetAlert] = useState(true);
  const [dailyReport, setDailyReport] = useState(true);
  const [anomalyDetection, setAnomalyDetection] = useState(false);

  const handleSave = () => {
    alert('저장되었습니다');
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold text-[var(--lr-text-primary)] mb-8">조직 설정</h1>

      <div className="space-y-6">
        {/* 기본 정보 */}
        <div className="bg-[var(--lr-bg-section)] border border-[var(--lr-border)] rounded-lg p-6">
          <h2 className="text-xl font-semibold text-[var(--lr-text-primary)] mb-4">기본 정보</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--lr-text-primary)] mb-2">
                조직명
              </label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full px-4 py-2 bg-[var(--lr-bg)] border border-[var(--lr-border)] rounded-lg text-[var(--lr-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--lr-primary)]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--lr-text-primary)] mb-2">
                설명
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 bg-[var(--lr-bg)] border border-[var(--lr-border)] rounded-lg text-[var(--lr-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--lr-primary)] resize-none"
              />
            </div>
          </div>
        </div>

        {/* 기본 모델 */}
        <div className="bg-[var(--lr-bg-section)] border border-[var(--lr-border)] rounded-lg p-6">
          <h2 className="text-xl font-semibold text-[var(--lr-text-primary)] mb-4">기본 모델</h2>

          <div>
            <label className="block text-sm font-medium text-[var(--lr-text-primary)] mb-2">
              모델 선택
            </label>
            <select
              value={defaultModel}
              onChange={(e) => setDefaultModel(e.target.value)}
              className="w-full px-4 py-2 bg-[var(--lr-bg)] border border-[var(--lr-border)] rounded-lg text-[var(--lr-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--lr-primary)]"
            >
              <option value="gpt-4o">GPT-4o (OpenAI)</option>
              <option value="gpt-4-turbo">GPT-4 Turbo (OpenAI)</option>
              <option value="claude-3.7-sonnet">Claude 3.7 Sonnet (Anthropic)</option>
              <option value="claude-3.5-haiku">Claude 3.5 Haiku (Anthropic)</option>
              <option value="gemini-2.0-flash">Gemini 2.0 Flash (Google)</option>
              <option value="gemini-1.5-pro">Gemini 1.5 Pro (Google)</option>
              <option value="llama-3.3-70b">Llama 3.3 70B (Meta)</option>
            </select>
            <p className="text-sm text-[var(--lr-text-muted)] mt-2">
              API 요청에서 모델을 지정하지 않을 경우 사용할 기본 모델입니다.
            </p>
          </div>
        </div>

        {/* 레이트 리밋 */}
        <div className="bg-[var(--lr-bg-section)] border border-[var(--lr-border)] rounded-lg p-6">
          <h2 className="text-xl font-semibold text-[var(--lr-text-primary)] mb-4">레이트 리밋</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--lr-text-primary)] mb-2">
                분당 요청 수 (requests/min)
              </label>
              <input
                type="number"
                value={requestsPerMin}
                onChange={(e) => setRequestsPerMin(Number(e.target.value))}
                min={1}
                className="w-full px-4 py-2 bg-[var(--lr-bg)] border border-[var(--lr-border)] rounded-lg text-[var(--lr-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--lr-primary)]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--lr-text-primary)] mb-2">
                분당 토큰 수 (tokens/min)
              </label>
              <input
                type="number"
                value={tokensPerMin}
                onChange={(e) => setTokensPerMin(Number(e.target.value))}
                min={1000}
                step={1000}
                className="w-full px-4 py-2 bg-[var(--lr-bg)] border border-[var(--lr-border)] rounded-lg text-[var(--lr-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--lr-primary)]"
              />
            </div>

            <p className="text-sm text-[var(--lr-text-muted)]">
              레이트 리밋을 초과하는 요청은 HTTP 429 상태 코드와 함께 거부됩니다.
            </p>
          </div>
        </div>

        {/* 알림 설정 */}
        <div className="bg-[var(--lr-bg-section)] border border-[var(--lr-border)] rounded-lg p-6">
          <h2 className="text-xl font-semibold text-[var(--lr-text-primary)] mb-4">알림 설정</h2>

          <div className="space-y-1">
            <Toggle
              enabled={budgetAlert}
              onChange={setBudgetAlert}
              label="예산 초과 알림"
            />
            <Toggle
              enabled={dailyReport}
              onChange={setDailyReport}
              label="일일 리포트"
            />
            <Toggle
              enabled={anomalyDetection}
              onChange={setAnomalyDetection}
              label="비정상 사용 감지"
            />
          </div>

          <p className="text-sm text-[var(--lr-text-muted)] mt-4">
            알림은 조직 관리자 이메일로 발송됩니다.
          </p>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2.5 bg-[var(--lr-primary)] text-white rounded-lg hover:bg-[var(--lr-primary-hover)] transition-colors font-medium"
          >
            <Check className="w-5 h-5" />
            변경사항 저장
          </button>
        </div>
      </div>
    </div>
  );
}
