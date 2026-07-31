import { useEffect, useState } from 'react';
import { useStore } from '@nanostores/react';
import { $user, $isLoading, fetchCurrentUser } from '@stores/authStore';
import { dashboardApi } from '@lib/api';
import { AnnouncementsWidget } from './AnnouncementsWidget';
import { ResourcesQuickAccessWidget } from './ResourcesQuickAccessWidget';
import { MessageCircle, CalendarDays, Clock, ChevronRight } from 'lucide-react';

interface StudentDashboardData {
  announcements: Array<{
    id: string;
    title: string;
    body: string;
    createdAt: string;
  }>;
  resourcesPreview: Array<{
    id: string;
    title: string;
    description: string;
    category: string;
    link: string | null;
  }>;
  assignedMentor: {
    id: string;
    displayName: string;
    availabilityStatus: string;
    isVerifiedMentor: boolean;
    chatThreadId: string | null;
  } | null;
  upcomingMeetings: Array<{
    id: string;
    title: string;
    date: string;
    time: string;
    meetingType: string;
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
        <div className="dashboard-card animate-pulse p-6">
          <div className="mb-4 h-6 w-1/4 rounded bg-gray-200" />
          <div className="space-y-3">
            <div className="h-4 w-3/4 rounded bg-gray-200" />
            <div className="h-4 w-1/2 rounded bg-gray-200" />
          </div>
        </div>
        <div className="dashboard-card animate-pulse p-6">
          <div className="mb-4 h-6 w-1/4 rounded bg-gray-200" />
          <div className="space-y-3">
            <div className="h-4 w-full rounded bg-gray-200" />
            <div className="h-4 w-full rounded bg-gray-200" />
            <div className="h-4 w-3/4 rounded bg-gray-200" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="text-copy-14 text-red-400">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 rounded-sm bg-primary px-4 py-2 text-button-14 font-semibold text-background-100 hover:bg-gray-800 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const mentor = dashboardData?.assignedMentor;
  const nextMeeting = dashboardData?.upcomingMeetings?.[0] ?? null;

  const statusConfig: Record<string, { label: string; dotClass: string }> = {
    AVAILABLE: { label: 'Available', dotClass: 'bg-green-500' },
    BUSY: { label: 'Busy', dotClass: 'bg-amber-500' },
    OFFLINE: { label: 'Offline', dotClass: 'bg-gray-400' },
  };

  const availability = mentor ? statusConfig[mentor.availabilityStatus] || statusConfig.OFFLINE : null;

  return (
    <div className="space-y-6">
      {/* Mentor Details */}
      <div className="dashboard-card p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-gray-100 border border-gray-200">
              <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0M17.25 13.5a3.75 3.75 0 110-7.5 3.75 3.75 0 010 7.5z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-heading-20 font-bold text-gray-1000">
                  {mentor ? mentor.displayName : 'No Mentor Assigned'}
                </h2>
                {mentor?.isVerifiedMentor && (
                  <svg className="h-5 w-5 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
                    <path fill-rule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.498 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.307 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clip-rule="evenodd" />
                  </svg>
                )}
              </div>
              {mentor ? (
                <div className="flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full ${availability?.dotClass || 'bg-gray-400'}`} />
                    <span className="text-label-14 text-gray-600">{availability?.label || 'Unknown'}</span>
                  </span>
                  {nextMeeting && (
                    <span className="flex items-center gap-1.5 text-label-14 text-gray-500">
                      <Clock className="h-3.5 w-3.5" />
                      <span>Next: {nextMeeting.title} - {new Date(nextMeeting.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-label-14 text-gray-500 mt-1">
                  A mentor will be assigned to you soon.
                </p>
              )}
            </div>
          </div>
          {mentor && (
            <a
              href={mentor.chatThreadId ? `/chat/${mentor.chatThreadId}` : '/chat'}
              className="flex items-center gap-2 rounded-sm bg-primary px-4 py-2 text-button-14 font-semibold text-background-100 hover:bg-gray-800 transition-colors flex-shrink-0"
            >
              <MessageCircle className="h-4 w-4" />
              Contact Mentor
            </a>
          )}
        </div>
      </div>

      {/* Announcements */}
      <AnnouncementsWidget announcements={dashboardData?.announcements || []} />

      {/* Quick Resources */}
      <ResourcesQuickAccessWidget resourcesPreview={dashboardData?.resourcesPreview || []} />
    </div>
  );
}

export default StudentDashboardClient;
