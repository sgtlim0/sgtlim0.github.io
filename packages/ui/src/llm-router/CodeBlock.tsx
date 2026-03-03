'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export interface CodeBlockProps {
  examples: {
    language: string;
    code: string;
  }[];
}

export default function CodeBlock({ examples }: CodeBlockProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(examples[activeTab].code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg border border-lr-border bg-lr-bg-section overflow-hidden">
      <div className="flex items-center justify-between border-b border-lr-border bg-lr-bg-code">
        <div role="tablist" aria-label="코드 언어 선택" className="flex">
          {examples.map((example, index) => (
            <button
              key={index}
              role="tab"
              aria-selected={activeTab === index}
              onClick={() => setActiveTab(index)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === index
                  ? 'text-white bg-lr-bg-code border-b-2 border-lr-primary'
                  : 'text-lr-text-muted hover:text-white'
              }`}
            >
              {example.language}
            </button>
          ))}
        </div>
        <button
          onClick={handleCopy}
          className="px-4 py-2 text-lr-text-muted hover:text-white transition-colors"
          aria-label="코드 복사"
        >
          {copied ? (
            <Check className="w-4 h-4" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      </div>
      <div className="bg-lr-bg-code p-4 overflow-x-auto">
        <pre className="text-sm text-gray-300">
          <code>{examples[activeTab].code}</code>
        </pre>
      </div>
    </div>
  );
}
