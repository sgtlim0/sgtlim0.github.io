import dynamic from 'next/dynamic';
import { SkeletonChart } from '@hchat/ui';
import { ProtectedRoute } from '@hchat/ui/admin';

const ROIAnalysis = dynamic(
  () => import('@hchat/ui').then(m => ({ default: m.ROIAnalysis })),
  { loading: () => <SkeletonChart /> }
);

export default function AnalysisPage() {
  return (
    <ProtectedRoute>
      <ROIAnalysis />
    </ProtectedRoute>
  );
}
