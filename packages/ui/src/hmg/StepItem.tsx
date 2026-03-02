import React from 'react';
import { ChevronDown } from 'lucide-react';

interface StepItemProps {
  step: number;
  title: string;
  description: string;
  showArrow?: boolean;
}

export default function StepItem({ step, title, description, showArrow = false }: StepItemProps) {
  return (
    <div className="w-[300px] flex flex-col gap-1">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-7 h-7 rounded-full bg-hmg-teal flex items-center justify-center">
          <span className="text-white text-[14px] font-semibold">
            {step}
          </span>
        </div>
        <h3 className="text-[16px] font-semibold text-hmg-text-title">
          {title}
        </h3>
      </div>

      <p className="text-[14px] text-hmg-text-caption max-w-[260px]">
        {description}
      </p>

      {showArrow && (
        <div className="flex justify-center mt-4">
          <ChevronDown className="w-6 h-6 text-hmg-teal" />
        </div>
      )}
    </div>
  );
}
