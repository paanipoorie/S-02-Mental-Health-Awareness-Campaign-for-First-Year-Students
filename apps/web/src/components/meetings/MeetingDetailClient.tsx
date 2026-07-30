import { useEffect, useState } from 'react';
import { api } from '@lib/api';
import { useStore } from '@nanostores/react';
import { $user, fetchCurrentUser } from '@stores/authStore';
import { toast } from 'sonner';

interface Attendee {
  id: string;
  anonymousIdentityId: string;
  anonymousIdentity?: {
    displayName: string;
  };
}

interface MeetingDetail {
  id: string;
  title: string;
  description: string;
  hostType: string;
  hostDisplayName: string | null;
  hostUserId: string | null;
  hostIdentityId: string | null;
  date: string;
  time: string;
  durationMinutes: number;
  meetingType: string;
  meetingLink: string | null;
  location: string | null;
  category: string;
  attendees: Attendee[];
  isAttending: boolean;
  createdAt: string;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(timeStr: string): string {
  const [hours, minutes] = timeStr.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

export function MeetingDetailClient({ meetingId }: { meetingId: string }) {
  const user = useStore($user);
  const [meeting, setMeeting] = useState<MeetingDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMeetingDetail = async () => {
    try {
      if (!user) {
        await fetchCurrentUser();
      }
      const response = await api.get<MeetingDetail>(`/meetings/${meetingId}`);
      setMeeting(response);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch meeting details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetingDetail();
  }, [meetingId]);

  const handleRSVP = async () => {
    if (!meeting) return;
    try {
      const response = await api.post<{ rsvped: boolean }>(`/meetings/${meeting.id}/rsvp`);
      toast.success(response.rsvped ? 'RSVP registered!' : 'RSVP cancelled.');
      fetchMeetingDetail(); // Refresh attendee list and attending status
    } catch (err: any) {
      toast.error(err.message || 'Failed to update RSVP');
    }
  };

  const handleCancelMeeting = async () => {
    if (!meeting) return;
    if (!confirm('Are you sure you want to cancel and delete this meeting? This cannot be undone.')) return;

    try {
      await api.delete(`/meetings/${meeting.id}`);
      toast.success('Meeting has been cancelled.');
      window.location.href = '/meetings';
    } catch (err: any) {
      toast.error(err.message || 'Failed to cancel meeting');
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 animate-pulse space-y-6">
        <div className="h-4 bg-gray-200 rounded-sm w-1/4" />
        <div className="h-48 bg-gray-200 rounded-sm w-full" />
        <div className="h-32 bg-gray-200 rounded-sm w-full" />
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="text-center py-16 max-w-md mx-auto">
        <h2 className="text-heading-24 font-bold text-gray-900">Meeting not found</h2>
        <p className="text-copy-14 text-gray-500 mt-2">The meeting may have been cancelled or deleted.</p>
        <a href="/meetings" className="mt-6 inline-block rounded-sm bg-primary px-5 py-2.5 text-button-14 font-semibold text-background-100 hover:bg-gray-800 transition-colors">
          Back to Meetings
        </a>
      </div>
    );
  }

  const isHost = user?.role === 'STUDENT'
    ? meeting.hostIdentityId === user?.anonymousIdentityId
    : meeting.hostUserId === user?.userId;

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Back button */}
      <div>
        <a href="/meetings" className="text-label-14 font-semibold text-tertiary hover:underline flex items-center gap-1.5 transition-colors">
          ← Back to Meetings
        </a>
      </div>

      {/* Main card */}
      <div className="rounded-sm border border-gray-200 bg-background-100 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <span className="inline-flex items-center gap-1 rounded-sm border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-700 uppercase tracking-wide">
            {meeting.category.replace('_', ' ')}
          </span>
          <span className="inline-flex items-center gap-1 rounded-sm border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-700">
            {meeting.meetingType === 'ONLINE' ? '🌐 Online' : '📍 Offline'}
          </span>
        </div>

        <h1 className="text-heading-28 sm:text-heading-32 font-bold text-gray-1000 leading-tight">
          {meeting.title}
        </h1>

        <p className="text-copy-15 text-gray-700 mt-4 leading-relaxed whitespace-pre-wrap">
          {meeting.description}
        </p>

        {/* Meeting Logistics Panel */}
        <div className="mt-8 bg-gray-50 border border-gray-200 rounded-sm p-5 grid gap-4 sm:grid-cols-2 text-sm text-gray-500 font-mono">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span>📅 Date:</span>
              <strong className="text-gray-900">{formatDate(meeting.date)}</strong>
            </div>
            <div className="flex items-center gap-2">
              <span>⏰ Time:</span>
              <strong className="text-gray-900">{formatTime(meeting.time)} ({meeting.durationMinutes} mins)</strong>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span>👤 Host:</span>
              <strong className="text-gray-900">{meeting.hostDisplayName || 'Anonymous'}</strong>
            </div>
            {meeting.meetingType === 'ONLINE' ? (
              <div className="flex items-center gap-2 truncate">
                <span>🔗 Link:</span>
                {meeting.meetingLink ? (
                  <a href={meeting.meetingLink} target="_blank" rel="noreferrer" className="text-tertiary hover:underline truncate">
                    {meeting.meetingLink}
                  </a>
                ) : (
                  <span className="text-gray-400 italic">No link provided</span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span>📍 Location:</span>
                <strong className="text-gray-900">{meeting.location || 'Campus'}</strong>
              </div>
            )}
          </div>
        </div>

        {/* Action Panel */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-gray-200 pt-6">
          <div className="flex items-center gap-1.5 text-gray-500 text-sm">
            <span>👥</span>
            <strong className="text-gray-900 text-lg font-bold">{meeting.attendees.length}</strong> attending
          </div>
          <div className="flex gap-3">
            {isHost && (
              <button
                type="button"
                onClick={handleCancelMeeting}
                className="px-5 py-2.5 text-sm font-semibold text-red-800 bg-red-50 border border-red-300 rounded-sm hover:bg-red-100 transition-colors"
              >
                Cancel Meeting
              </button>
            )}
            <button
              type="button"
              onClick={handleRSVP}
              className={`px-6 py-2.5 text-sm font-semibold rounded-sm border transition-colors ${
                meeting.isAttending
                  ? 'bg-green-50 text-green-800 border-green-300'
                  : 'bg-primary hover:bg-gray-800 text-background-100 border-transparent'
              }`}
            >
              {meeting.isAttending ? '✓ Going' : 'RSVP to Join'}
            </button>
          </div>
        </div>
      </div>

      {/* Attendees list section */}
      <div className="rounded-sm border border-gray-200 bg-background-100 p-6 shadow-sm">
        <h3 className="text-heading-18 font-bold text-gray-900 mb-4">
          Attendees List
        </h3>
        {meeting.attendees.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No one has RSVP'd yet. Be the first to join!</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {meeting.attendees.map((attendee) => (
              <div key={attendee.id} className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-sm text-sm text-gray-700 font-semibold">
                <span>👤</span>
                <span className="truncate">{attendee.anonymousIdentity?.displayName || 'Anonymous Student'}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
