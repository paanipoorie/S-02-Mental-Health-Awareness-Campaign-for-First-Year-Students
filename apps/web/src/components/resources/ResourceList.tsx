import { ResourceFilterBar } from './ResourceFilterBar.tsx';
import { ResourceCard } from './ResourceCard.tsx';
import type { FormEvent } from 'react';
import { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';
import type { ResourceCategory } from '@campus-peer-support/shared-types/enums';

interface Resource {
  id: string;
  title: string;
  description: string;
  category: ResourceCategory;
  content: string;
  link: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CategoryWithCount {
  category: ResourceCategory;
  count: number;
}

export function ResourceList() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchResources = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
      });
      if (selectedCategory) params.append('category', selectedCategory);
      if (searchQuery) params.append('search', searchQuery);

      const response = await api.get(`/resources?${params.toString()}`);
      if (response.data.success) {
        setResources(response.data.data);
        setTotalPages(response.data.pagination.totalPages);
        setTotal(response.data.pagination.total);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      setError(error.response?.data?.error?.message ?? 'Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/resources/categories');
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  useEffect(() => {
    fetchResources();
    fetchCategories();
  }, [page, selectedCategory, searchQuery]);

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchResources();
  };

  if (loading && resources.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div
          className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"
          aria-label="Loading resources..."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ResourceFilterBar
        selectedCategory={selectedCategory}
        onCategoryChange={cat => {
          setSelectedCategory(cat);
          setPage(1);
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        categories={categories}
      />

      {error && (
        <div
          className="rounded-sm border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          role="alert"
        >
          {error}
        </div>
      )}

      {resources.length === 0 && !loading && (
        <div className="bg-background-100 rounded-sm border border-gray-200 py-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-bold text-gray-900">No resources found</h3>
          <p className="mt-1 text-xs text-gray-500">
            {selectedCategory || searchQuery
              ? 'Try adjusting your filters or search terms'
              : 'No resources have been added yet'}
          </p>
        </div>
      )}

      <div
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        role="list"
        aria-label="Resources"
      >
        {resources.map(resource => (
          <ResourceCard
            key={resource.id}
            resource={resource}
            onClick={() => (window.location.href = `/resources/${resource.id}`)}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <nav
          className="flex items-center justify-center gap-3 border-t border-gray-200 pt-4"
          aria-label="Pagination"
        >
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="bg-background-100 rounded-sm border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Previous page"
          >
            Previous
          </button>
          <span className="font-mono text-xs text-gray-500">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="bg-background-100 rounded-sm border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Next page"
          >
            Next
          </button>
        </nav>
      )}
    </div>
  );
}
