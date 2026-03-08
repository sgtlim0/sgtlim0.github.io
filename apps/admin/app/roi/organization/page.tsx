'use client';

import dynamic from 'next/dynamic';
import { SkeletonChart } from '@hchat/ui';
import { ProtectedRoute } from '@hchat/ui/admin';

const ROIOrganization = dynamic(
  () => import('@hchat/ui/roi/ROIOrganization'),
  { ssr: false, loading: () => <SkeletonChart /> }
);

export default function OrganizationPage() {
  return (
    <ProtectedRoute>
      <ROIOrganization />
    </ProtectedRoute>
  );
}
