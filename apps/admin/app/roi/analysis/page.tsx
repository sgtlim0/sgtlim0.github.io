'use client';

import dynamic from 'next/dynamic';
import { SkeletonChart } from '@hchat/ui';
import { ProtectedRoute } from '@hchat/ui/admin/auth';

const ROIAnalysis = dynamic(
  () => import('@hchat/ui/roi/ROIAnalysis'),
  { ssr: false, loading: () => <SkeletonChart /> }
);

export default function AnalysisPage() {
  return (
    <ProtectedRoute>
      <ROIAnalysis />
    </ProtectedRoute>
  );
}
