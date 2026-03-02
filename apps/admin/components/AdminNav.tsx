'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ThemeToggle } from '@hchat/ui';
import { useAuth } from '@hchat/ui/admin';

const navItems = [
  { href: '/', label: '대시보드' },
  { href: '/usage', label: '사용내역' },
  { href: '/statistics', label: '통계' },
  { href: '/users', label: '사용자 관리' },
  { href: '/settings', label: '설정' },
  { href: '/roi/overview', label: 'ROI 대시보드' },
  { href: '/departments', label: '부서 관리' },
  { href: '/audit-logs', label: '감사 로그' },
  { href: '/sso', label: 'SSO 설정' },
  { href: '/providers', label: 'AI 제공자' },
  { href: '/models', label: '모델 가격' },
  { href: '/features', label: '기능 사용량' },
  { href: '/prompts', label: '프롬프트' },
  { href: '/agents', label: '에이전트' },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (pathname === '/login') {
    return null;
  }

  return (
    <nav className="h-20 bg-hmg-bg-card border-b border-hmg-border">
      <div className="h-full max-w-screen-2xl mx-auto px-4 md:px-8 flex items-center justify-between">
        <div className="flex items-center gap-4 md:gap-12">
          <Link
            href="/"
            className="text-xl md:text-2xl font-bold text-hmg-navy hover:opacity-80 transition-opacity"
          >
            H Chat Admin
          </Link>
          {/* Desktop nav */}
          <ul className="hidden md:flex items-center gap-8">
            {navItems.map((item) => {
              const isActive = item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`text-base transition-colors ${
                      isActive
                        ? 'text-admin-teal font-semibold'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="flex items-center gap-3">
          {isAuthenticated && user && (
            <div className="hidden md:flex items-center gap-3 px-3 py-2 rounded-md bg-hmg-bg-section">
              <div className="flex flex-col items-end">
                <span className="text-sm font-medium text-text-primary">{user.name}</span>
                <span className="text-xs text-text-tertiary">{user.role}</span>
              </div>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 text-sm text-text-secondary hover:text-danger transition-colors"
                title="로그아웃"
              >
                로그아웃
              </button>
            </div>
          )}
          <ThemeToggle />
          {/* Mobile hamburger */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-text-secondary hover:text-text-primary"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-hmg-border bg-hmg-bg-card">
          <ul className="flex flex-col py-2">
            {navItems.map((item) => {
              const isActive = item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`block px-4 py-3 text-base transition-colors ${
                      isActive
                        ? 'text-admin-teal font-semibold bg-admin-teal/5'
                        : 'text-text-secondary hover:text-text-primary hover:bg-hmg-bg-surface'
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
            {isAuthenticated && user && (
              <li className="border-t border-hmg-border mt-2 pt-2">
                <div className="px-4 py-2 text-sm">
                  <div className="text-text-primary font-medium">{user.name}</div>
                  <div className="text-text-tertiary text-xs">{user.role}</div>
                </div>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left px-4 py-3 text-base text-danger hover:bg-hmg-bg-surface transition-colors"
                >
                  로그아웃
                </button>
              </li>
            )}
          </ul>
        </div>
      )}
    </nav>
  );
}
