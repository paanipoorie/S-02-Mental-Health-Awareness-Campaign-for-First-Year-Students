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
        <div className="mb-1 flex items-end gap-2">
          {!message.isOwn && (
            <div className="bg-gray-150 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-sm border border-gray-200 text-[10px] font-bold text-gray-600">
              {message.senderName.charAt(0)}
            </div>
          )}
          <div
            className={`text-copy-14 rounded-sm px-4 py-2 leading-normal ${
              message.isOwn
                ? 'bg-primary text-background-100'
                : 'border border-gray-200 bg-gray-100 text-gray-900'
            }`}
          >
            <p className="whitespace-pre-wrap break-words">{message.body}</p>
          </div>
        </div>
        <div
          className={`flex items-center gap-2 px-1 ${message.isOwn ? 'justify-end' : 'justify-start'}`}
        >
          <span className="font-mono text-[10px] text-gray-400">
            {formatTime(message.createdAt)}
          </span>
          {message.isOwn && message.readAt && (
            <span className="text-tertiary font-mono text-[10px]">Read</span>
          )}
        </div>
      </div>
    </div>
  );
}
