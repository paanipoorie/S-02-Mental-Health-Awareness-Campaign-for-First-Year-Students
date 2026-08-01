interface ActiveUsersWidgetProps {
  activeStudents: Array<{
    id: string;
    anonymousDisplayName: string;
    createdAt: string;
    lastEmotionAt: string | null;
    postCount: number;
    activeChats: number;
  }>;
  activeMentors: Array<{
    id: string;
    displayName: string;
    department: string;
    isVerifiedMentor: boolean;
    availabilityStatus: string;
    activeChats: number;
    hostedMeetings: number;
    hostedWorkshops: number;
    lastSeenAt: string | null;
  }>;
  className?: string;
}

const AVAILABILITY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  AVAILABLE: { label: 'Available', color: 'text-green-700 border-green-200', bg: 'bg-green-50' },
  BUSY: { label: 'Busy', color: 'text-amber-700 border-amber-200', bg: 'bg-amber-50' },
  OFFLINE: { label: 'Offline', color: 'text-gray-700 border-gray-200', bg: 'bg-gray-50' },
};

export function ActiveUsersWidget({
  activeStudents,
  activeMentors,
  className = '',
}: ActiveUsersWidgetProps) {
  return (
    <div
      className={`dashboard-card bg-background-100 rounded-sm border border-gray-200 p-6 ${className}`}
    >
      <h3 className="text-heading-16 text-gray-1000 mb-6 font-bold">Active Users</h3>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h4 className="text-label-14 mb-3 flex items-center gap-2 font-bold text-gray-900">
            <span className="h-2 w-2 rounded-full bg-blue-500"></span>
            Students ({activeStudents?.length || 0})
          </h4>
          <div className="space-y-3">
            {(activeStudents || []).slice(0, 10).map(student => (
              <div
                key={student.id}
                className="bg-background-100 flex items-center gap-3 rounded-sm border border-gray-200 p-3 transition-colors hover:bg-gray-50"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-sm border border-gray-200 bg-gray-100">
                  <span className="text-sm font-bold text-gray-700">
                    {student.anonymousDisplayName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-copy-14 truncate font-semibold text-gray-900">
                    {student.anonymousDisplayName}
                  </p>
                  <div className="text-label-12 mt-1 flex flex-wrap items-center gap-3 text-gray-500">
                    <span className="flex items-center gap-1 font-mono text-[11px]">
                      {formatDate(student.createdAt)} ago
                    </span>
                    <span className="font-semibold">{student.postCount} posts</span>
                    <span className="font-semibold">{student.activeChats} chats</span>
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="font-mono text-[11px] text-gray-400">
                    Joined {formatDate(student.createdAt, true)}
                  </p>
                  {student.lastEmotionAt && (
                    <p className="mt-0.5 text-[10px] font-semibold text-gray-500">
                      Emotion: {formatDate(student.lastEmotionAt, true)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-label-14 mb-3 flex items-center gap-2 font-bold text-gray-900">
            <span className="h-2 w-2 rounded-full bg-purple-500"></span>
            Mentors ({activeMentors?.length || 0})
          </h4>
          <div className="space-y-3">
            {(activeMentors || []).slice(0, 10).map(mentor => {
              const avail =
                AVAILABILITY_CONFIG[mentor.availabilityStatus] || AVAILABILITY_CONFIG.OFFLINE;
              return (
                <div
                  key={mentor.id}
                  className="bg-background-100 flex items-center justify-between rounded-sm border border-gray-200 p-3 transition-colors hover:bg-gray-50"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-sm border border-gray-200 bg-gray-100">
                      <span className="text-sm font-bold text-gray-700">
                        {mentor.displayName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-copy-14 truncate font-semibold text-gray-900">
                          {mentor.displayName}
                        </p>
                        {mentor.isVerifiedMentor && (
                          <span className="inline-flex items-center rounded-sm border border-green-200 bg-green-50 px-1.5 py-0.5 text-[10px] font-bold text-green-700">
                            ✓ Verified
                          </span>
                        )}
                      </div>
                      <div className="text-label-12 mt-1 flex items-center gap-3 text-gray-500">
                        <span>{mentor.department || 'No department'}</span>
                        <span className="font-semibold">{mentor.activeChats} active chats</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-shrink-0 flex-col items-end gap-1">
                    <span
                      className={`inline-flex items-center rounded-sm border px-2 py-0.5 text-[10px] font-bold ${avail.color} ${avail.bg}`}
                    >
                      {avail.label}
                    </span>
                    {mentor.lastSeenAt && (
                      <span className="font-mono text-[10px] text-gray-400">
                        Seen {formatDate(mentor.lastSeenAt, true)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatDate(dateStr: string, addSuffix = false): string {
  const date = new Date(dateStr);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
