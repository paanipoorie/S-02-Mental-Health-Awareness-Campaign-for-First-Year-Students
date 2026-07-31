import { ChatList } from './ChatList';
import { ChatWindow } from './ChatWindow';
import { MessageSquare } from 'lucide-react';

interface ChatPortalProps {
  activeThreadId?: string;
}

export function ChatPortal({ activeThreadId }: ChatPortalProps) {
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
          onSelect={(id) => {
            window.location.href = `/chat/${id}`;
          }}
        />
      </div>

      {/* Right panel: Chat Window */}
      <div
        className={`flex-1 bg-background-100 h-full ${
          activeThreadId ? 'flex flex-col' : 'hidden md:flex flex-col items-center justify-center p-8 text-center'
        }`}
      >
        {activeThreadId ? (
          <ChatWindow threadId={activeThreadId} />
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
