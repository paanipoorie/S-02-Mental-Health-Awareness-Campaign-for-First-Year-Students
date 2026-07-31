import { Megaphone } from 'lucide-react';

interface AnnouncementsWidgetProps {
  announcements: Array<{
    id: string;
    title: string;
    body: string;
    createdAt: string;
  }>;
  className?: string;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString([], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function AnnouncementsWidget({ announcements, className = '' }: AnnouncementsWidgetProps) {
  if (!announcements || announcements.length === 0) {
    return (
      <div className={`dashboard-card p-6 ${className}`}>
        <h3 className="text-heading-20 mb-4 text-gray-1000 font-semibold">Announcements</h3>
        <div className="py-8 text-center">
          <Megaphone className="mx-auto h-10 w-10 text-gray-400" strokeWidth={1.5} />
          <p className="text-copy-14 mt-3 text-gray-600 font-medium">No announcements</p>
          <p className="text-label-12 mt-1 text-gray-500">Check back later for university updates.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`dashboard-card ${className}`}>
      <div className="border-b border-gray-200 px-6 py-4">
        <h3 className="text-heading-20 text-gray-1000 font-semibold">Announcements</h3>
      </div>
      <div className="divide-y divide-gray-100">
        {announcements.map(announcement => (
          <div
            key={announcement.id}
            className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h4 className="text-copy-14 font-semibold text-gray-900">
                  {announcement.title}
                </h4>
                <p className="text-label-12 mt-1 text-gray-500 line-clamp-2 leading-relaxed">
                  {announcement.body}
                </p>
              </div>
              <time
                className="text-label-12 flex-shrink-0 whitespace-nowrap text-gray-400"
                dateTime={announcement.createdAt}
              >
                {formatDate(announcement.createdAt)}
              </time>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
