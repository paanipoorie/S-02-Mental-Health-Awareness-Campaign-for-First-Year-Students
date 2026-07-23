export const EMOTIONS = [
  { type: 'HAPPY' as const, label: 'Happy', emoji: '😊', color: '#22c55e', bg: '#dcfce7', border: '#86efac' },
  { type: 'EXCITED' as const, label: 'Excited', emoji: '🤩', color: '#f97316', bg: '#ffedd5', border: '#fdba74' },
  { type: 'CONFUSED' as const, label: 'Confused', emoji: '😕', color: '#8b5cf6', bg: '#f3e8ff', border: '#d8b4fe' },
  { type: 'HOMESICK' as const, label: 'Homesick', emoji: '🏠', color: '#ec4899', bg: '#fce7f3', border: '#fbcfe8' },
  { type: 'LONELY' as const, label: 'Lonely', emoji: '😔', color: '#6366f1', bg: '#e0e7ff', border: '#c7d2fe' },
  { type: 'SCARED' as const, label: 'Scared', emoji: '😨', color: '#ef4444', bg: '#fee2e2', border: '#fecaca' },
  { type: 'ANXIOUS' as const, label: 'Anxious', emoji: '😰', color: '#f59e0b', bg: '#fef3c7', border: '#fde68a' },
  { type: 'BURNT_OUT' as const, label: 'Burnt Out', emoji: '😩', color: '#78716c', bg: '#f5f5f4', border: '#d6d3d1' },
  { type: 'OVERWHELMED' as const, label: 'Overwhelmed', emoji: '🤯', color: '#dc2626', bg: '#fee2e2', border: '#fecaca' },
  { type: 'STRESSED' as const, label: 'Stressed', emoji: '😤', color: '#ea580c', bg: '#ffedd5', border: '#fdba74' },
] as const;

export const URGENCY_LEVELS = [
  { level: 'LOW' as const, label: 'Low', color: '#22c55e', bg: '#dcfce7', icon: '🟢' },
  { level: 'MEDIUM' as const, label: 'Medium', color: '#f59e0b', bg: '#fef3c7', icon: '🟡' },
  { level: 'HIGH' as const, label: 'High', color: '#ef4444', bg: '#fee2e2', icon: '🔴' },
] as const;

export function getEmotionConfig(type: typeof EMOTIONS[number]['type']) {
  return EMOTIONS.find((e) => e.type === type) || EMOTIONS[0];
}

export function getUrgencyConfig(level: typeof URGENCY_LEVELS[number]['level']) {
  return URGENCY_LEVELS.find((u) => u.level === level) || URGENCY_LEVELS[0];
}

export type EmotionType = typeof EMOTIONS[number]['type'];
export type UrgencyLevel = typeof URGENCY_LEVELS[number]['level'];