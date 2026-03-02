import { ROIProductivity } from '@hchat/ui';
import { ProtectedRoute } from '@hchat/ui/admin';

export default function ProductivityPage() {
  return (
    <ProtectedRoute>
      <ROIProductivity />
    </ProtectedRoute>
  );
}
