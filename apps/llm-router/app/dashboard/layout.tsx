'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LRNavbar } from '@hchat/ui/llm-router';
import { BarChart3, Key, Settings, CreditCard } from 'lucide-react';

interface NavLinkProps {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isActive: boolean;
}

function NavLink({ href, icon, children, isActive }: NavLinkProps) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
        isActive
          ? 'bg-[var(--lr-primary)] text-white'
          : 'text-[var(--lr-text-secondary)] hover:bg-[var(--lr-bg-section)] hover:text-[var(--lr-text-primary)]'
      }`}
    >
      {icon}
      <span className="font-medium">{children}</span>
    </Link>
  );
}

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[var(--lr-bg)]">
      <LRNavbar isAuthenticated={true} />

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-56 h-[calc(100vh-4rem)] border-r border-[var(--lr-border)] bg-[var(--lr-bg)] sticky top-16">
          <nav className="p-4 space-y-1">
            <NavLink
              href="/dashboard/usage"
              icon={<BarChart3 className="w-5 h-5" />}
              isActive={pathname === '/dashboard/usage'}
            >
              사용량
            </NavLink>
            <NavLink
              href="/dashboard/keys"
              icon={<Key className="w-5 h-5" />}
              isActive={pathname === '/dashboard/keys'}
            >
              API 키
            </NavLink>
            <NavLink
              href="/dashboard/settings"
              icon={<Settings className="w-5 h-5" />}
              isActive={pathname === '/dashboard/settings'}
            >
              설정
            </NavLink>
            <NavLink
              href="/dashboard/billing"
              icon={<CreditCard className="w-5 h-5" />}
              isActive={pathname === '/dashboard/billing'}
            >
              결제
            </NavLink>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
