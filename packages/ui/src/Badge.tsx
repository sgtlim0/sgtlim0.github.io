export interface BadgeProps {
  label: string;
}

export default function Badge({ label }: BadgeProps) {
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-primary-light text-primary text-xs font-semibold">
      {label}
    </span>
  );
}
