import type { PostCategory } from '@shared-types/enums';

const CATEGORIES = [
  { value: 'ACADEMICS', label: 'Academics', icon: '📚' },
  { value: 'HOSTEL', label: 'Hostel', icon: '🏠' },
  { value: 'HOMESICKNESS', label: 'Homesickness', icon: '🏡' },
  { value: 'FRIENDS', label: 'Friends', icon: '👯' },
  { value: 'RELATIONSHIPS', label: 'Relationships', icon: '💕' },
  { value: 'TIME_MANAGEMENT', label: 'Time Management', icon: '⏰' },
  { value: 'EXAMS', label: 'Exams', icon: '📝' },
  { value: 'SLEEP', label: 'Sleep', icon: '😴' },
  { value: 'CLUBS', label: 'Clubs', icon: '🎭' },
  { value: 'FINANCIAL', label: 'Financial', icon: '💸' },
  { value: 'GENERAL', label: 'General', icon: '📌' },
] as const;

interface CategoryPickerProps {
  selectedCategory?: PostCategory;
  onSelect: (category: PostCategory) => void;
  className?: string;
}

export function CategoryPicker({
  selectedCategory,
  onSelect,
  className = '',
}: CategoryPickerProps) {
  return (
    <div className={`w-full ${className}`}>
      <select
        value={selectedCategory || ''}
        onChange={e => onSelect(e.target.value as PostCategory)}
        className="rounded-sm border border-gray-200 bg-background-100 px-3.5 py-2 text-copy-14 text-gray-900 outline-none focus:border-gray-900 transition-colors cursor-pointer w-full"
        aria-label="Post category"
      >
        <option value="">Select a category</option>
        {CATEGORIES.map(({ value, label, icon }) => (
          <option key={value} value={value}>
            {icon} {label}
          </option>
        ))}
      </select>
    </div>
  );
}
