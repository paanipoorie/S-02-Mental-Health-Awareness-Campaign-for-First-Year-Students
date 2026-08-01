import { formatDistanceToNow } from 'date-fns';
import { Globe, MapPin, Users } from 'lucide-react';

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
    <span className="inline-flex items-center rounded-sm border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px] font-bold text-gray-600">
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
    <div className={`dashboard-card p-6 bg-background-100 border border-gray-200 rounded-sm ${className}`}>
      <h3 className="text-heading-16 font-bold text-gray-1000 mb-6">Events Overview</h3>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h4 className="text-label-14 mb-3 flex items-center gap-2 font-bold text-gray-900">
            <svg
              className="h-4 w-4 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
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
          <div className="space-y-3">
            {(meetingsOverview || []).slice(0, 10).map(meeting => (
              <a
                key={meeting.id}
                href={`/events/${meeting.id}?type=meeting`}
                className="flex items-start gap-3 rounded-sm border border-gray-200 bg-background-100 p-3 transition-all hover:bg-gray-50 hover:border-gray-300"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-sm bg-gray-100 border border-gray-200">
                  <svg
                    className="h-5 w-5 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
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
                  <h5 className="text-copy-14 truncate font-semibold text-gray-900">
                    {meeting.title}
                  </h5>
                  <div className="text-label-12 mt-1 flex flex-wrap items-center gap-2 text-gray-500">
                    <span className="flex items-center gap-1 font-mono text-[11px]">
                      {formatDate(meeting.date)}
                    </span>
                    <span className="flex items-center gap-1 font-semibold">
                      {meeting.meetingType === 'ONLINE' ? <Globe className="h-3 w-3 text-gray-500" /> : <MapPin className="h-3 w-3 text-gray-500" />}
                      {' '}{meeting.meetingType === 'ONLINE' ? 'Online' : 'In-person'}
                    </span>
                    <CategoryBadge category={meeting.category} />
                  </div>
                  <div className="text-label-12 mt-2 flex items-center gap-3 text-gray-500">
                    <span className="flex items-center gap-1"><Users className="h-3 w-3 text-gray-500" /> {meeting.attendeeCount} attendees</span>
                    <span className="font-semibold text-gray-600">Host: {meeting.hostDisplayName || meeting.hostType}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
          {(meetingsOverview || []).length > 10 && (
            <div className="mt-3 text-center">
              <a
                href="/admin/meetings"
                className="text-label-12 text-tertiary font-bold hover:underline"
              >
                View all {meetingsOverview.length} meetings
              </a>
            </div>
          )}
        </div>

        <div>
          <h4 className="text-label-14 mb-3 flex items-center gap-2 font-bold text-gray-900">
            <svg
              className="h-4 w-4 text-amber-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
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
          <div className="space-y-3">
            {(workshopsOverview || []).slice(0, 10).map(workshop => (
              <a
                key={workshop.id}
                href={`/events/${workshop.id}?type=workshop`}
                className="flex items-start gap-3 rounded-sm border border-gray-200 bg-background-100 p-3 transition-all hover:bg-gray-50 hover:border-gray-300"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-sm bg-gray-100 border border-gray-200">
                  <svg
                    className="h-5 w-5 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
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
                  <h5 className="text-copy-14 truncate font-semibold text-gray-900">
                    {workshop.title}
                  </h5>
                  <div className="text-label-12 mt-1 flex flex-wrap items-center gap-2 text-gray-500">
                    <span className="flex items-center gap-1 font-mono text-[11px]">
                      {formatDate(workshop.date)}
                    </span>
                    <span className="flex items-center gap-1 font-semibold">
                      {workshop.meetingType === 'ONLINE' ? <Globe className="h-3 w-3 text-gray-500" /> : <MapPin className="h-3 w-3 text-gray-500" />}
                      {' '}{workshop.meetingType === 'ONLINE' ? 'Online' : 'In-person'}
                    </span>
                    <CategoryBadge category={workshop.category} />
                    <span className="flex items-center gap-1 font-semibold">
                      <Users className="h-3 w-3 text-gray-500" /> {workshop.registrationCount} / {workshop.maxAttendees || '\u221E'}
                    </span>
                  </div>
                  <div className="text-label-12 mt-2 flex items-center gap-3 text-gray-500">
                    <span className="font-semibold text-gray-600">Mentor: {workshop.mentorDisplayName}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
          {(workshopsOverview || []).length > 10 && (
            <div className="mt-3 text-center">
              <a
                href="/admin/workshops"
                className="text-label-12 text-tertiary font-bold hover:underline"
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
