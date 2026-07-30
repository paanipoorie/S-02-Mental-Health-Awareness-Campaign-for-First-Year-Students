export interface PostReply {
  id: string;
  body: string;
  authorName: string;
  createdAt: string;
  isMentor?: boolean;
}

interface ReplyListProps {
  replies: PostReply[];
  onReply: (replyId: string) => void;
  onDeleteReply?: (replyId: string) => void;
}

export function ReplyList({ replies, onReply, onDeleteReply }: ReplyListProps) {
  if (replies.length === 0) {
    return (
      <div className="py-6 text-center text-gray-400 font-medium">
        No replies yet. Be the first to respond!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {replies.map(reply => (
        <div key={reply.id} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
          <div className="flex items-center gap-2">
            <span className="text-label-12 font-bold text-gray-900">{reply.authorName}</span>
            {reply.isMentor && (
              <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded-sm">
                Verified Mentor
              </span>
            )}
            <span className="text-gray-300 font-mono text-label-12">·</span>
            <time className="text-label-12 font-mono text-gray-400" dateTime={reply.createdAt}>
              {new Date(reply.createdAt).toLocaleString([], {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </time>
          </div>
          <div
            className="text-copy-14 text-gray-700 mt-2 leading-relaxed whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: reply.body }}
          />
          <div className="flex items-center gap-3 mt-2">
            <button
              className="text-label-12 font-semibold text-tertiary hover:underline cursor-pointer focus-visible:outline-none"
              onClick={() => onReply(reply.id)}
            >
              Reply
            </button>
            {onDeleteReply && (
              <button
                className="text-label-12 font-semibold text-red-600 hover:underline cursor-pointer focus-visible:outline-none"
                onClick={() => onDeleteReply(reply.id)}
              >
                Delete
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
