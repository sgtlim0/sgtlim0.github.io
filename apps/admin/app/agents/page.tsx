import { AdminAgentMonitoring } from '@hchat/ui/admin';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '에이전트 모니터링',
};

export default async function AgentsPage() {
  return <AdminAgentMonitoring />;
}
