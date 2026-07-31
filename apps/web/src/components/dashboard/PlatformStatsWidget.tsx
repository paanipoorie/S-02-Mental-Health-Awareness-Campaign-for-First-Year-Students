import { Users, GraduationCap, Briefcase, ShieldCheck, MessageSquare, MessageCircle, CalendarCheck, Target, BookOpen } from 'lucide-react';
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
      label: 'Total Users',
      value: formatNumber(platformStats.totalUsers),
      icon: <Users className="h-6 w-6 text-gray-500" />,
      key: 'totalUsers',
    },
    {
      label: 'Students',
      value: formatNumber(platformStats.totalStudents),
      icon: <GraduationCap className="h-6 w-6 text-gray-500" />,
      key: 'totalStudents',
    },
    {
      label: 'Mentors',
      value: formatNumber(platformStats.totalMentors),
      icon: <Briefcase className="h-6 w-6 text-gray-500" />,
      key: 'totalMentors',
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
      label: 'Active Chats',
      value: formatNumber(platformStats.activeChats),
      icon: <MessageCircle className="h-6 w-6 text-gray-500" />,
      key: 'activeChats',
    },
    {
      label: 'Upcoming Meetings',
      value: formatNumber(platformStats.upcomingMeetings),
      icon: <CalendarCheck className="h-6 w-6 text-gray-500" />,
      key: 'upcomingMeetings',
    },
    {
      label: 'Upcoming Workshops',
      value: formatNumber(platformStats.upcomingWorkshops),
      icon: <Target className="h-6 w-6 text-gray-500" />,
      key: 'upcomingWorkshops',
    },
    {
      label: 'Active Resources',
      value: formatNumber(platformStats.activeResources),
      icon: <BookOpen className="h-6 w-6 text-gray-500" />,
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
            <span aria-hidden="true">{stat.icon}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
