import dynamic from 'next/dynamic';
import { SkeletonChart } from '@hchat/ui';
import { ProtectedRoute } from '@hchat/ui/admin';

const ROIOrganization = dynamic(
  () => import('@hchat/ui').then(m => ({ default: m.ROIOrganization })),
  { loading: () => <SkeletonChart /> }
);

export default function OrganizationPage() {
  return (
    <ProtectedRoute>
      <ROIOrganization />
    </ProtectedRoute>
  );
}
