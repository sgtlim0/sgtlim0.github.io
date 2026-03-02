import { ROIOrganization } from '@hchat/ui';
import { ProtectedRoute } from '@hchat/ui/admin';

export default function OrganizationPage() {
  return (
    <ProtectedRoute>
      <ROIOrganization />
    </ProtectedRoute>
  );
}
