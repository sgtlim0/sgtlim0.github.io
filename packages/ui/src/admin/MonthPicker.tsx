'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface MonthPickerProps {
  year: number;
  month: number;
  onChange?: (year: number, month: number) => void;
}

export default function MonthPicker({ year, month, onChange }: MonthPickerProps) {
  const handlePrev = () => {
    const prev = month === 1 ? { y: year - 1, m: 12 } : { y: year, m: month - 1 };
    onChange?.(prev.y, prev.m);
  };

  const handleNext = () => {
    const next = month === 12 ? { y: year + 1, m: 1 } : { y: year, m: month + 1 };
    onChange?.(next.y, next.m);
  };

  return (
    <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-admin-bg-card">
      <button onClick={handlePrev} aria-label="이전 달" className="p-1 rounded hover:bg-bg-hover transition-colors">
        <ChevronLeft className="w-4 h-4 text-text-secondary" aria-hidden="true" />
      </button>
      <span className="text-sm font-medium text-text-primary min-w-[100px] text-center">
        {year}년 {month}월
      </span>
      <button onClick={handleNext} aria-label="다음 달" className="p-1 rounded hover:bg-bg-hover transition-colors">
        <ChevronRight className="w-4 h-4 text-text-secondary" aria-hidden="true" />
      </button>
    </div>
  );
}
