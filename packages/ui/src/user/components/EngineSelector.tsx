'use client';

import type { TranslationEngine } from '../services/types';

export interface EngineSelectorProps {
  selectedEngine: TranslationEngine;
  onSelect: (engine: TranslationEngine) => void;
}

interface EngineOption {
  key: TranslationEngine;
  name: string;
  specs: readonly { label: string; value: string }[];
}

const engines: readonly EngineOption[] = [
  {
    key: 'internal',
    name: '자체 번역 엔진',
    specs: [
      { label: '번역 품질', value: '최상' },
      { label: '속도', value: '빠름' },
      { label: '언어', value: '89개' },
      { label: '용량', value: '하루 5,000페이지/300MB' },
    ],
  },
  {
    key: 'deepl',
    name: 'DeepL 번역 엔진',
    specs: [
      { label: '번역 품질', value: '최상' },
      { label: '속도', value: '빠름' },
      { label: '언어', value: '32개' },
      { label: '용량', value: '하루 30MB/100건' },
    ],
  },
] as const;

export default function EngineSelector({ selectedEngine, onSelect }: EngineSelectorProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {engines.map((engine) => {
        const isSelected = selectedEngine === engine.key;

        return (
          <button
            key={engine.key}
            type="button"
            onClick={() => onSelect(engine.key)}
            className={[
              'flex items-start gap-3 rounded-xl border-2 p-5 text-left transition-colors',
              isSelected
                ? 'border-[#4F6EF7] bg-[#EBF0FF]/30'
                : 'border-[#E2E8F0] bg-white hover:border-[#4F6EF7]/40',
            ].join(' ')}
          >
            {/* Radio indicator */}
            <div
              className={[
                'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                isSelected
                  ? 'border-[#4F6EF7]'
                  : 'border-[#E2E8F0]',
              ].join(' ')}
            >
              {isSelected && (
                <div className="h-2.5 w-2.5 rounded-full bg-[#4F6EF7]" />
              )}
            </div>

            {/* Engine info */}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[#1E293B]">
                {engine.name}
              </p>
              <ul className="mt-2 space-y-1">
                {engine.specs.map((spec) => (
                  <li
                    key={spec.label}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="text-[#64748B]">{spec.label}</span>
                    <span className="font-medium text-[#1E293B]">{spec.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          </button>
        );
      })}
    </div>
  );
}
