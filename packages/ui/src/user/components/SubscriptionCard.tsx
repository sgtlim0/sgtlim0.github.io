'use client';

import { Mail } from 'lucide-react';
import type { Subscription } from '../services/types';

export interface SubscriptionCardProps {
  subscription: Subscription;
}

export default function SubscriptionCard({ subscription }: SubscriptionCardProps) {
  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white p-6">
      {/* Email row */}
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EBF0FF]">
          <Mail className="h-4 w-4 text-[#4F6EF7]" />
        </div>
        <span className="text-sm font-medium text-[#1E293B]">
          {subscription.email}
        </span>
      </div>

      {/* Plan info */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="inline-block rounded-full bg-[#EBF0FF] px-2.5 py-0.5 text-xs font-semibold text-[#4F6EF7]">
            {subscription.planName}
          </span>
          <span className="text-sm text-[#64748B]">
            {subscription.planType}
          </span>
        </div>

        <p className="text-xs text-[#94A3B8]">
          다음 갱신일: {subscription.renewalDate}
        </p>
      </div>

      {/* CTA */}
      <button
        type="button"
        className="mt-5 rounded-lg border border-[#4F6EF7] px-4 py-2 text-sm font-medium text-[#4F6EF7] transition-colors hover:bg-[#EBF0FF]"
      >
        요금제 변경
      </button>
    </div>
  );
}
