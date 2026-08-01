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
      <div className="py-6 text-center font-medium text-gray-400">
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
              <span className="rounded-sm border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700">
                Verified Mentor
              </span>
            )}
            <span className="text-label-12 font-mono text-gray-300">·</span>
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
            className="text-copy-14 mt-2 whitespace-pre-wrap leading-relaxed text-gray-700"
            dangerouslySetInnerHTML={{ __html: reply.body }}
          />
          <div className="mt-2 flex items-center gap-3">
            <button
              className="text-label-12 text-tertiary cursor-pointer font-semibold hover:underline focus-visible:outline-none"
              onClick={() => onReply(reply.id)}
            >
              Reply
            </button>
            {onDeleteReply && (
              <button
                className="text-label-12 cursor-pointer font-semibold text-red-600 hover:underline focus-visible:outline-none"
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
