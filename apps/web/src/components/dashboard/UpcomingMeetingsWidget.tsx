import { formatDistanceToNow } from 'date-fns';

interface UpcomingMeetingsWidgetProps {
  upcomingMeetings: Array<{
    id: string;
    title: string;
    description: string;
    hostType: string;
    date: string;
    time: string;
    durationMinutes: number;
    meetingType: string;
    meetingLink: string | null;
    location: string | null;
    category: string;
    hostDisplayName: string | null;
    isAttending: boolean;
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

export function UpcomingMeetingsWidget({
  upcomingMeetings,
  className = '',
}: UpcomingMeetingsWidgetProps) {
  if (!upcomingMeetings || upcomingMeetings.length === 0) {
    return (
      <div className={`dashboard-card p-6 ${className}`}>
        <h3 className="text-heading-20 mb-4 text-slate-100">Upcoming Meetings</h3>
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
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-copy-14 mt-3 text-slate-400">No upcoming meetings</p>
          <p className="text-label-14 mt-1 text-slate-500">RSVP to meetings to see them here</p>
          <a
            href="/meetings"
            className="button-primary text-button-14 mt-4 inline-block rounded-lg px-4 py-2 transition-opacity hover:opacity-90"
          >
            Browse Meetings
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={`dashboard-card p-6 ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-heading-20 text-slate-100">Upcoming Meetings</h3>
        <a
          href="/meetings"
          className="text-label-14 text-teal-400 transition-colors hover:text-teal-300"
        >
          View all
        </a>
      </div>

      <div className="space-y-3">
        {upcomingMeetings.slice(0, 4).map(meeting => (
          <a
            key={meeting.id}
            href={`/meetings/${meeting.id}`}
            className="flex items-start gap-4 rounded-lg border border-slate-800/50 bg-slate-900/50 p-4 transition-all hover:border-slate-700/50 hover:bg-slate-800/50"
          >
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600">
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
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-copy-14 truncate font-medium text-slate-100">
                  {meeting.title}
                </h4>
                <span className="inline-flex flex-shrink-0 items-center gap-1 rounded-full border border-slate-700/50 bg-slate-800/50 px-2 py-0.5 text-xs font-medium text-slate-400">
                  {meeting.meetingType === 'ONLINE' ? '🌐' : '📍'} {meeting.meetingType}
                </span>
              </div>
              <p className="text-label-13 mt-1 truncate text-slate-400">
                {meeting.description.substring(0, 80) +
                  (meeting.description.length > 80 ? '...' : '')}
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
                  {formatTime(meeting.time)} · {meeting.durationMinutes} min
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>

      {upcomingMeetings.length > 4 && (
        <div className="mt-4 text-center">
          <a
            href="/meetings"
            className="text-label-14 text-teal-400 transition-colors hover:text-teal-300"
          >
            View all {upcomingMeetings.length} meetings
          </a>
        </div>
      )}
    </div>
  );
}
