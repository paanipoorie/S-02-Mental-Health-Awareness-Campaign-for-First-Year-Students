export interface EmotionMapping {
  label: string;
  lucideIcon: string;
}

export const EMOTION_MAPPINGS: Record<string, EmotionMapping> = {
  HAPPY: { label: 'Happy', lucideIcon: 'Smile' },
  EXCITED: { label: 'Excited', lucideIcon: 'Sparkles' },
  CONFUSED: { label: 'Confused', lucideIcon: 'HelpCircle' },
  HOMESICK: { label: 'Homesick', lucideIcon: 'Home' },
  LONELY: { label: 'Lonely', lucideIcon: 'Frown' },
  SCARED: { label: 'Scared', lucideIcon: 'AlertTriangle' },
  ANXIOUS: { label: 'Anxious', lucideIcon: 'AlertCircle' },
  BURNT_OUT: { label: 'Burnt Out', lucideIcon: 'BatteryLow' },
  OVERWHELMED: { label: 'Overwhelmed', lucideIcon: 'Brain' },
  STRESSED: { label: 'Stressed', lucideIcon: 'Zap' },
};

export function getEmotionMapping(emotion: string): EmotionMapping {
  return (
    EMOTION_MAPPINGS[emotion] || {
      label: emotion,
      lucideIcon: 'HelpCircle',
    }
  );
}

export interface UrgencyMapping {
  label: string;
}

export const URGENCY_MAPPINGS: Record<string, UrgencyMapping> = {
  LOW: { label: 'Low' },
  MEDIUM: { label: 'Medium' },
  HIGH: { label: 'High' },
};

export function getUrgencyMapping(urgency: string): UrgencyMapping {
  return (
    URGENCY_MAPPINGS[urgency] || {
      label: urgency,
    }
  );
}
