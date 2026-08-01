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
        <h3 className="text-heading-20 text-gray-1000 mb-4 font-semibold">Recent Discussions</h3>
        <div className="py-8 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
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
          <p className="text-copy-14 mt-3 font-medium text-gray-600">No discussions yet</p>
          <p className="text-label-12 mt-1 text-gray-500">
            Be the first to share an anonymous story or post.
          </p>
          <a
            href="/posts/new"
            className="bg-primary text-button-14 text-background-100 mt-4 inline-block rounded-sm px-4 py-2 font-semibold transition-colors hover:bg-gray-800"
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
        <h3 className="text-heading-20 text-gray-1000 font-semibold">Recent Discussions</h3>
        <a
          href="/posts"
          className="text-label-14 text-tertiary font-medium transition-colors hover:underline"
        >
          View all
        </a>
      </div>

      <div className="space-y-3">
        {recentDiscussions.slice(0, 5).map(post => (
          <a
            key={post.id}
            href={`/posts/${post.id}`}
            className="bg-background-100 flex flex-col rounded-sm border border-gray-200 p-3 transition-colors hover:bg-gray-50 focus-visible:outline-none"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h4 className="text-copy-14 line-clamp-1 font-semibold text-gray-900">
                  {post.title}
                </h4>
                <p className="text-label-12 mt-1 line-clamp-2 text-gray-500">{post.body}</p>
              </div>
              {post.emotion && (
                <EmotionBadge
                  emotion={post.emotion as any}
                  urgency={post.urgencyLevel as any}
                  size="sm"
                />
              )}
            </div>

            <div className="text-label-12 mt-3 flex flex-wrap items-center gap-3 border-t border-gray-100 pt-3 text-gray-500">
              <span className="flex items-center gap-1">
                <svg
                  className="h-3.5 w-3.5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                {post.anonymousDisplayName}
              </span>
              <span className="flex items-center gap-1">
                <svg
                  className="h-3.5 w-3.5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                {post.replyCount} {post.replyCount === 1 ? 'reply' : 'replies'}
              </span>
              <span className="ml-auto text-gray-400">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
