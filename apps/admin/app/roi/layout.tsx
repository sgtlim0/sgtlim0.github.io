'use client';

import dynamic from 'next/dynamic';
import { SkeletonPulse } from '@hchat/ui';

const ROISidebar = dynamic(
  () => import('@hchat/ui/roi/ROISidebar'),
  { ssr: false, loading: () => <div className="w-56 min-h-screen"><SkeletonPulse className="h-full" /></div> }
);

const ROIDataProvider = dynamic(
  () => import('@hchat/ui/roi/ROIDataContext').then(m => ({ default: m.ROIDataProvider })),
  { ssr: false }
);

export default function ROILayout({ children }: { children: React.ReactNode }) {
  return (
    <ROIDataProvider>
      <div className="flex">
        <ROISidebar />
        <div className="flex-1 min-h-[calc(100vh-80px)] bg-[var(--roi-body-bg)] p-4 md:p-6 lg:p-8 overflow-auto">
          {children}
        </div>
      </div>
    </ROIDataProvider>
  );
}
