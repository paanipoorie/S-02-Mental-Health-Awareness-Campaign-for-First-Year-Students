import { useEffect, useState } from 'react';
import { api } from '@lib/api';
import { getCategoryLabel } from '@lib/categoryConstants';
import { useStore } from '@nanostores/react';
import { $user, fetchCurrentUser } from '@stores/authStore';
import { ReplyComposer } from './ReplyComposer';
import { toast } from 'sonner';

interface Reply {
  id: string;
  body: string;
  authorName: string;
  authorIdentityId?: string;
  createdAt: string;
  isMentor: boolean;
  isOwn: boolean;
}

interface PostDetail {
  id: string;
  title: string;
  body: string;
  category: string;
  emotion: string | null;
  urgencyLevel: string | null;
  createdAt: string;
  updatedAt: string;
  anonymousDisplayName: string;
  anonymousIdentityId: string;
  isOwn: boolean;
  replies: Reply[];
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}


function getUrgencyBadgeClass(level: string | null): string {
  switch (level) {
    case 'HIGH':
      return 'bg-red-50 text-red-800 border-red-300';
    case 'MEDIUM':
      return 'bg-amber-50 text-amber-800 border-amber-300';
    case 'LOW':
      return 'bg-green-50 text-green-800 border-green-300';
    default:
      return 'bg-gray-50 text-gray-600 border-gray-200';
  }
}

function getEmotionLabel(emotion: string | null): string {
  const map: Record<string, string> = {
    HAPPY: 'Happy',
    EXCITED: 'Excited',
    CONFUSED: 'Confused',
    HOMESICK: 'Homesick',
    LONELY: 'Lonely',
    SCARED: 'Scared',
    ANXIOUS: 'Anxious',
    BURNT_OUT: 'Burnt Out',
    OVERWHELMED: 'Overwhelmed',
    STRESSED: 'Stressed',
  };
  return map[emotion || ''] || '';
}

