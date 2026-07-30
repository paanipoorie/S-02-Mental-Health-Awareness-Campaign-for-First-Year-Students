import type { ResourceCategory } from '@campus-peer-support/shared-types/enums';

interface ResourceCategoryBadgeProps {
  category: ResourceCategory;
  size?: 'sm' | 'md' | 'lg';
}

export function ResourceCategoryBadge({ category, size = 'md' }: ResourceCategoryBadgeProps) {
  const categoryConfig: Record<ResourceCategory, { label: string; color: string }> = {
    COUNSELING_CENTER: {
      label: 'Counseling Center',
      color: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    EMERGENCY_CONTACTS: {
      label: 'Emergency Contacts',
      color: 'bg-red-50 text-red-700 border-red-200',
    },
    FACULTY_ADVISORS: {
      label: 'Faculty Advisors',
      color: 'bg-purple-50 text-purple-700 border-purple-200',
    },
    STUDENT_WELFARE: {
      label: 'Student Welfare',
      color: 'bg-green-50 text-green-700 border-green-200',
    },
    CAMPUS_CLUBS: {
      label: 'Campus Clubs',
      color: 'bg-orange-50 text-orange-700 border-orange-200',
    },
    SELF_HELP_PDFS: {
      label: 'Self-Help PDFs',
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
    STRESS_MANAGEMENT: {
      label: 'Stress Management',
      color: 'bg-teal-50 text-teal-700 border-teal-200',
    },
    SLEEP_HYGIENE: {
      label: 'Sleep Hygiene',
      color: 'bg-pink-50 text-pink-700 border-pink-200',
    },
    EXTERNAL_HELPLINES: {
      label: 'External Helplines',
      color: 'bg-gray-50 text-gray-700 border-gray-200',
    },
  };

  const config = categoryConfig[category] || {
    label: category.replace(/_/g, ' '),
    color: 'bg-gray-50 text-gray-700 border-gray-200',
  };

  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2 py-1 text-sm',
    lg: 'px-2.5 py-1.5 text-base',
  };

  return (
    <span
      className={`inline-flex items-center rounded-sm border font-semibold ${sizeClasses[size]} ${config.color}`}
    >
      {config.label}
    </span>
  );
}
