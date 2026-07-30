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
        <h3 className="text-heading-20 mb-4 text-gray-1000 font-semibold">Today's Meetings</h3>
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
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-copy-14 mt-3 text-gray-600 font-medium">No meetings today</p>
          <p className="text-label-12 mt-1 text-gray-500">Your scheduled meetings for today will appear here.</p>
        </div>
      </div>
    );
  }

  const sortedMeetings = [...todaysMeetings].sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className={`dashboard-card p-6 ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-heading-20 text-gray-1000 font-semibold">Today's Meetings</h3>
        <a
          href="/meetings"
          className="text-label-14 font-medium text-tertiary hover:underline transition-colors"
        >
          View all
        </a>
      </div>

      <div className="space-y-2">
        {sortedMeetings.slice(0, 5).map(meeting => (
          <a
            key={meeting.id}
            href={`/meetings/${meeting.id}`}
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
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-copy-14 truncate pr-2 font-semibold text-gray-900">
                  {meeting.title}
                  {meeting.isHost && (
                    <span className="ml-2 inline-flex items-center gap-1 rounded-sm border border-purple-300 bg-purple-100/50 px-1.5 py-0.5 text-xs font-semibold text-purple-800">
                      Host
                    </span>
                  )}
                </h4>
                <span className="inline-flex flex-shrink-0 items-center gap-1 rounded-sm border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs font-semibold text-gray-700">
                  {meeting.meetingType === 'ONLINE' ? '🌐' : '📍'} {meeting.meetingType}
                </span>
              </div>

              <p className="text-label-12 mt-1 truncate text-gray-500">
                {meeting.description}
              </p>

              <div className="text-label-12 mt-2 flex flex-wrap items-center gap-3 text-gray-400 font-mono">
                <span className="flex items-center gap-1">
                  {formatTime(meeting.time)} · {meeting.durationMinutes} min
                </span>
                <span className="flex items-center gap-1 text-gray-500 font-sans font-medium">
                  {meeting.attendeeCount} attendees
                </span>
                <span className="flex items-center gap-1 text-gray-500 font-sans font-medium">
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
            className="text-label-14 font-medium text-tertiary hover:underline transition-colors"
          >
            View all {todaysMeetings.length} meetings today
          </a>
        </div>
      )}
    </div>
  );
}
