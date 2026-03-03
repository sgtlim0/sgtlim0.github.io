'use client';

import React from 'react';

export interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function EmptyState({
  icon = '📭',
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div
      className="min-h-[400px] flex items-center justify-center p-8"
      style={{ backgroundColor: 'var(--bg-page)' }}
    >
      <div className="max-w-md w-full text-center space-y-6">
        {/* Icon/Emoji */}
        <div className="text-6xl opacity-50">{icon}</div>

        {/* Title */}
        <h3
          className="text-xl font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          {title}
        </h3>

        {/* Description */}
        {description && (
          <p
            className="text-base"
            style={{ color: 'var(--text-secondary)' }}
          >
            {description}
          </p>
        )}

        {/* Action Button */}
        {action && (
          <button
            onClick={action.onClick}
            className="px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            style={{
              backgroundColor: 'var(--primary)',
              color: 'var(--text-white)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--primary-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--primary)';
            }}
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
}
