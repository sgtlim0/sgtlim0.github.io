'use client';

import dynamic from 'next/dynamic';
import { SkeletonChart } from '@hchat/ui';
import { ProtectedRoute } from '@hchat/ui/admin';

const ROIProductivity = dynamic(
  () => import('@hchat/ui/roi/ROIProductivity'),
  { ssr: false, loading: () => <SkeletonChart /> }
);

export default function ProductivityPage() {
  return (
    <ProtectedRoute>
      <ROIProductivity />
    </ProtectedRoute>
  );
}
