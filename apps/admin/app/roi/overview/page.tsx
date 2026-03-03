import dynamic from 'next/dynamic';
import { SkeletonChart } from '@hchat/ui';
import { ProtectedRoute } from '@hchat/ui/admin';

const ROIOverview = dynamic(
  () => import('@hchat/ui').then(m => ({ default: m.ROIOverview })),
  { loading: () => <SkeletonChart /> }
);

export default function OverviewPage() {
  return (
    <ProtectedRoute>
      <ROIOverview />
    </ProtectedRoute>
  );
}
