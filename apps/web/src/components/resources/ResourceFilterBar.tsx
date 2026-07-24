import type { ResourceCategory } from '@campus-peer-support/shared-types/enums';
import { ResourceCategoryBadge } from './ResourceCategoryBadge.tsx';
import type { FormEvent } from 'react';
import { useState } from 'react';

interface CategoryWithCount {
  category: ResourceCategory;
  count: number;
}

interface ResourceFilterBarProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  categories: CategoryWithCount[];
}

export function ResourceFilterBar({
  selectedCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  categories,
}: ResourceFilterBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearchChange(searchQuery);
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearchSubmit} className="relative">
        <label htmlFor="resource-search" className="sr-only">
          Search resources
        </label>
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            id="resource-search"
            type="search"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Search resources by keyword..."
            className="focus:ring-primary-500 w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-gray-900 placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
        </div>
      </form>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Categories</h4>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-primary-600 dark:text-primary-400 text-sm hover:underline"
            aria-expanded={isExpanded}
          >
            {isExpanded ? 'Show less' : 'Show all'}
          </button>
        </div>
        <div className={`flex flex-wrap gap-2 ${!isExpanded ? 'max-h-10 overflow-hidden' : ''}`}>
          <button
            onClick={() => onCategoryChange('')}
            className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
              selectedCategory === ''
                ? 'bg-primary-600 border-primary-600 text-white'
                : 'hover:border-primary-300 dark:hover:border-primary-700 border-gray-300 bg-white text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300'
            }`}
          >
            All Categories
          </button>
          {categories.slice(0, isExpanded ? categories.length : 6).map(({ category, count }) => (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                selectedCategory === category
                  ? 'bg-primary-600 border-primary-600 text-white'
                  : 'hover:border-primary-300 dark:hover:border-primary-700 border-gray-300 bg-white text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300'
              }`}
            >
              <ResourceCategoryBadge category={category} size="sm" />
              <span className="text-xs text-gray-500 dark:text-gray-400">({count})</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
