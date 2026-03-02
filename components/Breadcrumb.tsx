'use client';

import Link from 'next/link';

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-1.5 text-[13px]">
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-text-tertiary">/</span>}
            {isLast ? (
              <span className="text-text-primary font-medium">{item.label}</span>
            ) : item.href === '#' ? (
              <span className="text-text-tertiary">{item.label}</span>
            ) : (
              <Link href={item.href} className="text-text-tertiary hover:text-text-secondary transition-colors">
                {item.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
