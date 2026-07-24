import { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';
import { ResourceCategoryBadge } from './ResourceCategoryBadge.tsx';
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

export function ResourceDetail() {
  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const pathParts = window.location.pathname.split('/');
    const id = pathParts[pathParts.length - 1];

    const fetchResource = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/resources/${id}`);
        if (response.data.success) {
          setResource(response.data.data);
        } else {
          setError('Resource not found');
        }
      } catch (err: unknown) {
        const error = err as { response?: { data?: { error?: { message?: string } } } };
        setError(error.response?.data?.error?.message ?? 'Failed to load resource');
      } finally {
        setLoading(false);
      }
    };

    fetchResource();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const goBack = () => {
    window.location.href = '/resources';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div
          className="border-primary-600 h-8 w-8 animate-spin rounded-full border-b-2"
          aria-label="Loading resource..."
        />
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="py-12 text-center">
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
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
          Resource not found
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {error ?? 'The resource you are looking for does not exist.'}
        </p>
        <button
          onClick={goBack}
          className="bg-primary-600 hover:bg-primary-700 mt-4 rounded-lg px-4 py-2 text-sm font-medium text-white"
        >
          Back to Resources
        </button>
      </div>
    );
  }

  return (
    <article className="space-y-6">
      <header>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {resource.title}
          </h1>
          <ResourceCategoryBadge category={resource.category} size="md" />
        </div>
        <p className="text-gray-600 dark:text-gray-300">{resource.description}</p>
      </header>

      <div className="prose prose-gray dark:prose-invert max-w-none">
        <div dangerouslySetInnerHTML={{ __html: resource.content }} />
      </div>

      {resource.link && (
        <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
          <a
            href={resource.link}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-primary-600 hover:bg-primary-700 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
            Visit External Resource
          </a>
        </div>
      )}

      <footer className="border-t border-gray-200 pt-4 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
        <p>Last updated: {formatDate(resource.updatedAt)}</p>
      </footer>

      <div className="pt-4">
        <button
          onClick={goBack}
          className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium"
        >
          ← Back to Resources
        </button>
      </div>
    </article>
  );
}
