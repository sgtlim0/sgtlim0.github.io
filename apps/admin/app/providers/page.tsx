import { AdminProviderStatus, ProtectedRoute } from '@hchat/ui/admin';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI 제공자 상태',
};

export default function ProvidersPage() {
  return (
    <ProtectedRoute>
      <AdminProviderStatus />
    </ProtectedRoute>
  );
}
