import { formatDistanceToNow } from 'date-fns';
import { EmotionBadge } from '@components/emotion/EmotionBadge';

interface RecentDiscussionsWidgetProps {
  recentDiscussions: Array<{
    id: string;
    title: string;
    body: string;
    category: string;
    emotion: string | null;
    urgencyLevel: string | null;
    createdAt: string;
    anonymousDisplayName: string;
    replyCount: number;
  }>;
  className?: string;
}

export function RecentDiscussionsWidget({
  recentDiscussions,
  className = '',
}: RecentDiscussionsWidgetProps) {
  if (!recentDiscussions || recentDiscussions.length === 0) {
    return (
      <div className={`dashboard-card p-6 ${className}`}>
        <h3 className="text-heading-20 mb-4 text-slate-100">Recent Discussions</h3>
        <div className="py-8 text-center">
          <svg
            className="mx-auto h-12 w-12 text-slate-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <p className="text-copy-14 mt-3 text-slate-400">No discussions yet</p>
          <p className="text-label-14 mt-1 text-slate-500">Be the first to start a conversation</p>
          <a
            href="/posts/new"
            className="button-primary text-button-14 mt-4 inline-block rounded-lg px-4 py-2 transition-opacity hover:opacity-90"
          >
            Create Post
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={`dashboard-card p-6 ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-heading-20 text-slate-100">Recent Discussions</h3>
        <a
          href="/posts"
          className="text-label-14 text-teal-400 transition-colors hover:text-teal-300"
        >
          View all
        </a>
      </div>

      <div className="space-y-3">
        {recentDiscussions.slice(0, 5).map(post => (
          <a
            key={post.id}
            href={`/posts/${post.id}`}
            className="flex flex-col rounded-lg border border-slate-800/50 bg-slate-900/50 p-3 transition-all hover:border-slate-700/50 hover:bg-slate-800/50"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h4 className="text-copy-14 line-clamp-2 font-medium text-slate-100">
                  {post.title}
                </h4>
                <p className="text-label-14 mt-1 line-clamp-2 text-slate-400">{post.body}</p>
              </div>
              {post.emotion && (
                <EmotionBadge
                  emotion={post.emotion as any}
                  urgency={post.urgencyLevel as any}
                  size="sm"
                />
              )}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-slate-800/30 pt-3">
              <span className="text-label-12 flex items-center gap-1 text-slate-500">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                {post.anonymousDisplayName}
              </span>
              <span className="text-label-12 flex items-center gap-1 text-slate-500">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                {post.replyCount} replies
              </span>
              <span className="text-label-12 ml-auto text-slate-500">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
