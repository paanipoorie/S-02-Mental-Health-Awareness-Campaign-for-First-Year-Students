interface PlatformStatsWidgetProps {
  platformStats: {
    totalUsers: number;
    totalStudents: number;
    totalMentors: number;
    totalAdmins: number;
    verifiedMentors: number;
    totalPosts: number;
    totalChats: number;
    activeChats: number;
    totalMeetings: number;
    upcomingMeetings: number;
    totalWorkshops: number;
    upcomingWorkshops: number;
    totalResources: number;
    activeResources: number;
  };
  className?: string;
}

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toString();
}

export function PlatformStatsWidget({ platformStats, className = '' }: PlatformStatsWidgetProps) {
  const stats = [
    {
      label: 'Total Users',
      value: formatNumber(platformStats.totalUsers),
      icon: '👥',
      key: 'totalUsers',
    },
    {
      label: 'Students',
      value: formatNumber(platformStats.totalStudents),
      icon: '🎓',
      key: 'totalStudents',
    },
    {
      label: 'Mentors',
      value: formatNumber(platformStats.totalMentors),
      icon: '👨‍🏫',
      key: 'totalMentors',
    },
    {
      label: 'Verified Mentors',
      value: formatNumber(platformStats.verifiedMentors),
      icon: '✅',
      key: 'verifiedMentors',
    },
    {
      label: 'Total Posts',
      value: formatNumber(platformStats.totalPosts),
      icon: '💬',
      key: 'totalPosts',
    },
    {
      label: 'Active Chats',
      value: formatNumber(platformStats.activeChats),
      icon: '💭',
      key: 'activeChats',
    },
    {
      label: 'Upcoming Meetings',
      value: formatNumber(platformStats.upcomingMeetings),
      icon: '📅',
      key: 'upcomingMeetings',
    },
    {
      label: 'Upcoming Workshops',
      value: formatNumber(platformStats.upcomingWorkshops),
      icon: '🎯',
      key: 'upcomingWorkshops',
    },
    {
      label: 'Active Resources',
      value: formatNumber(platformStats.activeResources),
      icon: '📚',
      key: 'activeResources',
    },
  ];

  return (
    <div className={`dashboard-card p-6 ${className}`}>
      <h3 className="text-heading-16 font-bold text-gray-1000 mb-6">Platform Statistics</h3>
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {stats.map(stat => (
          <div
            key={stat.key}
            className="rounded-sm border border-gray-200 bg-background-100 p-4 hover:bg-gray-50 transition-colors flex items-center justify-between"
          >
            <div>
              <p className="text-label-12 font-medium text-gray-700 leading-none">{stat.label}</p>
              <p className="text-heading-20 font-bold text-gray-1000 mt-2 leading-none">{stat.value}</p>
            </div>
            <span className="text-2xl text-gray-500" aria-hidden="true">{stat.icon}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
