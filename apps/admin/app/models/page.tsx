import { AdminModelPricing, ProtectedRoute } from '@hchat/ui/admin';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '모델 가격 정보',
};

export default function ModelsPage() {
  return (
    <ProtectedRoute>
      <AdminModelPricing />
    </ProtectedRoute>
  );
}
