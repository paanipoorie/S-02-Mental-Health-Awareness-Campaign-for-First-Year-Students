import { formatDistanceToNow } from 'date-fns';

interface UpcomingWorkshopsWidgetProps {
  upcomingWorkshops: Array<{
    id: string;
    title: string;
    description: string;
    date: string;
    time: string;
    durationMinutes: number;
    meetingType: string;
    meetingLink: string | null;
    location: string | null;
    category: string;
    mentorDisplayName: string;
    registrationStatus: string;
  }>;
  className?: string;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatTime(timeStr: string): string {
  const [hours, minutes] = timeStr.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

function getStatusBadgeClass(status: string) {
  const configs: Record<string, string> = {
    REGISTERED: 'bg-green-100/50 text-green-800 border border-green-300',
    ATTENDED: 'bg-blue-100/50 text-blue-800 border border-blue-300',
    CANCELLED: 'bg-red-100/50 text-red-800 border border-red-300',
  };
  return configs[status] || 'bg-gray-100 text-gray-800 border border-gray-300';
}

export function UpcomingWorkshopsWidget({
  upcomingWorkshops,
  className = '',
}: UpcomingWorkshopsWidgetProps) {
  if (!upcomingWorkshops || upcomingWorkshops.length === 0) {
    return (
      <div className={`dashboard-card p-6 ${className}`}>
        <h3 className="text-heading-20 mb-4 text-gray-1000 font-semibold">Upcoming Events</h3>
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
              d="M9 20l-5.447-5.447L12 14l5.446-5.447L21 20H9z"
            />
          </svg>
          <p className="text-copy-14 mt-3 text-gray-600 font-medium">No registered workshops</p>
          <p className="text-label-12 mt-1 text-gray-500">
            Register for workshops to participate and learn.
          </p>
          <a
            href="/events"
            className="mt-4 inline-block rounded-sm bg-primary px-4 py-2 text-button-14 font-semibold text-background-100 hover:bg-gray-800 transition-colors"
          >
            Browse Events
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={`dashboard-card p-6 ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-heading-20 text-gray-1000 font-semibold">Upcoming Events</h3>
        <a
          href="/events"
          className="text-label-14 font-medium text-tertiary hover:underline transition-colors"
        >
          View all
        </a>
      </div>

      <div className="space-y-2">
        {upcomingWorkshops.slice(0, 4).map(workshop => {
          const statusBadge = getStatusBadgeClass(workshop.registrationStatus);
          return (
            <a
              key={workshop.id}
              href={`/events/${workshop.id}?type=workshop`}
              className="flex items-start gap-4 rounded-sm border border-gray-200 bg-background-100 p-4 transition-colors hover:bg-gray-50 focus-visible:outline-none"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-sm bg-gray-100 border border-gray-200 text-gray-700">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 20l-5.447-5.447L12 14l5.446-5.447L21 20H9z"
                  />
                </svg>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-copy-14 truncate pr-2 font-semibold text-gray-900">
                    {workshop.title}
                  </h4>
                  <span
                    className={`inline-flex flex-shrink-0 items-center gap-1 rounded-sm px-2 py-0.5 text-xs font-semibold ${statusBadge}`}
                  >
                    {workshop.registrationStatus}
                  </span>
                </div>
                <p className="text-label-12 mt-1 truncate text-gray-500">
                  {workshop.description}
                </p>
                <div className="text-label-12 mt-2 flex flex-wrap items-center gap-3 text-gray-400 font-mono">
                  <span className="flex items-center gap-1">
                    {formatDate(workshop.date)}
                  </span>
                  <span className="flex items-center gap-1">
                    {formatTime(workshop.time)} · {workshop.durationMinutes} min
                  </span>
                  <span className="flex items-center gap-1 text-gray-500 font-sans font-medium">
                    By {workshop.mentorDisplayName}
                  </span>
                </div>
              </div>
            </a>
          );
        })}
      </div>

      {upcomingWorkshops.length > 4 && (
        <div className="mt-4 text-center">
          <a
            href="/events"
            className="text-label-14 font-medium text-tertiary hover:underline transition-colors"
          >
            View all {upcomingWorkshops.length} events
          </a>
        </div>
      )}
    </div>
  );
}
