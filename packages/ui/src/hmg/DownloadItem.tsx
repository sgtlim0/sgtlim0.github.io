'use client';

import React from 'react';

interface DownloadButton {
  label: string;
  onClick?: () => void;
}

interface DownloadItemProps {
  title: string;
  buttons: DownloadButton[];
}

export default function DownloadItem({ title, buttons }: DownloadItemProps) {
  return (
    <div className="w-full max-w-[600px] flex items-center justify-between py-5 border-b border-hmg-border">
      <span className="text-[17px] text-hmg-text-body">
        {title}
      </span>

      <div className="flex gap-2">
        {buttons.map((button, index) => (
          <button
            key={index}
            onClick={button.onClick}
            className="h-9 px-5 rounded-[18px] bg-hmg-bg-card border border-hmg-border text-[14px] font-medium text-hmg-text-body hover:bg-hmg-bg-section transition-colors"
          >
            {button.label}
          </button>
        ))}
      </div>
    </div>
  );
}
