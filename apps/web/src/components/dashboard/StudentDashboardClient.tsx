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
    universityEmail?: string;
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
        let currentUser = user;
        if (!currentUser) {
          currentUser = await fetchCurrentUser();
        }
        if (!currentUser) {
          window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
          return;
        }
        if (currentUser.role !== 'STUDENT') {
          if (currentUser.role === 'MENTOR') {
            window.location.href = '/mentor/dashboard';
            return;
          } else if (currentUser.role === 'ADMIN') {
            window.location.href = '/admin/dashboard';
            return;
          }
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
          className="bg-primary text-button-14 text-background-100 mt-4 rounded-sm px-4 py-2 font-semibold transition-colors hover:bg-gray-800"
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

  const availability = mentor
    ? statusConfig[mentor.availabilityStatus] || statusConfig.OFFLINE
    : null;

  return (
    <div className="space-y-6">
      {/* Mentor Details */}
      <div className="dashboard-card p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-sm border border-blue-100 bg-blue-50 text-xl font-bold text-blue-800">
              {mentor ? mentor.displayName.charAt(0) : 'N'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-heading-20 text-gray-1000 font-bold">
                  {mentor ? mentor.displayName : 'No Mentor Assigned'}
                </h2>
                {mentor && (
                  <span className="rounded-sm border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-800">
                    Verified Peer Mentor
                  </span>
                )}
              </div>
              {mentor ? (
                <div className="mt-1.5 space-y-1">
                  {mentor.universityEmail && (
                    <div className="text-xs text-gray-600">
                      Email: <span className="font-semibold text-gray-800">{mentor.universityEmail}</span>
                    </div>
                  )}
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="flex items-center gap-1.5">
                      <span
                        className={`h-2 w-2 rounded-full ${availability?.dotClass || 'bg-gray-400'}`}
                      />
                      <span className="text-xs text-gray-600 font-semibold">
                        Status: {availability?.label || 'Offline'}
                      </span>
                    </span>
                    {nextMeeting && (
                      <span className="text-xs flex items-center gap-1.5 text-gray-500">
                        <Clock className="h-3.5 w-3.5" />
                        <span>
                          Next Meeting: <span className="font-semibold text-gray-800">{nextMeeting.title}</span> ({new Date(nextMeeting.date).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                          })})
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-label-14 mt-1 text-gray-500">
                  A mentor will be assigned to you soon.
                </p>
              )}
            </div>
          </div>
          {mentor && (
            <a
              href={mentor.chatThreadId ? `/chat?threadId=${mentor.chatThreadId}` : '/chat'}
              className="bg-primary text-button-14 text-background-100 flex flex-shrink-0 items-center justify-center gap-2 rounded-sm px-4 py-2 font-semibold transition-colors hover:bg-gray-800"
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
