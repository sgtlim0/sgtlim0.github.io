'use client';

export interface SettingsRowProps {
  label: string;
  description?: string;
  enabled?: boolean;
  onToggle?: (enabled: boolean) => void;
  onEdit?: () => void;
}

export default function SettingsRow({
  label,
  description,
  enabled = true,
  onToggle,
  onEdit,
}: SettingsRowProps) {
  return (
    <div className="flex items-center justify-between py-3 px-4 border-b border-border-light">
      <div className="flex items-center gap-3">
        <button
          onClick={() => onToggle?.(!enabled)}
          className={`relative w-11 h-6 rounded-full transition-colors ${
            enabled ? 'bg-admin-teal' : 'bg-bg-hover'
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
              enabled ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
        <span className="text-sm font-medium text-text-primary">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {description && (
          <span className="text-xs text-text-tertiary">{description}</span>
        )}
        {onEdit && (
          <button
            onClick={onEdit}
            className="text-xs text-text-secondary px-3 py-1 rounded border border-border hover:bg-bg-hover transition-colors"
          >
            수정
          </button>
        )}
      </div>
    </div>
  );
}
