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

function getStatusBadge(status: string) {
  const configs: Record<string, { bg: string; color: string; label: string }> = {
    REGISTERED: { bg: '#dcfce7', color: '#166534', label: 'Registered' },
    ATTENDED: { bg: '#dbeafe', color: '#1e40af', label: 'Attended' },
    CANCELLED: { bg: '#fee2e2', color: '#991b1b', label: 'Cancelled' },
  };
  return configs[status] || { bg: '#f1f5f9', color: '#475569', label: status };
}

export function UpcomingWorkshopsWidget({
  upcomingWorkshops,
  className = '',
}: UpcomingWorkshopsWidgetProps) {
  if (!upcomingWorkshops || upcomingWorkshops.length === 0) {
    return (
      <div className={`dashboard-card p-6 ${className}`}>
        <h3 className="text-heading-20 mb-4 text-slate-100">Upcoming Workshops</h3>
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
              d="M9 20l-5.447-5.447L12 14l5.446-5.447L21 20H9z"
            />
          </svg>
          <p className="text-copy-14 mt-3 text-slate-400">No registered workshops</p>
          <p className="text-label-14 mt-1 text-slate-500">
            Register for workshops to see them here
          </p>
          <a
            href="/workshops"
            className="button-primary text-button-14 mt-4 inline-block rounded-lg px-4 py-2 transition-opacity hover:opacity-90"
          >
            Browse Workshops
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={`dashboard-card p-6 ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-heading-20 text-slate-100">Upcoming Workshops</h3>
        <a
          href="/workshops"
          className="text-label-14 text-teal-400 transition-colors hover:text-teal-300"
        >
          View all
        </a>
      </div>

      <div className="space-y-3">
        {upcomingWorkshops.slice(0, 4).map(workshop => {
          const statusConfig = getStatusBadge(workshop.registrationStatus);
          return (
            <a
              key={workshop.id}
              href={`/workshops/${workshop.id}`}
              className="flex items-start gap-4 rounded-lg border border-slate-800/50 bg-slate-900/50 p-4 transition-all hover:border-slate-700/50 hover:bg-slate-800/50"
            >
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600">
                <svg
                  className="h-6 w-6 text-white"
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
                  <h4 className="text-copy-14 truncate pr-2 font-medium text-slate-100">
                    {workshop.title}
                  </h4>
                  <span
                    className="inline-flex flex-shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
                    style={{ background: statusConfig.bg, color: statusConfig.color }}
                  >
                    {statusConfig.label}
                  </span>
                </div>
                <p className="text-label-13 mt-1 truncate text-slate-400">
                  {workshop.description.substring(0, 80) +
                    (workshop.description.length > 80 ? '...' : '')}
                </p>
                <div className="text-label-12 mt-2 flex flex-wrap items-center gap-3 text-slate-500">
                  <span className="flex items-center gap-1">
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    {formatDate(workshop.date)}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {formatTime(workshop.time)} · {workshop.durationMinutes} min
                  </span>
                  <span className="flex items-center gap-1">
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    {workshop.mentorDisplayName}
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
            href="/workshops"
            className="text-label-14 text-teal-400 transition-colors hover:text-teal-300"
          >
            View all {upcomingWorkshops.length} workshops
          </a>
        </div>
      )}
    </div>
  );
}
