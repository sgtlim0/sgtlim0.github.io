'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';
import type { UserRole } from './types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  minRole?: UserRole;
}

const ROLE_HIERARCHY: Record<UserRole, number> = {
  viewer: 1,
  manager: 2,
  admin: 3,
};

export default function ProtectedRoute({ children, minRole }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-hmg-bg-section">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-admin-teal border-t-transparent rounded-full animate-spin" />
          <p className="text-text-secondary">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  if (minRole && ROLE_HIERARCHY[user.role] < ROLE_HIERARCHY[minRole]) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-hmg-bg-section">
        <div className="max-w-md mx-auto p-8 bg-hmg-bg-card rounded-lg shadow-sm border border-hmg-border text-center">
          <h1 className="text-2xl font-bold text-text-primary mb-4">접근 권한이 없습니다</h1>
          <p className="text-text-secondary mb-6">
            이 페이지에 접근하려면 {minRole} 권한 이상이 필요합니다.
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-admin-teal text-white rounded-md hover:opacity-90 transition-opacity"
          >
            대시보드로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
