'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { SkeletonPulse, Breadcrumb } from '@hchat/ui';
import type { BreadcrumbItem } from '@hchat/ui';

const ROISidebar = dynamic(
  () => import('@hchat/ui/roi/ROISidebar'),
  { ssr: false, loading: () => <div className="w-56 min-h-screen"><SkeletonPulse className="h-full" /></div> }
);

const ROIDataProvider = dynamic(
  () => import('@hchat/ui/roi/ROIDataContext').then(m => ({ default: m.ROIDataProvider })),
  { ssr: false }
);

const PAGE_LABELS: Record<string, string> = {
  overview: '개요',
  adoption: '도입 현황',
  productivity: '생산성',
  analysis: '분석',
  organization: '조직별',
  sentiment: '만족도',
  reports: '리포트',
  settings: '설정',
  upload: '데이터 업로드',
};

function useROIBreadcrumbs(): BreadcrumbItem[] {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);
  const items: BreadcrumbItem[] = [
    { label: 'Admin', href: '/' },
    { label: 'ROI 대시보드', href: '/roi/overview' },
  ];

  const lastSegment = segments[segments.length - 1];
  if (lastSegment && lastSegment !== 'roi') {
    const label = PAGE_LABELS[lastSegment] ?? lastSegment;
    items.push({ label });
  }

  return items;
}

export default function ROILayout({ children }: { children: React.ReactNode }) {
  const breadcrumbs = useROIBreadcrumbs();

  return (
    <ROIDataProvider>
      <div className="flex">
        <ROISidebar />
        <div className="flex-1 min-h-[calc(100vh-80px)] bg-[var(--roi-body-bg)] p-4 md:p-6 lg:p-8 overflow-auto">
          <Breadcrumb items={breadcrumbs} separator=">" className="mb-4" />
          {children}
        </div>
      </div>
    </ROIDataProvider>
  );
}
