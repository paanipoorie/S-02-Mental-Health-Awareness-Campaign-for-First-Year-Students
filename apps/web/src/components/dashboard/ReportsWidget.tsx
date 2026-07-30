interface ReportsWidgetProps {
  reports: Array<{
    id: string;
    type: string;
    targetType: string;
    targetId: string;
    reason: string;
    status: string;
    createdAt: string;
  }>;
  className?: string;
}

const TYPE_CONFIG: Record<string, { icon: string; color: string; bg: string }> = {
  CONTENT_FLAG: { icon: '🚩', color: '#ef4444', bg: '#fee2e2' },
  CHAT_CONCERN: { icon: '⚠️', color: '#f59e0b', bg: '#fef3c7' },
  USER_REPORT: { icon: '👤', color: '#8b5cf6', bg: '#f3e8ff' },
  SPAM: { icon: '📧', color: '#ec4899', bg: '#fce7f3' },
  HARASSMENT: { icon: '🛑', color: '#dc2626', bg: '#fee2e2' },
  SELF_HARM: { icon: '🆘', color: '#ef4444', bg: '#fee2e2' },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: 'Pending Review', color: '#f59e0b', bg: '#fef3c7' },
  IN_REVIEW: { label: 'In Review', color: '#3b82f6', bg: '#dbeafe' },
  RESOLVED: { label: 'Resolved', color: '#22c55e', bg: '#dcfce7' },
  DISMISSED: { label: 'Dismissed', color: '#6b7280', bg: '#f3f4f6' },
  ESCALATED: { label: 'Escalated', color: '#ef4444', bg: '#fee2e2' },
};

const TARGET_TYPE_ICONS: Record<string, string> = {
  POST: '📝',
  REPLY: '💬',
  CHAT: '💭',
  USER: '👤',
  MEETING: '📅',
  WORKSHOP: '🎯',
};

export function ReportsWidget({ reports, className = '' }: ReportsWidgetProps) {
  if (!reports || reports.length === 0) {
    return (
      <div className={`dashboard-card p-6 bg-background-100 border border-gray-200 rounded-sm ${className}`}>
        <h3 className="text-heading-16 font-bold text-gray-1000 mb-4">Moderation Reports</h3>
        <div className="py-8 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
          <p className="text-copy-14 mt-3 font-semibold text-gray-900">No reports</p>
          <p className="text-label-12 mt-1 text-gray-500">Flagged content will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`dashboard-card p-6 bg-background-100 border border-gray-200 rounded-sm ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-heading-16 font-bold text-gray-1000">Moderation Reports</h3>
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full border border-red-200 bg-red-50 px-1.5 text-xs font-bold text-red-700">
          {reports.length}
        </span>
      </div>

      <div className="max-h-96 space-y-3 overflow-y-auto pr-1">
        {reports.map(report => {
          const typeConfig = TYPE_CONFIG[report.type] || {
            icon: '📋',
            color: '#6b7280',
            bg: '#f3f4f6',
          };
          const statusConfig = STATUS_CONFIG[report.status] || {
            label: report.status,
            color: '#6b7280',
            bg: '#f3f4f6',
          };
          const targetIcon = TARGET_TYPE_ICONS[report.targetType] || '📄';

          return (
            <div
              key={report.id}
              className="rounded-sm border border-gray-200 bg-background-100 p-4 hover:bg-gray-50 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <div
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-sm"
                    style={{ background: typeConfig.bg }}
                  >
                    <span className="text-lg">{typeConfig.icon}</span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-copy-14 font-semibold text-gray-900">
                        {report.type.replace(/_/g, ' ')}
                      </h4>
                      <span
                        className="inline-flex items-center rounded-sm px-1.5 py-0.5 text-[10px] font-bold"
                        style={{ background: statusConfig.bg, color: statusConfig.color }}
                      >
                        {statusConfig.label}
                      </span>
                    </div>

                    <p className="text-copy-13 mt-1 line-clamp-2 text-gray-600 leading-relaxed">
                      {report.reason}
                    </p>

                    <div className="text-label-12 mt-2 flex flex-wrap items-center gap-3 text-gray-500">
                      <span className="flex items-center gap-1">
                        {targetIcon} {report.targetType}
                      </span>
                      <span className="font-mono text-gray-400">#{report.targetId.slice(-8)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-shrink-0 flex-col items-end gap-1.5">
                  <time
                    className="text-[10px] font-mono whitespace-nowrap text-gray-400"
                    dateTime={report.createdAt}
                  >
                    {formatDate(report.createdAt, true)}
                  </time>
                  <button
                    className="text-label-12 whitespace-nowrap text-tertiary font-bold hover:underline"
                    onClick={() => window.open(`/admin/reports/${report.id}`, '_blank')}
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {reports.length > 10 && (
        <div className="mt-4 text-center">
          <a
            href="/admin/reports"
            className="text-label-12 text-tertiary font-bold hover:underline"
          >
            View all {reports.length} reports
          </a>
        </div>
      )}
    </div>
  );
}

function formatDate(dateStr: string, addSuffix = false): string {
  const date = new Date(dateStr);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