export function PostDetailClient({ postId }: { postId: string }) {
  const user = useStore($user);
  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replying, setReplying] = useState(false);

  const fetchPost = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!user) await fetchCurrentUser();
      const data = await api.get<PostDetail>(`/posts/${postId}`);
      setPost(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load post');
      toast.error(err.message || 'Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [postId]);

  const handleReply = async (body: string) => {
    try {
      await api.post(`/posts/${postId}/replies`, { body });
      toast.success('Reply posted');
      setReplying(false);
      fetchPost();
    } catch (err: any) {
      throw err;
    }
  };

  const handleDeleteReply = async (replyId: string) => {
    if (!confirm('Delete this reply?')) return;
    try {
      await api.delete(`/posts/${postId}/replies/${replyId}`);
      toast.success('Reply deleted');
      fetchPost();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete reply');
    }
  };

  const handleDeletePost = async () => {
    if (!confirm('Delete this post? This cannot be undone.')) return;
    try {
      await api.delete(`/posts/${postId}`);
      toast.success('Post deleted');
      window.location.href = '/posts';
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete post');
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl animate-pulse space-y-6 px-4 py-12">
        <div className="h-4 w-1/4 rounded-sm bg-gray-200" />
        <div className="h-48 w-full rounded-sm bg-gray-200" />
        <div className="h-32 w-full rounded-sm bg-gray-200" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <h2 className="text-heading-24 font-bold text-red-600">Failed to load post</h2>
        <p className="text-copy-14 mt-2 text-gray-500">{error}</p>
        <button
          onClick={fetchPost}
          className="bg-primary text-background-100 mt-6 inline-block rounded-sm px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-gray-800"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <h2 className="text-heading-24 font-bold text-gray-900">Post not found</h2>
        <p className="text-copy-14 mt-2 text-gray-500">This post may have been deleted.</p>
        <a
          href="/posts"
          className="bg-primary text-background-100 mt-6 inline-block rounded-sm px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-gray-800"
        >
          Back to Discussions
        </a>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <a
          href="/posts"
          className="text-label-14 text-tertiary flex items-center gap-1.5 font-semibold transition-colors hover:underline"
        >
          ← Back to Discussions
        </a>
      </div>

      <div className="bg-background-100 rounded-sm border border-gray-200 p-6 shadow-sm sm:p-8">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href={`/profile/${post.anonymousIdentityId}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="flex h-10 w-10 items-center justify-center rounded-sm border border-gray-200 bg-gray-100 text-sm font-bold text-gray-700">
                {(post.anonymousDisplayName || 'Anonymous').charAt(0)}
              </div>
              <div>
                <p className="text-copy-14 font-bold text-gray-900 hover:underline">
                  {post.anonymousDisplayName || 'Anonymous'}
                </p>
                <p className="text-label-12 font-mono text-gray-400">{timeAgo(post.createdAt)}</p>
              </div>
            </a>
          </div>
          {post.isOwn && (
            <button
              onClick={handleDeletePost}
              className="text-label-12 rounded-sm border border-red-200 px-3 py-1.5 font-semibold text-red-600 transition-colors hover:bg-red-50"
            >
              Delete
            </button>
          )}
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="category-badge">
            {getCategoryLabel(post.category)}
          </span>
          {post.emotion && (
            <span className="inline-flex items-center gap-1 rounded-sm border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs font-semibold text-gray-700">
              {getEmotionLabel(post.emotion)}
            </span>
          )}
          {post.urgencyLevel && post.urgencyLevel !== 'NONE' && (
            <span
              className={`inline-flex items-center gap-1 rounded-sm border px-2.5 py-0.5 text-xs font-semibold ${getUrgencyBadgeClass(post.urgencyLevel)}`}
            >
              {post.urgencyLevel}
            </span>
          )}
        </div>

        <h1 className="text-heading-28 sm:text-heading-32 text-gray-1000 mb-4 font-bold leading-tight">
          {post.title}
        </h1>

        <div className="text-copy-15 whitespace-pre-wrap font-sans leading-relaxed text-gray-700">
          {post.body}
        </div>

        <div className="text-label-12 mt-6 font-mono text-gray-400">
          Posted {formatDate(post.createdAt)}
        </div>
      </div>

      <div className="bg-background-100 rounded-sm border border-gray-200 p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between border-b border-gray-200 pb-4">
          <h2 className="text-heading-18 font-bold text-gray-900">
            Replies ({post.replies.length})
          </h2>
          <button
            onClick={() => setReplying(v => !v)}
            className="text-label-14 text-tertiary font-semibold hover:underline"
          >
            {replying ? 'Cancel' : '+ Reply'}
          </button>
        </div>

        {replying && (
          <div className="mb-6">
            <ReplyComposer onSubmit={handleReply} />
          </div>
        )}

        {post.replies.length === 0 ? (
          <p className="text-copy-14 py-6 text-center italic text-gray-400">
            No replies yet. Be the first to respond!
          </p>
        ) : (
          <div className="space-y-4">
            {post.replies.map(reply => (
              <div
                key={reply.id}
                className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0"
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {!reply.isMentor && reply.authorIdentityId ? (
                      <a href={`/profile/${reply.authorIdentityId}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <div className="flex h-7 w-7 items-center justify-center rounded-sm border border-gray-200 bg-gray-100 text-xs font-bold text-gray-600">
                          {reply.authorName.charAt(0)}
                        </div>
                        <span className="text-label-12 font-bold text-gray-900 hover:underline">
                          {reply.authorName}
                        </span>
                      </a>
                    ) : (
                      <>
                        <div className="flex h-7 w-7 items-center justify-center rounded-sm border border-gray-200 bg-gray-100 text-xs font-bold text-gray-600">
                          {reply.authorName.charAt(0)}
                        </div>
                        <span className="text-label-12 font-bold text-gray-900">
                          {reply.authorName}
                        </span>
                      </>
                    )}
                    {reply.isMentor && (
                      <span className="rounded-sm border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-800">
                        Verified Mentor
                      </span>
                    )}
                    <span className="text-label-12 font-mono text-gray-300">·</span>
                    <span className="text-label-12 font-mono text-gray-400">
                      {timeAgo(reply.createdAt)}
                    </span>
                  </div>
                  {reply.isOwn && (
                    <button
                      onClick={() => handleDeleteReply(reply.id)}
                      className="text-label-12 font-semibold text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  )}
                </div>
                <div className="text-copy-14 whitespace-pre-wrap pl-9 leading-relaxed text-gray-700">
                  {reply.body}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default PostDetailClient;
