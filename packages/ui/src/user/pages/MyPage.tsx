import SubscriptionCard from '../components/SubscriptionCard'
import UsageTable from '../components/UsageTable'
import { mockSubscription, mockModelUsage } from '../services/mockData'
import Avatar from '../../Avatar'
import { Tabs, TabPanel } from '../../Tabs'
import type { TabConfig } from '../../hooks/useTabs'

const MY_PAGE_TABS: TabConfig[] = [
  { id: 'subscription', label: '구독 정보' },
  { id: 'usage', label: '사용 현황' },
]

export default function MyPage() {
  return (
    <div className="mx-auto max-w-[800px] px-4 py-8">
      {/* Account info */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <Avatar name={mockSubscription.email.split('@')[0]} size="lg" status="online" />
          <div>
            <p className="text-lg font-bold text-user-text-primary">내 계정</p>
            <p className="text-sm text-user-text-secondary break-all">{mockSubscription.email}</p>
          </div>
        </div>
      </div>

      <Tabs tabs={MY_PAGE_TABS} variant="underline">
        <TabPanel id="subscription">
          <div className="pt-6">
            <SubscriptionCard subscription={mockSubscription} />
          </div>
        </TabPanel>

        <TabPanel id="usage">
          <div className="pt-6 overflow-x-auto">
            <UsageTable usage={mockModelUsage} />
          </div>
        </TabPanel>
      </Tabs>
    </div>
  )
}
