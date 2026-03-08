'use client';

import React, { useState } from 'react';

interface MenuItem {
  label: string;
  href: string;
}

interface GNBProps {
  brand: string;
  menuItems: MenuItem[];
  rightSlot?: React.ReactNode;
}

export default function GNB({ brand, menuItems, rightSlot }: GNBProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <nav role="navigation" aria-label="메인 네비게이션" className="w-full h-20 flex items-center justify-between px-4 md:px-10 lg:px-20 bg-hmg-bg-card border-b border-hmg-border">
        <div className="text-[17px] font-bold text-hmg-navy">
          {brand}
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6 lg:gap-10">
          {menuItems.map((item, index) => (
            <a
              key={index}
              href={item.href}
              className="text-[17px] font-medium text-[#333333] dark:text-hmg-text-body hover:text-hmg-navy transition-colors"
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {rightSlot && (
            <div className="flex items-center gap-4">
              {rightSlot}
            </div>
          )}
          {/* Mobile hamburger */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-hmg-navy"
            aria-label="메뉴 열기/닫기"
            aria-expanded={isMenuOpen}
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
      </nav>
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-b border-hmg-border bg-hmg-bg-card">
          <div className="flex flex-col py-2">
            {menuItems.map((item, index) => (
              <a
                key={index}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="block px-4 py-3 text-[17px] font-medium text-[#333333] dark:text-hmg-text-body hover:bg-hmg-bg-surface transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
