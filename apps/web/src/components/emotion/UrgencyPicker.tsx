import { URGENCY_LEVELS } from '@lib/emotionConstants';
import type { UrgencyLevel } from '@lib/emotionConstants';
import { ChevronDown, Minus, ChevronUp } from 'lucide-react';

interface UrgencyPickerProps {
  selectedUrgency?: UrgencyLevel;
  onSelect: (urgency: UrgencyLevel) => void;
  className?: string;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LOW: ChevronDown,
  MEDIUM: Minus,
  HIGH: ChevronUp,
};

export function UrgencyPicker({ selectedUrgency, onSelect, className = '' }: UrgencyPickerProps) {
  return (
    <div className={`grid grid-cols-3 gap-2 ${className}`}>
      {URGENCY_LEVELS.map(({ level, label }) => {
        const isSelected = selectedUrgency === level;
        const Icon = iconMap[level] || Minus;
        return (
          <button
            key={level}
            type="button"
            className={`flex items-center justify-center gap-2 rounded-sm border p-2.5 text-xs font-medium transition-colors ${
              isSelected
                ? 'border-gray-900 bg-gray-100 text-gray-900'
                : 'bg-background-100 border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => onSelect(level)}
            aria-label={label}
            aria-pressed={isSelected}
          >
            <Icon className={`h-4 w-4 ${isSelected ? 'text-gray-900' : 'text-gray-500'}`} />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
