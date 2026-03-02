'use client';

import React from 'react';

interface PillButtonProps {
  children: React.ReactNode;
  variant?: 'outline' | 'navy' | 'teal';
  onClick?: () => void;
  className?: string;
}

export default function PillButton({
  children,
  variant = 'outline',
  onClick,
  className = ''
}: PillButtonProps) {
  const variantClasses = {
    outline: 'bg-hmg-bg-card border border-hmg-border text-hmg-text-body hover:bg-hmg-bg-section',
    navy: 'bg-hmg-navy text-white border-none hover:opacity-90',
    teal: 'bg-hmg-teal text-white border-none hover:opacity-90'
  };

  return (
    <button
      onClick={onClick}
      className={`
        h-[60px] px-8 rounded-[30px]
        text-[20px] font-medium
        transition-all
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {children}
    </button>
  );
}
