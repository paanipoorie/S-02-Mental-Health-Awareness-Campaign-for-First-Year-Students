import { Smile, Star, HelpCircle, Home, Frown, AlertCircle, Activity, Flame, CloudRain, AlertTriangle, BarChart3, ArrowUpCircle, MinusCircle, ArrowDownCircle } from 'lucide-react';
import type { ReactNode } from 'react';

interface StudentEmotionOverviewWidgetProps {
  studentEmotionOverview: {
    windowHours: number;
    totalLogs: number;
    emotionCounts: Record<string, number>;
    urgencyCounts: Record<string, number>;
    emotionUrgencyBreakdown: Record<string, Record<string, number>>;
    priorityStudents: Array<{
      studentIdentityId: string;
      studentDisplayName: string;
      latestEmotion: string;
      latestUrgency: string | null;
      chatId: string;
    }>;
  };
  className?: string;
}

const EMOTION_ICONS: Record<string, ReactNode> = {
  HAPPY: <Smile className="h-4 w-4 text-gray-600" />,
  EXCITED: <Star className="h-4 w-4 text-gray-600" />,
  CONFUSED: <HelpCircle className="h-4 w-4 text-gray-600" />,
  HOMESICK: <Home className="h-4 w-4 text-gray-600" />,
  LONELY: <Frown className="h-4 w-4 text-gray-600" />,
  SCARED: <AlertCircle className="h-4 w-4 text-gray-600" />,
  ANXIOUS: <Activity className="h-4 w-4 text-gray-600" />,
  BURNT_OUT: <Flame className="h-4 w-4 text-gray-600" />,
  OVERWHELMED: <CloudRain className="h-4 w-4 text-gray-600" />,
  STRESSED: <AlertTriangle className="h-4 w-4 text-gray-600" />,
};

const EMOTION_LABELS: Record<string, string> = {
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

const URGENCY_STYLES: Record<string, string> = {
  HIGH: 'bg-red-50 text-red-800 border-red-300',
  MEDIUM: 'bg-amber-50 text-amber-800 border-amber-300',
  LOW: 'bg-green-50 text-green-800 border-green-300',
};

const URGENCY_ICONS: Record<string, ReactNode> = {
  HIGH: <AlertCircle className="h-3 w-3 text-red-600" />,
  MEDIUM: <MinusCircle className="h-3 w-3 text-amber-600" />,
  LOW: <ArrowDownCircle className="h-3 w-3 text-green-600" />,
};

function formatNumber(num: number): string {
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toString();
}

export function StudentEmotionOverviewWidget({
  studentEmotionOverview,
  className = '',
}: StudentEmotionOverviewWidgetProps) {
  const { totalLogs, emotionCounts, urgencyCounts, priorityStudents } = studentEmotionOverview;

  const topEmotions = Object.entries(emotionCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const totalHighUrgency = urgencyCounts.HIGH || 0;
  const totalMediumUrgency = urgencyCounts.MEDIUM || 0;
  const totalLowUrgency = urgencyCounts.LOW || 0;

  return (
    <div className={`dashboard-card p-6 ${className}`}>
      <h3 className="text-heading-20 mb-6 text-gray-1000 font-semibold">Student Emotion Overview (24h)</h3>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Logs"
          value={formatNumber(totalLogs)}
          icon={<BarChart3 className="h-6 w-6 text-gray-500" />}
          borderColor="border-gray-200"
          valueColor="text-gray-1000"
        />
        <StatCard
          label="High Urgency"
          value={formatNumber(totalHighUrgency)}
          icon={<ArrowUpCircle className="h-6 w-6 text-red-500" />}
          borderColor="border-red-300 bg-red-50/20"
          valueColor="text-red-700"
        />
        <StatCard
          label="Medium Urgency"
          value={formatNumber(totalMediumUrgency)}
          icon={<MinusCircle className="h-6 w-6 text-amber-500" />}
          borderColor="border-amber-300 bg-amber-50/10"
          valueColor="text-amber-700"
        />
        <StatCard
          label="Low Urgency"
          value={formatNumber(totalLowUrgency)}
          icon={<ArrowDownCircle className="h-6 w-6 text-green-500" />}
          borderColor="border-green-300 bg-green-50/10"
          valueColor="text-green-700"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h4 className="text-label-13 mb-3 font-semibold text-gray-700">Top Emotions</h4>
          <div className="space-y-3.5">
            {topEmotions.length > 0 ? (
              topEmotions.map(([emotion, count]) => (
                <EmotionBar
                  key={emotion}
                  label={EMOTION_LABELS[emotion] || emotion}
                  icon={EMOTION_ICONS[emotion] || <HelpCircle className="h-4 w-4 text-gray-400" />}
                  count={count}
                  total={totalLogs}
                />
              ))
            ) : (
              <p className="text-label-12 py-4 text-center text-gray-400">No emotional status logged today.</p>
            )}
          </div>
        </div>

        <div>
          <h4 className="text-label-13 mb-3 font-semibold text-gray-700">
            Priority Support Required ({priorityStudents.length})
          </h4>
          <div className="max-h-64 space-y-2 overflow-y-auto">
            {priorityStudents.length > 0 ? (
              priorityStudents.slice(0, 8).map((student, index) => (
                <div
                  key={student.studentIdentityId}
                  className="flex items-center gap-3 rounded-sm border border-gray-200 bg-background-100 p-3"
                >
                  <span className="text-label-12 w-5 text-right text-gray-400 font-mono">{index + 1}.</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-copy-14 truncate font-semibold text-gray-900">
                      {student.studentDisplayName}
                    </p>
                    <div className="mt-0.5 flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-label-12 text-gray-600">
                        {EMOTION_ICONS[student.latestEmotion] || <HelpCircle className="h-3.5 w-3.5 text-gray-400" />}
                        {EMOTION_LABELS[student.latestEmotion] || student.latestEmotion}
                      </span>
                      {student.latestUrgency && (
                        <span
                          className={`inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-[10px] font-semibold border ${URGENCY_STYLES[student.latestUrgency] || 'bg-gray-100 text-gray-800 border-gray-300'}`}
                        >
                          {URGENCY_ICONS[student.latestUrgency] || ''}
                          {student.latestUrgency}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-label-12 py-4 text-center text-gray-400">No students are currently flagged as priority.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  borderColor,
  valueColor,
}: {
  label: string;
  value: string;
  icon: ReactNode;
  borderColor: string;
  valueColor: string;
}) {
  return (
    <div
      className={`rounded-sm border p-4 bg-background-100 ${borderColor}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-label-12 font-medium text-gray-600">{label}</p>
          <p className={`text-heading-32 font-bold mt-1 ${valueColor}`}>{value}</p>
        </div>
        <span aria-label={label}>{icon}</span>
      </div>
    </div>
  );
}

function EmotionBar({
  label,
  icon,
  count,
  total,
}: {
  label: string;
  icon: ReactNode;
  count: number;
  total: number;
}) {
  const percentage = total > 0 ? (count / total) * 100 : 0;

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-label-13 flex items-center gap-1.5 text-gray-700">
          <span className="flex-shrink-0">{icon}</span>
          <span className="font-medium">{label}</span>
        </span>
        <span className="text-label-12 font-mono text-gray-400">{count}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-sm bg-gray-100">
        <div
          className="h-full rounded-sm bg-gray-1000"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
