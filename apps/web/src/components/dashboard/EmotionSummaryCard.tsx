import { getEmotionConfig } from '@lib/emotionConstants';
import { getUrgencyConfig } from '@lib/emotionConstants';
import { EmotionBadge } from '@components/emotion/EmotionBadge';
import {
  Smile,
  Sparkles,
  HelpCircle,
  Home,
  Frown,
  AlertTriangle,
  AlertCircle,
  BatteryLow,
  Brain,
  Zap,
  ChevronDown,
  Minus,
  ChevronUp,
} from 'lucide-react';

interface EmotionSummaryCardProps {
  currentEmotion: {
    emotion: string | null;
    urgencyLevel: string | null;
    createdAt: string | null;
  } | null;
  className?: string;
}

const emotionIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  HAPPY: Smile,
  EXCITED: Sparkles,
  CONFUSED: HelpCircle,
  HOMESICK: Home,
  LONELY: Frown,
  SCARED: AlertTriangle,
  ANXIOUS: AlertCircle,
  BURNT_OUT: BatteryLow,
  OVERWHELMED: Brain,
  STRESSED: Zap,
};

const urgencyIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LOW: ChevronDown,
  MEDIUM: Minus,
  HIGH: ChevronUp,
};

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
        <h3 className="text-heading-20 text-gray-1000 mb-4 font-semibold">Current Emotion</h3>
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
              d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-copy-14 mt-3 text-gray-600">No emotion logged today</p>
          <p className="text-label-12 mt-1 text-gray-500">
            Log your emotion or write a new post to alert mentors.
          </p>
          <a
            href="/posts/new"
            className="bg-primary text-button-14 text-background-100 mt-4 inline-block rounded-sm px-4 py-2 font-semibold transition-colors hover:bg-gray-800"
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

  const EmotionIcon = emotionIconMap[currentEmotion.emotion] || HelpCircle;
  const UrgencyIcon = urgencyConfig ? urgencyIconMap[urgencyConfig.level] : null;

  return (
    <div className={`dashboard-card p-6 ${className}`}>
      <h3 className="text-heading-20 text-gray-1000 mb-4 font-semibold">Current Emotion</h3>

      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-sm border border-gray-200"
            style={{ backgroundColor: `${emotionConfig.bg}22` }}
          >
            <EmotionIcon className="h-8 w-8 text-gray-700" />
          </div>
          <div>
            <p className="text-label-12 font-medium text-gray-500">Currently feeling</p>
            <p className="text-heading-20 text-gray-1000 font-bold">{emotionConfig.label}</p>
            <p className="text-label-12 text-gray-500">
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

      {urgencyConfig && UrgencyIcon && (
        <div className="bg-background-200 mt-4 rounded-sm border border-gray-200 p-3">
          <div className="flex items-center gap-2">
            <span className="text-heading-16 text-gray-800">
              <UrgencyIcon className="h-5 w-5 text-gray-700" />
            </span>
            <p className="text-copy-14 text-gray-700">
              <strong className="text-gray-900">Urgency: {urgencyConfig.label}</strong>{' '}
              {urgencyConfig.level === 'HIGH' && (
                <>- Recommended to message a Peer Mentor directly for support.</>
              )}
              {urgencyConfig.level === 'MEDIUM' && (
                <> - Peers and mentors are available for guidance.</>
              )}
              {urgencyConfig.level === 'LOW' && (
                <> - Regular status update, no immediate response requested.</>
              )}
            </p>
          </div>
        </div>
      )}

      <div className="mt-4 border-t border-gray-200 pt-4">
        <a
          href="/posts/new"
          className="bg-background-100 text-button-14 inline-block rounded-sm border border-gray-300 px-4 py-2 font-semibold text-gray-700 transition-colors hover:bg-gray-100"
        >
          Update Emotion
        </a>
      </div>
    </div>
  );
}
