import { ROIReports } from '@hchat/ui';
import { ProtectedRoute } from '@hchat/ui/admin';

export default function ReportsPage() {
  return (
    <ProtectedRoute>
      <ROIReports />
    </ProtectedRoute>
  );
}
