import { useEffect, useState } from 'react';
import { useStore } from '@nanostores/react';
import { $user, $isLoading, fetchCurrentUser } from '@stores/authStore';
import { dashboardApi } from '@lib/api';
import { PlatformStatsWidget } from './PlatformStatsWidget';
import { ActiveUsersWidget } from './ActiveUsersWidget';
import { EventsOverviewWidget } from './EventsOverviewWidget';
import { ReportsWidget } from './ReportsWidget';

interface AdminDashboardData {
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
  activeStudents: Array<{
    id: string;
    anonymousDisplayName: string;
    createdAt: string;
    lastEmotionAt: string | null;
    postCount: number;
    activeChats: number;
  }>;
  activeMentors: Array<{
    id: string;
    displayName: string;
    department: string;
    isVerifiedMentor: boolean;
    availabilityStatus: string;
    activeChats: number;
    hostedMeetings: number;
    hostedWorkshops: number;
    lastSeenAt: string | null;
  }>;
  meetingsOverview: Array<{
    id: string;
    title: string;
    hostType: string;
    hostDisplayName: string | null;
    date: string;
    meetingType: string;
    category: string;
    attendeeCount: number;
  }>;
  workshopsOverview: Array<{
    id: string;
    title: string;
    mentorDisplayName: string;
    date: string;
    meetingType: string;
    category: string;
    maxAttendees: number | null;
    registrationCount: number;
  }>;
  reports: Array<{
    id: string;
    type: string;
    targetType: string;
    targetId: string;
    reason: string;
    status: string;
    createdAt: string;
  }>;
}

export function AdminDashboardClient() {
  const user = useStore($user);
  const isLoading = useStore($isLoading);
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        if (!user) {
          await fetchCurrentUser();
        }
        const data = await dashboardApi.getAdminDashboard();
        setDashboardData(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load admin dashboard');
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, [user]);

  if (isLoading || loading) {
    return (
      <div className="grid gap-6" role="status" aria-label="Loading admin dashboard">
        <AdminDashboardSkeleton />
        <AdminDashboardSkeleton />
        <AdminDashboardSkeleton className="lg:col-span-2" />
        <AdminDashboardSkeleton className="lg:col-span-2" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="text-copy-14 text-red-400">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="button-primary text-button-14 mt-4 rounded-lg px-4 py-2"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <div className="lg:col-span-12">
        <PlatformStatsWidget
          platformStats={
            dashboardData?.platformStats || {
              totalUsers: 0,
              totalStudents: 0,
              totalMentors: 0,
              totalAdmins: 0,
              verifiedMentors: 0,
              totalPosts: 0,
              totalChats: 0,
              activeChats: 0,
              totalMeetings: 0,
              upcomingMeetings: 0,
              totalWorkshops: 0,
              upcomingWorkshops: 0,
              totalResources: 0,
              activeResources: 0,
            }
          }
        />
      </div>

      <div className="lg:col-span-7">
        <EventsOverviewWidget
          meetingsOverview={dashboardData?.meetingsOverview || []}
          workshopsOverview={dashboardData?.workshopsOverview || []}
        />
      </div>

      <div className="lg:col-span-5">
        <ActiveUsersWidget
          activeStudents={dashboardData?.activeStudents || []}
          activeMentors={dashboardData?.activeMentors || []}
        />
      </div>

      <div className="lg:col-span-12">
        <ReportsWidget reports={dashboardData?.reports || []} />
      </div>
    </div>
  );
}

function AdminDashboardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`dashboard-card animate-pulse p-6 ${className}`}>
      <div className="mb-4 h-6 w-1/4 rounded bg-slate-800" />
      <div className="space-y-3">
        <div className="h-4 w-3/4 rounded bg-slate-800" />
        <div className="h-4 w-1/2 rounded bg-slate-800" />
        <div className="h-4 w-1/3 rounded bg-slate-800" />
      </div>
    </div>
  );
}

export default AdminDashboardClient;
