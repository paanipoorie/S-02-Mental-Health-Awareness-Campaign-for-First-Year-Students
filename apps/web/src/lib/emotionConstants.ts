export const EMOTIONS = [
  {
    type: 'HAPPY' as const,
    label: 'Happy',
    lucideIcon: 'Smile',
  },
  {
    type: 'EXCITED' as const,
    label: 'Excited',
    lucideIcon: 'Sparkles',
  },
  {
    type: 'CONFUSED' as const,
    label: 'Confused',
    lucideIcon: 'HelpCircle',
  },
  {
    type: 'HOMESICK' as const,
    label: 'Homesick',
    lucideIcon: 'Home',
  },
  {
    type: 'LONELY' as const,
    label: 'Lonely',
    lucideIcon: 'Frown',
  },
  {
    type: 'SCARED' as const,
    label: 'Scared',
    lucideIcon: 'AlertTriangle',
  },
  {
    type: 'ANXIOUS' as const,
    label: 'Anxious',
    lucideIcon: 'AlertCircle',
  },
  {
    type: 'BURNT_OUT' as const,
    label: 'Burnt Out',
    lucideIcon: 'BatteryLow',
  },
  {
    type: 'OVERWHELMED' as const,
    label: 'Overwhelmed',
    lucideIcon: 'Brain',
  },
  {
    type: 'STRESSED' as const,
    label: 'Stressed',
    lucideIcon: 'Zap',
  },
] as const;

export const URGENCY_LEVELS = [
  { level: 'LOW' as const, label: 'Low', lucideIcon: 'ChevronDown' },
  { level: 'MEDIUM' as const, label: 'Medium', lucideIcon: 'Minus' },
  { level: 'HIGH' as const, label: 'High', lucideIcon: 'ChevronUp' },
] as const;

export function getEmotionConfig(type: (typeof EMOTIONS)[number]['type']) {
  return EMOTIONS.find(e => e.type === type) || EMOTIONS[0];
}

export function getUrgencyConfig(level: (typeof URGENCY_LEVELS)[number]['level']) {
  return URGENCY_LEVELS.find(u => u.level === level) || URGENCY_LEVELS[0];
}

export type EmotionType = (typeof EMOTIONS)[number]['type'];
export type UrgencyLevel = (typeof URGENCY_LEVELS)[number]['level'];
