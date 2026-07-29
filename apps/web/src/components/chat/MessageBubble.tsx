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
  return new Date(dateStr).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isMentor = message.senderType === 'MENTOR';

  return (
    <div className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`max-w-[75%] ${message.isOwn ? 'order-1' : 'order-1'}`}>
        <div className="flex items-end gap-2 mb-1">
          {!message.isOwn && (
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-500 to-slate-700 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
              {message.senderName.charAt(0)}
            </div>
          )}
          <div
            className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
              message.isOwn
                ? 'bg-teal-600 text-white rounded-br-md'
                : 'bg-slate-800 text-slate-200 rounded-bl-md'
            }`}
          >
            <p className="whitespace-pre-wrap break-words">{message.body}</p>
          </div>
        </div>
        <div className={`flex items-center gap-2 px-1 ${message.isOwn ? 'justify-end' : 'justify-start'}`}>
          <span className="text-[10px] text-slate-600">{formatTime(message.createdAt)}</span>
          {message.isOwn && message.readAt && (
            <span className="text-[10px] text-teal-400">Read</span>
          )}
        </div>
      </div>
    </div>
  );
}
