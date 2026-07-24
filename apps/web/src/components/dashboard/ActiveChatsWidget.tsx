import { formatDistanceToNow } from 'date-fns';

interface ActiveChatsWidgetProps {
  activeChats: Array<{
    id: string;
    studentIdentityId: string;
    mentorId: string | null;
    status: string;
    createdAt: string;
    studentDisplayName: string;
    mentorDisplayName: string | null;
    unreadCount: number;
    lastMessage: { body: string; createdAt: string } | null;
  }>;
  className?: string;
}

export function ActiveChatsWidget({ activeChats, className = '' }: ActiveChatsWidgetProps) {
  if (!activeChats || activeChats.length === 0) {
    return (
      <div className={`dashboard-card p-6 ${className}`}>
        <h3 className="text-heading-20 mb-4 text-slate-100">Active Chats</h3>
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
          <p className="text-copy-14 mt-3 text-slate-400">No active chats</p>
          <p className="text-label-14 mt-1 text-slate-500">Start a conversation with a mentor</p>
          <a
            href="/chat"
            className="button-primary text-button-14 mt-4 inline-block rounded-lg px-4 py-2 transition-opacity hover:opacity-90"
          >
            Find Support
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={`dashboard-card p-6 ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-heading-20 text-slate-100">Active Chats</h3>
        <a
          href="/chat"
          className="text-label-14 text-teal-400 transition-colors hover:text-teal-300"
        >
          View all
        </a>
      </div>

      <div className="space-y-3">
        {activeChats.slice(0, 5).map(chat => (
          <a
            key={chat.id}
            href={`/chat/${chat.id}`}
            className="flex items-center gap-4 rounded-lg border border-slate-800/50 bg-slate-900/50 p-3 transition-all hover:border-slate-700/50 hover:bg-slate-800/50"
          >
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-indigo-600">
              <svg
                className="h-5 w-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <p className="text-copy-14 truncate pr-2 font-medium text-slate-100">
                  {chat.studentDisplayName}
                </p>
                {chat.unreadCount > 0 && (
                  <span className="flex h-5 min-w-5 flex-shrink-0 items-center justify-center rounded-full bg-teal-500 px-1.5 text-xs font-medium text-white">
                    {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
                  </span>
                )}
              </div>
              {chat.lastMessage && (
                <p className="text-label-14 mt-0.5 truncate text-slate-400">
                  {chat.lastMessage.body}
                </p>
              )}
            </div>
            {chat.lastMessage && (
              <time
                className="text-label-12 flex-shrink-0 whitespace-nowrap text-slate-500"
                dateTime={chat.lastMessage.createdAt}
              >
                {formatDistanceToNow(new Date(chat.lastMessage.createdAt), { addSuffix: true })}
              </time>
            )}
          </a>
        ))}
      </div>
    </div>
  );
}
