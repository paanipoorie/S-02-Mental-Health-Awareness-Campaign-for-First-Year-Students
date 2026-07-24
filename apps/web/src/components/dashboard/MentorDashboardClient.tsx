import { useEffect, useState } from 'react';
import { useStore } from '@nanostores/react';
import { $user, $isLoading, fetchCurrentUser } from '@stores/authStore';
import { dashboardApi } from '@lib/api';
import { WaitingChatsWidget } from './WaitingChatsWidget';
import { AssignedStudentsWidget } from './AssignedStudentsWidget';
import { StudentEmotionOverviewWidget } from './StudentEmotionOverviewWidget';
import { TodaysMeetingsWidget } from './TodaysMeetingsWidget';
import { TodaysWorkshopsWidget } from './TodaysWorkshopsWidget';
import { MentorAvailabilityToggle } from './MentorAvailabilityToggle';
import { RecentDiscussionsWidget } from './RecentDiscussionsWidget';
import { AnnouncementsWidget } from './AnnouncementsWidget';

interface MentorDashboardData {
  waitingChats: Array<{
    id: string;
    studentIdentityId: string;
    status: string;
    createdAt: string;
    studentDisplayName: string;
    studentAvatarSeed: number;
    latestEmotion: {
      emotion: string;
      urgencyLevel: string | null;
      createdAt: string;
    } | null;
  }>;
  assignedStudents: Array<{
    id: string;
    studentIdentityId: string;
    studentDisplayName: string;
    studentAvatarSeed: number;
    status: string;
    createdAt: string;
    latestEmotion: {
      emotion: string;
      urgencyLevel: string | null;
      createdAt: string;
    } | null;
    unreadCount: number;
    lastMessage: { body: string; createdAt: string } | null;
  }>;
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
  todaysMeetings: Array<{
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
    attendeeCount: number;
    isHost: boolean;
  }>;
  todaysWorkshops: Array<{
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
    maxAttendees: number | null;
    registrationCount: number;
  }>;
  mentorAvailability: string;
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

export function MentorDashboardClient() {
  const user = useStore($user);
  const isLoading = useStore($isLoading);
  const [dashboardData, setDashboardData] = useState<MentorDashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        if (!user) {
          await fetchCurrentUser();
        }
        const data = await dashboardApi.getMentorDashboard();
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
      <div className="grid gap-6" role="status" aria-label="Loading mentor dashboard">
        <DashboardSkeleton />
        <DashboardSkeleton />
        <DashboardSkeleton className="lg:col-span-2" />
        <DashboardSkeleton className="lg:col-span-2" />
        <DashboardSkeleton />
        <DashboardSkeleton />
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
      <div className="lg:col-span-6">
        <WaitingChatsWidget waitingChats={dashboardData?.waitingChats || []} />
      </div>

      <div className="lg:col-span-6">
        <AssignedStudentsWidget assignedStudents={dashboardData?.assignedStudents || []} />
      </div>

      <div className="lg:col-span-12">
        <StudentEmotionOverviewWidget
          studentEmotionOverview={
            dashboardData?.studentEmotionOverview || {
              windowHours: 24,
              totalLogs: 0,
              emotionCounts: {},
              urgencyCounts: {},
              emotionUrgencyBreakdown: {},
              priorityStudents: [],
            }
          }
        />
      </div>

      <div className="lg:col-span-6">
        <TodaysMeetingsWidget todaysMeetings={dashboardData?.todaysMeetings || []} />
      </div>

      <div className="lg:col-span-6">
        <TodaysWorkshopsWidget todaysWorkshops={dashboardData?.todaysWorkshops || []} />
      </div>

      <div className="lg:col-span-4">
        <MentorAvailabilityToggle
          initialAvailability={dashboardData?.mentorAvailability || 'OFFLINE'}
        />
      </div>

      <div className="lg:col-span-4">
        <RecentDiscussionsWidget recentDiscussions={dashboardData?.recentDiscussions || []} />
      </div>

      <div className="lg:col-span-4">
        <AnnouncementsWidget announcements={dashboardData?.announcements || []} />
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

export default MentorDashboardClient;
