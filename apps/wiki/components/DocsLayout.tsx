'use client';

import { useMemo, useState, useEffect } from 'react';
import type { PageData } from '@/lib/markdown';
import { getHeadings } from '@/lib/headings';
import { getBreadcrumbs, getPrevNext } from '@/lib/navigation';
import { ProgressBar } from '@hchat/ui';
import Badge from './Badge';
import Breadcrumb from './Breadcrumb';
import TableOfContents from './TableOfContents';
import PageNavigation from './PageNavigation';
import MarkdownRenderer from './MarkdownRenderer';

interface DocsLayoutProps {
  page: PageData;
}

export default function DocsLayout({ page }: DocsLayoutProps) {
  const breadcrumbs = useMemo(() => getBreadcrumbs(page.slug), [page.slug]);
  const headings = useMemo(() => getHeadings(page.content), [page.content]);
  const { prev, next } = useMemo(() => getPrevNext(page.slug), [page.slug]);

  // Page loading progress indicator
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    setIsLoading(true);
    const id = requestAnimationFrame(() => setIsLoading(false));
    return () => cancelAnimationFrame(id);
  }, [page.slug]);

  return (
    <div className="flex h-full">
      {isLoading && (
        <div className="absolute top-0 left-0 right-0 z-10">
          <ProgressBar value={0} indeterminate size="sm" />
        </div>
      )}
      {/* Doc Content */}
      <div className="flex-1 overflow-y-auto px-16 py-10">
        <div className="max-w-3xl">
          <Breadcrumb items={breadcrumbs} />

          <div className="mt-6 mb-3">
            {page.badges && page.badges.length > 0 && (
              <div className="flex gap-2 mb-3">
                {page.badges.map((badge) => (
                  <Badge key={badge} label={badge} />
                ))}
              </div>
            )}
            <h1 className="text-[32px] font-extrabold text-text-primary">{page.title}</h1>
            {page.description && (
              <p className="text-base text-text-secondary leading-relaxed mt-3">
                {page.description}
              </p>
            )}
          </div>

          <hr className="border-border my-6" />

          <MarkdownRenderer content={page.content} />

          <PageNavigation prev={prev} next={next} />
        </div>
      </div>

      {/* TOC Sidebar */}
      {headings.length > 0 && (
        <aside className="w-[220px] shrink-0 border-l border-border-light overflow-y-auto px-5 py-10">
          <TableOfContents headings={headings} />

          {(prev || next) && (
            <>
              <hr className="border-border my-4" />
              {prev && (
                <div className="mb-3">
                  <p className="text-[11px] font-medium text-text-tertiary">이전</p>
                  <a href={prev.slug === 'home' ? '/' : `/${prev.slug}`} className="text-[13px] font-medium text-primary hover:underline">
                    &larr; {prev.title}
                  </a>
                </div>
              )}
              {next && (
                <div>
                  <p className="text-[11px] font-medium text-text-tertiary">다음</p>
                  <a href={`/${next.slug}`} className="text-[13px] font-medium text-primary hover:underline">
                    {next.title} &rarr;
                  </a>
                </div>
              )}
            </>
          )}
        </aside>
      )}
    </div>
  );
}
