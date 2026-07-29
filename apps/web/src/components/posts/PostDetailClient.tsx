import { useEffect, useState } from 'react';
import { api } from '@lib/api';
import { useStore } from '@nanostores/react';
import { $user, fetchCurrentUser } from '@stores/authStore';
import { ReplyComposer } from './ReplyComposer';
import { toast } from 'sonner';

interface Reply {
  id: string;
  body: string;
  authorName: string;
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
  isOwn: boolean;
  replies: Reply[];
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString([], {
    weekday: 'long',
    month: 'long',
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

function getCategoryEmoji(cat: string): string {
  const map: Record<string, string> = {
    ACADEMICS: '📚',
    HOSTEL: '🏠',
    HOMESICKNESS: '🏡',
    FRIENDS: '👯',
    RELATIONSHIPS: '💕',
    TIME_MANAGEMENT: '⏰',
    EXAMS: '📝',
    SLEEP: '😴',
    CLUBS: '🎭',
    FINANCIAL: '💰',
    GENERAL: '💬',
  };
  return map[cat] || '💬';
}

function getUrgencyColor(level: string | null): string {
  switch (level) {
    case 'HIGH': return 'text-rose-400 border-rose-800 bg-rose-950/60';
    case 'MEDIUM': return 'text-amber-400 border-amber-800 bg-amber-950/60';
    case 'LOW': return 'text-emerald-400 border-emerald-800 bg-emerald-950/60';
    default: return 'text-slate-500 border-slate-800 bg-slate-950';
  }
}

function getEmoji(emotion: string | null): string {
  const map: Record<string, string> = {
    HAPPY: '😊', EXCITED: '🤩', CONFUSED: '😕', HOMESICK: '🏠',
    LONELY: '😔', SCARED: '😨', ANXIOUS: '😰', BURNT_OUT: '😩',
    OVERWHELMED: '🤯', STRESSED: '😤',
  };
  return map[emotion || ''] || '';
}

export function PostDetailClient({ postId }: { postId: string }) {
  const user = useStore($user);
  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [replying, setReplying] = useState(false);

  const fetchPost = async () => {
    try {
      if (!user) await fetchCurrentUser();
      const data = await api.get<PostDetail>(`/posts/${postId}`);
      setPost(data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPost(); }, [postId]);

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
      <div className="max-w-3xl mx-auto py-12 px-4 animate-pulse">
        <div className="h-4 bg-slate-800 rounded w-1/4 mb-4" />
        <div className="h-10 bg-slate-800 rounded w-3/4 mb-6" />
        <div className="h-32 bg-slate-800 rounded mb-6" />
        <div className="h-10 bg-slate-800 rounded w-full" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-16 max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-slate-200 font-sans">Post not found</h2>
        <p className="text-sm text-slate-500 mt-2">This post may have been deleted.</p>
        <a href="/posts" className="mt-6 inline-block rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold px-5 py-2.5 text-sm transition-all">
          Back to Posts
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      <div>
        <a href="/posts" className="text-sm text-teal-400 hover:text-teal-300 flex items-center gap-1.5 transition-colors">
          ← Back to Posts
        </a>
      </div>

      <div className="bg-gradient-to-b from-slate-900/60 to-slate-950/60 border border-slate-800/80 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-indigo-500 flex items-center justify-center text-sm font-bold text-white">
              {post.anonymousDisplayName.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-200">{post.anonymousDisplayName}</p>
              <p className="text-xs text-slate-500">{timeAgo(post.createdAt)}</p>
            </div>
          </div>
          {post.isOwn && (
            <button onClick={handleDeletePost} className="text-xs text-rose-400 hover:text-rose-300 px-3 py-1.5 rounded-lg border border-rose-900/40 hover:bg-rose-950/40 transition-all">
              Delete
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-800 bg-slate-950 px-3 py-1 text-xs font-semibold text-slate-400">
            {getCategoryEmoji(post.category)} {post.category.replace('_', ' ')}
          </span>
          {post.emotion && (
            <span className="inline-flex items-center gap-1 rounded-full border border-slate-800 bg-slate-950 px-3 py-1 text-xs text-slate-400">
              {getEmoji(post.emotion)} {post.emotion}
            </span>
          )}
          {post.urgencyLevel && (
            <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${getUrgencyColor(post.urgencyLevel)}`}>
              {post.urgencyLevel}
            </span>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-sans tracking-tight mb-4">
          {post.title}
        </h1>

        <div className="text-slate-300 leading-relaxed whitespace-pre-wrap">
          {post.body}
        </div>

        <div className="mt-6 text-xs text-slate-600">
          Posted {formatDate(post.createdAt)}
        </div>
      </div>

      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-slate-100 font-sans">
            Replies ({post.replies.length})
          </h2>
          <button
            onClick={() => setReplying(v => !v)}
            className="text-sm font-semibold text-teal-400 hover:text-teal-300 transition-colors"
          >
            {replying ? 'Cancel' : '+ Reply'}
          </button>
        </div>

        {replying && (
          <div className="mb-6 p-4 bg-slate-950/50 border border-slate-800 rounded-xl">
            <ReplyComposer onSubmit={handleReply} />
          </div>
        )}

        {post.replies.length === 0 ? (
          <p className="text-sm text-slate-500 italic text-center py-6">No replies yet. Be the first to respond!</p>
        ) : (
          <div className="space-y-4">
            {post.replies.map((reply) => (
              <div key={reply.id} className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-500 to-slate-700 flex items-center justify-center text-xs font-bold text-white">
                      {reply.authorName.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-slate-300">{reply.authorName}</span>
                    {reply.isMentor && (
                      <span className="text-[10px] font-semibold text-teal-300 bg-teal-950/60 border border-teal-800/50 rounded-full px-2 py-0.5">
                        Verified Mentor
                      </span>
                    )}
                    <span className="text-xs text-slate-600">{timeAgo(reply.createdAt)}</span>
                  </div>
                  {reply.isOwn && (
                    <button onClick={() => handleDeleteReply(reply.id)} className="text-xs text-rose-400/60 hover:text-rose-300 transition-colors">
                      Delete
                    </button>
                  )}
                </div>
                <div className="text-sm text-slate-400 leading-relaxed whitespace-pre-wrap">
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
