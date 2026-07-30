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
      className="flex flex-col justify-between bg-background-100 border border-gray-200 rounded-sm p-5 hover:bg-gray-50 transition-colors cursor-pointer focus-visible:outline-none"
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
          <h3 className="line-clamp-2 flex-1 text-heading-18 font-bold text-gray-900 leading-tight">
            {resource.title}
          </h3>
          <ResourceCategoryBadge category={resource.category} size="sm" />
        </div>
        <p className="mb-4 line-clamp-3 text-copy-14 text-gray-600 leading-normal">
          {resource.description}
        </p>
      </div>

      <div className="flex items-center justify-between border-t border-gray-200 pt-3">
        <time className="text-xs font-mono text-gray-400" dateTime={resource.updatedAt}>
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
