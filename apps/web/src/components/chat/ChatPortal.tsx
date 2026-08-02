import { useEffect, useState } from 'react';
import { ChatList } from './ChatList';
import { ChatWindow } from './ChatWindow';
import { MessageSquare } from 'lucide-react';

export function ChatPortal() {
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);

  useEffect(() => {
    const getThreadIdFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      return params.get('threadId');
    };

    setActiveThreadId(getThreadIdFromUrl());

    // Listen for history popstate events (e.g. browser back/forward buttons)
    const handlePopState = () => {
      setActiveThreadId(getThreadIdFromUrl());
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleSelectThread = (id: string) => {
    const params = new URLSearchParams(window.location.search);
    params.set('threadId', id);
    window.history.pushState({}, '', `${window.location.pathname}?${params.toString()}`);
    setActiveThreadId(id);
  };

  return (
    <div className="bg-background-100 flex h-full w-full overflow-hidden">
      {/* Left panel: Conversation List */}
      <div
        className={`bg-background-100 w-full flex-shrink-0 border-r border-gray-200 md:w-80 ${
          activeThreadId ? 'hidden h-full flex-col md:flex' : 'flex h-full flex-col'
        }`}
      >
        <ChatList compact={true} activeThreadId={activeThreadId} onSelect={handleSelectThread} />
      </div>

      {/* Right panel: Chat Window */}
      <div
        className={`bg-background-100 h-full flex-1 ${
          activeThreadId
            ? 'flex flex-col'
            : 'hidden flex-col items-center justify-center p-8 text-center md:flex'
        }`}
      >
        {activeThreadId ? (
          <ChatWindow key={activeThreadId} threadId={activeThreadId} />
        ) : (
          <div className="max-w-sm">
            <MessageSquare className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="text-heading-18 font-bold text-gray-900">Your Messages</h3>
            <p className="text-copy-14 mt-2 text-gray-500">
              Select a conversation from the list to start messaging.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
