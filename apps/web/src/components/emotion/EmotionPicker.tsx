import { EMOTIONS } from '@lib/emotionConstants';
import type { EmotionType } from '@lib/emotionConstants';
import { Smile, Sparkles, HelpCircle, Home, Frown, AlertTriangle, AlertCircle, BatteryLow, Brain, Zap } from 'lucide-react';

interface EmotionPickerProps {
  selectedEmotion?: EmotionType;
  onSelect: (emotion: EmotionType) => void;
  className?: string;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  HAPPY: Smile,
  EXCITED: Sparkles,
  CONFUSED: HelpCircle,
  HOMESICK: Home,
  LONELY: Frown,
  SCARED: AlertTriangle,
  ANXIOUS: AlertCircle,
  BURNT_OUT: BatteryLow,
  OVERWHELMED: Brain,
  STRESSED: Zap,
};

export function EmotionPicker({ selectedEmotion, onSelect, className = '' }: EmotionPickerProps) {
  return (
    <div className={`grid grid-cols-2 sm:grid-cols-5 gap-2 ${className}`}>
      {EMOTIONS.map(({ type, label, lucideIcon }) => {
        const isSelected = selectedEmotion === type;
        const Icon = iconMap[type] || HelpCircle;
        return (
          <button
            key={type}
            type="button"
            className={`flex flex-col items-center gap-1.5 p-3 rounded-sm border text-xs font-medium transition-colors ${
              isSelected
                ? 'border-gray-900 bg-gray-100 text-gray-900'
                : 'border-gray-200 bg-background-100 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
            }`}
            onClick={() => onSelect(type)}
            aria-label={label}
            aria-pressed={isSelected}
          >
            <Icon className={`h-5 w-5 ${isSelected ? 'text-gray-900' : 'text-gray-500'}`} />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
