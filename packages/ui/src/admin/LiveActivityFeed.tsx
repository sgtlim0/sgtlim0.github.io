import type { RealtimeActivity } from './services/realtimeTypes'

export interface LiveActivityFeedProps {
  activities: RealtimeActivity[]
}

const TYPE_CONFIG: Record<RealtimeActivity['type'], { icon: string; bg: string; text: string }> = {
  query: {
    icon: 'Q',
    bg: 'bg-blue-100 dark:bg-blue-900/40',
    text: 'text-blue-600 dark:text-blue-400',
  },
  login: {
    icon: 'L',
    bg: 'bg-green-100 dark:bg-green-900/40',
    text: 'text-green-600 dark:text-green-400',
  },
  error: { icon: '!', bg: 'bg-red-100 dark:bg-red-900/40', text: 'text-red-600 dark:text-red-400' },
  model_switch: {
    icon: 'M',
    bg: 'bg-purple-100 dark:bg-purple-900/40',
    text: 'text-purple-600 dark:text-purple-400',
  },
  upload: {
    icon: 'U',
    bg: 'bg-orange-100 dark:bg-orange-900/40',
    text: 'text-orange-600 dark:text-orange-400',
  },
}

function formatRelativeTime(timestamp: number): string {
  const diff = Math.floor((Date.now() - timestamp) / 1000)
  if (diff < 5) return 'just now'
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  return `${Math.floor(diff / 3600)}h ago`
}

function ActivityItem({ activity, isNew }: { activity: RealtimeActivity; isNew: boolean }) {
  const config = TYPE_CONFIG[activity.type]

  return (
    <div
      className="flex items-start gap-3 px-4 py-3 transition-all duration-300"
      style={{
        opacity: isNew ? 1 : 1,
        transform: isNew ? 'translateY(0)' : 'translateY(0)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div
        className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${config.bg} ${config.text}`}
      >
        {config.icon}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
            {activity.user}
          </span>
          <span
            className="text-xs shrink-0 tabular-nums"
            style={{ color: 'var(--text-secondary)' }}
          >
            {formatRelativeTime(activity.timestamp)}
          </span>
        </div>
        <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-secondary)' }}>
          {activity.message}
        </p>
      </div>
    </div>
  )
}

export function LiveActivityFeed({ activities }: LiveActivityFeedProps) {
  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
        <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          Live Activity
        </h3>
      </div>

      <div className="overflow-y-auto" style={{ maxHeight: 380 }}>
        {activities.length === 0 && (
          <div className="px-4 py-8 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
            No recent activity
          </div>
        )}
        {activities.map((activity) => (
          <ActivityItem key={activity.id} activity={activity} isNew={false} />
        ))}
      </div>
    </div>
  )
}

export default LiveActivityFeed
