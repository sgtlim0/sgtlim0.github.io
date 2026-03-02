import { ROISentiment } from '@hchat/ui';
import { ProtectedRoute } from '@hchat/ui/admin';

export default function SentimentPage() {
  return (
    <ProtectedRoute>
      <ROISentiment />
    </ProtectedRoute>
  );
}
