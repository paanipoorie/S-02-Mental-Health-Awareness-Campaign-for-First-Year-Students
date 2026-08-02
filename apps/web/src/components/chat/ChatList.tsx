import { useEffect, useState } from 'react';
import { api } from '@lib/api';
import { useStore } from '@nanostores/react';
import { $user, fetchCurrentUser } from '@stores/authStore';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import {
  Smile,
  Sparkles,
  HelpCircle,
  Home,
  Frown,
  AlertTriangle,
  AlertCircle,
  BatteryLow,
  Brain,
  Zap,
} from 'lucide-react';

interface ChatThread {
  id: string;
  studentIdentityId: string;
  mentorId: string | null;
  status: string;
  createdAt: string;
  studentDisplayName: string;
  mentorDisplayName: string | null;
  unreadCount: number;
  lastMessage: { body: string; createdAt: string } | null;
  latestEmotion?: { emotion: string; urgencyLevel: string | null } | null;
}

interface ChatListProps {
  onSelect?: (threadId: string) => void;
  compact?: boolean;
}

const emotionIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  HAPPY: Smile,
  EXCITED: Sparkles,
  CONFUSED: HelpCircle,
  HOMESICK: Home,
  LONELY: Frown,
  SCARED: AlertTriangle,
  ANXIOUS: AlertCircle,
  BURNT_OUT: BatteryLow,
  OVERWHELMED: Brain,
  STRESSED: Zap,
};

export function ChatList({ onSelect, compact }: ChatListProps) {
  const user = useStore($user);
  const [chats, setChats] = useState<ChatThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChats = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!user) await fetchCurrentUser();
      const res = await api.get<{ data: ChatThread[] }>('/chats');
      setChats(res.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load chats');
      toast.error(err.message || 'Failed to load chats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  const handleStartChat = async () => {
    try {
      const data = await api.post<{ id: string }>('/chats');
      window.location.href = `/chat?threadId=${data.id}`;
    } catch (err: any) {
      toast.error(err.message || 'Failed to start chat');
    }
  };

  if (loading) {
    return (
      <div className="space-y-2 p-4">
        {[1, 2, 3].map(i => (
          <div
            key={i}
            className="bg-background-100 flex animate-pulse items-center gap-3 rounded-sm border border-gray-200 p-4"
          >
            <div className="h-10 w-10 rounded-sm bg-gray-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/3 rounded-sm bg-gray-200" />
              <div className="h-3 w-2/3 rounded-sm bg-gray-200" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
        <h3 className="text-heading-16 text-red-600 font-bold">Failed to load chats</h3>
        <p className="text-copy-13 mt-2 text-gray-500">{error}</p>
        <button
          onClick={fetchChats}
          className="bg-primary text-background-100 mt-4 inline-block rounded-sm px-4 py-2 text-xs font-semibold transition-colors hover:bg-gray-800"
        >
          Retry
        </button>
      </div>
    );
  }

  const isStudent = user?.role === 'STUDENT';
  const isMentor = user?.role === 'MENTOR';

  return (
    <div className={`${compact ? '' : 'bg-background-100 flex h-full flex-col'}`}>
      {!compact && (
        <div className="bg-background-100 flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h1 className="text-heading-20 text-gray-1000 font-bold">Messages</h1>
          {isStudent && (
            <button
              onClick={handleStartChat}
              className="bg-primary text-button-14 text-background-100 rounded-sm px-4 py-2 font-semibold transition-colors hover:bg-gray-800"
            >
              + New Chat
            </button>
          )}
        </div>
      )}

      {chats.length === 0 ? (
        <div className="bg-background-100 px-4 py-16 text-center">
          <svg
            className="mx-auto mb-4 h-12 w-12 text-gray-400"
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
          <h3 className="text-heading-18 font-bold text-gray-900">No conversations yet</h3>
          {isStudent ? (
            <p className="text-copy-14 mx-auto mb-6 mt-2 max-w-sm text-gray-500">
              Start a chat with a mentor to get support. A mentor will be assigned to you
              automatically.
            </p>
          ) : (
            <p className="text-copy-14 mx-auto mb-6 mt-2 max-w-sm text-gray-500">
              When a student reaches out, their conversation will appear here.
            </p>
          )}
          {isStudent && (
            <button
              onClick={handleStartChat}
              className="bg-primary text-button-14 text-background-100 rounded-sm px-5 py-2.5 font-semibold transition-colors hover:bg-gray-800"
            >
              Start a Chat
            </button>
          )}
        </div>
      ) : (
        <div className={`${compact ? '' : 'flex-1 overflow-y-auto'}`}>
          {chats.map(chat => {
            const displayName = isStudent
              ? chat.mentorDisplayName || 'Mentor'
              : chat.studentDisplayName;
            const otherInitial = displayName.charAt(0);
            const EmotionIconComponent =
              isMentor && chat.latestEmotion ? emotionIcons[chat.latestEmotion.emotion] : undefined;

            const isUnread = chat.unreadCount > 0;

            return (
              <a
                key={chat.id}
                href={`/chat?threadId=${chat.id}`}
                onClick={
                  onSelect
                    ? e => {
                        e.preventDefault();
                        onSelect(chat.id);
                      }
                    : undefined
                }
                className={`bg-background-100 flex items-center gap-4 border-b border-gray-200 px-6 py-4 transition-colors hover:bg-gray-50 ${
                  isUnread ? 'bg-blue-50/20' : ''
                }`}
              >
                <div className="relative flex-shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-sm border border-gray-200 bg-gray-100 text-sm font-bold text-gray-700">
                    {otherInitial}
                  </div>
                  {EmotionIconComponent && (
                    <EmotionIconComponent className="absolute -bottom-1.5 -right-1.5 h-3.5 w-3.5 text-gray-600" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-0.5 flex items-center justify-between">
                    <span
                      className={`text-copy-14 truncate ${
                        isUnread ? 'font-bold text-gray-900' : 'font-semibold text-gray-800'
                      }`}
                    >
                      {displayName}
                    </span>
                    <div className="flex items-center gap-2">
                      {isUnread && (
                        <span className="text-background-100 flex h-5 min-w-5 items-center justify-center rounded-sm bg-blue-700 px-1.5 text-[10px] font-bold">
                          {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
                        </span>
                      )}
                      {chat.lastMessage && (
                        <time className="text-label-10 flex-shrink-0 font-mono text-gray-400">
                          {formatDistanceToNow(new Date(chat.lastMessage.createdAt), {
                            addSuffix: true,
                          })}
                        </time>
                      )}
                    </div>
                  </div>
                  <p
                    className={`text-label-12 truncate ${
                      isUnread ? 'font-semibold text-gray-700' : 'text-gray-500'
                    }`}
                  >
                    {chat.lastMessage?.body || 'No messages yet'}
                  </p>
                  {isMentor && chat.latestEmotion && (
                    <p className="mt-1 font-mono text-[10px] text-gray-400">
                      Emotion: {chat.latestEmotion.emotion}
                      {chat.latestEmotion.urgencyLevel && ` · ${chat.latestEmotion.urgencyLevel}`}
                    </p>
                  )}
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
