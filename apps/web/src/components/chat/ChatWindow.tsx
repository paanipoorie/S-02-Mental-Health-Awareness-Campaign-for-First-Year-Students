import { useEffect, useState, useRef, useCallback } from 'react';
import { api } from '@lib/api';
import { useStore } from '@nanostores/react';
import { $user, fetchCurrentUser } from '@stores/authStore';
import { getSocket } from '@lib/socket';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { toast } from 'sonner';

interface Message {
  id: string;
  body: string;
  createdAt: string;
  senderType: 'ANONYMOUS_IDENTITY' | 'MENTOR';
  senderName: string;
  isOwn: boolean;
  readAt: string | null;
}

interface ChatInfo {
  id: string;
  studentIdentityId: string;
  studentDisplayName: string;
  mentorDisplayName: string | null;
  status: string;
  latestEmotion?: { emotion: string; urgencyLevel: string | null } | null;
}

interface ChatWindowProps {
  threadId: string;
}

export function ChatWindow({ threadId }: ChatWindowProps) {
  const user = useStore($user);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInfo, setChatInfo] = useState<ChatInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, []);

  const fetchChatInfo = async () => {
    try {
      const data = await api.get<ChatInfo>(`/chats/${threadId}`);
      setChatInfo(data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load chat');
    }
  };

  const fetchMessages = async (pageNum: number = 1, append: boolean = false) => {
    try {
      const res = await api.get<{
        data: Message[];
        pagination: { page: number; totalPages: number };
      }>(`/chats/${threadId}/messages?page=${pageNum}&limit=50`);
      if (append) {
        setMessages(prev => [...res.data, ...prev]);
      } else {
        setMessages(res.data);
      }
      setHasMore(res.pagination.page < res.pagination.totalPages);
      if (!append) {
        setTimeout(scrollToBottom, 100);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      fetchCurrentUser().then(() => {
        fetchChatInfo();
        fetchMessages();
      });
    } else {
      fetchChatInfo();
      fetchMessages();
    }
  }, [threadId]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket.connected) socket.connect();

    socket.emit('chat:join', { threadId });

    socket.on('chat:message', (msg: Message) => {
      setMessages(prev => [...prev, msg]);
      setTimeout(scrollToBottom, 50);
    });

    socket.on('chat:typing', ({ senderId }: { senderId: string }) => {
      if (senderId !== user?.userId && senderId !== user?.id) {
        setTypingUsers(prev => new Set(prev).add(senderId));
        setTimeout(() => {
          setTypingUsers(prev => {
            const next = new Set(prev);
            next.delete(senderId);
            return next;
          });
        }, 3000);
      }
    });

    return () => {
      socket.off('chat:message');
      socket.off('chat:typing');
    };
  }, [threadId, user]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;

    setSending(true);
    setInput('');
    try {
      const socket = getSocket();
      if (socket.connected) {
        socket.emit('chat:message', { threadId, body: text });
      } else {
        await api.post(`/chats/${threadId}/messages`, { body: text });
        fetchMessages();
      }
      setTimeout(scrollToBottom, 100);
    } catch (err: any) {
      setInput(text);
      toast.error(err.message || 'Failed to send message');
    } finally {
      setSending(false);
      if (inputRef.current) inputRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const socket = getSocket();
    if (socket.connected) {
      socket.emit('chat:typing', { threadId });
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('chat:typing', { threadId, stop: true });
    }, 2000);
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchMessages(nextPage, true);
  };

  const isStudent = user?.role === 'STUDENT';
  const otherName = isStudent
    ? chatInfo?.mentorDisplayName || 'Mentor'
    : chatInfo?.studentDisplayName || 'Student';

  if (loading) {
    return (
      <div className="bg-background-100 flex h-full flex-col">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="h-5 w-1/3 animate-pulse rounded-sm bg-gray-200" />
        </div>
        <div className="flex-1 space-y-4 p-6">
          {[1, 2, 3].map(i => (
            <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
              <div className={`h-12 w-3/5 animate-pulse rounded-sm bg-gray-200`} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background-100 flex h-full flex-col">
      <div className="bg-background-100 flex items-center gap-3 border-b border-gray-200 px-6 py-3">
        <a
          href="/chat"
          className="text-lg text-gray-500 transition-colors hover:text-gray-700 md:hidden"
        >
          ←
        </a>
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-sm border border-gray-200 bg-gray-100 text-sm font-bold text-gray-700">
          {otherName.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-gray-900">{otherName}</p>
          {chatInfo?.latestEmotion && (
            <p className="mt-0.5 font-mono text-[10px] text-gray-400">
              Mood: {chatInfo.latestEmotion.emotion}
              {chatInfo.latestEmotion.urgencyLevel &&
                ` · ${chatInfo.latestEmotion.urgencyLevel} Urgency`}
            </p>
          )}
        </div>
      </div>

      <div ref={messagesContainerRef} className="flex-1 space-y-1 overflow-y-auto px-6 py-4">
        {hasMore && (
          <div className="py-2 text-center">
            <button
              onClick={loadMore}
              className="text-tertiary text-xs font-semibold transition-colors hover:underline"
            >
              Load older messages
            </button>
          </div>
        )}

        {messages.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm italic text-gray-400">No messages yet. Say hello!</p>
          </div>
        ) : (
          messages.map(msg => (
            <MessageBubble
              key={msg.id}
              message={{
                ...msg,
                isOwn: isStudent
                  ? msg.senderType === ('ANONYMOUS' as any) ||
                    msg.senderType === 'ANONYMOUS_IDENTITY'
                  : msg.senderType === 'MENTOR',
              }}
            />
          ))
        )}

        {typingUsers.size > 0 && <TypingIndicator displayName={otherName} />}

        <div ref={messagesEndRef} />
      </div>

      <div className="bg-background-100 border-t border-gray-200 px-6 py-4">
        <div className="flex items-end gap-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            rows={1}
            className="bg-background-100 text-copy-14 max-h-32 min-h-[42px] flex-1 resize-none rounded-sm border border-gray-200 px-3.5 py-2.5 text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-gray-900"
            disabled={sending}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="bg-primary text-button-14 text-background-100 flex-shrink-0 rounded-sm px-5 py-2.5 font-semibold transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sending ? '...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}
