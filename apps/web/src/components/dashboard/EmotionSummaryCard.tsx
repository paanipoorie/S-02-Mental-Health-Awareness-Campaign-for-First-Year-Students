import { getEmotionConfig } from '@lib/emotionConstants';
import { getUrgencyConfig } from '@lib/emotionConstants';
import { EmotionBadge } from '@components/emotion/EmotionBadge';

interface EmotionSummaryCardProps {
  currentEmotion: {
    emotion: string | null;
    urgencyLevel: string | null;
    createdAt: string | null;
  } | null;
  className?: string;
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export function EmotionSummaryCard({ currentEmotion, className = '' }: EmotionSummaryCardProps) {
  if (!currentEmotion || !currentEmotion.emotion) {
    return (
      <div className={`dashboard-card p-6 ${className}`}>
        <h3 className="text-heading-20 mb-4 text-slate-100">Current Emotional State</h3>
        <div className="py-8 text-center">
          <svg
            className="mx-auto h-14 w-14 text-slate-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-copy-14 mt-3 text-slate-400">No emotion logged yet</p>
          <p className="text-label-14 mt-1 text-slate-500">
            Share how you're feeling to get personalized support
          </p>
          <a
            href="/posts/new"
            className="button-primary text-button-14 mt-4 inline-block rounded-lg px-4 py-2 transition-opacity hover:opacity-90"
          >
            Log Emotion
          </a>
        </div>
      </div>
    );
  }

  const emotionConfig = getEmotionConfig(currentEmotion.emotion as any);
  const urgencyConfig = currentEmotion.urgencyLevel
    ? getUrgencyConfig(currentEmotion.urgencyLevel as any)
    : null;

  return (
    <div className={`dashboard-card p-6 ${className}`}>
      <h3 className="text-heading-20 mb-4 text-slate-100">Current Emotional State</h3>

      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <div
            className="flex h-20 w-20 items-center justify-center rounded-2xl"
            style={{ background: `${emotionConfig.bg}CC` }}
          >
            <span className="text-4xl">{emotionConfig.emoji}</span>
          </div>
          <div>
            <p className="text-copy-14 font-medium text-slate-100">Currently feeling</p>
            <p className="text-heading-20 font-bold text-slate-100">{emotionConfig.label}</p>
            <p className="text-label-14 text-slate-400">
              Updated {formatTimeAgo(new Date(currentEmotion.createdAt!))}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <EmotionBadge
            emotion={currentEmotion.emotion as any}
            urgency={currentEmotion.urgencyLevel as any}
            size="lg"
          />
        </div>
      </div>

      {urgencyConfig && (
        <div className="mt-4 rounded-lg p-3" style={{ background: `${urgencyConfig.bg}80` }}>
          <div className="flex items-center gap-2">
            <span style={{ color: urgencyConfig.color }} className="text-heading-16">
              {urgencyConfig.icon}
            </span>
            <p className="text-copy-14 text-slate-300" style={{ color: urgencyConfig.color }}>
              <strong>Urgency: {urgencyConfig.label}</strong>{' '}
              {urgencyConfig.level === 'HIGH' && (
                <>- Consider reaching out to a mentor or counselor for support.</>
              )}
              {urgencyConfig.level === 'MEDIUM' && (
                <> - You might benefit from talking to someone about this.</>
              )}
              {urgencyConfig.level === 'LOW' && <> - Good to track, no immediate action needed.</>}
            </p>
          </div>
        </div>
      )}

      <div className="mt-4 border-t border-slate-800/30 pt-4">
        <a
          href="/posts/new"
          className="button-tertiary text-button-14 rounded-lg px-4 py-2 transition-colors hover:bg-slate-800/50"
        >
          Update Emotion
        </a>
      </div>
    </div>
  );
}
