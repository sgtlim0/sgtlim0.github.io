// Push Notification utility — local notifications only (no server-side push subscription)
// SSR-safe: all browser API access guarded by typeof checks

const PERMISSION_DENIED_KEY = 'hchat-notification-denied'

export function isSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window
}

export function getPermissionStatus(): NotificationPermission {
  if (!isSupported()) return 'denied'
  return Notification.permission
}

export async function requestPermission(): Promise<NotificationPermission> {
  if (!isSupported()) return 'denied'

  try {
    const result = await Notification.requestPermission()

    if (result === 'denied' && typeof localStorage !== 'undefined') {
      localStorage.setItem(PERMISSION_DENIED_KEY, 'true')
    }

    return result
  } catch (error) {
    throw new Error(
      `Failed to request notification permission: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}

export async function showNotification(
  title: string,
  options?: NotificationOptions,
): Promise<void> {
  if (!isSupported()) return

  if (Notification.permission !== 'granted') return

  try {
    new Notification(title, options)
  } catch (error) {
    // Fallback: try via service worker registration if available
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready
        await registration.showNotification(title, options)
      } catch {
        throw new Error(
          `Failed to show notification: ${error instanceof Error ? error.message : String(error)}`,
        )
      }
    }
  }
}

export function wasPreviouslyDenied(): boolean {
  if (typeof localStorage === 'undefined') return false
  return localStorage.getItem(PERMISSION_DENIED_KEY) === 'true'
}

export function clearDeniedFlag(): void {
  if (typeof localStorage === 'undefined') return
  localStorage.removeItem(PERMISSION_DENIED_KEY)
}
