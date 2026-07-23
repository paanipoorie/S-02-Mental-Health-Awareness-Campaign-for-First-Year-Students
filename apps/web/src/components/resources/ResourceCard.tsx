import { ResourceCategory } from '@campus-peer-support/shared-types/enums';
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
      className="border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 p-5 hover:border-primary-300 dark:hover:border-primary-700 transition-colors cursor-pointer"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick?.(); } }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 flex-1">{resource.title}</h3>
        <ResourceCategoryBadge category={resource.category} size="sm" />
      </div>
      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">{resource.description}</p>
      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
        <time className="text-xs text-gray-500 dark:text-gray-400" dateTime={resource.updatedAt}>
          Updated {formatDate(resource.updatedAt)}
        </time>
        {resource.link && (
          <span className="text-xs text-primary-600 dark:text-primary-400 flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            External
          </span>
        )}
      </div>
    </article>
  );
}