import { getEmotionConfig } from '@lib/emotionConstants';
import { getUrgencyConfig } from '@lib/emotionConstants';
import { Smile, Sparkles, HelpCircle, Home, Frown, AlertTriangle, AlertCircle, BatteryLow, Brain, Zap, ChevronDown, Minus, ChevronUp } from 'lucide-react';
import type { EmotionType, UrgencyLevel } from '@lib/emotionConstants';

interface EmotionBadgeProps {
  emotion: EmotionType | null;
  urgency?: UrgencyLevel | null;
  size?: 'sm' | 'md' | 'lg';
  showUrgency?: boolean;
  className?: string;
}

const emotionIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
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

const urgencyIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LOW: ChevronDown,
  MEDIUM: Minus,
  HIGH: ChevronUp,
};

export function EmotionBadge({
  emotion,
  urgency,
  size = 'md',
  showUrgency = true,
  className = '',
}: EmotionBadgeProps) {
  if (!emotion) return null;

  const emotionConfig = getEmotionConfig(emotion);
  const urgencyConfig = urgency ? getUrgencyConfig(urgency) : null;

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  const EmotionIcon = emotionIconMap[emotion] || HelpCircle;
  const UrgencyIcon = urgencyConfig ? urgencyIconMap[urgencyConfig.level] || Minus : null;

  return (
    <span className={`inline-flex items-center gap-1.5 ${sizeClasses[size]} font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-sm ${className}`}>
      <EmotionIcon className="h-3.5 w-3.5 text-gray-600" />
      <span>{emotionConfig.label}</span>
      {showUrgency && urgencyConfig && UrgencyIcon && (
        <>
          <span className="text-gray-300 mx-0.5">·</span>
          <UrgencyIcon className="h-3 w-3 text-gray-500" />
          <span className="text-gray-500">{urgencyConfig.label}</span>
        </>
      )}
    </span>
  );
}
