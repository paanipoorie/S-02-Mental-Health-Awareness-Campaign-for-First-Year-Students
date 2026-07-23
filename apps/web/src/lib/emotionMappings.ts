export interface EmotionMapping {
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export const EMOTION_MAPPINGS: Record<string, EmotionMapping> = {
  HAPPY: {
    label: 'Happy',
    icon: '😊',
    color: '#16a34a',
    bgColor: '#dcfce7',
    borderColor: '#86efac',
  },
  EXCITED: {
    label: 'Excited',
    icon: '🤩',
    color: '#ea580c',
    bgColor: '#ffedd5',
    borderColor: '#fdba74',
  },
  CONFUSED: {
    label: 'Confused',
    icon: '😕',
    color: '#7c3aed',
    bgColor: '#ede9fe',
    borderColor: '#c4b5fd',
  },
  HOMESICK: {
    label: 'Homesick',
    icon: '🏠',
    color: '#2563eb',
    bgColor: '#dbeafe',
    borderColor: '#93c5fd',
  },
  LONELY: {
    label: 'Lonely',
    icon: '😔',
    color: '#0891b2',
    bgColor: '#cffafe',
    borderColor: '#67e8f9',
  },
  SCARED: {
    label: 'Scared',
    icon: '😨',
    color: '#dc2626',
    bgColor: '#fee2e2',
    borderColor: '#fca5a5',
  },
  ANXIOUS: {
    label: 'Anxious',
    icon: '😰',
    color: '#db2777',
    bgColor: '#fce7f3',
    borderColor: '#f9a8d4',
  },
  BURNT_OUT: {
    label: 'Burnt Out',
    icon: '😮‍💨',
    color: '#991b1b',
    bgColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  OVERWHELMED: {
    label: 'Overwhelmed',
    icon: '😵‍💫',
    color: '#7c2d12',
    bgColor: '#fff7ed',
    borderColor: '#fed7aa',
  },
  STRESSED: {
    label: 'Stressed',
    icon: '😫',
    color: '#92400e',
    bgColor: '#fef9c3',
    borderColor: '#fde047',
  },
};

export function getEmotionMapping(emotion: string): EmotionMapping {
  return (
    EMOTION_MAPPINGS[emotion] || {
      label: emotion,
      icon: '❓',
      color: '#6b7280',
      bgColor: '#f3f4f6',
      borderColor: '#d1d5db',
    }
  );
}

export interface UrgencyMapping {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export const URGENCY_MAPPINGS: Record<string, UrgencyMapping> = {
  LOW: {
    label: 'Low',
    color: '#16a34a',
    bgColor: '#dcfce7',
    borderColor: '#86efac',
  },
  MEDIUM: {
    label: 'Medium',
    color: '#ea580c',
    bgColor: '#ffedd5',
    borderColor: '#fdba74',
  },
  HIGH: {
    label: 'High',
    color: '#dc2626',
    bgColor: '#fee2e2',
    borderColor: '#fca5a5',
  },
};

export function getUrgencyMapping(urgency: string): UrgencyMapping {
  return (
    URGENCY_MAPPINGS[urgency] || {
      label: urgency,
      color: '#6b7280',
      bgColor: '#f3f4f6',
      borderColor: '#d1d5db',
    }
  );
}
