import { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';
import { EmotionBadge } from '../emotion/EmotionBadge.tsx';
import type { PostCategory } from '@campus-peer-support/shared-types/enums';

interface PriorityPost {
  id: string;
  title: string;
  body: string;
  category: PostCategory;
  emotion: string | null;
  urgencyLevel: string | null;
  createdAt: string;
  anonymousDisplayName: string;
  replyCount: number;
}

export function PriorityPostList() {
  const [posts, setPosts] = useState<PriorityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [emotionFilter, setEmotionFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });
      if (emotionFilter) params.append('emotion', emotionFilter);
      if (categoryFilter) params.append('category', categoryFilter);

      const response = await api.get(`/mentors/priority-feed?${params.toString()}`);
      if (response.data.success) {
        setPosts(response.data.data);
        setTotalPages(response.data.pagination.totalPages);
        setTotal(response.data.pagination.total);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      setError(error.response?.data?.error?.message ?? 'Failed to load priority feed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [page, emotionFilter, categoryFilter]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getUrgencyClasses = (level: string | null) => {
    switch (level) {
      case 'HIGH':
        return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
      case 'MEDIUM':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800';
      case 'LOW':
        return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
    }
  };

  if (loading && posts.length === 0) {
    return (
      <div class="flex items-center justify-center py-12">
        <div
          class="border-primary-600 h-8 w-8 animate-spin rounded-full border-b-2"
          aria-label="Loading posts..."
        />
      </div>
    );
  }

  return (
    <div class="space-y-6">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">Priority Feed</h2>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Posts sorted by emotional urgency — students needing immediate support appear first
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
          <select
            value={emotionFilter}
            onChange={e => {
              setEmotionFilter(e.target.value);
              setPage(1);
            }}
            class="focus:ring-primary-500 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          >
            <option value="">All Emotions</option>
            <option value="OVERWHELMED">Overwhelmed</option>
            <option value="ANXIOUS">Anxious</option>
            <option value="SCARED">Scared</option>
            <option value="STRESSED">Stressed</option>
            <option value="BURNT_OUT">Burnt Out</option>
            <option value="HOMESICK">Homesick</option>
            <option value="LONELY">Lonely</option>
            <option value="CONFUSED">Confused</option>
            <option value="HAPPY">Happy</option>
            <option value="EXCITED">Excited</option>
          </select>
          <select
            value={categoryFilter}
            onChange={e => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            class="focus:ring-primary-500 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          >
            <option value="">All Categories</option>
            <option value="ACADEMICS">Academics</option>
            <option value="HOSTEL">Hostel</option>
            <option value="HOMESICKNESS">Homesickness</option>
            <option value="FRIENDS">Friends</option>
            <option value="RELATIONSHIPS">Relationships</option>
            <option value="TIME_MANAGEMENT">Time Management</option>
            <option value="EXAMS">Exams</option>
            <option value="SLEEP">Sleep</option>
            <option value="CLUBS">Clubs</option>
            <option value="FINANCIAL">Financial</option>
            <option value="GENERAL">General</option>
          </select>
        </div>
      </div>

      {error && (
        <div
          class="rounded-lg bg-red-50 p-4 text-red-700 dark:bg-red-900/20 dark:text-red-400"
          role="alert"
        >
          {error}
        </div>
      )}

      {posts.length === 0 && !loading && (
        <div class="py-12 text-center">
          <svg
            class="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No posts found</h3>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {emotionFilter || categoryFilter
              ? 'Try adjusting your filters'
              : 'No posts have been created yet'}
          </p>
        </div>
      )}

      <div class="space-y-4" role="feed" aria-label="Priority posts">
        {posts.map(post => (
          <article
            key={post.id}
            class="rounded-xl border border-gray-200 bg-white p-5 transition-colors hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600"
          >
            <div class="mb-3 flex flex-wrap items-start justify-between gap-3">
              <div class="flex flex-wrap items-center gap-2">
                <span class="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {post.anonymousDisplayName}
                </span>
                <EmotionBadge emotion={post.emotion} size="sm" />
                {post.urgencyLevel && (
                  <span
                    class={`rounded-full border px-2 py-0.5 text-xs font-medium ${getUrgencyClasses(post.urgencyLevel)}`}
                  >
                    {post.urgencyLevel}
                  </span>
                )}
                <span class="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                  {post.category.replace(/_/g, ' ')}
                </span>
              </div>
              <time
                class="whitespace-nowrap text-xs text-gray-500 dark:text-gray-400"
                dateTime={post.createdAt}
              >
                {formatDate(post.createdAt)}
              </time>
            </div>
            <h3 class="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
              {post.title}
            </h3>
            <p class="mb-3 line-clamp-3 text-gray-600 dark:text-gray-300">{post.body}</p>
            <div class="flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-700">
              <span class="text-sm text-gray-500 dark:text-gray-400">
                {post.replyCount} {post.replyCount === 1 ? 'reply' : 'replies'}
              </span>
              <a
                href={`/posts/${post.id}`}
                class="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium"
              >
                View conversation →
              </a>
            </div>
          </article>
        ))}
      </div>

      {totalPages > 1 && (
        <nav class="flex items-center justify-center gap-2" aria-label="Pagination">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            class="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            aria-label="Previous page"
          >
            Previous
          </button>
          <span class="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
            Page {page} of {totalPages} ({total} total)
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            class="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            aria-label="Next page"
          >
            Next
          </button>
        </nav>
      )}
    </div>
  );
}
