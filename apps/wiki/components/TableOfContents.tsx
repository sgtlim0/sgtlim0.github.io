'use client';

import { useEffect, useState } from 'react';
import type { Heading } from '@/lib/headings';

interface TableOfContentsProps {
  headings: Heading[];
}

export default function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: '-80px 0px -80% 0px' }
    );

    for (const heading of headings) {
      const el = document.getElementById(heading.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav className="space-y-2">
      <p className="text-[12px] font-semibold text-text-tertiary tracking-wide uppercase">
        목차
      </p>
      {headings.map((heading) => (
        <a
          key={heading.id}
          href={`#${heading.id}`}
          className={`block text-[13px] transition-colors ${
            heading.level === 3 ? 'pl-3' : ''
          } ${
            activeId === heading.id
              ? 'text-primary font-medium'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          {heading.text}
        </a>
      ))}
    </nav>
  );
}
