import { formatDistanceToNow } from 'date-fns';

interface EventsOverviewWidgetProps {
  meetingsOverview: Array<{
    id: string;
    title: string;
    hostType: string;
    hostDisplayName: string | null;
    date: string;
    meetingType: string;
    category: string;
    attendeeCount: number;
  }>;
  workshopsOverview: Array<{
    id: string;
    title: string;
    mentorDisplayName: string;
    date: string;
    meetingType: string;
    category: string;
    maxAttendees: number | null;
    registrationCount: number;
  }>;
  className?: string;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
}

function CategoryBadge({ category }: { category: string }) {
  const formatted = category
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase());
  return (
    <span className="inline-flex items-center rounded-full border border-slate-700/50 bg-slate-800/50 px-2 py-0.5 text-xs font-medium text-slate-400">
      {formatted}
    </span>
  );
}

export function EventsOverviewWidget({
  meetingsOverview,
  workshopsOverview,
  className = '',
}: EventsOverviewWidgetProps) {
  return (
    <div className={`dashboard-card p-6 ${className}`}>
      <h3 className="text-heading-20 mb-6 text-slate-100">Events Overview</h3>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h4 className="text-label-14 mb-3 flex items-center gap-2 font-medium text-slate-300">
            <svg
              className="h-4 w-4 text-purple-400"
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
            Meetings ({meetingsOverview?.length || 0})
          </h4>
          <div className="max-h-80 space-y-2 overflow-y-auto">
            {(meetingsOverview || []).slice(0, 10).map(meeting => (
              <a
                key={meeting.id}
                href={`/meetings/${meeting.id}`}
                className="flex items-start gap-3 rounded-lg border border-slate-800/50 bg-slate-900/50 p-3 transition-all hover:border-purple-500/30 hover:bg-purple-500/5"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600">
                  <svg
                    className="h-5 w-5 text-white"
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
                </div>
                <div className="min-w-0 flex-1">
                  <h5 className="text-copy-14 truncate font-medium text-slate-100">
                    {meeting.title}
                  </h5>
                  <div className="text-label-12 mt-1 flex flex-wrap items-center gap-2 text-slate-500">
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
                      {formatDate(meeting.date)}
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
                      {meeting.meetingType === 'ONLINE' ? '🌐 Online' : '📍 In-person'}
                    </span>
                    <CategoryBadge category={meeting.category} />
                  </div>
                  <div className="text-label-12 mt-2 flex items-center gap-3 text-slate-400">
                    <span>👤 {meeting.attendeeCount} attendees</span>
                    <span>Host: {meeting.hostDisplayName || meeting.hostType}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
          {(meetingsOverview || []).length > 10 && (
            <div className="mt-3 text-center">
              <a
                href="/admin/meetings"
                className="text-label-14 text-teal-400 transition-colors hover:text-teal-300"
              >
                View all {meetingsOverview.length} meetings
              </a>
            </div>
          )}
        </div>

        <div>
          <h4 className="text-label-14 mb-3 flex items-center gap-2 font-medium text-slate-300">
            <svg
              className="h-4 w-4 text-amber-400"
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
            Workshops ({workshopsOverview?.length || 0})
          </h4>
          <div className="max-h-80 space-y-2 overflow-y-auto">
            {(workshopsOverview || []).slice(0, 10).map(workshop => (
              <a
                key={workshop.id}
                href={`/workshops/${workshop.id}`}
                className="flex items-start gap-3 rounded-lg border border-slate-800/50 bg-slate-900/50 p-3 transition-all hover:border-amber-500/30 hover:bg-amber-500/5"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600">
                  <svg
                    className="h-5 w-5 text-white"
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
                  <h5 className="text-copy-14 truncate font-medium text-slate-100">
                    {workshop.title}
                  </h5>
                  <div className="text-label-12 mt-1 flex flex-wrap items-center gap-2 text-slate-500">
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
                      {workshop.meetingType === 'ONLINE' ? '🌐 Online' : '📍 In-person'}
                    </span>
                    <CategoryBadge category={workshop.category} />
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
                      {workshop.registrationCount} / {workshop.maxAttendees || '∞'}
                    </span>
                  </div>
                  <div className="text-label-12 mt-2 flex items-center gap-3 text-slate-400">
                    <span>👨‍🏫 {workshop.mentorDisplayName}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
          {(workshopsOverview || []).length > 10 && (
            <div className="mt-3 text-center">
              <a
                href="/admin/workshops"
                className="text-label-14 text-teal-400 transition-colors hover:text-teal-300"
              >
                View all {workshopsOverview.length} workshops
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
