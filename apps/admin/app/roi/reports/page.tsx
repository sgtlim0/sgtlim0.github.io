import dynamic from 'next/dynamic';
import { SkeletonCard } from '@hchat/ui';
import { ProtectedRoute } from '@hchat/ui/admin';

const ROIReports = dynamic(
  () => import('@hchat/ui').then(m => ({ default: m.ROIReports })),
  { loading: () => <SkeletonCard /> }
);

export default function ReportsPage() {
  return (
    <ProtectedRoute>
      <ROIReports />
    </ProtectedRoute>
  );
}
