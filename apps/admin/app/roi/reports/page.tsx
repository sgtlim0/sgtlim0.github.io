'use client';

import dynamic from 'next/dynamic';
import { SkeletonCard } from '@hchat/ui';
import { ProtectedRoute } from '@hchat/ui/admin';

const ROIReports = dynamic(
  () => import('@hchat/ui/roi/ROIReports'),
  { ssr: false, loading: () => <SkeletonCard /> }
);

export default function ReportsPage() {
  return (
    <ProtectedRoute>
      <ROIReports />
    </ProtectedRoute>
  );
}
