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
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
      const data = await api.get<{ messages: Message[]; hasMore: boolean }>(
        `/chats/${threadId}/messages?page=${pageNum}&limit=50`
      );
      if (append) {
        setMessages(prev => [...data.messages, ...prev]);
      } else {
        setMessages(data.messages);
      }
      setHasMore(data.hasMore);
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
    ? (chatInfo?.mentorDisplayName || 'Mentor')
    : (chatInfo?.studentDisplayName || 'Student');

  if (loading) {
    return (
      <div className="h-full flex flex-col">
        <div className="border-b border-slate-800 px-6 py-4">
          <div className="h-5 bg-slate-800 rounded w-1/3 animate-pulse" />
        </div>
        <div className="flex-1 p-6 space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
              <div className={`h-12 bg-slate-800 rounded-2xl w-3/5 animate-pulse ${i % 2 === 1 ? 'rounded-bl-md' : 'rounded-br-md'}`} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-3 px-6 py-3 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md">
        <a href="/chat" className="text-slate-500 hover:text-slate-300 transition-colors md:hidden">
          ←
        </a>
        <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${
          isStudent ? 'from-indigo-400 to-purple-500' : 'from-teal-400 to-indigo-500'
        } flex items-center justify-center text-sm font-bold text-white flex-shrink-0`}>
          {otherName.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-100 truncate">{otherName}</p>
          {chatInfo?.latestEmotion && (
            <p className="text-[10px] text-slate-500">
              Feeling: {chatInfo.latestEmotion.emotion}
              {chatInfo.latestEmotion.urgencyLevel && ` · ${chatInfo.latestEmotion.urgencyLevel} urgency`}
            </p>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-1">
        {hasMore && (
          <div className="text-center py-2">
            <button onClick={loadMore} className="text-xs text-teal-400 hover:text-teal-300 transition-colors">
              Load older messages
            </button>
          </div>
        )}

        {messages.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-sm text-slate-500">No messages yet. Say hello!</p>
          </div>
        ) : (
          messages.map(msg => (
            <MessageBubble key={msg.id} message={msg} />
          ))
        )}

        {typingUsers.size > 0 && <TypingIndicator displayName={otherName} />}

        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-slate-800 px-6 py-4 bg-slate-900/80 backdrop-blur-md">
        <div className="flex items-end gap-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            rows={1}
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 resize-none outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all min-h-[44px] max-h-32"
            disabled={sending}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="rounded-xl bg-teal-500 hover:bg-teal-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-semibold px-5 py-3 text-sm transition-all disabled:cursor-not-allowed flex-shrink-0"
          >
            {sending ? '...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}
