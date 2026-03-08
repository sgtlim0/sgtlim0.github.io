'use client'

import { useState, useEffect } from 'react'
import { usePushNotification } from './hooks/usePushNotification'
import { wasPreviouslyDenied } from './utils/pushNotification'

const DISMISSED_KEY = 'hchat-notification-banner-dismissed'

interface NotificationBannerProps {
  className?: string
}

function wasDismissed(): boolean {
  if (typeof localStorage === 'undefined') return false
  return localStorage.getItem(DISMISSED_KEY) === 'true'
}

function setDismissed(): void {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(DISMISSED_KEY, 'true')
}

export default function NotificationBanner({ className = '' }: NotificationBannerProps) {
  const { permission, isSupported, requestPermission } = usePushNotification()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!isSupported) return
    if (permission !== 'default') return
    if (wasDismissed() || wasPreviouslyDenied()) return

    setVisible(true)
  }, [isSupported, permission])

  const handleAllow = async () => {
    const result = await requestPermission()
    if (result === 'denied') {
      setDismissed()
    }
    setVisible(false)
  }

  const handleDismiss = () => {
    setDismissed()
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      className={`fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md rounded-lg border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800 ${className}`}
      role="alert"
      aria-live="polite"
    >
      <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
        H Chat 알림을 허용하면 새 메시지와 업데이트를 실시간으로 받을 수 있습니다.
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleAllow}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          알림 허용
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
        >
          나중에
        </button>
      </div>
    </div>
  )
}
