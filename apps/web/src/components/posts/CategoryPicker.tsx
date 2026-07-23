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
    <div className={`category-picker ${className}`}>
      <label className="category-label">Category</label>
      <select
        value={selectedCategory || ''}
        onChange={e => onSelect(e.target.value as PostCategory)}
        className="category-select"
        aria-label="Post category"
      >
        <option value="">Select a category</option>
        {CATEGORIES.map(({ value, label, icon }) => (
          <option key={value} value={value}>
            {icon} {label}
          </option>
        ))}
      </select>
      <style jsx>{`
        .category-picker {
          width: 100%;
        }
        .category-label {
          display: block;
          font-size: 14px;
          font-weight: 500;
          color: #374151;
          margin-bottom: 6px;
        }
        .category-select {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          color: #111827;
          background: white;
          cursor: pointer;
          transition:
            border-color 0.15s ease,
            box-shadow 0.15s ease;
        }
        .category-select:hover {
          border-color: #9ca3af;
        }
        .category-select:focus {
          outline: none;
          border-color: #0d9488;
          box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.15);
        }
        .category-select:disabled {
          background: #f9fafb;
          color: #9ca3af;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
