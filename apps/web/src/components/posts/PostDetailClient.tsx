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

function getCategoryLabel(cat: string): string {
  const map: Record<string, string> = {
    ACADEMICS: 'Academics',
    HOSTEL: 'Hostel',
    HOMESICKNESS: 'Homesickness',
    FRIENDS: 'Friends',
    RELATIONSHIPS: 'Relationships',
    TIME_MANAGEMENT: 'Time Management',
    EXAMS: 'Exams',
    SLEEP: 'Sleep',
    CLUBS: 'Clubs',
    FINANCIAL: 'Financial',
    GENERAL: 'General',
  };
  return map[cat] || 'General';
}

function getUrgencyBadgeClass(level: string | null): string {
  switch (level) {
    case 'HIGH': return 'bg-red-50 text-red-800 border-red-300';
    case 'MEDIUM': return 'bg-amber-50 text-amber-800 border-amber-300';
    case 'LOW': return 'bg-green-50 text-green-800 border-green-300';
    default: return 'bg-gray-50 text-gray-600 border-gray-200';
  }
}

function getEmotionLabel(emotion: string | null): string {
  const map: Record<string, string> = {
    HAPPY: 'Happy', EXCITED: 'Excited', CONFUSED: 'Confused', HOMESICK: 'Homesick',
    LONELY: 'Lonely', SCARED: 'Scared', ANXIOUS: 'Anxious', BURNT_OUT: 'Burnt Out',
    OVERWHELMED: 'Overwhelmed', STRESSED: 'Stressed',
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
      <div className="max-w-3xl mx-auto py-12 px-4 animate-pulse space-y-6">
        <div className="h-4 bg-gray-200 rounded-sm w-1/4" />
        <div className="h-48 bg-gray-200 rounded-sm w-full" />
        <div className="h-32 bg-gray-200 rounded-sm w-full" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-16 max-w-md mx-auto">
        <h2 className="text-heading-24 font-bold text-gray-900">Post not found</h2>
        <p className="text-copy-14 text-gray-500 mt-2">This post may have been deleted.</p>
        <a href="/posts" className="mt-6 inline-block rounded-sm bg-primary hover:bg-gray-800 text-background-100 font-semibold px-5 py-2.5 text-sm transition-colors">
          Back to Discussions
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      <div>
        <a href="/posts" className="text-label-14 font-semibold text-tertiary hover:underline flex items-center gap-1.5 transition-colors">
          ← Back to Discussions
        </a>
      </div>

      <div className="rounded-sm border border-gray-200 bg-background-100 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-sm bg-gray-100 border border-gray-200 flex items-center justify-center text-sm font-bold text-gray-700">
              {post.anonymousDisplayName.charAt(0)}
            </div>
            <div>
              <p className="text-copy-14 font-bold text-gray-900">{post.anonymousDisplayName}</p>
              <p className="text-label-12 text-gray-400 font-mono">{timeAgo(post.createdAt)}</p>
            </div>
          </div>
          {post.isOwn && (
            <button onClick={handleDeletePost} className="text-label-12 font-semibold text-red-600 border border-red-200 hover:bg-red-50 px-3 py-1.5 rounded-sm transition-colors">
              Delete
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="inline-flex items-center gap-1 rounded-sm border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs font-semibold text-gray-700">
            {getCategoryLabel(post.category)}
          </span>
          {post.emotion && (
            <span className="inline-flex items-center gap-1 rounded-sm border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs font-semibold text-gray-700">
              {getEmotionLabel(post.emotion)}
            </span>
          )}
          {post.urgencyLevel && post.urgencyLevel !== 'NONE' && (
            <span className={`inline-flex items-center gap-1 rounded-sm border px-2.5 py-0.5 text-xs font-semibold ${getUrgencyBadgeClass(post.urgencyLevel)}`}>
              {post.urgencyLevel}
            </span>
          )}
        </div>

        <h1 className="text-heading-28 sm:text-heading-32 font-bold text-gray-1000 leading-tight mb-4">
          {post.title}
        </h1>

        <div className="text-copy-15 text-gray-700 leading-relaxed whitespace-pre-wrap font-sans">
          {post.body}
        </div>

        <div className="mt-6 text-label-12 text-gray-400 font-mono">
          Posted {formatDate(post.createdAt)}
        </div>
      </div>

      <div className="rounded-sm border border-gray-200 bg-background-100 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
          <h2 className="text-heading-18 font-bold text-gray-900">
            Replies ({post.replies.length})
          </h2>
          <button
            onClick={() => setReplying(v => !v)}
            className="text-label-14 font-semibold text-tertiary hover:underline"
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
          <p className="text-copy-14 text-gray-400 italic text-center py-6">No replies yet. Be the first to respond!</p>
        ) : (
          <div className="space-y-4">
            {post.replies.map((reply) => (
              <div key={reply.id} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-sm bg-gray-100 border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                      {reply.authorName.charAt(0)}
                    </div>
                    <span className="text-label-12 font-bold text-gray-900">{reply.authorName}</span>
                    {reply.isMentor && (
                      <span className="text-[10px] font-semibold text-blue-800 bg-blue-50 border border-blue-200 rounded-sm px-1.5 py-0.5">
                        Verified Mentor
                      </span>
                    )}
                    <span className="text-gray-300 font-mono text-label-12">·</span>
                    <span className="text-label-12 font-mono text-gray-400">{timeAgo(reply.createdAt)}</span>
                  </div>
                  {reply.isOwn && (
                    <button onClick={() => handleDeleteReply(reply.id)} className="text-label-12 font-semibold text-red-600 hover:underline">
                      Delete
                    </button>
                  )}
                </div>
                <div className="text-copy-14 text-gray-700 leading-relaxed whitespace-pre-wrap pl-9">
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
