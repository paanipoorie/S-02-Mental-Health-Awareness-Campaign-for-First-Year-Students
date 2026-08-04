import { formatDistanceToNow } from 'date-fns';
import { Globe, MapPin } from 'lucide-react';

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
        <h3 className="text-heading-20 text-gray-1000 mb-4 font-semibold">Upcoming Meetings</h3>
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
          <p className="text-copy-14 mt-3 font-medium text-gray-600">No upcoming meetings</p>
          <p className="text-label-12 mt-1 text-gray-500">
            You are not attending any meetings. Browse peer-support meetings to join.
          </p>
          <a
            href="/events"
            className="bg-primary text-button-14 text-background-100 mt-4 inline-block rounded-sm px-4 py-2 font-semibold transition-colors hover:bg-gray-800"
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
        <h3 className="text-heading-20 text-gray-1000 font-semibold">Upcoming Meetings</h3>
        <a
          href="/events"
          className="text-label-14 text-tertiary font-medium transition-colors hover:underline"
        >
          View all
        </a>
      </div>

      <div className="space-y-2">
        {upcomingMeetings.slice(0, 4).map(meeting => (
          <a
            key={meeting.id}
href={`/events?id=${meeting.id}&type=meeting`}
            className="bg-background-100 flex items-start gap-4 rounded-sm border border-gray-200 p-4 transition-all duration-200 hover:border-gray-300 hover:shadow-md hover:-translate-y-0.5 focus-visible:outline-none"
          >
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-sm border border-gray-200 bg-gray-100 text-gray-700">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <h4 className="text-copy-14 truncate font-semibold text-gray-900">
                  {meeting.title}
                </h4>
                <span className="inline-flex flex-shrink-0 items-center gap-1 rounded-sm border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs font-semibold text-gray-700">
                  {meeting.meetingType === 'ONLINE' ? (
                    <Globe className="h-3 w-3" />
                  ) : (
                    <MapPin className="h-3 w-3" />
                  )}
                  {meeting.meetingType === 'ONLINE' ? 'Online' : 'In-person'}
                </span>
              </div>
              <p className="text-label-12 mt-1 truncate text-gray-500">{meeting.description}</p>
              <div className="text-label-12 mt-2 flex flex-wrap items-center gap-3 font-mono text-gray-400">
                <span className="flex items-center gap-1">{formatDate(meeting.date)}</span>
                <span className="flex items-center gap-1">
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
            href="/events"
            className="text-label-14 text-tertiary font-medium transition-colors hover:underline"
          >
            View all {upcomingMeetings.length} meetings
          </a>
        </div>
      )}
    </div>
  );
}
