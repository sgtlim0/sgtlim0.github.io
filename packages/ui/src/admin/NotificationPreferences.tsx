'use client'

/**
 * NotificationPreferences
 *
 * Settings panel for managing notification channels, type filters,
 * and quiet hours configuration.
 */

import type {
  NotificationPreference,
  NotificationChannel,
  NotificationType,
} from './services/notificationTypes'

export interface NotificationPreferencesProps {
  preferences: NotificationPreference[]
  onUpdate: (channel: NotificationChannel, preference: Partial<NotificationPreference>) => void
}

const CHANNEL_LABELS: Record<NotificationChannel, { name: string; description: string }> = {
  push: { name: 'Push', description: '브라우저 푸시 알림' },
  email: { name: 'Email', description: '이메일 알림' },
  slack: { name: 'Slack', description: 'Slack 채널 알림' },
  teams: { name: 'Teams', description: 'Microsoft Teams 알림' },
}

const TYPE_LABELS: Record<NotificationType, { name: string; color: string }> = {
  info: { name: '정보', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' },
  warning: {
    name: '경고',
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
  },
  error: {
    name: '오류',
    color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
  },
  success: {
    name: '성공',
    color: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
  },
}

const ALL_TYPES: NotificationType[] = ['info', 'warning', 'error', 'success']

function ToggleSwitch({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={onToggle}
      className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors"
      style={{
        backgroundColor: enabled ? 'var(--admin-teal, #0d9488)' : 'var(--border, #d1d5db)',
      }}
    >
      <span
        className="inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform"
        style={{ transform: enabled ? 'translateX(18px)' : 'translateX(3px)' }}
      />
    </button>
  )
}

function ChannelSection({
  preference,
  onUpdate,
}: {
  preference: NotificationPreference
  onUpdate: (channel: NotificationChannel, update: Partial<NotificationPreference>) => void
}) {
  const label = CHANNEL_LABELS[preference.channel]

  function handleToggle() {
    onUpdate(preference.channel, { enabled: !preference.enabled })
  }

  function handleTypeToggle(type: NotificationType) {
    const current = preference.types
    const next = current.includes(type) ? current.filter((t) => t !== type) : [...current, type]
    onUpdate(preference.channel, { types: next })
  }

  function handleQuietHoursChange(field: 'quietHoursStart' | 'quietHoursEnd', value: string) {
    onUpdate(preference.channel, { [field]: value })
  }

  return (
    <div
      className="flex flex-col gap-3 p-4 rounded-lg border"
      style={{
        borderColor: 'var(--border)',
        opacity: preference.enabled ? 1 : 0.6,
      }}
    >
      {/* Channel toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            {label.name}
          </h4>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            {label.description}
          </p>
        </div>
        <ToggleSwitch enabled={preference.enabled} onToggle={handleToggle} />
      </div>

      {/* Type filter + Quiet hours */}
      {preference.enabled && (
        <>
          <div className="flex flex-wrap gap-2">
            {ALL_TYPES.map((type) => {
              const isActive = preference.types.includes(type)
              const typeConfig = TYPE_LABELS[type]

              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleTypeToggle(type)}
                  className={`text-xs font-medium px-2.5 py-1 rounded-full transition-opacity ${
                    isActive
                      ? typeConfig.color
                      : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'
                  }`}
                >
                  {typeConfig.name}
                </button>
              )
            })}
          </div>

          {/* Quiet hours */}
          <div className="flex items-center gap-2">
            <span className="text-xs shrink-0" style={{ color: 'var(--text-secondary)' }}>
              방해 금지:
            </span>
            <input
              type="time"
              value={preference.quietHoursStart ?? ''}
              onChange={(e) => handleQuietHoursChange('quietHoursStart', e.target.value)}
              className="text-xs px-2 py-1 rounded border bg-transparent"
              style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            />
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              ~
            </span>
            <input
              type="time"
              value={preference.quietHoursEnd ?? ''}
              onChange={(e) => handleQuietHoursChange('quietHoursEnd', e.target.value)}
              className="text-xs px-2 py-1 rounded border bg-transparent"
              style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            />
          </div>
        </>
      )}
    </div>
  )
}

export default function NotificationPreferences({
  preferences,
  onUpdate,
}: NotificationPreferencesProps) {
  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
    >
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: 'var(--border)' }}
      >
        <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          알림 설정
        </h3>
        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          {preferences.filter((p) => p.enabled).length}/{preferences.length} 활성
        </span>
      </div>

      <div className="p-4 flex flex-col gap-3">
        {preferences.map((pref) => (
          <ChannelSection key={pref.channel} preference={pref} onUpdate={onUpdate} />
        ))}
      </div>
    </div>
  )
}
