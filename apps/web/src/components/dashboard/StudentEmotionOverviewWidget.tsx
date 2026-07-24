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

const EMOTION_EMOJIS: Record<string, string> = {
  HAPPY: '😊',
  EXCITED: '🤩',
  CONFUSED: '😕',
  HOMESICK: '🏠',
  LONELY: '😔',
  SCARED: '😨',
  ANXIOUS: '😰',
  BURNT_OUT: '😩',
  OVERWHELMED: '🤯',
  STRESSED: '😤',
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

const PRIORITY_ORDER = [
  'OVERWHELMED',
  'ANXIOUS',
  'SCARED',
  'STRESSED',
  'BURNT_OUT',
  'HOMESICK',
  'LONELY',
  'CONFUSED',
];

const URGENCY_COLORS: Record<string, { bg: string; color: string; icon: string }> = {
  HIGH: { bg: '#fee2e2', color: '#dc2626', icon: '🔴' },
  MEDIUM: { bg: '#fef3c7', color: '#d97706', icon: '🟡' },
  LOW: { bg: '#dcfce7', color: '#16a34a', icon: '🟢' },
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
      <h3 className="text-heading-20 mb-6 text-slate-100">Student Emotion Overview (24h)</h3>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Logs"
          value={formatNumber(totalLogs)}
          icon="📊"
          bg="from-teal-500 to-indigo-600"
        />
        <StatCard
          label="High Urgency"
          value={formatNumber(totalHighUrgency)}
          icon="🔴"
          bg="from-red-500 to-red-600"
          highlight
        />
        <StatCard
          label="Medium Urgency"
          value={formatNumber(totalMediumUrgency)}
          icon="🟡"
          bg="from-amber-500 to-orange-500"
        />
        <StatCard
          label="Low Urgency"
          value={formatNumber(totalLowUrgency)}
          icon="🟢"
          bg="from-green-500 to-emerald-500"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h4 className="text-label-14 mb-3 font-medium text-slate-300">Top Emotions</h4>
          <div className="space-y-2">
            {topEmotions.length > 0 ? (
              topEmotions.map(([emotion, count]) => (
                <EmotionBar
                  key={emotion}
                  label={EMOTION_LABELS[emotion] || emotion}
                  emoji={EMOTION_EMOJIS[emotion] || '❓'}
                  count={count}
                  total={totalLogs}
                />
              ))
            ) : (
              <p className="text-label-14 py-4 text-center text-slate-500">No emotion data</p>
            )}
          </div>
        </div>

        <div>
          <h4 className="text-label-14 mb-3 font-medium text-slate-300">
            Priority Students ({priorityStudents.length})
          </h4>
          <div className="max-h-64 space-y-2 overflow-y-auto">
            {priorityStudents.length > 0 ? (
              priorityStudents.slice(0, 8).map((student, index) => (
                <div
                  key={student.studentIdentityId}
                  className="flex items-center gap-3 rounded-lg border border-slate-800/50 bg-slate-900/50 p-3"
                >
                  <span className="text-label-12 w-5 text-right text-slate-500">{index + 1}.</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-copy-14 truncate font-medium text-slate-100">
                      {student.studentDisplayName}
                    </p>
                    <div className="mt-0.5 flex items-center gap-1">
                      <span className="text-label-12">
                        {EMOTION_EMOJIS[student.latestEmotion] || '❓'}
                        {EMOTION_LABELS[student.latestEmotion] || student.latestEmotion}
                      </span>
                      {student.latestUrgency && (
                        <span
                          className="inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium"
                          style={{
                            background: URGENCY_COLORS[student.latestUrgency]?.bg || '#f1f5f9',
                            color: URGENCY_COLORS[student.latestUrgency]?.color || '#475569',
                          }}
                        >
                          {URGENCY_COLORS[student.latestUrgency]?.icon || ''}
                          {student.latestUrgency}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-label-14 py-4 text-center text-slate-500">No priority students</p>
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
  bg,
  highlight = false,
}: {
  label: string;
  value: string;
  icon: string;
  bg: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl bg-gradient-to-br p-4 ${bg} text-white ${
        highlight ? 'ring-2 ring-red-500/50' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-label-14 opacity-90">{label}</p>
          <p className="text-heading-24 mt-1 font-bold">{value}</p>
        </div>
        <span className="text-3xl opacity-80">{icon}</span>
      </div>
    </div>
  );
}

function EmotionBar({
  label,
  emoji,
  count,
  total,
}: {
  label: string;
  emoji: string;
  count: number;
  total: number;
}) {
  const percentage = total > 0 ? (count / total) * 100 : 0;

  return (
    <div className="group">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-label-13 flex items-center gap-1 text-slate-300">
          <span>{emoji}</span>
          {label}
        </span>
        <span className="text-label-13 font-medium text-slate-400">{count}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-teal-400 to-indigo-500 transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
