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
        <h3 className="text-heading-20 mb-4 text-gray-1000 font-semibold">Active Chats</h3>
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
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <p className="text-copy-14 mt-3 text-gray-600 font-medium">No active chats</p>
          <p className="text-label-12 mt-1 text-gray-500">Initiate an anonymous conversation with a peer mentor.</p>
          <a
            href="/chat"
            className="mt-4 inline-block rounded-sm bg-primary px-4 py-2 text-button-14 font-semibold text-background-100 hover:bg-gray-800 transition-colors"
          >
            Start Chat
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={`dashboard-card p-6 ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-heading-20 text-gray-1000 font-semibold">Active Chats</h3>
        <a
          href="/chat"
          className="text-label-14 font-medium text-tertiary hover:underline transition-colors"
        >
          View all
        </a>
      </div>

      <div className="space-y-2">
        {activeChats.slice(0, 5).map(chat => (
          <a
            key={chat.id}
            href={`/chat/${chat.id}`}
            className="flex items-center gap-4 rounded-sm border border-gray-200 bg-background-100 p-3 transition-colors hover:bg-gray-50 focus-visible:outline-none"
          >
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-sm bg-gray-100 border border-gray-200 text-gray-700">
              <svg
                className="h-5 w-5"
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
                <p className="text-copy-14 truncate pr-2 font-semibold text-gray-900">
                  {chat.mentorDisplayName || chat.studentDisplayName}
                </p>
                {chat.unreadCount > 0 && (
                  <span className="flex h-5 min-w-5 flex-shrink-0 items-center justify-center rounded-sm bg-blue-700 px-1.5 text-xs font-semibold text-background-100">
                    {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
                  </span>
                )}
              </div>
              {chat.lastMessage && (
                <p className="text-label-12 mt-0.5 truncate text-gray-500">
                  {chat.lastMessage.body}
                </p>
              )}
            </div>
            {chat.lastMessage && (
              <time
                className="text-label-12 flex-shrink-0 whitespace-nowrap text-gray-400"
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
