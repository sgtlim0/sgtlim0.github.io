'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './auth/AuthProvider';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('이메일과 비밀번호를 입력해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      await login({ email, password, rememberMe });
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-hmg-bg-section px-4">
      <div className="w-full max-w-md">
        <div className="bg-hmg-bg-card rounded-lg shadow-lg border border-hmg-border p-8">
          {/* Logo/Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-admin-teal mb-2">H Chat Admin</h1>
            <p className="text-text-secondary text-sm">관리자 로그인</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
                이메일
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-hmg-input-bg border border-hmg-input-border rounded-md text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-admin-teal focus:border-transparent transition-all"
                placeholder="admin@hchat.ai"
                disabled={isLoading}
              />
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-2">
                비밀번호
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-hmg-input-bg border border-hmg-input-border rounded-md text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-admin-teal focus:border-transparent transition-all"
                placeholder="비밀번호를 입력하세요"
                disabled={isLoading}
              />
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center">
              <input
                id="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-admin-teal bg-hmg-input-bg border-hmg-input-border rounded focus:ring-2 focus:ring-admin-teal cursor-pointer"
                disabled={isLoading}
              />
              <label htmlFor="rememberMe" className="ml-2 text-sm text-text-secondary cursor-pointer">
                로그인 상태 유지
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-danger/10 border border-danger/30 rounded-md p-3">
                <p className="text-sm text-danger">{error}</p>
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-admin-teal text-white font-semibold rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-admin-teal focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '로그인 중...' : '로그인'}
            </button>
          </form>

          {/* Demo Info */}
          <div className="mt-6 pt-6 border-t border-hmg-border">
            <p className="text-xs text-text-tertiary text-center mb-3">데모 계정</p>
            <div className="space-y-2 text-xs text-text-secondary">
              <div className="flex justify-between items-center p-2 bg-hmg-bg-section rounded">
                <span>관리자:</span>
                <span className="font-mono">admin@hchat.ai</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-hmg-bg-section rounded">
                <span>매니저:</span>
                <span className="font-mono">manager@hchat.ai</span>
              </div>
              <p className="text-center text-text-tertiary pt-2">비밀번호: 임의 입력</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-text-tertiary">H Chat Admin v1.0</p>
        </div>
      </div>
    </div>
  );
}
