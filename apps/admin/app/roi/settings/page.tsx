import { ROISettings } from '@hchat/ui';
import { ProtectedRoute } from '@hchat/ui/admin';

export default function SettingsPage() {
  return (
    <ProtectedRoute minRole="admin">
      <ROISettings />
    </ProtectedRoute>
  );
}
