import { ChevronDown } from 'lucide-react';

export interface NavGroupHeaderProps {
  title: string;
  isOpen: boolean;
  onToggle?: () => void;
}

export default function NavGroupHeader({ title, isOpen, onToggle }: NavGroupHeaderProps) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-2 px-3 py-2 w-full text-left text-[13px] font-semibold text-text-primary tracking-wide"
    >
      <ChevronDown
        className={`w-3.5 h-3.5 text-text-tertiary transition-transform ${
          isOpen ? '' : '-rotate-90'
        }`}
      />
      <span>{title}</span>
    </button>
  );
}
