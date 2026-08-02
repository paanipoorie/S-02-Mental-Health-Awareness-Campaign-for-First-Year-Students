export const CATEGORY_MAP: Record<string, string> = {
  ACADEMICS: 'Academics',
  HOSTEL: 'Hostel',
  HOMESICKNESS: 'Homesickness',
  FRIENDS: 'Friends',
  RELATIONSHIPS: 'Relationships',
  TIME_MANAGEMENT: 'Time Management',
  EXAMS: 'Exams',
  SLEEP: 'Sleep',
  CLUBS: 'Clubs',
  FINANCIAL: 'Financial',
  GENERAL: 'General',
};

export function getCategoryLabel(category: string): string {
  if (!category) return 'General';
  return CATEGORY_MAP[category] || category.charAt(0).toUpperCase() + category.slice(1).toLowerCase().replace(/_/g, ' ');
}
