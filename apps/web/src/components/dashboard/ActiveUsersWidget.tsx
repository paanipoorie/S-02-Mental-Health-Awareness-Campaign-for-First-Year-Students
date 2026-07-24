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

const AVAILABILITY_CONFIG: Record<string, { icon: string; color: string; bg: string }> = {
  AVAILABLE: { icon: '🟢', color: 'text-green-400', bg: 'bg-green-500/10' },
  BUSY: { icon: '🟡', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  OFFLINE: { icon: '⚫', color: 'text-slate-500', bg: 'bg-slate-500/10' },
};

export function ActiveUsersWidget({
  activeStudents,
  activeMentors,
  className = '',
}: ActiveUsersWidgetProps) {
  return (
    <div className={`dashboard-card p-6 ${className}`}>
      <h3 className="text-heading-20 mb-6 text-slate-100">Active Users</h3>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h4 className="text-label-14 mb-3 flex items-center gap-2 font-medium text-slate-300">
            <span className="h-2 w-2 rounded-full bg-teal-400"></span>
            Students ({activeStudents?.length || 0})
          </h4>
          <div className="max-h-80 space-y-2 overflow-y-auto">
            {(activeStudents || []).slice(0, 10).map(student => (
              <div
                key={student.id}
                className="flex items-center gap-3 rounded-lg border border-slate-800/50 bg-slate-900/50 p-3"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-indigo-600">
                  <span className="text-sm font-bold text-white">
                    {student.anonymousDisplayName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-copy-14 truncate font-medium text-slate-100">
                    {student.anonymousDisplayName}
                  </p>
                  <div className="text-label-12 mt-1 flex flex-wrap items-center gap-3 text-slate-500">
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
                      {formatDate(student.createdAt)} ago
                    </span>
                    <span>{student.postCount} posts</span>
                    <span>{student.activeChats} active chats</span>
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="text-label-12 text-slate-400">
                    Joined {formatDate(student.createdAt, true)}
                  </p>
                  {student.lastEmotionAt && (
                    <p className="text-label-12 text-slate-500">
                      Last emotion: {formatDate(student.lastEmotionAt, true)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-label-14 mb-3 flex items-center gap-2 font-medium text-slate-300">
            <span className="h-2 w-2 rounded-full bg-purple-400"></span>
            Mentors ({activeMentors?.length || 0})
          </h4>
          <div className="max-h-80 space-y-2 overflow-y-auto">
            {(activeMentors || []).slice(0, 10).map(mentor => (
              <div
                key={mentor.id}
                className="flex items-center justify-between rounded-lg border border-slate-800/50 bg-slate-900/50 p-3"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-600">
                    <span className="text-sm font-bold text-white">
                      {mentor.displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-copy-14 truncate font-medium text-slate-100">
                        {mentor.displayName}
                      </p>
                      {mentor.isVerifiedMentor && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-green-500/30 bg-green-500/20 px-2 py-0.5 text-xs font-medium text-green-400">
                          ✓ Verified
                        </span>
                      )}
                    </div>
                    <div className="text-label-12 mt-0.5 flex items-center gap-3 text-slate-500">
                      <span>{mentor.department || 'No department'}</span>
                      <span>{mentor.activeChats} active chats</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-shrink-0 items-center gap-3">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      AVAILABILITY_CONFIG[mentor.availabilityStatus]?.bg || 'bg-slate-500'
                    }`}
                  />
                  <span className="text-label-12 capitalize text-slate-400">
                    {AVAILABILITY_CONFIG[mentor.availabilityStatus]?.icon || '⚫'}
                    {AVAILABILITY_CONFIG[mentor.availabilityStatus]?.color || 'Offline'}
                  </span>
                  {mentor.lastSeenAt && (
                    <span className="text-label-12 text-slate-500">
                      {formatDate(mentor.lastSeenAt, true)}
                    </span>
                  )}
                </div>
              </div>
            ))}
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
