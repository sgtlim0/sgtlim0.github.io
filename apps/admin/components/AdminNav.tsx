'use client';

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
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="h-20 bg-hmg-bg-card border-b border-hmg-border">
      <div className="h-full max-w-screen-2xl mx-auto px-8 flex items-center justify-between">
        <div className="flex items-center gap-12">
          <Link
            href="/"
            className="text-2xl font-bold text-hmg-navy hover:opacity-80 transition-opacity"
          >
            H Chat Admin
          </Link>
          <ul className="flex items-center gap-8">
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
        <ThemeToggle />
      </div>
    </nav>
  );
}
