import dynamic from 'next/dynamic';
import { SkeletonChart } from '@hchat/ui';
import { ProtectedRoute } from '@hchat/ui/admin';

const ROIProductivity = dynamic(
  () => import('@hchat/ui').then(m => ({ default: m.ROIProductivity })),
  { loading: () => <SkeletonChart /> }
);

export default function ProductivityPage() {
  return (
    <ProtectedRoute>
      <ROIProductivity />
    </ProtectedRoute>
  );
}
