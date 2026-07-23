import { ResourceCategory } from '@campus-peer-support/shared-types/enums';

interface ResourceCategoryBadgeProps {
  category: ResourceCategory;
  size?: 'sm' | 'md' | 'lg';
}

export function ResourceCategoryBadge({ category, size = 'md' }: ResourceCategoryBadgeProps) {
  const categoryConfig: Record<ResourceCategory, { label: string; color: string }> = {
    COUNSELING_CENTER: { label: 'Counseling Center', color: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800' },
    EMERGENCY_CONTACTS: { label: 'Emergency Contacts', color: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800' },
    FACULTY_ADVISORS: { label: 'Faculty Advisors', color: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800' },
    STUDENT_WELFARE: { label: 'Student Welfare', color: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' },
    CAMPUS_CLUBS: { label: 'Campus Clubs', color: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800' },
    SELF_HELP_PDFS: { label: 'Self-Help PDFs', color: 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800' },
    STRESS_MANAGEMENT: { label: 'Stress Management', color: 'bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-400 dark:border-teal-800' },
    SLEEP_HYGIENE: { label: 'Sleep Hygiene', color: 'bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/30 dark:text-pink-400 dark:border-pink-800' },
    EXTERNAL_HELPLINES: { label: 'External Helplines', color: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700' },
  };

  const config = categoryConfig[category] || { label: category.replace(/_/g, ' '), color: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700' };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  return (
    <span className={`inline-flex items-center rounded-full font-medium border ${sizeClasses[size]} ${config.color}`}>
      {config.label}
    </span>
  );
}