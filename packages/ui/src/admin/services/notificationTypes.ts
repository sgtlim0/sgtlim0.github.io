/**
 * Notification System Types
 *
 * Type definitions for the push notification service
 * used by the Admin dashboard for real-time alerts and updates.
 */

export type NotificationType = 'info' | 'warning' | 'error' | 'success'
export type NotificationChannel = 'push' | 'email' | 'slack' | 'teams'
export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical'

export interface Notification {
  id: string
  type: NotificationType
  priority: NotificationPriority
  title: string
  message: string
  source: string
  timestamp: number
  read: boolean
  actionUrl?: string
  channels: NotificationChannel[]
  metadata?: Record<string, string | number>
}

export interface NotificationPreference {
  channel: NotificationChannel
  enabled: boolean
  types: NotificationType[]
  quietHoursStart?: string
  quietHoursEnd?: string
}

export interface NotificationFilter {
  types?: NotificationType[]
  priorities?: NotificationPriority[]
  read?: boolean
  source?: string
  from?: number
  to?: number
}

export interface NotificationStats {
  total: number
  unread: number
  byType: Record<NotificationType, number>
  byPriority: Record<NotificationPriority, number>
}

export interface NotificationSubscription {
  unsubscribe: () => void
}
