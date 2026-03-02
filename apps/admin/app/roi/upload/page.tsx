import { ROIDataUpload } from '@hchat/ui';
import { ProtectedRoute } from '@hchat/ui/admin';

export default function UploadPage() {
  return (
    <ProtectedRoute minRole="admin">
      <ROIDataUpload />
    </ProtectedRoute>
  );
}
