import dynamic from 'next/dynamic';
import { SkeletonChart } from '@hchat/ui';
import { ProtectedRoute } from '@hchat/ui/admin';

const ROISentiment = dynamic(
  () => import('@hchat/ui').then(m => ({ default: m.ROISentiment })),
  { loading: () => <SkeletonChart /> }
);

export default function SentimentPage() {
  return (
    <ProtectedRoute>
      <ROISentiment />
    </ProtectedRoute>
  );
}
