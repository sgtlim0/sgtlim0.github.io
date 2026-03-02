import { ROIOverview } from '@hchat/ui';
import { ProtectedRoute } from '@hchat/ui/admin';

export default function OverviewPage() {
  return (
    <ProtectedRoute>
      <ROIOverview />
    </ProtectedRoute>
  );
}
