'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@hchat/ui';
import { useState } from 'react';

const navItems = [
  { href: '/', label: '업무 비서' },
  { href: '/translate', label: '문서 번역' },
  { href: '/docs', label: '문서 작성' },
  { href: '/ocr', label: '텍스트 추출' },
  { href: '/my-page', label: '마이페이지' },
];

export default function UserNavWrapper() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="h-20 bg-user-bg border-b border-user-border">
      <div className="h-full max-w-screen-2xl mx-auto px-4 md:px-8 flex items-center justify-between">
        <div className="flex items-center gap-4 md:gap-12">
          <Link
            href="/"
            className="text-xl md:text-2xl font-bold text-user-primary hover:opacity-80 transition-opacity"
          >
            H Chat
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
                        ? 'text-user-primary font-semibold'
                        : 'text-user-text-secondary hover:text-user-text-primary'
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
          <ThemeToggle />
          {/* Mobile hamburger */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-user-text-secondary hover:text-user-text-primary"
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
        <div className="md:hidden border-t border-user-border bg-user-bg">
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
                        ? 'text-user-primary font-semibold bg-user-primary-light'
                        : 'text-user-text-secondary hover:text-user-text-primary hover:bg-user-bg-section'
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
