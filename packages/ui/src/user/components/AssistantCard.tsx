'use client';

import React, { useCallback } from 'react';
import type { Assistant } from '../services/types';

export interface AssistantCardProps {
  assistant: Assistant;
  onClick: (assistant: Assistant) => void;
}

export default function AssistantCard({ assistant, onClick }: AssistantCardProps) {
  const handleClick = useCallback(() => {
    onClick(assistant);
  }, [assistant, onClick]);

  return (
    <button
      onClick={handleClick}
      className="flex flex-col items-start gap-3 p-5 rounded-xl border border-[#E2E8F0] dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20 hover:scale-[1.02] transition-all duration-200 text-left w-full"
    >
      {/* Icon + badge row */}
      <div className="flex items-start justify-between w-full">
        <div
          className="flex items-center justify-center w-12 h-12 rounded-xl text-2xl"
          style={{ backgroundColor: assistant.iconColor }}
        >
          {assistant.icon}
        </div>
        {assistant.model && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#F8FAFC] dark:bg-gray-700 text-[#64748B] dark:text-gray-400 border border-[#E2E8F0] dark:border-gray-600">
            {assistant.model}
          </span>
        )}
      </div>

      {/* Name */}
      <h3 className="text-sm font-semibold text-[#1E293B] dark:text-white">
        {assistant.name}
      </h3>

      {/* Description */}
      <p className="text-xs text-[#64748B] dark:text-gray-400 leading-relaxed line-clamp-2">
        {assistant.description}
      </p>
    </button>
  );
}
