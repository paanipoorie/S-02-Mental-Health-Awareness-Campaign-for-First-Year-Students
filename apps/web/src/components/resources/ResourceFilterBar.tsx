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
            className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
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
            className="bg-background-100 w-full rounded-sm border border-gray-200 py-2 pl-10 pr-4 text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-gray-900"
          />
        </div>
      </form>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h4 className="text-sm font-bold text-gray-700">Categories</h4>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-tertiary text-sm font-semibold hover:underline"
            aria-expanded={isExpanded}
          >
            {isExpanded ? 'Show less' : 'Show all'}
          </button>
        </div>
        <div
          className={`flex flex-wrap gap-2 ${!isExpanded ? 'max-h-[38px] overflow-hidden' : ''}`}
        >
          <button
            onClick={() => onCategoryChange('')}
            className={`rounded-sm border px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
              selectedCategory === ''
                ? 'bg-primary border-primary text-background-100'
                : 'bg-background-100 border-gray-200 text-gray-700 hover:border-gray-300 hover:shadow-sm'
            }`}
          >
            All Categories
          </button>
          {categories.slice(0, isExpanded ? categories.length : 6).map(({ category, count }) => (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={`flex items-center gap-1.5 rounded-sm border px-3 py-1 text-xs font-semibold transition-all duration-200 ${
                selectedCategory === category
                  ? 'bg-primary border-primary text-background-100'
                  : 'bg-background-100 border-gray-200 text-gray-700 hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              <ResourceCategoryBadge category={category} size="sm" />
              <span className="font-mono text-xs text-gray-400">({count})</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
