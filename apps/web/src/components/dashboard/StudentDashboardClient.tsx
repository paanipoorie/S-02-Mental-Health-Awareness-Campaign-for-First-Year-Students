import { useEffect, useState } from 'react';
import { useStore } from '@nanostores/react';
import { $user, $isLoading, fetchCurrentUser } from '@stores/authStore';
import { dashboardApi } from '@lib/api';
import { EmotionSummaryCard } from './EmotionSummaryCard';
import { ActiveChatsWidget } from './ActiveChatsWidget';
import { RecentDiscussionsWidget } from './RecentDiscussionsWidget';
import { AnnouncementsWidget } from './AnnouncementsWidget';
import { UpcomingMeetingsWidget } from './UpcomingMeetingsWidget';
import { UpcomingWorkshopsWidget } from './UpcomingWorkshopsWidget';
import { ResourcesQuickAccessWidget } from './ResourcesQuickAccessWidget';

interface StudentDashboardData {
  currentEmotion: {
    emotion: string | null;
    urgencyLevel: string | null;
    createdAt: string | null;
  } | null;
  upcomingMeetings: Array<{
    id: string;
    title: string;
    description: string;
    hostType: string;
    date: string;
    time: string;
    durationMinutes: number;
    meetingType: string;
    meetingLink: string | null;
    location: string | null;
    category: string;
    hostDisplayName: string | null;
    isAttending: boolean;
  }>;
  upcomingWorkshops: Array<{
    id: string;
    title: string;
    description: string;
    date: string;
    time: string;
    durationMinutes: number;
    meetingType: string;
    meetingLink: string | null;
    location: string | null;
    category: string;
    mentorDisplayName: string;
    registrationStatus: string;
  }>;
  resourcesPreview: Array<{
    id: string;
    title: string;
    description: string;
    category: string;
    link: string | null;
  }>;
  activeChats: Array<{
    id: string;
    studentIdentityId: string;
    mentorId: string | null;
    status: string;
    createdAt: string;
    studentDisplayName: string;
    mentorDisplayName: string | null;
    unreadCount: number;
    lastMessage: { body: string; createdAt: string } | null;
  }>;
  recentDiscussions: Array<{
    id: string;
    title: string;
    body: string;
    category: string;
    emotion: string | null;
    urgencyLevel: string | null;
    createdAt: string;
    anonymousDisplayName: string;
    replyCount: number;
  }>;
  announcements: Array<{
    id: string;
    title: string;
    body: string;
    createdAt: string;
  }>;
}

export function StudentDashboardClient() {
  const user = useStore($user);
  const isLoading = useStore($isLoading);
  const [dashboardData, setDashboardData] = useState<StudentDashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        if (!user) {
          await fetchCurrentUser();
        }
        const data = await dashboardApi.getStudentDashboard();
        setDashboardData(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, [user]);

  if (isLoading || loading) {
    return (
      <div className="space-y-6" role="status" aria-label="Loading dashboard">
        <DashboardSkeleton />
        <DashboardSkeleton />
        <DashboardSkeleton className="lg:col-span-2" />
        <DashboardSkeleton className="md:col-span-1 lg:col-span-2" />
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
    <div className="grid gap-6 md:grid-cols-[1fr_1fr] lg:grid-cols-[1fr_1fr]">
      <div className="lg:col-span-1">
        <EmotionSummaryCard currentEmotion={dashboardData?.currentEmotion ?? null} />
      </div>

      <div className="lg:col-span-1">
        <ActiveChatsWidget activeChats={dashboardData?.activeChats || []} />
      </div>

      <div className="lg:col-span-2">
        <RecentDiscussionsWidget recentDiscussions={dashboardData?.recentDiscussions || []} />
      </div>

      <div className="md:col-span-1 lg:col-span-2">
        <AnnouncementsWidget announcements={dashboardData?.announcements || []} />
      </div>

      <div className="lg:col-span-1">
        <UpcomingMeetingsWidget upcomingMeetings={dashboardData?.upcomingMeetings || []} />
      </div>

      <div className="lg:col-span-1">
        <UpcomingWorkshopsWidget upcomingWorkshops={dashboardData?.upcomingWorkshops || []} />
      </div>

      <div className="md:col-span-1 lg:col-span-2">
        <ResourcesQuickAccessWidget resourcesPreview={dashboardData?.resourcesPreview || []} />
      </div>
    </div>
  );
}

function DashboardSkeleton({ className = '' }: { className?: string }) {
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

export default StudentDashboardClient;
