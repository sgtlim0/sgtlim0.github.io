'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css';

// Only register languages actually used in wiki content
// Default 'common' set includes ~40 languages; this subset cuts ~60% of highlight bundle
import type { LanguageFn } from 'highlight.js';
import typescript from 'highlight.js/lib/languages/typescript';
import javascript from 'highlight.js/lib/languages/javascript';
import bash from 'highlight.js/lib/languages/bash';
import css from 'highlight.js/lib/languages/css';
import json from 'highlight.js/lib/languages/json';
import xml from 'highlight.js/lib/languages/xml';
import markdown from 'highlight.js/lib/languages/markdown';
import yaml from 'highlight.js/lib/languages/yaml';
import python from 'highlight.js/lib/languages/python';

const wikiLanguages: Record<string, LanguageFn> = {
  typescript,
  javascript,
  bash,
  css,
  json,
  xml,
  markdown,
  yaml,
  python,
};

interface MarkdownRendererProps {
  content: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeHighlight, { languages: wikiLanguages }]]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-4xl font-bold mt-8 mb-4 text-text-primary">
              {children}
            </h1>
          ),
          h2: ({ children }) => {
            const text = typeof children === 'string' ? children : String(children);
            const id = slugify(text);
            return (
              <h2 id={id} className="text-[22px] font-bold mt-10 mb-4 text-text-primary scroll-mt-6">
                {children}
              </h2>
            );
          },
          h3: ({ children }) => {
            const text = typeof children === 'string' ? children : String(children);
            const id = slugify(text);
            return (
              <h3 id={id} className="text-lg font-semibold mt-6 mb-3 text-text-primary scroll-mt-6">
                {children}
              </h3>
            );
          },
          h4: ({ children }) => (
            <h4 className="text-base font-semibold mt-4 mb-2 text-text-primary">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="text-[15px] text-text-secondary leading-7 mb-4">{children}</p>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              className="text-primary hover:text-primary-hover underline"
            >
              {children}
            </a>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside mb-4 space-y-2 text-[15px] text-text-secondary">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside mb-4 space-y-2 text-[15px] text-text-secondary">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-7">{children}</li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary pl-4 py-2 mb-4 text-text-secondary italic bg-primary-light/50 rounded-r-lg">
              {children}
            </blockquote>
          ),
          code: ({ className, children }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="bg-bg-code text-primary px-1.5 py-0.5 rounded text-sm font-mono">
                  {children}
                </code>
              );
            }
            return (
              <code className={className}>
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="bg-bg-code rounded-lg p-4 mb-4 overflow-x-auto border border-border">
              {children}
            </pre>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full divide-y divide-border border border-border rounded-lg overflow-hidden">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-bg-card">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="px-4 py-2.5 text-left text-sm font-semibold text-text-primary border-r border-border last:border-r-0">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-2.5 text-sm text-text-secondary border-r border-border last:border-r-0">
              {children}
            </td>
          ),
          hr: () => <hr className="my-8 border-border" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
