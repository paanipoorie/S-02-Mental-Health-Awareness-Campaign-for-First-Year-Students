import { formatDistanceToNow } from 'date-fns';

interface TodaysMeetingsWidgetProps {
  todaysMeetings: Array<{
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
    attendeeCount: number;
    isHost: boolean;
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

export function TodaysMeetingsWidget({
  todaysMeetings,
  className = '',
}: TodaysMeetingsWidgetProps) {
  if (!todaysMeetings || todaysMeetings.length === 0) {
    return (
      <div className={`dashboard-card p-6 ${className}`}>
        <h3 className="text-heading-20 mb-4 text-slate-100">Today's Meetings</h3>
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
          <p className="text-copy-14 mt-3 text-slate-400">No meetings today</p>
          <p className="text-label-14 mt-1 text-slate-500">
            Your scheduled meetings will appear here
          </p>
        </div>
      </div>
    );
  }

  const sortedMeetings = [...todaysMeetings].sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className={`dashboard-card p-6 ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-heading-20 text-slate-100">Today's Meetings</h3>
        <a
          href="/meetings"
          className="text-label-14 text-teal-400 transition-colors hover:text-teal-300"
        >
          View all
        </a>
      </div>

      <div className="space-y-3">
        {sortedMeetings.slice(0, 5).map(meeting => (
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
                <h4 className="text-copy-14 truncate pr-2 font-medium text-slate-100">
                  {meeting.title}
                  {meeting.isHost && (
                    <span className="ml-2 inline-flex items-center gap-1 rounded-full border border-purple-500/30 bg-purple-500/20 px-1.5 py-0.5 text-xs font-medium text-purple-400">
                      Host
                    </span>
                  )}
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
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {formatTime(meeting.time)} · {meeting.durationMinutes} min
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
                  {meeting.attendeeCount} attendees
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
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                  {getCategoryLabel(meeting.category)}
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>

      {todaysMeetings.length > 5 && (
        <div className="mt-4 text-center">
          <a
            href="/meetings"
            className="text-label-14 text-teal-400 transition-colors hover:text-teal-300"
          >
            View all {todaysMeetings.length} meetings today
          </a>
        </div>
      )}
    </div>
  );
}
