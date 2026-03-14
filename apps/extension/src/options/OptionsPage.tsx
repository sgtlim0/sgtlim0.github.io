import React, { useState, useEffect } from 'react'
import { ThemeProvider } from '@hchat/ui'
import { Switch } from '@hchat/ui'
import type { ExtensionSettings } from '../types/settings'
import { DEFAULT_SETTINGS } from '../types/settings'
import { getSettings, setSettings } from '../utils/storage'

export function OptionsPage() {
  const [settings, setLocalSettings] = useState<ExtensionSettings>(DEFAULT_SETTINGS)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  useEffect(() => {
    const loadSettings = async () => {
      const loaded = await getSettings()
      setLocalSettings(loaded)
    }
    loadSettings()
  }, [])

  const handleChange = <K extends keyof ExtensionSettings>(key: K, value: ExtensionSettings[K]) => {
    setLocalSettings((prev) => ({
      ...prev,
      [key]: value,
    }))
    setSaveMessage(null)
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSaveMessage(null)
    try {
      await setSettings(settings)
      setSaveMessage('설정이 저장되었습니다.')
      setTimeout(() => setSaveMessage(null), 3000)
    } catch (error) {
      setSaveMessage('저장 중 오류가 발생했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = async () => {
    setLocalSettings(DEFAULT_SETTINGS)
    setSaveMessage(null)
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-ext-bg text-ext-text">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-ext-text mb-2">H Chat 설정</h1>
            <p className="text-ext-text-secondary">Chrome Extension의 동작 방식을 설정합니다.</p>
          </header>

          <div className="space-y-6">
            {/* Theme Section */}
            <section className="bg-ext-surface rounded-lg p-6 border border-ext-surface">
              <h2 className="text-lg font-semibold text-ext-text mb-4">테마</h2>
              <div className="space-y-3">
                <RadioOption
                  name="theme"
                  value="light"
                  label="라이트 모드"
                  description="밝은 테마를 사용합니다"
                  checked={settings.theme === 'light'}
                  onChange={(value) => handleChange('theme', value as ExtensionSettings['theme'])}
                />
                <RadioOption
                  name="theme"
                  value="dark"
                  label="다크 모드"
                  description="어두운 테마를 사용합니다"
                  checked={settings.theme === 'dark'}
                  onChange={(value) => handleChange('theme', value as ExtensionSettings['theme'])}
                />
                <RadioOption
                  name="theme"
                  value="system"
                  label="시스템 설정"
                  description="시스템 테마를 따릅니다"
                  checked={settings.theme === 'system'}
                  onChange={(value) => handleChange('theme', value as ExtensionSettings['theme'])}
                />
              </div>
            </section>

            {/* Language Section */}
            <section className="bg-ext-surface rounded-lg p-6 border border-ext-surface">
              <h2 className="text-lg font-semibold text-ext-text mb-4">언어</h2>
              <div className="space-y-3">
                <RadioOption
                  name="language"
                  value="ko"
                  label="한국어"
                  description="인터페이스를 한국어로 표시합니다"
                  checked={settings.language === 'ko'}
                  onChange={(value) =>
                    handleChange('language', value as ExtensionSettings['language'])
                  }
                />
                <RadioOption
                  name="language"
                  value="en"
                  label="English"
                  description="Display interface in English"
                  checked={settings.language === 'en'}
                  onChange={(value) =>
                    handleChange('language', value as ExtensionSettings['language'])
                  }
                />
              </div>
            </section>

            {/* API Settings Section */}
            <section className="bg-ext-surface rounded-lg p-6 border border-ext-surface">
              <h2 className="text-lg font-semibold text-ext-text mb-4">API 설정</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-ext-text mb-1">API 모드</label>
                    <p className="text-sm text-ext-text-secondary">
                      {settings.apiMode === 'mock' ? 'Mock 데이터 사용 (개발용)' : '실제 API 사용'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-ext-text-secondary">Mock</span>
                    <Switch
                      initialChecked={settings.apiMode === 'real'}
                      onChange={(checked) => handleChange('apiMode', checked ? 'real' : 'mock')}
                      size="md"
                      color="primary"
                      aria-label="API 모드 전환"
                    />
                    <span className="text-sm text-ext-text-secondary">Real</span>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="apiBaseUrl"
                    className="block text-sm font-medium text-ext-text mb-2"
                  >
                    API Base URL
                  </label>
                  <input
                    id="apiBaseUrl"
                    type="url"
                    value={settings.apiBaseUrl}
                    onChange={(e) => handleChange('apiBaseUrl', e.target.value)}
                    className="w-full px-3 py-2 bg-ext-bg border border-ext-surface rounded-md text-ext-text focus:outline-none focus:ring-2 focus:ring-ext-primary"
                    placeholder="https://api.example.com"
                  />
                  <p className="text-xs text-ext-text-secondary mt-1">
                    API 엔드포인트의 기본 URL을 설정합니다.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="maxTextLength"
                    className="block text-sm font-medium text-ext-text mb-2"
                  >
                    최대 텍스트 길이
                  </label>
                  <input
                    id="maxTextLength"
                    type="number"
                    min="100"
                    max="50000"
                    value={settings.maxTextLength}
                    onChange={(e) => handleChange('maxTextLength', parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 bg-ext-bg border border-ext-surface rounded-md text-ext-text focus:outline-none focus:ring-2 focus:ring-ext-primary"
                  />
                  <p className="text-xs text-ext-text-secondary mt-1">
                    추출할 수 있는 최대 텍스트 길이를 설정합니다. (100-50000자)
                  </p>
                </div>
              </div>
            </section>

            {/* Feature Toggles Section */}
            <section className="bg-ext-surface rounded-lg p-6 border border-ext-surface">
              <h2 className="text-lg font-semibold text-ext-text mb-4">기능 설정</h2>
              <div className="space-y-4">
                <ToggleOption
                  label="자동 새니타이즈"
                  description="추출된 텍스트에서 개인정보를 자동으로 제거합니다"
                  checked={settings.autoSanitize}
                  onChange={(checked) => handleChange('autoSanitize', checked)}
                />
                <ToggleOption
                  label="사이드 패널 활성화"
                  description="전체 채팅 히스토리를 볼 수 있는 사이드 패널을 사용합니다"
                  checked={settings.enableSidePanel}
                  onChange={(checked) => handleChange('enableSidePanel', checked)}
                />
                <ToggleOption
                  label="키보드 단축키"
                  description="키보드 단축키로 빠르게 기능을 실행합니다"
                  checked={settings.enableShortcuts}
                  onChange={(checked) => handleChange('enableShortcuts', checked)}
                />
              </div>
            </section>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex items-center justify-between">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 text-sm font-medium text-ext-text-secondary hover:text-ext-text border border-ext-surface rounded-md hover:bg-ext-surface transition-colors"
            >
              기본값으로 재설정
            </button>
            <div className="flex items-center gap-4">
              {saveMessage && (
                <span
                  className={`text-sm ${saveMessage.includes('오류') ? 'text-red-500' : 'text-green-600 dark:text-green-400'}`}
                >
                  {saveMessage}
                </span>
              )}
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2 text-sm font-medium text-white bg-ext-primary rounded-md hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {isSaving ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  )
}

interface RadioOptionProps {
  name: string
  value: string
  label: string
  description: string
  checked: boolean
  onChange: (value: string) => void
}

function RadioOption({ name, value, label, description, checked, onChange }: RadioOptionProps) {
  return (
    <label className="flex items-start gap-3 p-3 rounded-md hover:bg-ext-bg/50 cursor-pointer transition-colors">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-4 h-4 text-ext-primary focus:ring-2 focus:ring-ext-primary"
      />
      <div className="flex-1">
        <div className="text-sm font-medium text-ext-text">{label}</div>
        <div className="text-xs text-ext-text-secondary mt-0.5">{description}</div>
      </div>
    </label>
  )
}

interface ToggleOptionProps {
  label: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void
}

function ToggleOption({ label, description, checked, onChange }: ToggleOptionProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1">
        <div className="text-sm font-medium text-ext-text mb-1">{label}</div>
        <div className="text-xs text-ext-text-secondary">{description}</div>
      </div>
      <Switch
        initialChecked={checked}
        onChange={onChange}
        size="md"
        color="primary"
        aria-label={label}
      />
    </div>
  )
}
