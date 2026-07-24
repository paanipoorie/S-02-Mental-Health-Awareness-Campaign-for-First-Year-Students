interface ResourcesQuickAccessWidgetProps {
  resourcesPreview: Array<{
    id: string;
    title: string;
    description: string;
    category: string;
    link: string | null;
  }>;
  className?: string;
}

const CATEGORY_ICONS: Record<string, string> = {
  COUNSELING_CENTER: '🏥',
  EMERGENCY_CONTACTS: '🚨',
  FACULTY_ADVISORS: '👨‍🏫',
  STUDENT_WELFARE: '🤝',
  CAMPUS_CLUBS: '🎭',
  SELF_HELP_PDFS: '📚',
  STRESS_MANAGEMENT: '🧘',
  SLEEP_HYGIENE: '🌙',
  EXTERNAL_HELPLINES: '☎️',
};

const CATEGORY_LABELS: Record<string, string> = {
  COUNSELING_CENTER: 'Counseling Center',
  EMERGENCY_CONTACTS: 'Emergency Contacts',
  FACULTY_ADVISORS: 'Faculty Advisors',
  STUDENT_WELFARE: 'Student Welfare',
  CAMPUS_CLUBS: 'Campus Clubs',
  SELF_HELP_PDFS: 'Self-Help PDFs',
  STRESS_MANAGEMENT: 'Stress Management',
  SLEEP_HYGIENE: 'Sleep Hygiene',
  EXTERNAL_HELPLINES: 'External Helplines',
};

export function ResourcesQuickAccessWidget({
  resourcesPreview,
  className = '',
}: ResourcesQuickAccessWidgetProps) {
  if (!resourcesPreview || resourcesPreview.length === 0) {
    return (
      <div className={`dashboard-card p-6 ${className}`}>
        <h3 className="text-heading-20 mb-4 text-slate-100">Quick Access Resources</h3>
        <div className="py-8 text-center">
          <svg
            className="mx-auto h-12 w-12 text-slate-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
          <p className="text-copy-14 mt-3 text-slate-400">No resources available</p>
          <a
            href="/resources"
            className="button-primary text-button-14 mt-4 inline-block rounded-lg px-4 py-2 transition-opacity hover:opacity-90"
          >
            Browse Resources
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={`dashboard-card p-6 ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-heading-20 text-slate-100">Quick Access Resources</h3>
        <a
          href="/resources"
          className="text-label-14 text-teal-400 transition-colors hover:text-teal-300"
        >
          View all
        </a>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {resourcesPreview.slice(0, 6).map(resource => (
          <a
            key={resource.id}
            href={resource.link || `/resources/${resource.id}`}
            className="flex items-start gap-4 rounded-lg border border-slate-800/50 bg-slate-900/50 p-4 transition-all hover:border-slate-700/50 hover:bg-slate-800/50"
          >
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-slate-800/50">
              <span className="text-xl">{CATEGORY_ICONS[resource.category] || '📄'}</span>
            </div>

            <div className="min-w-0 flex-1">
              <h4 className="text-copy-14 line-clamp-1 font-medium text-slate-100">
                {resource.title}
              </h4>
              <p className="text-label-13 mt-0.5 truncate text-slate-400">{resource.description}</p>
              <span className="mt-2 inline-flex flex-shrink-0 items-center gap-1 rounded-full border border-slate-700/50 bg-slate-800/50 px-2 py-0.5 text-xs font-medium text-slate-400">
                {CATEGORY_LABELS[resource.category] || resource.category}
              </span>
            </div>

            <svg
              className="h-5 w-5 flex-shrink-0 text-slate-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        ))}
      </div>

      {resourcesPreview.length > 6 && (
        <div className="mt-4 text-center">
          <a
            href="/resources"
            className="text-label-14 text-teal-400 transition-colors hover:text-teal-300"
          >
            View all {resourcesPreview.length} resources
          </a>
        </div>
      )}
    </div>
  );
}
