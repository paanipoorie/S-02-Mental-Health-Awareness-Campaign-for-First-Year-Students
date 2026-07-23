import type { PostReply } from '@/types/posts';

interface ReplyListProps {
  replies: PostReply[];
  onReply: (replyId: string) => void;
  onDeleteReply?: (replyId: string) => void;
}

export function ReplyList({ replies, onReply, onDeleteReply }: ReplyListProps) {
  if (replies.length === 0) {
    return (
      <div className="reply-list">
        <div className="no-replies">No replies yet. Be the first to respond!</div>
      </div>
    );
  }

  return (
    <div className="reply-list">
      {replies.map(reply => (
        <div key={reply.id} className="reply">
          <div className="reply-header">
            <span className="reply-author">{reply.authorName}</span>
            <time className="reply-time" dateTime={reply.createdAt}>
              {new Date(reply.createdAt).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })}
            </time>
          </div>
          <div className="reply-body" dangerouslySetInnerHTML={{ __html: reply.body }} />
          <div className="reply-actions">
            <button className="reply-btn" onClick={() => onReply(reply.id)}>
              Reply
            </button>
            {onDeleteReply && (
              <button className="delete-btn" onClick={() => onDeleteReply(reply.id)}>
                Delete
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export interface PostReply {
  id: string;
  body: string;
  authorName: string;
  createdAt: string;
  isMentor?: boolean;
}
