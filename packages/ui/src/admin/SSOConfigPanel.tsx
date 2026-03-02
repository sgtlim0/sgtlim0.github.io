'use client';

import { useState } from 'react';
import { Shield, Key, Globe, Copy, Check, Link2 } from 'lucide-react';

interface SSOConfig {
  enabled: boolean;
  companyCode: string;
  apiEndpoint: 'production' | 'public';
  encryptionKey: string;
}

const INITIAL_CONFIG: SSOConfig = {
  enabled: true,
  companyCode: 'hyundai',
  apiEndpoint: 'production',
  encryptionKey: 'aB3dEf7hIjKlMnOpQrStUvWx',
};

export default function SSOConfigPanel() {
  const [config, setConfig] = useState<SSOConfig>(INITIAL_CONFIG);
  const [showKey, setShowKey] = useState(false);
  const [testEmployeeId, setTestEmployeeId] = useState('');
  const [testEmployeeName, setTestEmployeeName] = useState('');
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const handleToggle = (enabled: boolean) => {
    setConfig((prev) => ({ ...prev, enabled }));
  };

  const handleGenerateTestUrl = () => {
    if (!testEmployeeId || !testEmployeeName) {
      alert('사번과 이름을 입력해주세요.');
      return;
    }

    const mockEncrypted = btoa(`${testEmployeeId}:${testEmployeeName}`);
    const url = `https://wrks.ai/ko/signin/company/${config.companyCode}?code=${mockEncrypted}`;
    setGeneratedUrl(url);
  };

  const handleCopyUrl = async () => {
    if (!generatedUrl) return;
    try {
      await navigator.clipboard.writeText(generatedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      alert('URL 복사에 실패했습니다.');
    }
  };

  const handleSave = () => {
    alert('SSO 설정이 저장되었습니다.');
  };

  return (
    <div className="flex flex-col gap-8 p-8 max-w-4xl">
      <div className="flex items-center gap-3">
        <Shield className="w-7 h-7 text-admin-teal" />
        <h1 className="text-2xl font-bold text-text-primary">SSO 설정</h1>
      </div>

      {/* SSO 활성화 */}
      <section className="flex flex-col gap-6 bg-hmg-bg-card rounded-2xl border border-hmg-border p-6">
        <h2 className="text-lg font-semibold text-text-primary">SSO 활성화</h2>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-text-secondary" />
            <span className="text-sm text-text-primary">SSO 인증 활성화</span>
          </div>
          <button
            onClick={() => handleToggle(!config.enabled)}
            className={`w-14 h-7 rounded-full transition-colors ${
              config.enabled ? 'bg-admin-teal' : 'bg-border'
            }`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                config.enabled ? 'translate-x-8' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </section>

      {/* 회사 코드 설정 */}
      <section className="flex flex-col gap-6 bg-hmg-bg-card rounded-2xl border border-hmg-border p-6">
        <h2 className="text-lg font-semibold text-text-primary">회사 코드 설정</h2>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <Key className="w-5 h-5 text-text-secondary" />
            <label htmlFor="companyCode" className="text-sm font-medium text-text-primary">
              회사 코드
            </label>
          </div>
          <input
            id="companyCode"
            type="text"
            value={config.companyCode}
            onChange={(e) => setConfig((prev) => ({ ...prev, companyCode: e.target.value }))}
            className="w-full px-4 py-3 text-sm rounded-lg border border-admin-input-border bg-admin-input-bg text-text-primary outline-none focus:border-admin-teal"
          />
          <p className="text-xs text-text-tertiary">SSO 인증 URL에 사용되는 회사 고유 코드</p>
        </div>
      </section>

      {/* API 엔드포인트 선택 */}
      <section className="flex flex-col gap-6 bg-hmg-bg-card rounded-2xl border border-hmg-border p-6">
        <h2 className="text-lg font-semibold text-text-primary">API 엔드포인트</h2>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <input
              type="radio"
              id="production"
              name="apiEndpoint"
              checked={config.apiEndpoint === 'production'}
              onChange={() => setConfig((prev) => ({ ...prev, apiEndpoint: 'production' }))}
              className="w-4 h-4 accent-admin-teal"
            />
            <label htmlFor="production" className="flex items-center gap-2 text-sm text-text-primary cursor-pointer">
              <Globe className="w-4 h-4 text-text-secondary" />
              상용 (gateway-api.wrks.ai)
            </label>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="radio"
              id="public"
              name="apiEndpoint"
              checked={config.apiEndpoint === 'public'}
              onChange={() => setConfig((prev) => ({ ...prev, apiEndpoint: 'public' }))}
              className="w-4 h-4 accent-admin-teal"
            />
            <label htmlFor="public" className="flex items-center gap-2 text-sm text-text-primary cursor-pointer">
              <Globe className="w-4 h-4 text-text-secondary" />
              공공 (gov-api.wrks.ai)
            </label>
          </div>
        </div>
      </section>

      {/* 암호화 키 */}
      <section className="flex flex-col gap-6 bg-hmg-bg-card rounded-2xl border border-hmg-border p-6">
        <h2 className="text-lg font-semibold text-text-primary">암호화 키</h2>
        <div className="flex items-center gap-4">
          <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-lg border border-admin-input-border bg-admin-input-bg">
            <Key className="w-5 h-5 text-text-secondary" />
            <span className="text-sm font-mono text-text-primary">
              {showKey ? config.encryptionKey : '••••••••••••••••••••'}
            </span>
          </div>
          <button
            onClick={() => setShowKey(!showKey)}
            className="px-6 py-3 text-sm font-medium text-text-primary border border-border rounded-lg hover:bg-bg-hover transition-colors"
          >
            {showKey ? '숨기기' : '변경'}
          </button>
        </div>
      </section>

      {/* SSO 테스트 */}
      <section className="flex flex-col gap-6 bg-hmg-bg-card rounded-2xl border border-hmg-border p-6">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <div className="flex items-center gap-2">
            <Link2 className="w-5 h-5 text-text-secondary" />
            <h2 className="text-lg font-semibold text-text-primary">SSO 테스트</h2>
          </div>
          <div className="flex-1 h-px bg-border" />
        </div>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="testEmployeeId" className="text-sm font-medium text-text-primary">
                사번
              </label>
              <input
                id="testEmployeeId"
                type="text"
                value={testEmployeeId}
                onChange={(e) => setTestEmployeeId(e.target.value)}
                placeholder="예: 123456"
                className="px-4 py-3 text-sm rounded-lg border border-admin-input-border bg-admin-input-bg text-text-primary outline-none focus:border-admin-teal"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="testEmployeeName" className="text-sm font-medium text-text-primary">
                이름
              </label>
              <input
                id="testEmployeeName"
                type="text"
                value={testEmployeeName}
                onChange={(e) => setTestEmployeeName(e.target.value)}
                placeholder="예: 홍길동"
                className="px-4 py-3 text-sm rounded-lg border border-admin-input-border bg-admin-input-bg text-text-primary outline-none focus:border-admin-teal"
              />
            </div>
          </div>

          <button
            onClick={handleGenerateTestUrl}
            className="w-full px-6 py-3 text-sm font-semibold text-white bg-admin-teal rounded-lg hover:opacity-90 transition-opacity"
          >
            테스트 URL 생성
          </button>

          {generatedUrl && (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-hmg-bg-section border border-hmg-border">
              <code className="flex-1 text-xs text-text-secondary break-all font-mono">{generatedUrl}</code>
              <button
                onClick={handleCopyUrl}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-text-primary border border-border rounded-lg hover:bg-bg-hover transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-success" />
                    복사됨
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    복사
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 저장 버튼 */}
      <button
        onClick={handleSave}
        className="w-full px-8 py-4 text-base font-semibold text-white bg-admin-teal rounded-lg hover:opacity-90 transition-opacity"
      >
        저장
      </button>
    </div>
  );
}
