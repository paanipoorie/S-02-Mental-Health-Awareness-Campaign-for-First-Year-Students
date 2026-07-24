import { formatDistanceToNow } from 'date-fns';

interface AnnouncementsWidgetProps {
  announcements: Array<{
    id: string;
    title: string;
    body: string;
    createdAt: string;
  }>;
  className?: string;
}

export function AnnouncementsWidget({ announcements, className = '' }: AnnouncementsWidgetProps) {
  if (!announcements || announcements.length === 0) {
    return (
      <div className={`dashboard-card p-6 ${className}`}>
        <h3 className="text-heading-20 mb-4 text-slate-100">Announcements</h3>
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
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          <p className="text-copy-14 mt-3 text-slate-400">No announcements</p>
          <p className="text-label-14 mt-1 text-slate-500">Check back later for updates</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`dashboard-card p-6 ${className}`}>
      <h3 className="text-heading-20 mb-4 text-slate-100">Announcements</h3>

      <div className="space-y-3">
        {announcements.slice(0, 3).map(announcement => (
          <div
            key={announcement.id}
            className="rounded-lg border border-slate-800/50 bg-slate-900/50 p-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h4 className="text-copy-14 font-semibold text-slate-100">{announcement.title}</h4>
                <p className="text-label-14 mt-1 line-clamp-3 text-slate-300">
                  {announcement.body}
                </p>
              </div>
              <time
                className="text-label-12 flex-shrink-0 whitespace-nowrap text-slate-500"
                dateTime={announcement.createdAt}
              >
                {formatDistanceToNow(new Date(announcement.createdAt), { addSuffix: true })}
              </time>
            </div>
          </div>
        ))}
      </div>

      {announcements.length > 3 && (
        <div className="mt-4 text-center">
          <a
            href="/announcements"
            className="text-label-14 text-teal-400 transition-colors hover:text-teal-300"
          >
            View all {announcements.length} announcements
          </a>
        </div>
      )}
    </div>
  );
}
