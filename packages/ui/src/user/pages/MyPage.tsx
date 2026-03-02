'use client';

import { User } from 'lucide-react';
import SubscriptionCard from '../components/SubscriptionCard';
import UsageTable from '../components/UsageTable';
import { mockSubscription, mockModelUsage } from '../services/mockData';

export default function MyPage() {
  return (
    <div className="mx-auto max-w-[800px] px-4 py-8">
      {/* Account info */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#EBF0FF]">
            <User className="h-5 w-5 text-[#4F6EF7]" />
          </div>
          <div>
            <p className="text-lg font-bold text-[#1E293B]">내 계정</p>
            <p className="text-sm text-[#64748B]">{mockSubscription.email}</p>
          </div>
        </div>
      </div>

      {/* Subscription */}
      <div className="mb-8">
        <h2 className="mb-4 text-base font-semibold text-[#1E293B]">구독 정보</h2>
        <SubscriptionCard subscription={mockSubscription} />
      </div>

      {/* Usage section */}
      <div>
        <h2 className="mb-4 text-base font-semibold text-[#1E293B]">
          이달의 내 상세 사용 현황
        </h2>
        <UsageTable usage={mockModelUsage} />
      </div>
    </div>
  );
}
