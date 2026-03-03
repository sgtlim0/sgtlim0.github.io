'use client';

import React, { useState } from 'react';
import { Menu, X, Globe } from 'lucide-react';
import { ThemeToggle } from '@hchat/ui';

type UserTab = 'chat' | 'translate' | 'docs' | 'ocr';

interface TabItem {
  key: UserTab;
  label: string;
}

export interface UserGNBProps {
  activeTab: UserTab;
  userEmail?: string;
  onTabChange?: (tab: UserTab) => void;
}

const tabs: TabItem[] = [
  { key: 'chat', label: '업무 비서' },
  { key: 'translate', label: '문서 번역' },
  { key: 'docs', label: '문서 작성' },
  { key: 'ocr', label: '텍스트 추출' },
];

export default function UserGNB({ activeTab, userEmail, onTabChange }: UserGNBProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  function handleTabClick(tab: UserTab) {
    onTabChange?.(tab);
    setIsMobileMenuOpen(false);
  }

  return (
    <>
      <nav role="navigation" aria-label="메인 네비게이션" className="w-full h-14 bg-user-primary flex items-center justify-between px-4 md:px-6 lg:px-10">
        {/* Left: Logo + Tabs */}
        <div className="flex items-center gap-8">
          <span className="text-white text-lg font-bold tracking-tight whitespace-nowrap">
            H Chat
          </span>

          {/* Desktop tabs */}
          <div className="hidden md:flex items-center gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabClick(tab.key)}
                className={[
                  'relative px-4 py-4 text-sm font-medium transition-colors whitespace-nowrap',
                  activeTab === tab.key
                    ? 'text-white'
                    : 'text-white/70 hover:text-white/90',
                ].join(' ')}
              >
                {tab.label}
                {activeTab === tab.key && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-white rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Email + CTA + Language */}
        <div className="flex items-center gap-3">
          {userEmail && (
            <span className="hidden lg:inline text-white/80 text-sm truncate max-w-48">
              {userEmail}
            </span>
          )}

          <button
            className="hidden sm:inline-flex items-center px-3 py-1.5 bg-user-accent hover:bg-user-accent/90 text-white text-xs font-medium rounded-md transition-colors whitespace-nowrap"
          >
            기업용 버전 가입
          </button>

          <ThemeToggle />

          <button
            className="flex items-center gap-1 text-white/80 hover:text-white text-sm transition-colors"
            aria-label="언어 선택"
          >
            <Globe className="w-4 h-4" />
            <span className="hidden sm:inline text-xs">KR</span>
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-1.5 text-white"
            aria-label="메뉴 열기"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-user-primary border-t border-white/10">
          <div className="flex flex-col py-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabClick(tab.key)}
                className={[
                  'w-full text-left px-6 py-3 text-sm font-medium transition-colors',
                  activeTab === tab.key
                    ? 'text-white bg-white/10'
                    : 'text-white/70 hover:text-white hover:bg-white/5',
                ].join(' ')}
              >
                {tab.label}
              </button>
            ))}
            {userEmail && (
              <div className="px-6 py-3 text-white/60 text-xs border-t border-white/10">
                {userEmail}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
