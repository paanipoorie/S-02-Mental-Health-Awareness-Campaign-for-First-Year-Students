import { Hospital, Phone, GraduationCap, Handshake, Theater, BookOpen, Heart, Moon, PhoneCall } from 'lucide-react';

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

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  COUNSELING_CENTER: Hospital,
  EMERGENCY_CONTACTS: Phone,
  FACULTY_ADVISORS: GraduationCap,
  STUDENT_WELFARE: Handshake,
  CAMPUS_CLUBS: Theater,
  SELF_HELP_PDFS: BookOpen,
  STRESS_MANAGEMENT: Heart,
  SLEEP_HYGIENE: Moon,
  EXTERNAL_HELPLINES: PhoneCall,
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
        <h3 className="text-heading-20 mb-4 text-gray-1000 font-semibold">Quick Access Resources</h3>
        <div className="py-8 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
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
          <p className="text-copy-14 mt-3 text-gray-600 font-medium">No resources available</p>
          <a
            href="/dashboard"
            className="mt-4 inline-block rounded-sm bg-primary px-4 py-2 text-button-14 font-semibold text-background-100 hover:bg-gray-800 transition-colors"
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
        <h3 className="text-heading-20 text-gray-1000 font-semibold">Quick Access Resources</h3>
        <a
          href="/dashboard"
          className="text-label-14 font-medium text-tertiary hover:underline transition-colors"
        >
          View all
        </a>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {resourcesPreview.slice(0, 6).map(resource => {
          const IconComponent = CATEGORY_ICONS[resource.category] || BookOpen;
          return (
            <a
              key={resource.id}
              href={resource.link || `/resources/${resource.id}`}
              className="flex items-start gap-4 rounded-sm border border-gray-200 bg-background-100 p-4 transition-colors hover:bg-gray-50 focus-visible:outline-none"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-sm bg-gray-100 border border-gray-200">
                <IconComponent className="h-5 w-5 text-gray-700" />
              </div>

              <div className="min-w-0 flex-1">
                <h4 className="text-copy-14 line-clamp-1 font-semibold text-gray-900">
                  {resource.title}
                </h4>
                <p className="text-label-12 mt-1 truncate text-gray-500">{resource.description}</p>
                <span className="mt-2 inline-flex flex-shrink-0 items-center gap-1 rounded-sm border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs font-semibold text-gray-600">
                  {CATEGORY_LABELS[resource.category] || resource.category}
                </span>
              </div>

              <svg
                className="h-5 w-5 flex-shrink-0 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          );
        })}
      </div>

    </div>
  );
}
