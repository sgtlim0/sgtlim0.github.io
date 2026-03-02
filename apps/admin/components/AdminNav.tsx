'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@hchat/ui';

const navItems = [
  { href: '/', label: '대시보드' },
  { href: '/usage', label: '사용내역' },
  { href: '/statistics', label: '통계' },
  { href: '/users', label: '사용자 관리' },
  { href: '/settings', label: '설정' },
  { href: '/roi/overview', label: 'ROI 대시보드' },
  { href: '/providers', label: 'AI 제공자' },
  { href: '/models', label: '모델 가격' },
  { href: '/features', label: '기능 사용량' },
  { href: '/prompts', label: '프롬프트' },
  { href: '/agents', label: '에이전트' },
];

export default function AdminNav() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
        <div className="flex items-center gap-2">
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
          </ul>
        </div>
      )}
    </nav>
  );
}
