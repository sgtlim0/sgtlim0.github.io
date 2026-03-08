import { User } from 'lucide-react'
import SubscriptionCard from '../components/SubscriptionCard'
import UsageTable from '../components/UsageTable'
import { mockSubscription, mockModelUsage } from '../services/mockData'

export default function MyPage() {
  return (
    <div className="mx-auto max-w-[800px] px-4 py-8">
      {/* Account info */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-user-primary-light">
            <User className="h-5 w-5 text-user-primary" />
          </div>
          <div>
            <p className="text-lg font-bold text-user-text-primary">내 계정</p>
            <p className="text-sm text-user-text-secondary break-all">{mockSubscription.email}</p>
          </div>
        </div>
      </div>

      {/* Subscription */}
      <div className="mb-8">
        <h2 className="mb-4 text-base font-semibold text-user-text-primary">구독 정보</h2>
        <SubscriptionCard subscription={mockSubscription} />
      </div>

      {/* Usage section */}
      <div>
        <h2 className="mb-4 text-base font-semibold text-user-text-primary">
          이달의 내 상세 사용 현황
        </h2>
        <div className="overflow-x-auto">
          <UsageTable usage={mockModelUsage} />
        </div>
      </div>
    </div>
  )
}
