'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/roi/overview', label: '개요', icon: 'dashboard' },
  { href: '/roi/adoption', label: '도입 현황', icon: 'group' },
  { href: '/roi/productivity', label: '생산성 효과', icon: 'trending_up' },
  { href: '/roi/analysis', label: 'ROI 분석', icon: 'analytics' },
  { href: '/roi/organization', label: '조직 분석', icon: 'corporate_fare' },
  { href: '/roi/sentiment', label: '만족도', icon: 'sentiment_satisfied' },
  { href: '/roi/reports', label: '리포트', icon: 'description' },
  { href: '/roi/settings', label: '설정', icon: 'settings' },
];

export default function ROISidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 min-h-[calc(100vh-80px)] bg-[var(--roi-sidebar-bg)] flex flex-col">
      <div className="px-5 py-6">
        <h2 className="text-sm font-bold text-white tracking-wider">H Chat ROI</h2>
      </div>
      <nav className="flex-1 px-2">
        <ul className="flex flex-col gap-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-[var(--roi-chart-1)] text-white font-medium'
                      : 'text-[var(--roi-sidebar-text)] hover:bg-[var(--roi-sidebar-hover)]'
                  }`}
                >
                  <span className="material-symbols-rounded text-lg leading-none">{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
