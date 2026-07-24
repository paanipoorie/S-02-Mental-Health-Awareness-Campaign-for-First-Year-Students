import { formatDistanceToNow } from 'date-fns';
import { EmotionBadge } from '@components/emotion/EmotionBadge';

interface WaitingChatsWidgetProps {
  waitingChats: Array<{
    id: string;
    studentIdentityId: string;
    status: string;
    createdAt: string;
    studentDisplayName: string;
    studentAvatarSeed: number;
    latestEmotion: {
      emotion: string;
      urgencyLevel: string | null;
      createdAt: string;
    } | null;
  }>;
  className?: string;
}

export function WaitingChatsWidget({ waitingChats, className = '' }: WaitingChatsWidgetProps) {
  if (!waitingChats || waitingChats.length === 0) {
    return (
      <div className={`dashboard-card p-6 ${className}`}>
        <h3 className="text-heading-20 mb-4 text-slate-100">Waiting Chats</h3>
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
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <p className="text-copy-14 mt-3 text-slate-400">No students waiting</p>
          <p className="text-label-14 mt-1 text-slate-500">
            Students awaiting mentor assignment will appear here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`dashboard-card p-6 ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-heading-20 text-slate-100">Waiting Chats</h3>
        <span className="flex h-6 min-w-6 items-center justify-center rounded-full border border-teal-500/20 bg-teal-500/10 px-2 text-xs font-semibold text-teal-400">
          {waitingChats.length}
        </span>
      </div>

      <div className="space-y-3">
        {waitingChats.slice(0, 5).map(chat => (
          <a
            key={chat.id}
            href={`/mentor/chat/${chat.id}`}
            className="flex items-start gap-4 rounded-lg border border-slate-800/50 bg-slate-900/50 p-4 transition-all hover:border-teal-500/30 hover:bg-teal-500/5"
          >
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-indigo-600">
              <span className="text-xl font-bold text-white">
                {chat.studentDisplayName.charAt(0).toUpperCase()}
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-copy-14 truncate pr-2 font-medium text-slate-100">
                  {chat.studentDisplayName}
                </p>
                <span className="inline-flex flex-shrink-0 items-center gap-1 rounded-full border border-teal-500/20 bg-teal-500/10 px-2 py-0.5 text-xs font-medium text-teal-400">
                  Waiting
                </span>
              </div>
              <p className="text-label-13 mt-1 text-slate-400">
                Waiting for {formatDistanceToNow(new Date(chat.createdAt), { addSuffix: true })}
              </p>
              {chat.latestEmotion && (
                <div className="mt-2 flex items-center gap-2">
                  <EmotionBadge
                    emotion={chat.latestEmotion.emotion as any}
                    urgency={chat.latestEmotion.urgencyLevel as any}
                    size="sm"
                  />
                </div>
              )}
            </div>

            <span className="text-label-12 flex-shrink-0 font-medium text-teal-400">
              Assign to Me
            </span>
          </a>
        ))}
      </div>

      {waitingChats.length > 5 && (
        <div className="mt-4 text-center">
          <a
            href="/mentor/chats"
            className="text-label-14 text-teal-400 transition-colors hover:text-teal-300"
          >
            View all {waitingChats.length} waiting chats
          </a>
        </div>
      )}
    </div>
  );
}
