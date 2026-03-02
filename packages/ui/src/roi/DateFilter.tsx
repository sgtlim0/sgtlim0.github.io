'use client';

export interface DateFilterProps {
  value: string;
  onChange: (value: string) => void;
}

const dateOptions = ['2026.02', '2026.01', '2025.12', '2025.11', '2025.10', '2025.09'];

export default function DateFilter({ value, onChange }: DateFilterProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label="기간 선택"
      className="px-3 py-2 text-xs rounded-lg border border-[var(--roi-divider)] bg-[var(--roi-card-bg)] text-[var(--roi-text-secondary)] appearance-none cursor-pointer pr-7 bg-no-repeat bg-[right_8px_center] bg-[length:10px]"
      style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23888'/%3E%3C/svg%3E\")" }}
    >
      {dateOptions.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  );
}
