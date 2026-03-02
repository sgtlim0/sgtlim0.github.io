import { AdminPromptLibrary, ProtectedRoute } from '@hchat/ui/admin';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '프롬프트 라이브러리',
};

export default function PromptsPage() {
  return (
    <ProtectedRoute>
      <AdminPromptLibrary />
    </ProtectedRoute>
  );
}
