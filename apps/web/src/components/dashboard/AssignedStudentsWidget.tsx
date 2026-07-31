import { formatDistanceToNow } from 'date-fns';
import { AlertCircle, MinusCircle, ArrowDownCircle } from 'lucide-react';

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

export function AssignedStudentsWidget({
  assignedStudents,
  className = '',
}: AssignedStudentsWidgetProps) {
  if (!assignedStudents || assignedStudents.length === 0) {
    return (
      <div className={`dashboard-card p-6 ${className}`}>
        <h3 className="text-heading-20 mb-4 text-gray-1000 font-semibold">Assigned Students</h3>
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
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <p className="text-copy-14 mt-3 text-gray-600 font-medium">No assigned students</p>
          <p className="text-label-12 mt-1 text-gray-500">
            Accept waiting chats to see assigned students here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`dashboard-card p-6 ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-heading-20 text-gray-1000 font-semibold">Assigned Students</h3>
        <span className="text-label-14 text-gray-500">{assignedStudents.length} active</span>
      </div>

      <div className="space-y-2">
        {assignedStudents.slice(0, 5).map(student => (
          <a
            key={student.id}
            href={`/mentor/chat/${student.id}`}
            className="flex items-start gap-4 rounded-sm border border-gray-200 bg-background-100 p-4 transition-colors hover:bg-gray-50 focus-visible:outline-none"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-gray-100 border border-gray-200 text-gray-700 flex-shrink-0">
              <span className="text-base font-bold">
                {student.studentDisplayName.charAt(0).toUpperCase()}
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-copy-14 truncate pr-2 font-semibold text-gray-900">
                  {student.studentDisplayName}
                </p>
                <div className="flex flex-shrink-0 items-center gap-2">
                  {student.unreadCount > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-sm bg-blue-700 px-1.5 text-xs font-semibold text-background-100">
                      {student.unreadCount > 9 ? '9+' : student.unreadCount}
                    </span>
                  )}
                  <time
                    className="text-label-12 whitespace-nowrap text-gray-400 font-mono"
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
                  <span className="text-label-12 text-gray-400 font-medium">Mood:</span>
                  <span className="inline-flex items-center gap-1 rounded-sm border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs font-semibold text-gray-700">
                    {student.latestEmotion.emotion}
                    {student.latestEmotion.urgencyLevel === 'HIGH' && <AlertCircle className="h-3 w-3 text-red-500" />}
                    {student.latestEmotion.urgencyLevel === 'MEDIUM' && <MinusCircle className="h-3 w-3 text-amber-500" />}
                    {student.latestEmotion.urgencyLevel === 'LOW' && <ArrowDownCircle className="h-3 w-3 text-green-500" />}
                  </span>
                </div>
              )}

              {student.lastMessage && (
                <p className="text-label-12 mt-1 truncate text-gray-500">
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
            className="text-label-14 font-medium text-tertiary hover:underline transition-colors"
          >
            View all {assignedStudents.length} assigned students
          </a>
        </div>
      )}
    </div>
  );
}
