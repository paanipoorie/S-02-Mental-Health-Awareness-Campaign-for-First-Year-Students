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
  return date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
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
      <div className="max-w-3xl mx-auto py-12 px-4 animate-pulse">
        <div className="h-4 bg-slate-800 rounded w-1/4 mb-4" />
        <div className="h-10 bg-slate-800 rounded w-3/4 mb-6" />
        <div className="h-32 bg-slate-800 rounded mb-6" />
        <div className="h-10 bg-slate-800 rounded w-full" />
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="text-center py-16 max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-slate-200 font-sans">Meeting not found</h2>
        <p className="text-sm text-slate-500 mt-2">The meeting may have been cancelled or deleted.</p>
        <a href="/meetings" className="button-primary text-button-14 mt-6 inline-block rounded-xl px-4 py-2">
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
        <a href="/meetings" className="text-sm text-teal-400 hover:text-teal-300 flex items-center gap-1.5 transition-colors">
          ← Back to Meetings
        </a>
      </div>

      {/* Main card */}
      <div className="bg-gradient-to-b from-slate-900/60 to-slate-950/60 border border-slate-800/80 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-800 bg-slate-950 px-3 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wide">
            {meeting.category.replace('_', ' ')}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-800 bg-slate-950 px-3 py-1 text-xs font-semibold text-slate-400">
            {meeting.meetingType === 'ONLINE' ? '🌐 Online' : '📍 Offline'}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-sans tracking-tight">
          {meeting.title}
        </h1>

        <p className="text-slate-300 mt-4 leading-relaxed whitespace-pre-wrap">
          {meeting.description}
        </p>

        {/* Meeting Logistics Panel */}
        <div className="mt-8 bg-slate-950/40 border border-slate-900 rounded-xl p-5 grid gap-4 sm:grid-cols-2 text-sm text-slate-400">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span>📅 Date:</span>
              <strong className="text-slate-200">{formatDate(meeting.date)}</strong>
            </div>
            <div className="flex items-center gap-2">
              <span>⏰ Time:</span>
              <strong className="text-slate-200">{formatTime(meeting.time)} ({meeting.durationMinutes} mins)</strong>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span>👤 Host:</span>
              <strong className="text-slate-200">{meeting.hostDisplayName || 'Anonymous'}</strong>
            </div>
            {meeting.meetingType === 'ONLINE' ? (
              <div className="flex items-center gap-2 truncate">
                <span>🔗 Link:</span>
                {meeting.meetingLink ? (
                  <a href={meeting.meetingLink} target="_blank" rel="noreferrer" className="text-teal-400 hover:underline truncate">
                    {meeting.meetingLink}
                  </a>
                ) : (
                  <span className="text-slate-600 italic">No link provided</span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span>📍 Location:</span>
                <strong className="text-slate-200">{meeting.location || 'Campus'}</strong>
              </div>
            )}
          </div>
        </div>

        {/* Action Panel */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-slate-900/60 pt-6">
          <div className="flex items-center gap-1.5 text-slate-400 text-sm">
            <span>👥</span>
            <strong className="text-slate-200 text-lg font-bold">{meeting.attendees.length}</strong> attending
          </div>
          <div className="flex gap-3">
            {isHost && (
              <button
                type="button"
                onClick={handleCancelMeeting}
                className="px-5 py-2.5 text-sm font-semibold text-rose-300 bg-rose-950/40 border border-rose-900/40 rounded-xl hover:bg-rose-900/60 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Cancel Meeting
              </button>
            )}
            <button
              type="button"
              onClick={handleRSVP}
              className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-all ${
                meeting.isAttending
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                  : 'bg-teal-500 hover:bg-teal-400 text-slate-950 hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              {meeting.isAttending ? '✓ Going' : 'RSVP to Join'}
            </button>
          </div>
        </div>
      </div>

      {/* Attendees list section */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md">
        <h3 className="text-lg font-bold text-slate-100 font-sans mb-4">
          Attendees List
        </h3>
        {meeting.attendees.length === 0 ? (
          <p className="text-sm text-slate-500 italic">No one has RSVP'd yet. Be the first to join!</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {meeting.attendees.map((attendee) => (
              <div key={attendee.id} className="flex items-center gap-2 p-3 bg-slate-950/50 border border-slate-850 rounded-xl text-sm text-slate-300">
                <span className="text-lg">👤</span>
                <span className="truncate">{attendee.anonymousIdentity?.displayName || 'Anonymous Student'}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
