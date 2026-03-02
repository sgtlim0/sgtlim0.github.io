import type { ComponentType, ReactNode } from 'react';

export interface FeatureCardProps {
  title: string;
  description: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  iconColor?: string;
  iconBg?: string;
  linkComponent?: ComponentType<{ href: string; className: string; children: ReactNode }>;
}

export default function FeatureCard({
  title,
  description,
  href,
  icon: Icon,
  iconColor = 'text-primary',
  iconBg = 'bg-primary-light',
  linkComponent: LinkComponent,
}: FeatureCardProps) {
  const className = "flex flex-col gap-3 p-6 rounded-xl bg-bg-card border border-border hover:border-primary/30 hover:shadow-sm transition-all";

  const content = (
    <>
      <div className={`w-10 h-10 rounded-[10px] ${iconBg} flex items-center justify-center`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <h3 className="text-base font-semibold text-text-primary">{title}</h3>
      <p className="text-sm text-text-secondary leading-relaxed">{description}</p>
    </>
  );

  if (LinkComponent) {
    return <LinkComponent href={href} className={className}>{content}</LinkComponent>;
  }

  return <a href={href} className={className}>{content}</a>;
}
