import dynamic from 'next/dynamic';
import { SkeletonChart } from '@hchat/ui';
import { ProtectedRoute } from '@hchat/ui/admin';

const ROIAdoption = dynamic(
  () => import('@hchat/ui').then(m => ({ default: m.ROIAdoption })),
  { loading: () => <SkeletonChart /> }
);

export default function AdoptionPage() {
  return (
    <ProtectedRoute>
      <ROIAdoption />
    </ProtectedRoute>
  );
}
