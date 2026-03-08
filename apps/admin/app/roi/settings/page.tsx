'use client';

import dynamic from 'next/dynamic';
import { SkeletonCard } from '@hchat/ui';
import { ProtectedRoute } from '@hchat/ui/admin/auth';

const ROISettings = dynamic(
  () => import('@hchat/ui/roi/ROISettings'),
  { ssr: false, loading: () => <SkeletonCard /> }
);

export default function SettingsPage() {
  return (
    <ProtectedRoute minRole="admin">
      <ROISettings />
    </ProtectedRoute>
  );
}
