import { formatDistanceToNow } from 'date-fns';

interface AssignedStudentsWidgetProps {
  assignedStudents: Array<{
    id: string;
    studentIdentityId: string;
    studentDisplayName: string;
    studentAvatarSeed: number;
    status: string;
    createdAt: string;
    latestEmotion: {
      emotion: string;
      urgencyLevel: string | null;
      createdAt: string;
    } | null;
    unreadCount: number;
    lastMessage: { body: string; createdAt: string } | null;
  }>;
  className?: string;
}

const AVATAR_COLORS = [
  'from-teal-500 to-indigo-600',
  'from-purple-500 to-pink-600',
  'from-amber-500 to-orange-600',
  'from-emerald-500 to-teal-600',
  'from-rose-500 to-pink-600',
  'from-indigo-500 to-blue-600',
  'from-cyan-500 to-teal-600',
  'from-violet-500 to-purple-600',
];

function getAvatarColor(seed: number): string {
  return AVATAR_COLORS[seed % AVATAR_COLORS.length];
}

export function AssignedStudentsWidget({
  assignedStudents,
  className = '',
}: AssignedStudentsWidgetProps) {
  if (!assignedStudents || assignedStudents.length === 0) {
    return (
      <div className={`dashboard-card p-6 ${className}`}>
        <h3 className="text-heading-20 mb-4 text-slate-100">Assigned Students</h3>
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
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <p className="text-copy-14 mt-3 text-slate-400">No assigned students</p>
          <p className="text-label-14 mt-1 text-slate-500">
            Accept waiting chats to see assigned students here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`dashboard-card p-6 ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-heading-20 text-slate-100">Assigned Students</h3>
        <span className="text-label-14 text-slate-400">{assignedStudents.length} active</span>
      </div>

      <div className="space-y-3">
        {assignedStudents.slice(0, 5).map(student => (
          <a
            key={student.id}
            href={`/mentor/chat/${student.id}`}
            className="flex items-start gap-4 rounded-lg border border-slate-800/50 bg-slate-900/50 p-4 transition-all hover:border-slate-700/50 hover:bg-slate-800/50"
          >
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${getAvatarColor(student.studentAvatarSeed)} flex-shrink-0`}
            >
              <span className="text-xl font-bold text-white">
                {student.studentDisplayName.charAt(0).toUpperCase()}
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-copy-14 truncate pr-2 font-medium text-slate-100">
                  {student.studentDisplayName}
                </p>
                <div className="flex flex-shrink-0 items-center gap-2">
                  {student.unreadCount > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-teal-500 px-1.5 text-xs font-medium text-white">
                      {student.unreadCount > 9 ? '9+' : student.unreadCount}
                    </span>
                  )}
                  <time
                    className="text-label-12 whitespace-nowrap text-slate-500"
                    dateTime={student.lastMessage?.createdAt || student.createdAt}
                  >
                    {formatDistanceToNow(
                      new Date(student.lastMessage?.createdAt || student.createdAt),
                      { addSuffix: true }
                    )}
                  </time>
                </div>
              </div>

              {student.latestEmotion && (
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-label-12 text-slate-400">Mood:</span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-slate-700/50 bg-slate-800/50 px-2 py-0.5 text-xs font-medium text-slate-300">
                    {student.latestEmotion.emotion}
                    {student.latestEmotion.urgencyLevel === 'HIGH' && '🔴'}
                    {student.latestEmotion.urgencyLevel === 'MEDIUM' && '🟡'}
                    {student.latestEmotion.urgencyLevel === 'LOW' && '🟢'}
                  </span>
                </div>
              )}

              {student.lastMessage && (
                <p className="text-label-13 mt-1 truncate text-slate-400">
                  {student.lastMessage.body}
                </p>
              )}
            </div>
          </a>
        ))}
      </div>

      {assignedStudents.length > 5 && (
        <div className="mt-4 text-center">
          <a
            href="/mentor/chats"
            className="text-label-14 text-teal-400 transition-colors hover:text-teal-300"
          >
            View all {assignedStudents.length} assigned students
          </a>
        </div>
      )}
    </div>
  );
}
