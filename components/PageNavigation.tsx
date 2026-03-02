'use client';

import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PageLink {
  slug: string;
  title: string;
}

interface PageNavigationProps {
  prev: PageLink | null;
  next: PageLink | null;
}

function slugToHref(slug: string): string {
  return slug === 'home' ? '/' : `/${slug}`;
}

export default function PageNavigation({ prev, next }: PageNavigationProps) {
  if (!prev && !next) return null;

  return (
    <div className="flex gap-4 mt-12 pt-8 border-t border-border">
      {prev ? (
        <Link
          href={slugToHref(prev.slug)}
          className="flex-1 group flex items-center gap-3 p-4 rounded-lg border border-border hover:border-primary/30 hover:bg-primary-light/50 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-text-tertiary group-hover:text-primary transition-colors" />
          <div>
            <p className="text-[11px] font-medium text-text-tertiary">이전</p>
            <p className="text-[13px] font-medium text-primary">{prev.title}</p>
          </div>
        </Link>
      ) : (
        <div className="flex-1" />
      )}
      {next ? (
        <Link
          href={slugToHref(next.slug)}
          className="flex-1 group flex items-center justify-end gap-3 p-4 rounded-lg border border-border hover:border-primary/30 hover:bg-primary-light/50 transition-colors text-right"
        >
          <div>
            <p className="text-[11px] font-medium text-text-tertiary">다음</p>
            <p className="text-[13px] font-medium text-primary">{next.title}</p>
          </div>
          <ChevronRight className="w-4 h-4 text-text-tertiary group-hover:text-primary transition-colors" />
        </Link>
      ) : (
        <div className="flex-1" />
      )}
    </div>
  );
}
