'use client';

import React, { useRef, useCallback } from 'react';

export interface CategoryFilterProps {
  categories: string[];
  activeCategory: string;
  onSelect: (category: string) => void;
}

export default function CategoryFilter({ categories, activeCategory, onSelect }: CategoryFilterProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSelect = useCallback((category: string) => {
    onSelect(category);
  }, [onSelect]);

  return (
    <div
      ref={scrollRef}
      className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1"
      role="tablist"
      aria-label="카테고리 필터"
    >
      {categories.map((category) => {
        const isActive = category === activeCategory;
        return (
          <button
            key={category}
            role="tab"
            aria-selected={isActive}
            onClick={() => handleSelect(category)}
            className={[
              'px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors shrink-0',
              isActive
                ? 'bg-[#4F6EF7] text-white'
                : 'bg-transparent text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:border-[#4F6EF7] hover:text-[#4F6EF7]',
            ].join(' ')}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}
