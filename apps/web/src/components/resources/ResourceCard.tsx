import type { ResourceCategory } from '@campus-peer-support/shared-types/enums';
import { ResourceCategoryBadge } from './ResourceCategoryBadge.tsx';

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

interface ResourceCardProps {
  resource: Resource;
  onClick?: () => void;
}

export function ResourceCard({ resource, onClick }: ResourceCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <article
      className="bg-background-100 flex cursor-pointer flex-col justify-between rounded-sm border border-gray-200 p-5 transition-all duration-200 hover:border-gray-300 hover:shadow-md hover:-translate-y-0.5 focus-visible:outline-none"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      <div>
        <div className="mb-3 flex items-start justify-between gap-3">
          <h3 className="text-heading-18 line-clamp-2 flex-1 font-bold leading-tight text-gray-900">
            {resource.title}
          </h3>
          <ResourceCategoryBadge category={resource.category} size="sm" />
        </div>
        <p className="text-copy-14 mb-4 line-clamp-3 leading-normal text-gray-600">
          {resource.description}
        </p>
      </div>

      <div className="flex items-center justify-between border-t border-gray-200 pt-3">
        <time className="font-mono text-xs text-gray-400" dateTime={resource.updatedAt}>
          Updated {formatDate(resource.updatedAt)}
        </time>
        {resource.link && (
          <span className="text-tertiary flex items-center gap-1 text-xs font-semibold hover:underline">
            <svg
              className="h-3.5 w-3.5"
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
            External
          </span>
        )}
      </div>
    </article>
  );
}
