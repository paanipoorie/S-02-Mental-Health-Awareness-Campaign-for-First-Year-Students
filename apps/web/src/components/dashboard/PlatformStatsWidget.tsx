import { GraduationCap, ShieldCheck, MessageSquare, CalendarCheck, BookOpen } from 'lucide-react';
import type { ReactNode } from 'react';

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
  const stats: Array<{ label: string; value: string; icon: ReactNode; key: string }> = [
    {
      label: 'Students',
      value: formatNumber(platformStats.totalStudents),
      icon: <GraduationCap className="h-6 w-6 text-gray-500" />,
      key: 'totalStudents',
    },
    {
      label: 'Verified Mentors',
      value: formatNumber(platformStats.verifiedMentors),
      icon: <ShieldCheck className="h-6 w-6 text-gray-500" />,
      key: 'verifiedMentors',
    },
    {
      label: 'Total Posts',
      value: formatNumber(platformStats.totalPosts),
      icon: <MessageSquare className="h-6 w-6 text-gray-500" />,
      key: 'totalPosts',
    },
    {
      label: 'Active Resources',
      value: formatNumber(platformStats.activeResources),
      icon: <BookOpen className="h-6 w-6 text-gray-500" />,
      key: 'activeResources',
    },
    {
      label: 'Upcoming Events',
      value: formatNumber(platformStats.upcomingMeetings + platformStats.upcomingWorkshops),
      icon: <CalendarCheck className="h-6 w-6 text-gray-500" />,
      key: 'upcomingEvents',
    },
  ];

  return (
    <div className={`dashboard-card p-6 ${className}`}>
      <h3 className="text-heading-16 text-gray-1000 mb-6 font-bold">Platform Statistics</h3>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {stats.map(stat => (
          <div
            key={stat.key}
            className="bg-background-100 flex items-center justify-between rounded-sm border border-gray-200 p-4 transition-colors hover:bg-gray-50"
          >
            <div>
              <p className="text-label-12 font-medium leading-none text-gray-700">{stat.label}</p>
              <p className="text-heading-20 text-gray-1000 mt-2 font-bold leading-none">
                {stat.value}
              </p>
            </div>
            <span aria-hidden="true">{stat.icon}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
