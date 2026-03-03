'use client';

import React, { useMemo, useCallback } from 'react';
import type { Assistant, AssistantCategory } from '../services/types';
import AssistantCard from './AssistantCard';
import CategoryFilter from './CategoryFilter';

const CATEGORIES: AssistantCategory[] = [
  '전체', '채팅', '업무', '번역', '정리', '보고', '그림', '글쓰기',
];

export interface AssistantGridProps {
  assistants: Assistant[];
  activeTab: 'official' | 'custom';
  activeCategory: AssistantCategory;
  onTabChange: (tab: 'official' | 'custom') => void;
  onCategoryChange: (category: AssistantCategory) => void;
  onSelectAssistant: (assistant: Assistant) => void;
}

export default function AssistantGrid({
  assistants,
  activeTab,
  activeCategory,
  onTabChange,
  onCategoryChange,
  onSelectAssistant,
}: AssistantGridProps) {
  const filteredAssistants = useMemo(() => {
    if (activeTab === 'custom') return [];

    const officialAssistants = assistants.filter((a) => a.isOfficial);
    if (activeCategory === '전체') return officialAssistants;

    return officialAssistants.filter((a) => a.category === activeCategory);
  }, [assistants, activeTab, activeCategory]);

  const handleTabOfficial = useCallback(() => {
    onTabChange('official');
  }, [onTabChange]);

  const handleTabCustom = useCallback(() => {
    onTabChange('custom');
  }, [onTabChange]);

  const handleCategoryChange = useCallback(
    (category: string) => {
      onCategoryChange(category as AssistantCategory);
    },
    [onCategoryChange]
  );

  return (
    <div className="space-y-5">
      {/* Tabs */}
      <div role="tablist" aria-label="비서 유형 선택" className="flex items-center gap-1 bg-user-bg-section rounded-xl p-1">
        <TabButton
          label="H Chat 공식 비서"
          isActive={activeTab === 'official'}
          onClick={handleTabOfficial}
        />
        <TabButton
          label="내가 만든 비서"
          isActive={activeTab === 'custom'}
          onClick={handleTabCustom}
        />
      </div>

      {/* Category filter */}
      {activeTab === 'official' && (
        <CategoryFilter
          categories={CATEGORIES}
          activeCategory={activeCategory}
          onSelect={handleCategoryChange}
        />
      )}

      {/* Grid or empty state */}
      {activeTab === 'custom' ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-user-bg-section flex items-center justify-center text-3xl mb-4">
            🤖
          </div>
          <p className="text-sm font-medium text-user-text-primary mb-1">
            아직 만든 비서가 없어요
          </p>
          <p className="text-xs text-user-text-muted">
            나만의 AI 비서를 만들어보세요!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredAssistants.map((assistant) => (
            <AssistantCard
              key={assistant.id}
              assistant={assistant}
              onClick={onSelectAssistant}
            />
          ))}
          {filteredAssistants.length === 0 && (
            <p className="col-span-full text-center text-sm text-user-text-muted py-12">
              해당 카테고리에 비서가 없습니다.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function TabButton({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      role="tab"
      aria-selected={isActive}
      onClick={onClick}
      className={[
        'flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors',
        isActive
          ? 'bg-user-bg text-user-text-primary shadow-sm'
          : 'text-user-text-secondary hover:text-user-text-primary',
      ].join(' ')}
    >
      {label}
    </button>
  );
}
