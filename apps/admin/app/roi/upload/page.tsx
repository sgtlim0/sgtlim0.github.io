import dynamic from 'next/dynamic';
import { SkeletonCard } from '@hchat/ui';
import { ProtectedRoute } from '@hchat/ui/admin';

const ROIDataUpload = dynamic(
  () => import('@hchat/ui').then(m => ({ default: m.ROIDataUpload })),
  { loading: () => <SkeletonCard /> }
);

export default function UploadPage() {
  return (
    <ProtectedRoute minRole="admin">
      <ROIDataUpload />
    </ProtectedRoute>
  );
}
