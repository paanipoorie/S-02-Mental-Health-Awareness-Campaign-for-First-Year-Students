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
      color: 'from-teal-500 to-indigo-600',
      key: 'totalUsers',
    },
    {
      label: 'Students',
      value: formatNumber(platformStats.totalStudents),
      icon: '🎓',
      color: 'from-blue-500 to-cyan-500',
      key: 'totalStudents',
    },
    {
      label: 'Mentors',
      value: formatNumber(platformStats.totalMentors),
      icon: '👨‍🏫',
      color: 'from-purple-500 to-pink-500',
      key: 'totalMentors',
    },
    {
      label: 'Verified Mentors',
      value: formatNumber(platformStats.verifiedMentors),
      icon: '✅',
      color: 'from-green-500 to-emerald-500',
      key: 'verifiedMentors',
    },
    {
      label: 'Total Posts',
      value: formatNumber(platformStats.totalPosts),
      icon: '💬',
      color: 'from-orange-500 to-red-500',
      key: 'totalPosts',
    },
    {
      label: 'Active Chats',
      value: formatNumber(platformStats.activeChats),
      icon: '💭',
      color: 'from-teal-500 to-blue-500',
      key: 'activeChats',
    },
    {
      label: 'Upcoming Meetings',
      value: formatNumber(platformStats.upcomingMeetings),
      icon: '📅',
      color: 'from-indigo-500 to-purple-500',
      key: 'upcomingMeetings',
    },
    {
      label: 'Upcoming Workshops',
      value: formatNumber(platformStats.upcomingWorkshops),
      icon: '🎯',
      color: 'from-amber-500 to-orange-500',
      key: 'upcomingWorkshops',
    },
    {
      label: 'Active Resources',
      value: formatNumber(platformStats.activeResources),
      icon: '📚',
      color: 'from-emerald-500 to-teal-500',
      key: 'activeResources',
    },
  ];

  return (
    <div className={`dashboard-card p-6 ${className}`}>
      <h3 className="text-heading-20 mb-6 text-slate-100">Platform Statistics</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {stats.map(stat => (
          <div
            key={stat.key}
            className="rounded-xl bg-gradient-to-br p-4 text-white"
            style={{
              background: `linear-gradient(135deg, ${stat.color.split(' to ')[0]}, ${stat.color.split(' to ')[1]})`,
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-label-14 opacity-90">{stat.label}</p>
                <p className="text-heading-24 mt-1 font-bold">{stat.value}</p>
              </div>
              <span className="text-3xl opacity-80">{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
