import { ROIAnalysis } from '@hchat/ui';
import { ProtectedRoute } from '@hchat/ui/admin';

export default function AnalysisPage() {
  return (
    <ProtectedRoute>
      <ROIAnalysis />
    </ProtectedRoute>
  );
}
