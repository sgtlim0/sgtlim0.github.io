'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  isSupported as checkSupported,
  getPermissionStatus,
  requestPermission as requestPerm,
  showNotification,
} from '../utils/pushNotification'

interface UsePushNotificationReturn {
  permission: NotificationPermission
  isSupported: boolean
  requestPermission: () => Promise<NotificationPermission>
  sendNotification: (
    title: string,
    body?: string,
    options?: NotificationOptions,
  ) => Promise<void>
}

export function usePushNotification(): UsePushNotificationReturn {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const supported = checkSupported()

  useEffect(() => {
    if (!supported) return
    setPermission(getPermissionStatus())
  }, [supported])

  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!supported) return 'denied'

    const result = await requestPerm()
    setPermission(result)
    return result
  }, [supported])

  const sendNotification = useCallback(
    async (title: string, body?: string, options?: NotificationOptions): Promise<void> => {
      if (!supported) return

      await showNotification(title, {
        body,
        ...options,
      })
    },
    [supported],
  )

  return {
    permission,
    isSupported: supported,
    requestPermission,
    sendNotification,
  }
}
