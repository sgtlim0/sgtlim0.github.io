'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NavItem } from '@/lib/markdown';
import { useState } from 'react';

interface SidebarProps {
  navigation: NavItem[];
}

export default function Sidebar({ navigation }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const toggleCollapse = (slug: string) => {
    const newCollapsed = new Set(collapsed);
    if (newCollapsed.has(slug)) {
      newCollapsed.delete(slug);
    } else {
      newCollapsed.add(slug);
    }
    setCollapsed(newCollapsed);
  };

  const renderNavItem = (item: NavItem, depth: number = 0) => {
    const isActive = pathname === item.path;
    const hasChildren = item.children && item.children.length > 0;
    const isCollapsed = collapsed.has(item.slug);

    return (
      <div key={item.slug}>
        <div
          className={`flex items-center gap-1 rounded-md transition-colors ${
            depth > 0 ? 'ml-4' : ''
          }`}
        >
          {hasChildren && (
            <button
              onClick={() => toggleCollapse(item.slug)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <svg
                className={`w-3 h-3 transition-transform ${
                  isCollapsed ? '' : 'rotate-90'
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          )}
          <Link
            href={item.path}
            className={`flex-1 px-2 py-1 text-sm rounded-md transition-colors ${
              isActive
                ? 'bg-gray-100 text-gray-900 font-medium'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            } ${!hasChildren ? 'ml-5' : ''}`}
          >
            {item.title}
          </Link>
        </div>
        {hasChildren && !isCollapsed && (
          <div className="mt-1">
            {item.children?.map((child) => renderNavItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="w-64 h-screen fixed left-0 top-0 border-r border-gray-200 bg-white overflow-y-auto">
      <div className="p-6">
        <Link href="/" className="block mb-6">
          <h1 className="text-xl font-semibold text-gray-900">My Wiki</h1>
        </Link>
        <nav className="space-y-1">
          {navigation.map((item) => renderNavItem(item))}
        </nav>
      </div>
    </aside>
  );
}
