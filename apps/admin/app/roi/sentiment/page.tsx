'use client';

import dynamic from 'next/dynamic';
import { SkeletonChart } from '@hchat/ui';
import { ProtectedRoute } from '@hchat/ui/admin';

const ROISentiment = dynamic(
  () => import('@hchat/ui/roi/ROISentiment'),
  { ssr: false, loading: () => <SkeletonChart /> }
);

export default function SentimentPage() {
  return (
    <ProtectedRoute>
      <ROISentiment />
    </ProtectedRoute>
  );
}
