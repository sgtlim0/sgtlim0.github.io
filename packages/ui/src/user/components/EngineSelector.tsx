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
    <div className="flex flex-col md:flex-row gap-4">
      {engines.map((engine) => {
        const isSelected = selectedEngine === engine.key;

        return (
          <button
            key={engine.key}
            type="button"
            onClick={() => onSelect(engine.key)}
            className={[
              'flex items-start gap-3 rounded-xl border-2 p-5 text-left transition-colors flex-1',
              isSelected
                ? 'border-user-primary bg-user-primary-light/30'
                : 'border-user-border bg-user-bg hover:border-user-primary/40',
            ].join(' ')}
          >
            {/* Radio indicator */}
            <div
              className={[
                'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                isSelected
                  ? 'border-user-primary'
                  : 'border-user-border',
              ].join(' ')}
            >
              {isSelected && (
                <div className="h-2.5 w-2.5 rounded-full bg-user-primary" />
              )}
            </div>

            {/* Engine info */}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-user-text-primary">
                {engine.name}
              </p>
              <ul className="mt-2 space-y-1">
                {engine.specs.map((spec) => (
                  <li
                    key={spec.label}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="text-user-text-secondary">{spec.label}</span>
                    <span className="font-medium text-user-text-primary">{spec.value}</span>
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
