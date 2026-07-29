import { useEffect, useState } from 'react';
import { api } from '@lib/api';
import { useStore } from '@nanostores/react';
import { $user, fetchCurrentUser } from '@stores/authStore';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

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

const emotionIcons: Record<string, string> = {
  HAPPY: '😊', EXCITED: '🤩', CONFUSED: '😕', HOMESICK: '🏠',
  LONELY: '😔', SCARED: '😨', ANXIOUS: '😰', BURNT_OUT: '😩',
  OVERWHELMED: '🤯', STRESSED: '😤',
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
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center gap-3 p-4 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-slate-800" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-800 rounded w-1/3" />
              <div className="h-3 bg-slate-800 rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const isStudent = user?.role === 'STUDENT';
  const isMentor = user?.role === 'MENTOR';

  return (
    <div className={`${compact ? '' : 'h-full flex flex-col'}`}>
      {!compact && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h1 className="text-xl font-bold text-slate-100 font-sans">Messages</h1>
          {isStudent && (
            <button
              onClick={handleStartChat}
              className="rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold px-4 py-2 text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              + New Chat
            </button>
          )}
        </div>
      )}

      {chats.length === 0 ? (
        <div className="text-center py-16 px-4">
          <svg className="mx-auto h-14 w-14 text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <h3 className="text-lg font-semibold text-slate-300 font-sans">No conversations yet</h3>
          {isStudent ? (
            <p className="text-sm text-slate-500 mt-2 mb-6 max-w-sm mx-auto">
              Start a chat with a mentor to get support. A mentor will be assigned to you automatically.
            </p>
          ) : (
            <p className="text-sm text-slate-500 mt-2 mb-6 max-w-sm mx-auto">
              When a student reaches out, their conversation will appear here.
            </p>
          )}
          {isStudent && (
            <button
              onClick={handleStartChat}
              className="rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold px-5 py-2.5 text-sm transition-all"
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
            const emotionIcon = isMentor && chat.latestEmotion
              ? emotionIcons[chat.latestEmotion.emotion] || ''
              : '';

            return (
              <a
                key={chat.id}
                href={`/chat/${chat.id}`}
                onClick={onSelect ? (e) => { e.preventDefault(); onSelect(chat.id); } : undefined}
                className={`flex items-center gap-4 px-6 py-4 border-b border-slate-800/60 hover:bg-slate-800/40 transition-colors ${
                  chat.unreadCount > 0 ? 'bg-slate-800/20' : ''
                }`}
              >
                <div className="relative flex-shrink-0">
                  <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${
                    isStudent ? 'from-indigo-400 to-purple-500' : 'from-teal-400 to-indigo-500'
                  } flex items-center justify-center text-sm font-bold text-white`}>
                    {otherInitial}
                  </div>
                  {emotionIcon && (
                    <span className="absolute -bottom-1 -right-1 text-sm">{emotionIcon}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className={`text-sm font-semibold truncate ${
                      chat.unreadCount > 0 ? 'text-slate-100' : 'text-slate-300'
                    }`}>
                      {displayName}
                    </span>
                    <div className="flex items-center gap-2">
                      {chat.unreadCount > 0 && (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-teal-500 px-1.5 text-[10px] font-bold text-white">
                          {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
                        </span>
                      )}
                      {chat.lastMessage && (
                        <time className="text-[10px] text-slate-600 flex-shrink-0">
                          {formatDistanceToNow(new Date(chat.lastMessage.createdAt), { addSuffix: true })}
                        </time>
                      )}
                    </div>
                  </div>
                  <p className={`text-xs truncate ${
                    chat.unreadCount > 0 ? 'text-slate-400 font-medium' : 'text-slate-600'
                  }`}>
                    {chat.lastMessage?.body || 'No messages yet'}
                  </p>
                  {isMentor && chat.latestEmotion && (
                    <p className="text-[10px] text-slate-600 mt-0.5">
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
