import { AdminAgentMonitoring, ProtectedRoute } from '@hchat/ui/admin';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '에이전트 모니터링',
};

export default async function AgentsPage() {
  return (
    <ProtectedRoute>
      <AdminAgentMonitoring />
    </ProtectedRoute>
  );
}
