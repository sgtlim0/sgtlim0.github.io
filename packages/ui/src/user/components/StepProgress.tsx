'use client';

import React from 'react';
import { Check } from 'lucide-react';

interface Step {
  label: string;
}

export interface StepProgressProps {
  steps: Step[];
  currentStep: number;
}

export default function StepProgress({ steps, currentStep }: StepProgressProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;

          return (
            <React.Fragment key={index}>
              {/* Step circle + label */}
              <div className="flex flex-col items-center gap-2 relative z-10">
                <div
                  className={[
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors shrink-0',
                    isCompleted
                      ? 'bg-[#10B981] text-white'
                      : isActive
                        ? 'bg-[#4F6EF7] text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400',
                  ].join(' ')}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    stepNumber
                  )}
                </div>
                <span
                  className={[
                    'text-xs text-center whitespace-nowrap',
                    isActive
                      ? 'text-[#4F6EF7] font-medium'
                      : isCompleted
                        ? 'text-[#10B981] font-medium'
                        : 'text-gray-500 dark:text-gray-400',
                  ].join(' ')}
                >
                  {step.label}
                </span>
              </div>

              {/* Connecting line */}
              {index < steps.length - 1 && (
                <div
                  className={[
                    'flex-1 h-0.5 mx-2 -mt-6 transition-colors',
                    stepNumber < currentStep
                      ? 'bg-[#10B981]'
                      : 'bg-gray-200 dark:bg-gray-700',
                  ].join(' ')}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
