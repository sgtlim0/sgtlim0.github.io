'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/roi/upload', label: '데이터 업로드', icon: 'upload_file' },
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
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="lg:hidden fixed bottom-4 right-4 z-50 w-12 h-12 rounded-full bg-[var(--roi-sidebar-bg)] text-white shadow-lg flex items-center justify-center"
        aria-label="Toggle sidebar"
      >
        <span className="material-symbols-rounded text-lg">
          {isCollapsed ? 'menu' : 'close'}
        </span>
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed lg:static top-20 left-0 z-40
        w-60 md:w-16 lg:w-60
        shrink-0 min-h-[calc(100vh-80px)]
        bg-[var(--roi-sidebar-bg)] flex flex-col
        transition-transform duration-300
        ${isCollapsed ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'}
      `}>
        <div className="px-5 py-6 md:hidden lg:block">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-xs font-bold text-white">H</div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wider">H Chat</h2>
              <p className="text-[10px] text-[var(--roi-sidebar-text)]/70">생산성 대시보드</p>
            </div>
          </div>
        </div>
        <div className="md:flex md:items-center md:justify-center md:py-6 lg:hidden">
          <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-xs font-bold text-white">H</div>
        </div>
        <nav className="flex-1 px-2">
          <ul className="flex flex-col gap-0.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setIsCollapsed(true)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                      isActive
                        ? 'bg-[var(--roi-chart-1)] text-white font-medium'
                        : 'text-[var(--roi-sidebar-text)] hover:bg-[var(--roi-sidebar-hover)]'
                    }`}
                    title={item.label}
                  >
                    <span className="material-symbols-rounded text-lg leading-none">{item.icon}</span>
                    <span className="md:hidden lg:inline">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Mobile overlay */}
      {!isCollapsed && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30 top-20"
          onClick={() => setIsCollapsed(true)}
        />
      )}
    </>
  );
}
