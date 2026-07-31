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
    <div className="flex h-full w-full bg-background-100 overflow-hidden">
      {/* Left panel: Conversation List */}
      <div
        className={`w-full md:w-80 border-r border-gray-200 flex-shrink-0 bg-background-100 ${
          activeThreadId ? 'hidden md:flex flex-col h-full' : 'flex flex-col h-full'
        }`}
      >
        <ChatList
          compact={true}
          onSelect={handleSelectThread}
        />
      </div>

      {/* Right panel: Chat Window */}
      <div
        className={`flex-1 bg-background-100 h-full ${
          activeThreadId ? 'flex flex-col' : 'hidden md:flex flex-col items-center justify-center p-8 text-center'
        }`}
      >
        {activeThreadId ? (
          <ChatWindow key={activeThreadId} threadId={activeThreadId} />
        ) : (
          <div className="max-w-sm">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-heading-18 font-bold text-gray-900">Your Messages</h3>
            <p className="text-copy-14 text-gray-500 mt-2">
              Select a conversation from the list to start messaging.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
