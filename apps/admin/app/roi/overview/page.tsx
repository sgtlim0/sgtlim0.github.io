'use client';

import dynamic from 'next/dynamic';
import { SkeletonChart } from '@hchat/ui';
import { ProtectedRoute } from '@hchat/ui/admin/auth';

const ROIOverview = dynamic(
  () => import('@hchat/ui/roi/ROIOverview'),
  { ssr: false, loading: () => <SkeletonChart /> }
);

export default function OverviewPage() {
  return (
    <ProtectedRoute>
      <ROIOverview />
    </ProtectedRoute>
  );
}
