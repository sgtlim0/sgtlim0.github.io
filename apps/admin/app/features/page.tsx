import { AdminFeatureUsage } from '@hchat/ui/admin';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '기능별 사용량',
  description: 'AI 기능 사용 현황 및 트렌드 분석',
};

export default function FeaturesPage() {
  return <AdminFeatureUsage />;
}
