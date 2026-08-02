import { formatDistanceToNow } from 'date-fns';

interface TodaysWorkshopsWidgetProps {
  todaysWorkshops: Array<{
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
    maxAttendees: number | null;
    registrationCount: number;
  }>;
  className?: string;
}

function formatTime(timeStr: string): string {
  const [hours, minutes] = timeStr.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

function getCategoryLabel(category: string): string {
  return category
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase());
}

export function TodaysWorkshopsWidget({
  todaysWorkshops,
  className = '',
}: TodaysWorkshopsWidgetProps) {
  if (!todaysWorkshops || todaysWorkshops.length === 0) {
    return (
      <div className={`dashboard-card p-6 ${className}`}>
        <h3 className="text-heading-20 text-gray-1000 mb-4 font-semibold">Today's Workshops</h3>
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
          <p className="text-copy-14 mt-3 font-medium text-gray-600">No workshops today</p>
          <p className="text-label-12 mt-1 text-gray-500">
            Your hosted workshops for today will appear here.
          </p>
        </div>
      </div>
    );
  }

  const sortedWorkshops = [...todaysWorkshops].sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className={`dashboard-card p-6 ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-heading-20 text-gray-1000 font-semibold">Today's Workshops</h3>
        <a
          href="/events"
          className="text-label-14 text-tertiary font-medium transition-colors hover:underline"
        >
          View all
        </a>
      </div>

      <div className="space-y-2">
        {sortedWorkshops.slice(0, 5).map(workshop => {
          const capacityText = workshop.maxAttendees
            ? `${workshop.registrationCount}/${workshop.maxAttendees}`
            : `${workshop.registrationCount} registered`;
          const isFull =
            workshop.maxAttendees && workshop.registrationCount >= workshop.maxAttendees;

          return (
            <a
              key={workshop.id}
              href={`/events/${workshop.id}?type=workshop`}
              className="bg-background-100 flex items-start gap-4 rounded-sm border border-gray-200 p-4 transition-all duration-200 hover:border-gray-300 hover:shadow-md hover:-translate-y-0.5 focus-visible:outline-none"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-sm border border-gray-200 bg-gray-100 text-gray-700">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    className={`inline-flex flex-shrink-0 items-center gap-1 rounded-sm border px-2 py-0.5 text-xs font-semibold ${
                      isFull
                        ? 'border-red-300 bg-red-50 text-red-800'
                        : 'border-green-300 bg-green-50 text-green-800'
                    }`}
                  >
                    {isFull ? 'Full' : 'Open'}
                  </span>
                </div>

                <p className="text-label-12 mt-1 truncate text-gray-500">{workshop.description}</p>

                <div className="text-label-12 mt-2 flex flex-wrap items-center gap-3 font-mono text-gray-400">
                  <span className="flex items-center gap-1">
                    {formatTime(workshop.time)} · {workshop.durationMinutes} min
                  </span>
                  <span className="flex items-center gap-1 font-sans font-medium text-gray-500">
                    {capacityText}
                  </span>
                  <span className="flex items-center gap-1 font-sans font-medium text-gray-500">
                    {getCategoryLabel(workshop.category)}
                  </span>
                </div>
              </div>
            </a>
          );
        })}
      </div>

      {todaysWorkshops.length > 5 && (
        <div className="mt-4 text-center">
          <a
            href="/events"
            className="text-label-14 text-tertiary font-medium transition-colors hover:underline"
          >
            View all {todaysWorkshops.length} workshops today
          </a>
        </div>
      )}
    </div>
  );
}
