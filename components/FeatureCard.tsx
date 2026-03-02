import Link from 'next/link';
import type { ComponentType } from 'react';

export interface FeatureCardProps {
  title: string;
  description: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  iconColor?: string;
  iconBg?: string;
}

export default function FeatureCard({
  title,
  description,
  href,
  icon: Icon,
  iconColor = 'text-primary',
  iconBg = 'bg-primary-light',
}: FeatureCardProps) {
  return (
    <Link
      href={href}
      className="flex flex-col gap-3 p-6 rounded-xl bg-bg-card border border-border hover:border-primary/30 hover:shadow-sm transition-all"
    >
      <div className={`w-10 h-10 rounded-[10px] ${iconBg} flex items-center justify-center`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <h3 className="text-base font-semibold text-text-primary">{title}</h3>
      <p className="text-sm text-text-secondary leading-relaxed">{description}</p>
    </Link>
  );
}
