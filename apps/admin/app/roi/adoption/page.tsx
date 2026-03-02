import { ROIAdoption } from '@hchat/ui';
import { ProtectedRoute } from '@hchat/ui/admin';

export default function AdoptionPage() {
  return (
    <ProtectedRoute>
      <ROIAdoption />
    </ProtectedRoute>
  );
}
