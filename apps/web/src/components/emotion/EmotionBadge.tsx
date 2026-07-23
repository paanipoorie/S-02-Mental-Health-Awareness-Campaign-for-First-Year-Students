import { EMOTIONS, URGENCY_LEVELS } from '@lib/emotionConstants';
import type { EmotionType, UrgencyLevel } from '@lib/emotionConstants';

interface EmotionBadgeProps {
  emotion: EmotionType | null;
  urgency?: UrgencyLevel | null;
  size?: 'sm' | 'md' | 'lg';
  showUrgency?: boolean;
  className?: string;
}

export function EmotionBadge({
  emotion,
  urgency,
  size = 'md',
  showUrgency = true,
  className = '',
}: EmotionBadgeProps) {
  if (!emotion) return null;

  const emotionConfig = EMOTIONS.find(e => e.type === emotion) || EMOTIONS[0];
  const urgencyConfig = urgency
    ? URGENCY_LEVELS.find(u => u.level === urgency) || URGENCY_LEVELS[0]
    : null;

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <div className={`emotion-badge ${className}`}>
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border-2 font-medium ${sizeClasses[size]}`}
        style={{
          background: emotionConfig.bg,
          borderColor: emotionConfig.border,
          color: emotionConfig.color,
        }}
      >
        <span>{emotionConfig.emoji}</span>
        <span>{emotionConfig.label}</span>
      </span>

      {showUrgency && urgencyConfig && (
        <span
          className={`ml-2 inline-flex items-center gap-1 rounded-full border-2 font-medium ${sizeClasses[size]}`}
          style={{
            background: urgencyConfig.bg,
            borderColor: urgencyConfig.color,
            color: urgencyConfig.color,
          }}
        >
          <span>{urgencyConfig.icon}</span>
          <span>{urgencyConfig.label}</span>
        </span>
      )}

      <style jsx>{`
        .emotion-badge {
          display: inline-flex;
          align-items: center;
          white-space: nowrap;
        }
      `}</style>
    </div>
  );
}
