import { Search } from 'lucide-react';

export interface SearchBarProps {
  placeholder?: string;
  shortcut?: string;
}

export default function SearchBar({ placeholder = '문서 검색...', shortcut = '\u2318K' }: SearchBarProps) {
  return (
    <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-[10px] bg-bg-card border border-border text-text-tertiary">
      <Search className="w-4 h-4 shrink-0" />
      <span className="text-sm flex-1">{placeholder}</span>
      <kbd className="text-xs font-medium">{shortcut}</kbd>
    </div>
  );
}
