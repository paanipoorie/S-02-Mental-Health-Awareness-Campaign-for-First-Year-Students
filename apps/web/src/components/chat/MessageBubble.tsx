interface Message {
  id: string;
  body: string;
  createdAt: string;
  senderType: 'ANONYMOUS_IDENTITY' | 'MENTOR';
  senderName: string;
  isOwn: boolean;
  readAt: string | null;
}

interface MessageBubbleProps {
  message: Message;
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function MessageBubble({ message }: MessageBubbleProps) {
  return (
    <div className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className="max-w-[75%]">
        <div className="flex items-end gap-2 mb-1">
          {!message.isOwn && (
            <div className="w-7 h-7 rounded-sm bg-gray-150 border border-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600 flex-shrink-0">
              {message.senderName.charAt(0)}
            </div>
          )}
          <div
            className={`rounded-sm px-4 py-2 text-copy-14 leading-normal ${
              message.isOwn
                ? 'bg-primary text-background-100'
                : 'bg-gray-100 border border-gray-200 text-gray-900'
            }`}
          >
            <p className="whitespace-pre-wrap break-words">{message.body}</p>
          </div>
        </div>
        <div className={`flex items-center gap-2 px-1 ${message.isOwn ? 'justify-end' : 'justify-start'}`}>
          <span className="text-[10px] text-gray-400 font-mono">{formatTime(message.createdAt)}</span>
          {message.isOwn && message.readAt && (
            <span className="text-[10px] text-tertiary font-mono">Read</span>
          )}
        </div>
      </div>
    </div>
  );
}
