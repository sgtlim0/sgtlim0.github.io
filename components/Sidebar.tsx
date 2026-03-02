'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  Home, Rocket, MessageSquare, Users, MessagesSquare, Bot, Wrench,
  CirclePlay, FileText, Search as SearchIcon, PanelTop, Pencil, Bookmark,
  Settings, Layers, HelpCircle, GitBranch, ChevronDown,
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { sidebarNavigation, isNavGroup, type NavItemConfig } from '@/lib/navigation';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'home': Home,
  'rocket': Rocket,
  'message-square': MessageSquare,
  'users': Users,
  'messages-square': MessagesSquare,
  'bot': Bot,
  'wrench': Wrench,
  'circle-play': CirclePlay,
  'file-text': FileText,
  'search': SearchIcon,
  'panel-top': PanelTop,
  'pencil': Pencil,
  'bookmark': Bookmark,
  'settings': Settings,
  'layers': Layers,
  'help-circle': HelpCircle,
  'git-branch': GitBranch,
};

function slugToHref(slug: string): string {
  return slug === 'home' ? '/' : `/${slug}`;
}

function isActiveSlug(pathname: string, slug: string): boolean {
  if (slug === 'home') return pathname === '/';
  return pathname === `/${slug}`;
}

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const toggleGroup = (title: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(title)) {
        next.delete(title);
      } else {
        next.add(title);
      }
      return next;
    });
  };

  const renderNavItem = (item: NavItemConfig) => {
    const active = isActiveSlug(pathname, item.slug);
    const Icon = iconMap[item.icon];

    return (
      <Link
        key={item.slug}
        href={slugToHref(item.slug)}
        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
          active
            ? 'bg-primary-light text-primary font-medium'
            : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
        }`}
      >
        {Icon && <Icon className="w-4 h-4 shrink-0" />}
        <span>{item.title}</span>
      </Link>
    );
  };

  return (
    <aside className="w-[280px] h-screen fixed left-0 top-0 bg-bg-sidebar border-r border-border overflow-y-auto flex flex-col">
      <div className="flex-1 flex flex-col gap-2 p-4 pt-5">
        {/* Logo */}
        <div className="flex items-center gap-2.5 pb-4">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-text-white font-bold text-base">H</span>
          </div>
          <span className="text-lg font-bold text-text-primary">H Chat Wiki</span>
        </div>

        {/* Search placeholder */}
        <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-[10px] bg-bg-card border border-border text-text-tertiary mb-1">
          <SearchIcon className="w-4 h-4 shrink-0" />
          <span className="text-sm flex-1">문서 검색...</span>
          <kbd className="text-xs font-medium">&#8984;K</kbd>
        </div>

        <hr className="border-border" />

        {/* Navigation */}
        <nav className="flex flex-col gap-0.5 mt-1">
          {sidebarNavigation.map((entry, i) => {
            if (!isNavGroup(entry)) {
              return renderNavItem(entry);
            }

            const isOpen = !collapsed.has(entry.title);

            return (
              <div key={i} className="mt-2">
                <button
                  onClick={() => toggleGroup(entry.title)}
                  className="flex items-center gap-2 px-3 py-2 w-full text-left text-[13px] font-semibold text-text-primary tracking-wide"
                >
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-text-tertiary transition-transform ${
                      isOpen ? '' : '-rotate-90'
                    }`}
                  />
                  <span>{entry.title}</span>
                </button>
                {isOpen && (
                  <div className="flex flex-col gap-0.5 ml-1">
                    {entry.items.map((item) => renderNavItem(item))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border flex items-center justify-between">
        <span className="text-xs text-text-tertiary">H Chat v3.0</span>
        <ThemeToggle />
      </div>
    </aside>
  );
}
