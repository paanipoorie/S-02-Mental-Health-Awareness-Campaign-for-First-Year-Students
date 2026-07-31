import type { PostCategory } from '@shared-types/enums';

const CATEGORIES = [
  { value: 'ACADEMICS', label: 'Academics' },
  { value: 'HOSTEL', label: 'Hostel' },
  { value: 'HOMESICKNESS', label: 'Homesickness' },
  { value: 'FRIENDS', label: 'Friends' },
  { value: 'RELATIONSHIPS', label: 'Relationships' },
  { value: 'TIME_MANAGEMENT', label: 'Time Management' },
  { value: 'EXAMS', label: 'Exams' },
  { value: 'SLEEP', label: 'Sleep' },
  { value: 'CLUBS', label: 'Clubs' },
  { value: 'FINANCIAL', label: 'Financial' },
  { value: 'GENERAL', label: 'General' },
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
        {CATEGORIES.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}
