import { Mail } from 'lucide-react'
import type { Subscription } from '../services/types'

export interface SubscriptionCardProps {
  subscription: Subscription
}

export default function SubscriptionCard({ subscription }: SubscriptionCardProps) {
  return (
    <div className="rounded-xl border border-user-border bg-user-bg p-6">
      {/* Email row */}
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-user-primary-light">
          <Mail className="h-4 w-4 text-user-primary" />
        </div>
        <span className="text-sm font-medium text-user-text-primary">{subscription.email}</span>
      </div>

      {/* Plan info */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="inline-block rounded-full bg-user-primary-light px-2.5 py-0.5 text-xs font-semibold text-user-primary">
            {subscription.planName}
          </span>
          <span className="text-sm text-user-text-secondary">{subscription.planType}</span>
        </div>

        <p className="text-xs text-user-text-muted">다음 갱신일: {subscription.renewalDate}</p>
      </div>

      {/* CTA */}
      <button
        type="button"
        className="mt-5 rounded-lg border border-user-primary px-4 py-2 text-sm font-medium text-user-primary transition-colors hover:bg-user-primary-light"
      >
        요금제 변경
      </button>
    </div>
  )
}
