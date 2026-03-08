import Link from 'next/link';
import type { ComponentType } from 'react';

export interface NavItemProps {
  title: string;
  href: string;
  icon?: ComponentType<{ className?: string }>;
  active?: boolean;
}

export default function NavItem({ title, href, icon: Icon, active = false }: NavItemProps) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
        active
          ? 'bg-primary-light text-primary font-medium'
          : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
      }`}
    >
      {Icon && <Icon className="w-4 h-4 shrink-0" />}
      <span>{title}</span>
    </Link>
  );
}
