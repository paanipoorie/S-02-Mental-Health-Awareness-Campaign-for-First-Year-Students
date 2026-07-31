import { useEffect, useState } from 'react';
import { api } from '@lib/api';
import { useStore } from '@nanostores/react';
import { $user, fetchCurrentUser } from '@stores/authStore';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { Smile, Sparkles, HelpCircle, Home, Frown, AlertTriangle, AlertCircle, BatteryLow, Brain, Zap } from 'lucide-react';

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
  HAPPY: Smile, EXCITED: Sparkles, CONFUSED: HelpCircle, HOMESICK: Home,
  LONELY: Frown, SCARED: AlertTriangle, ANXIOUS: AlertCircle, BURNT_OUT: BatteryLow,
  OVERWHELMED: Brain, STRESSED: Zap,
};

export function ChatList({ onSelect, compact }: ChatListProps) {
  const user = useStore($user);
  const [chats, setChats] = useState<ChatThread[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChats = async () => {
    try {
      if (!user) await fetchCurrentUser();
      const data = await api.get<{ chats: ChatThread[] }>('/chats');
      setChats(data.chats);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load chats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchChats(); }, []);

  const handleStartChat = async () => {
    try {
      const data = await api.post<{ id: string }>('/chats');
      window.location.href = `/chat/${data.id}`;
    } catch (err: any) {
      toast.error(err.message || 'Failed to start chat');
    }
  };

  if (loading) {
    return (
      <div className="space-y-2 p-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center gap-3 p-4 border border-gray-200 rounded-sm bg-background-100 animate-pulse">
            <div className="w-10 h-10 rounded-sm bg-gray-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded-sm w-1/3" />
              <div className="h-3 bg-gray-200 rounded-sm w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const isStudent = user?.role === 'STUDENT';
  const isMentor = user?.role === 'MENTOR';

  return (
    <div className={`${compact ? '' : 'h-full flex flex-col bg-background-100'}`}>
      {!compact && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-background-100">
          <h1 className="text-heading-20 font-bold text-gray-1000">Messages</h1>
          {isStudent && (
            <button
              onClick={handleStartChat}
              className="rounded-sm bg-primary px-4 py-2 text-button-14 font-semibold text-background-100 hover:bg-gray-800 transition-colors"
            >
              + New Chat
            </button>
          )}
        </div>
      )}

      {chats.length === 0 ? (
        <div className="text-center py-16 px-4 bg-background-100">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <h3 className="text-heading-18 font-bold text-gray-900">No conversations yet</h3>
          {isStudent ? (
            <p className="text-copy-14 text-gray-500 mt-2 mb-6 max-w-sm mx-auto">
              Start a chat with a mentor to get support. A mentor will be assigned to you automatically.
            </p>
          ) : (
            <p className="text-copy-14 text-gray-500 mt-2 mb-6 max-w-sm mx-auto">
              When a student reaches out, their conversation will appear here.
            </p>
          )}
          {isStudent && (
            <button
              onClick={handleStartChat}
              className="rounded-sm bg-primary px-5 py-2.5 text-button-14 font-semibold text-background-100 hover:bg-gray-800 transition-colors"
            >
              Start a Chat
            </button>
          )}
        </div>
      ) : (
        <div className={`${compact ? '' : 'flex-1 overflow-y-auto'}`}>
          {chats.map(chat => {
            const displayName = isStudent
              ? (chat.mentorDisplayName || 'Mentor')
              : chat.studentDisplayName;
            const otherInitial = displayName.charAt(0);
            const EmotionIconComponent = isMentor && chat.latestEmotion
              ? emotionIcons[chat.latestEmotion.emotion]
              : undefined;

            const isUnread = chat.unreadCount > 0;

            return (
              <a
                key={chat.id}
                href={`/chat/${chat.id}`}
                onClick={onSelect ? (e) => { e.preventDefault(); onSelect(chat.id); } : undefined}
                className={`flex items-center gap-4 px-6 py-4 border-b border-gray-200 hover:bg-gray-50 transition-colors bg-background-100 ${
                  isUnread ? 'bg-blue-50/20' : ''
                }`}
              >
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 rounded-sm bg-gray-100 border border-gray-200 flex items-center justify-center text-sm font-bold text-gray-700">
                    {otherInitial}
                  </div>
                  {EmotionIconComponent && (
                    <EmotionIconComponent className="absolute -bottom-1.5 -right-1.5 h-3.5 w-3.5 text-gray-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className={`text-copy-14 truncate ${
                      isUnread ? 'font-bold text-gray-900' : 'font-semibold text-gray-800'
                    }`}>
                      {displayName}
                    </span>
                    <div className="flex items-center gap-2">
                      {isUnread && (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-sm bg-blue-700 px-1.5 text-[10px] font-bold text-background-100">
                          {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
                        </span>
                      )}
                      {chat.lastMessage && (
                        <time className="text-label-10 text-gray-400 font-mono flex-shrink-0">
                          {formatDistanceToNow(new Date(chat.lastMessage.createdAt), { addSuffix: true })}
                        </time>
                      )}
                    </div>
                  </div>
                  <p className={`text-label-12 truncate ${
                    isUnread ? 'text-gray-700 font-semibold' : 'text-gray-500'
                  }`}>
                    {chat.lastMessage?.body || 'No messages yet'}
                  </p>
                  {isMentor && chat.latestEmotion && (
                    <p className="text-[10px] text-gray-400 mt-1 font-mono">
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
