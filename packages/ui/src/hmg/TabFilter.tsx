'use client';

import React from 'react';

interface TabFilterProps {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function TabFilter({ tabs, activeTab, onTabChange }: TabFilterProps) {
  return (
    <div className="w-full h-[60px] flex items-center gap-10 px-20 bg-hmg-bg-card">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`
            text-[17px] font-medium pb-[2px] border-b-2 transition-colors
            ${activeTab === tab
              ? 'text-hmg-text-title border-hmg-text-title'
              : 'text-hmg-text-caption border-transparent'
            }
          `}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
