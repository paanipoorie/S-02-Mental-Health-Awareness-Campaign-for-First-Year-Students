import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useStore } from '@nanostores/react';
import { $user, fetchCurrentUser } from '../../stores/authStore';
import { toast } from 'sonner';
import { getCategoryLabel } from '../../lib/categoryConstants';
import { EmotionBadge } from '../emotion/EmotionBadge';
import { MessageSquare, Calendar, PenTool, Clock } from 'lucide-react';

interface RecentPost {
  id: string;
  title: string;
  category: string;
  emotion: string | null;
  urgencyLevel: string | null;
  createdAt: string;
  replyCount: number;
}

interface ProfileData {
  anonymousId: string;
  userId: string;
  displayName: string;
  joinedAt: string;
  avatarSeed: number;
  postCount: number;
  replyCount: number;
  discussionsParticipatedCount: number;
  recentPosts: RecentPost[];
}

interface ProfileClientProps {
  anonymousIdentityId: string;
}

export default function ProfileClient({ anonymousIdentityId }: ProfileClientProps) {
  const user = useStore($user);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!user) {
        await fetchCurrentUser();
      }
      const res = await api.get<ProfileData>(`/profiles/${anonymousIdentityId}`);
      setProfile(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load profile');
      toast.error(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [anonymousIdentityId]);

  const handleMessage = async () => {
    try {
      const payload: any = {};
      if (user?.role === 'STUDENT') {
        payload.peerIdentityId = anonymousIdentityId;
      } else if (user?.role === 'MENTOR') {
        if (!profile) return;
        payload.studentIdentityId = profile.anonymousId;
      } else {
        toast.error('Only students and mentors can message other users');
        return;
      }

      const res = await api.post<{ id: string }>('/chats', payload);
      window.location.href = `/chat?threadId=${res.id}`;
    } catch (err: any) {
      toast.error(err.message || 'Failed to start conversation');
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl animate-pulse space-y-6 px-4 py-8">
        <div className="bg-background-100 rounded-sm border border-gray-200 p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gray-200" />
            <div className="space-y-2 flex-1">
              <div className="h-6 w-1/3 rounded bg-gray-200" />
              <div className="h-4 w-1/4 rounded bg-gray-200" />
            </div>
          </div>
          <div className="h-8 w-24 rounded bg-gray-200" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-background-100 h-24 rounded-sm border border-gray-200 p-4" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <h2 className="text-heading-24 font-bold text-red-600">Failed to load profile</h2>
        <p className="text-copy-14 mt-2 text-gray-500">{error}</p>
        <button
          onClick={fetchProfile}
          className="bg-primary text-background-100 mt-6 inline-block rounded-sm px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-gray-800"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <h2 className="text-heading-24 font-bold text-gray-900">Profile not found</h2>
        <p className="text-copy-14 mt-2 text-gray-500">The requested user profile does not exist.</p>
      </div>
    );
  }

  const isOwnProfile = profile.displayName === user?.anonymousDisplayName;
  const joinedDateStr = new Date(profile.joinedAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      {/* Header Profile Card */}
      <div className="bg-background-100 rounded-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 text-2xl font-bold text-white shadow-sm">
              {profile.displayName.charAt(0)}
            </div>
            <div>
              <h1 className="text-heading-22 font-bold text-gray-900">{profile.displayName}</h1>
              <div className="mt-1 flex items-center gap-1.5 text-copy-14 text-gray-500">
                <Calendar className="h-4 w-4" />
                <span>Joined {joinedDateStr}</span>
              </div>
            </div>
          </div>

          {!isOwnProfile && (
            <button
              onClick={handleMessage}
              className="bg-primary text-button-14 text-background-100 flex items-center justify-center gap-2 rounded-sm px-5 py-2.5 font-semibold transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Message</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-background-100 rounded-sm border border-gray-200 p-4 text-center">
          <div className="text-heading-20 font-bold text-gray-900">{profile.postCount}</div>
          <div className="text-label-12 mt-1 text-gray-500">Posts</div>
        </div>
        <div className="bg-background-100 rounded-sm border border-gray-200 p-4 text-center">
          <div className="text-heading-20 font-bold text-gray-900">{profile.replyCount}</div>
          <div className="text-label-12 mt-1 text-gray-500">Replies</div>
        </div>
        <div className="bg-background-100 rounded-sm border border-gray-200 p-4 text-center">
          <div className="text-heading-20 font-bold text-gray-900">{profile.discussionsParticipatedCount}</div>
          <div className="text-label-12 mt-1 text-gray-500">Discussions</div>
        </div>
      </div>

      {/* Recent Posts Section */}
      <div className="space-y-4">
        <h2 className="text-heading-18 font-bold text-gray-900">Recent Posts</h2>

        {profile.recentPosts.length === 0 ? (
          <div className="bg-background-100 rounded-sm border border-gray-200 py-12 text-center">
            <PenTool className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="text-heading-16 mt-4 font-bold text-gray-900">No posts yet</h3>
            <p className="text-copy-14 mt-1 text-gray-500">This user hasn't published any discussions.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {profile.recentPosts.map(post => (
              <div key={post.id} className="bg-background-100 hover:border-gray-400 rounded-sm border border-gray-200 p-5 transition-all">
                <a href={`/posts/${post.id}`} className="block focus:outline-none">
                  <h3 className="text-heading-16 font-bold text-gray-900 hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                </a>
                
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <span className="category-badge">
                    {getCategoryLabel(post.category)}
                  </span>
                  
                  {post.emotion && (
                    <EmotionBadge
                      emotion={post.emotion as any}
                      urgency={post.urgencyLevel as any}
                      size="sm"
                      showUrgency={!!post.urgencyLevel}
                    />
                  )}
                  
                  <div className="flex items-center gap-1.5 text-label-12 text-gray-400">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center gap-1 text-label-12 text-gray-500">
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>
                      {post.replyCount} {post.replyCount === 1 ? 'reply' : 'replies'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
